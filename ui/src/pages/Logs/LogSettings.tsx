import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  Chip,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Settings, Save } from "@mui/icons-material";
import { useFormik } from "formik";
import { PageBreadcrumb, Spinner, ActionButton } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { apiLogsApi } from "../../api/apiLogsApi";
import { ApiLogSettings as IApiLogSettings, ApiLogLevel } from "../../types/apiLogs";
import { apiLogSettingsValidationSchema } from "../../validation/apiLogsValidation";
import LogRetentionField from "./components/LogRetentionField";

const ALL_LEVELS: ApiLogLevel[] = ["info", "warn", "error", "debug"];

const LogSettings = () => {
  const { selectedOrg } = useOrg();
  const [settings, setSettings] = useState<IApiLogSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const data = await apiLogsApi.getSettings(selectedOrg.id);
      setSettings(data);
    } catch {
      setError("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      retentionDays: settings?.retentionDays ?? 90,
      maxLogsPerDay: settings?.maxLogsPerDay ?? 100000,
      enabledLevels: settings?.enabledLevels ?? ALL_LEVELS,
      enableRequestBodyCapture: settings?.enableRequestBodyCapture ?? true,
      enableResponseBodyCapture: settings?.enableResponseBodyCapture ?? false,
      excludedPaths: settings?.excludedPaths ?? [],
    },
    validationSchema: apiLogSettingsValidationSchema,
    onSubmit: async (values) => {
      if (!selectedOrg) return;
      try {
        const updated = await apiLogsApi.updateSettings(selectedOrg.id, values);
        setSettings(updated);
        setSuccess("Settings updated successfully!");
      } catch {
        setError("Failed to update settings");
      }
    },
  });

  const toggleLevel = (level: ApiLogLevel) => {
    const current = formik.values.enabledLevels;
    const updated = current.includes(level)
      ? current.filter((l) => l !== level)
      : [...current, level];
    formik.setFieldValue("enabledLevels", updated);
  };

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  if (loading) return <Spinner />;

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: selectedOrg.orgName, href: `/organization/${selectedOrg.id}` },
          { label: "Developer Tools" },
          { label: "Logs" },
          { label: "Settings" },
        ]}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Settings sx={{ fontSize: 32, color: "primary.main" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Log Settings</Typography>
          <Typography variant="body2" color="text.secondary">Configure log retention, capture options, and levels</Typography>
        </Box>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <LogRetentionField
                retentionDays={formik.values.retentionDays}
                maxLogsPerDay={formik.values.maxLogsPerDay}
                onRetentionChange={(v) => formik.setFieldValue("retentionDays", v)}
                onMaxLogsChange={(v) => formik.setFieldValue("maxLogsPerDay", v)}
              />
            </Grid>
            <Grid size={{ xs: 12 }}><Divider /></Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Enabled Log Levels</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {ALL_LEVELS.map((level) => (
                  <Chip
                    key={level}
                    label={level.toUpperCase()}
                    onClick={() => toggleLevel(level)}
                    color={formik.values.enabledLevels.includes(level) ? (level === "error" ? "error" : level === "warn" ? "warning" : level === "debug" ? "secondary" : "info") : "default"}
                    variant={formik.values.enabledLevels.includes(level) ? "filled" : "outlined"}
                  />
                ))}
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}><Divider /></Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={<Switch checked={formik.values.enableRequestBodyCapture} onChange={(e) => formik.setFieldValue("enableRequestBodyCapture", e.target.checked)} />}
                label="Capture Request Body"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControlLabel
                control={<Switch checked={formik.values.enableResponseBodyCapture} onChange={(e) => formik.setFieldValue("enableResponseBodyCapture", e.target.checked)} />}
                label="Capture Response Body"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ActionButton type="submit" variant="contained" startIcon={<Save />} loading={formik.isSubmitting}>Save Settings</ActionButton>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)} message={success} />
    </Box>
  );
};

export default LogSettings;
