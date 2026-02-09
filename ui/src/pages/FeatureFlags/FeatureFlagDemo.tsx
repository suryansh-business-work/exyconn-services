import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Alert,
  Snackbar,
  Chip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { PlayArrow, Science } from "@mui/icons-material";
import { useFormik } from "formik";
import { PageBreadcrumb, ActionButton } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { featureFlagsApi } from "../../api/featureFlagsApi";
import { FeatureFlagEvaluation } from "../../types/featureFlags";
import { featureFlagEvaluateSchema } from "../../validation/featureFlagsValidation";

const FeatureFlagDemo = () => {
  const { selectedOrg } = useOrg();
  const [result, setResult] = useState<FeatureFlagEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: { key: "", userId: "", attributes: "" },
    validationSchema: featureFlagEvaluateSchema,
    onSubmit: async (values) => {
      if (!selectedOrg) return;
      try {
        let attrs: Record<string, string> | undefined;
        if (values.attributes) {
          try { attrs = JSON.parse(values.attributes); } catch { setError("Invalid JSON for attributes"); return; }
        }
        const res = await featureFlagsApi.evaluate(selectedOrg.id, {
          key: values.key,
          userId: values.userId || undefined,
          attributes: attrs,
        });
        setResult(res);
        setSuccess("Flag evaluated successfully!");
      } catch {
        setError("Failed to evaluate feature flag");
      }
    },
  });

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: selectedOrg.orgName, href: `/organization/${selectedOrg.id}` },
          { label: "Developer Tools" },
          { label: "Feature Flags" },
          { label: "Demo" },
        ]}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Science sx={{ fontSize: 32, color: "primary.main" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Feature Flag Demo</Typography>
          <Typography variant="body2" color="text.secondary">Test feature flag evaluation with different contexts</Typography>
        </Box>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Evaluate Flag</Typography>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="Flag Key" placeholder="e.g., dark-mode" {...formik.getFieldProps("key")} error={formik.touched.key && Boolean(formik.errors.key)} helperText={formik.touched.key && formik.errors.key} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth label="User ID (optional)" placeholder="e.g., user-123" {...formik.getFieldProps("userId")} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField fullWidth multiline rows={3} label="Attributes (JSON, optional)" placeholder='{"plan": "premium", "country": "US"}' {...formik.getFieldProps("attributes")} />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <ActionButton type="submit" variant="contained" startIcon={<PlayArrow />} loading={formik.isSubmitting}>Evaluate</ActionButton>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>Result</Typography>
            {result ? (
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Key:</Typography>
                  <Chip label={result.key} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Enabled:</Typography>
                  <Chip label={result.enabled ? "TRUE" : "FALSE"} color={result.enabled ? "success" : "error"} />
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Reason:</Typography>
                  <Chip label={result.reason} variant="outlined" />
                </Box>
                {result.percentage !== undefined && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Rollout:</Typography>
                    <Chip label={`${result.percentage}%`} color="info" />
                  </Box>
                )}
              </Box>
            ) : (
              <Typography color="text.secondary">Evaluate a flag to see the result</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)} message={success} />
    </Box>
  );
};

export default FeatureFlagDemo;
