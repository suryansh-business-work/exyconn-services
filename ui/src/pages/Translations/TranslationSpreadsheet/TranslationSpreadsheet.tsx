import { useState, useEffect, useCallback, useMemo } from "react";
import { Box, Alert, CircularProgress } from "@mui/material";
import { useOrg } from "../../../context/OrgContext";
import { translationApi, localeApi, sectionApi } from "../../../api/translationsApi";
import { Locale, TranslationEntry, Section } from "../../../types/translationsTheme";
import SectionManager from "./SectionManager";
import SpreadsheetToolbar from "./SpreadsheetToolbar";
import SpreadsheetTable from "./SpreadsheetTable";
import AddKeyDialog from "./AddKeyDialog";

interface TranslationSpreadsheetProps {
  projectId: string;
}

interface EditedCell {
  entryId: string;
  localeCode: string;
  value: string;
}

const TranslationSpreadsheet = ({ projectId }: TranslationSpreadsheetProps) => {
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
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [editedCells, setEditedCells] = useState<Map<string, EditedCell>>(new Map());
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const activeLocales = useMemo(() => locales.filter((l) => l.isActive), [locales]);

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
    } catch { /* ignore */ }
  }, [selectedOrg, projectId]);

  const fetchEntries = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const res = await translationApi.list(selectedOrg.id, projectId, {
        page: page + 1,
        limit: rowsPerPage,
        section: selectedSection || undefined,
        search: search || undefined,
      });
      setEntries(res.data);
      setTotal(res.pagination.total);
    } catch {
      setError("Failed to load translations");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, projectId, page, rowsPerPage, selectedSection, search]);

  useEffect(() => { fetchLocales(); fetchSections(); }, [fetchLocales, fetchSections]);
  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const handleCellEdit = (entryId: string, localeCode: string, value: string) => {
    const key = `${entryId}:${localeCode}`;
    setEditedCells((prev) => new Map(prev).set(key, { entryId, localeCode, value }));
  };

  const getCellValue = (entry: TranslationEntry, localeCode: string): string => {
    const edited = editedCells.get(`${entry._id}:${localeCode}`);
    return edited ? edited.value : (entry.values?.[localeCode] || "");
  };

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
        return translationApi.upsert(selectedOrg.id, projectId, { section: entry.section, key: entry.key, values, description: entry.description });
      });
      await Promise.all(promises);
      setEditedCells(new Map());
      setSuccess("Saved successfully");
      setTimeout(() => setSuccess(""), 3000);
      await fetchEntries();
    } catch {
      setError("Failed to save");
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!selectedOrg) return;
    try {
      await translationApi.delete(selectedOrg.id, projectId, entryId);
      await fetchEntries();
    } catch {
      setError("Failed to delete entry");
    }
  };

  const handleAddKey = async (section: string, key: string, description: string) => {
    if (!selectedOrg) return;
    await translationApi.upsert(selectedOrg.id, projectId, { section, key, values: {}, description: description || undefined });
    await fetchSections();
    await fetchEntries();
  };

  const handleAddSection = async (name: string) => {
    if (!selectedOrg) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    await sectionApi.add(selectedOrg.id, projectId, { name, slug });
    await fetchSections();
  };

  const handleRemoveSection = async (slug: string) => {
    if (!selectedOrg) return;
    await sectionApi.remove(selectedOrg.id, projectId, slug);
    if (selectedSection === slug) setSelectedSection("");
    await fetchSections();
    await fetchEntries();
  };

  if (loading && entries.length === 0) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <SectionManager
        sections={sections}
        selectedSection={selectedSection}
        onSectionSelect={(s) => { setSelectedSection(s); setPage(0); }}
        onAddSection={handleAddSection}
        onRemoveSection={handleRemoveSection}
      />
      <SpreadsheetToolbar
        search={search}
        onSearchChange={(s) => { setSearch(s); setPage(0); }}
        localeCount={activeLocales.length}
        hasEdits={editedCells.size > 0}
        editCount={editedCells.size}
        onSave={handleSaveAll}
        onAddKey={() => setAddDialogOpen(true)}
      />
      <SpreadsheetTable
        entries={entries}
        activeLocales={activeLocales}
        getCellValue={getCellValue}
        onCellEdit={handleCellEdit}
        onDelete={handleDeleteEntry}
        page={page}
        rowsPerPage={rowsPerPage}
        total={total}
        onPageChange={setPage}
        onRowsPerPageChange={(rpp) => { setRowsPerPage(rpp); setPage(0); }}
      />
      <AddKeyDialog
        open={addDialogOpen}
        sections={sections}
        onClose={() => setAddDialogOpen(false)}
        onAdd={handleAddKey}
      />
    </Box>
  );
};

export default TranslationSpreadsheet;
