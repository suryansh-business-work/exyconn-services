import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Science, Send } from "@mui/icons-material";
import { useFormik } from "formik";
import { PageBreadcrumb, ActionButton } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { apiLogsApi } from "../../api/apiLogsApi";
import { testLogValidationSchema } from "../../validation/apiLogsValidation";

const TestLogs = () => {
  const { selectedOrg } = useOrg();
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formik = useFormik({
    initialValues: {
      method: "GET" as string,
      url: "/api/test-endpoint",
      statusCode: 200,
      level: "info" as string,
      message: "Test log entry",
      source: "test-ui",
      responseTime: 150,
    },
    validationSchema: testLogValidationSchema,
    onSubmit: async (values) => {
      if (!selectedOrg) return;
      try {
        await apiLogsApi.create(selectedOrg.id, {
          method: values.method as "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
          url: values.url,
          statusCode: values.statusCode,
          level: values.level as "info" | "warn" | "error" | "debug",
          message: values.message,
          source: values.source,
          responseTime: values.responseTime,
          tags: ["test"],
        });
        setSuccess("Test log created successfully!");
      } catch {
        setError("Failed to create test log");
      }
    },
  });

  const handleSendBatch = async () => {
    if (!selectedOrg) return;
    try {
      const sampleLogs = Array.from({ length: 10 }, (_, i) => ({
        method: (["GET", "POST", "PUT", "DELETE"] as const)[i % 4],
        url: `/api/sample-endpoint/${i}`,
        statusCode: i % 3 === 0 ? 500 : 200,
        level: (["info", "warn", "error", "debug"] as const)[i % 4],
        message: `Batch test log entry #${i + 1}`,
        source: "batch-test",
        responseTime: Math.floor(Math.random() * 500),
        tags: ["test", "batch"],
      }));
      const result = await apiLogsApi.createBatch(selectedOrg.id, sampleLogs);
      setSuccess(`${result.inserted} batch test logs created!`);
    } catch {
      setError("Failed to create batch test logs");
    }
  };

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
          { label: "Logs" },
          { label: "Test Logs" },
        ]}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Science sx={{ fontSize: 32, color: "primary.main" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Test Logs</Typography>
          <Typography variant="body2" color="text.secondary">Send test log entries to verify your logging setup</Typography>
        </Box>
        <ActionButton variant="outlined" onClick={handleSendBatch}>Send Batch (10 logs)</ActionButton>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      <Paper sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth label="Method" {...formik.getFieldProps("method")} error={formik.touched.method && Boolean(formik.errors.method)} helperText={formik.touched.method && formik.errors.method}>
                {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="URL" {...formik.getFieldProps("url")} error={formik.touched.url && Boolean(formik.errors.url)} helperText={formik.touched.url && formik.errors.url} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth type="number" label="Status Code" {...formik.getFieldProps("statusCode")} error={formik.touched.statusCode && Boolean(formik.errors.statusCode)} helperText={formik.touched.statusCode && formik.errors.statusCode} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField select fullWidth label="Level" {...formik.getFieldProps("level")} error={formik.touched.level && Boolean(formik.errors.level)} helperText={formik.touched.level && formik.errors.level}>
                {["info", "warn", "error", "debug"].map((l) => <MenuItem key={l} value={l}>{l.toUpperCase()}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField fullWidth type="number" label="Response Time (ms)" {...formik.getFieldProps("responseTime")} error={formik.touched.responseTime && Boolean(formik.errors.responseTime)} helperText={formik.touched.responseTime && formik.errors.responseTime} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Message" {...formik.getFieldProps("message")} error={formik.touched.message && Boolean(formik.errors.message)} helperText={formik.touched.message && formik.errors.message} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Source" {...formik.getFieldProps("source")} error={formik.touched.source && Boolean(formik.errors.source)} helperText={formik.touched.source && formik.errors.source} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <ActionButton type="submit" variant="contained" startIcon={<Send />} loading={formik.isSubmitting}>Send Test Log</ActionButton>
            </Grid>
          </Grid>
        </form>
      </Paper>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess(null)} message={success} />
    </Box>
  );
};

export default TestLogs;
