import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Alert, CircularProgress, Chip } from "@mui/material";
import { Language } from "@mui/icons-material";
import { useOrg } from "../../../context/OrgContext";
import { localeApi } from "../../../api/translationsApi";
import { Locale } from "../../../types/translationsTheme";
import UnifiedLocaleTable from "../LocaleManager/UnifiedLocaleTable";

interface StepLocaleSelectionProps {
  projectId: string;
  onLocalesChange: (count: number) => void;
}

const StepLocaleSelection = ({ projectId, onLocalesChange }: StepLocaleSelectionProps) => {
  const { selectedOrg } = useOrg();
  const [locales, setLocales] = useState<Locale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLocales = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const res = await localeApi.list(selectedOrg.id, projectId, 1, 200);
      setLocales(res.data);
      onLocalesChange(res.data.length);
    } catch {
      setError("Failed to load locales");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, projectId, onLocalesChange]);

  useEffect(() => { fetchLocales(); }, [fetchLocales]);

  const handleToggleActive = async (
    code: string, name: string, nativeName: string, flag: string, active: boolean,
  ) => {
    if (!selectedOrg) return;
    try {
      if (active) {
        await localeApi.create(selectedOrg.id, projectId, { code, name, nativeName, flag, isDefault: false });
      } else {
        const locale = locales.find((l) => l.code === code);
        if (locale) await localeApi.delete(selectedOrg.id, projectId, locale._id);
      }
      await fetchLocales();
    } catch {
      setError(`Failed to ${active ? "add" : "remove"} locale`);
    }
  };

  const handleSetDefault = async (locale: Locale) => {
    if (!selectedOrg) return;
    try {
      await localeApi.update(selectedOrg.id, projectId, locale._id, { isDefault: true });
      await fetchLocales();
    } catch {
      setError("Failed to set default");
    }
  };

  if (loading && locales.length === 0) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Language color="primary" />
        <Typography variant="h6">Select Locales</Typography>
        <Chip label={`${locales.length} active`} color="primary" size="small" sx={{ ml: 1 }} />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Toggle the switch to activate locales for this project. You need at least one active locale to proceed.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <UnifiedLocaleTable activeLocales={locales} onToggleActive={handleToggleActive} onSetDefault={handleSetDefault} />
    </Box>
  );
};

export default StepLocaleSelection;
