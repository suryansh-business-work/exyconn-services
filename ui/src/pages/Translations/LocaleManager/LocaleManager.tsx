import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Alert, CircularProgress } from "@mui/material";
import { useOrg } from "../../../context/OrgContext";
import { localeApi } from "../../../api/translationsApi";
import { Locale } from "../../../types/translationsTheme";
import UnifiedLocaleTable from "./UnifiedLocaleTable";

interface LocaleManagerProps {
  projectId: string;
  onLocalesChange?: () => void;
}

const LocaleManager = ({ projectId, onLocalesChange }: LocaleManagerProps) => {
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
      onLocalesChange?.();
    } catch {
      setError("Failed to load locales");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, projectId]);

  useEffect(() => {
    fetchLocales();
  }, [fetchLocales]);

  const handleToggleActive = async (
    code: string,
    name: string,
    nativeName: string,
    flag: string,
    active: boolean
  ) => {
    if (!selectedOrg) return;
    try {
      if (active) {
        await localeApi.create(selectedOrg.id, projectId, {
          code,
          name,
          nativeName,
          flag,
          isDefault: false,
        });
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
      await localeApi.update(selectedOrg.id, projectId, locale._id, {
        isDefault: true,
      });
      await fetchLocales();
    } catch {
      setError("Failed to set default");
    }
  };

  if (loading && locales.length === 0) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Typography variant="h6" sx={{ mb: 1 }}>
        Locale Management
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Toggle the switch to activate locales for this project. Expand rows for
        detailed locale information.
      </Typography>
      <UnifiedLocaleTable
        activeLocales={locales}
        onToggleActive={handleToggleActive}
        onSetDefault={handleSetDefault}
      />
    </Box>
  );
};

export default LocaleManager;
