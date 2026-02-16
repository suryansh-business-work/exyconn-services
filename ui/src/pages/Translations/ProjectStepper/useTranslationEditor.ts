import { useState, useEffect, useCallback, useMemo } from "react";
import { useOrg } from "../../../context/OrgContext";
import { translationApi, localeApi } from "../../../api/translationsApi";
import { Locale, TranslationEntry, Section } from "../../../types/translationsTheme";

interface EditedCell {
  entryId: string;
  localeCode: string;
  value: string;
}

export const useTranslationEditor = (projectId: string) => {
  const { selectedOrg } = useOrg();
  const [locales, setLocales] = useState<Locale[]>([]);
  const [entries, setEntries] = useState<TranslationEntry[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [editedCells, setEditedCells] = useState<Map<string, EditedCell>>(new Map());
  const [translateDialogOpen, setTranslateDialogOpen] = useState(false);
  const [translatingKey, setTranslatingKey] = useState<string | null>(null);

  const activeLocales = useMemo(() => locales.filter((l) => l.isActive), [locales]);
  const defaultLocale = useMemo(() => activeLocales.find((l) => l.isDefault) || activeLocales[0], [activeLocales]);

  const fetchLocales = useCallback(async () => {
    if (!selectedOrg) return;
    try {
      const res = await localeApi.list(selectedOrg.id, projectId, 1, 200);
      setLocales(res.data);
    } catch { /* ignore */ }
  }, [selectedOrg, projectId]);

  const fetchSections = useCallback(async () => {
    if (!selectedOrg) return;
    try {
      const res = await translationApi.getSections(selectedOrg.id, projectId);
      setSections(res.sections);
      if (res.sections.length > 0 && !selectedSection) setSelectedSection(res.sections[0].slug);
    } catch { /* ignore */ }
  }, [selectedOrg, projectId]);

  const fetchEntries = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const res = await translationApi.list(selectedOrg.id, projectId, {
        page: page + 1, limit: rowsPerPage,
        section: selectedSection || undefined,
        search: search || undefined,
      });
      setEntries(res.data);
      setTotal(res.pagination.total);
    } catch { setError("Failed to load translations"); }
    finally { setLoading(false); }
  }, [selectedOrg, projectId, page, rowsPerPage, selectedSection, search]);

  useEffect(() => { fetchLocales(); fetchSections(); }, [fetchLocales, fetchSections]);
  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const getCellValue = (entryId: string, localeCode: string): string => {
    const edited = editedCells.get(`${entryId}:${localeCode}`);
    if (edited) return edited.value;
    const entry = entries.find((e) => e._id === entryId);
    return entry?.values?.[localeCode] || "";
  };

  const handleCellEdit = useCallback((entryId: string, localeCode: string, value: string) => {
    const key = `${entryId}:${localeCode}`;
    setEditedCells((prev) => new Map(prev).set(key, { entryId, localeCode, value }));
  }, []);

  const handleSaveAll = async () => {
    if (!selectedOrg || editedCells.size === 0) return;
    const grouped = new Map<string, Record<string, string>>();
    editedCells.forEach(({ entryId, localeCode, value }) => {
      if (!grouped.has(entryId)) {
        const entry = entries.find((e) => e._id === entryId);
        grouped.set(entryId, { ...(entry?.values || {}) });
      }
      grouped.get(entryId)![localeCode] = value;
    });
    try {
      const promises = Array.from(grouped.entries()).map(([entryId, values]) => {
        const entry = entries.find((e) => e._id === entryId);
        if (!entry) return Promise.resolve();
        return translationApi.upsert(selectedOrg.id, projectId, {
          section: entry.section, key: entry.key, values,
          defaultValue: entry.defaultValue, description: entry.description,
        });
      });
      await Promise.all(promises);
      setEditedCells(new Map());
      setSuccess("All translations saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
      await fetchEntries();
    } catch { setError("Failed to save translations"); }
  };

  const handleDelete = async (entryId: string) => {
    if (!selectedOrg) return;
    try {
      await translationApi.delete(selectedOrg.id, projectId, entryId);
      await fetchEntries();
    } catch { setError("Failed to delete entry"); }
  };

  const handleAutoTranslateSingle = async (entry: TranslationEntry) => {
    if (!selectedOrg || !defaultLocale) return;
    const sourceText = entry.values?.[defaultLocale.code] || entry.defaultValue || "";
    if (!sourceText) { setError("No source text. Set a default value or fill the default locale."); return; }
    setTranslatingKey(entry._id);
    const targets = activeLocales.filter((l) => l.code !== defaultLocale.code);
    try {
      for (const target of targets) {
        const res = await translationApi.autoTranslate(selectedOrg.id, projectId, {
          sourceLocaleCode: defaultLocale.code, targetLocaleCode: target.code,
          texts: { [entry.key]: sourceText },
        });
        if (res.translations[entry.key]) {
          handleCellEdit(entry._id, target.code, res.translations[entry.key]);
        }
      }
      setSuccess("Translation complete! Click Save to persist.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Auto-translation failed");
    } finally { setTranslatingKey(null); }
  };

  const handleBulkTranslated = useCallback((results: Map<string, Record<string, string>>) => {
    results.forEach((localeTranslations, key) => {
      const entry = entries.find((e) => e.key === key);
      if (!entry) return;
      Object.entries(localeTranslations).forEach(([localeCode, translated]) => {
        handleCellEdit(entry._id, localeCode, translated);
      });
    });
    setSuccess("Bulk translation complete! Click Save to persist.");
    setTimeout(() => setSuccess(""), 5000);
  }, [entries, handleCellEdit]);

  return {
    entries, sections, selectedSection, setSelectedSection,
    search, setSearch, loading, error, setError, success,
    page, setPage, rowsPerPage, setRowsPerPage, total,
    editedCells, translateDialogOpen, setTranslateDialogOpen,
    translatingKey, activeLocales,
    getCellValue, handleCellEdit, handleSaveAll, handleDelete,
    handleAutoTranslateSingle, handleBulkTranslated,
  };
};
