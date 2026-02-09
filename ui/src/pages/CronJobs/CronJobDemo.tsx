import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Alert,
  Snackbar,
  Chip,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { PlayArrow, Schedule } from "@mui/icons-material";
import { useFormik } from "formik";
import { PageBreadcrumb, ActionButton } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { cronJobsApi } from "../../api/cronJobsApi";
import { cronJobFormSchema } from "../../validation/cronJobsValidation";
import { CronJob } from "../../types/cronJobs";

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;

const CRON_PRESETS = [
  { label: "Every minute", value: "* * * * *" },
  { label: "Every 5 minutes", value: "*/5 * * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "Every day at midnight", value: "0 0 * * *" },
  { label: "Every Monday at 9am", value: "0 9 * * 1" },
];

const CronJobDemo = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const [createdJob, setCreatedJob] = useState<CronJob | null>(null);
  const [executeResult, setExecuteResult] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [executing, setExecuting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: "",
      description: "",
      cronExpression: "*/5 * * * *",
      timezone: "UTC",
      webhookUrl: "",
      method: "GET" as const,
      headers: "",
      body: "",
      maxRetries: 3,
      timeout: 30000,
    },
    validationSchema: cronJobFormSchema,
    onSubmit: async (values) => {
      if (!selectedOrg) return;
      try {
        const job = await cronJobsApi.create(selectedOrg.id, values);
        setCreatedJob(job);
        setSuccess("Cron job created successfully!");
      } catch {
        setError("Failed to create cron job");
      }
    },
  });

  const handleExecute = async () => {
    if (!selectedOrg || !createdJob) return;
    setExecuting(true);
    try {
      const result = await cronJobsApi.execute(selectedOrg.id, createdJob.id);
      setExecuteResult(result.execution);
      setSuccess(
        result.success ? "Job executed successfully!" : "Job execution failed",
      );
    } catch {
      setError("Failed to execute cron job");
    } finally {
      setExecuting(false);
    }
  };

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">
          No organization selected
        </Typography>
      </Box>
    );
  }

  const basePath = selectedApiKey
    ? `/organization/${selectedOrg.id}/apikey/${selectedApiKey.apiKey}`
    : `/organization/${selectedOrg.id}`;

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/dashboard" },
          { label: selectedOrg.orgName, href: basePath },
          { label: "Cron Jobs" },
          { label: "Demo" },
        ]}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Schedule sx={{ fontSize: 32, color: "primary.main" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Cron Job Demo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and test a cron job with webhook execution
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Create Cron Job
            </Typography>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Job Name"
                    placeholder="e.g., Health Check"
                    {...formik.getFieldProps("name")}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name && formik.errors.name}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Description"
                    multiline
                    rows={2}
                    {...formik.getFieldProps("description")}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Cron Expression"
                    placeholder="*/5 * * * *"
                    {...formik.getFieldProps("cronExpression")}
                    error={
                      formik.touched.cronExpression &&
                      Boolean(formik.errors.cronExpression)
                    }
                    helperText={
                      formik.touched.cronExpression &&
                      formik.errors.cronExpression
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                    {CRON_PRESETS.map((p) => (
                      <Chip
                        key={p.value}
                        label={p.label}
                        size="small"
                        variant={
                          formik.values.cronExpression === p.value
                            ? "filled"
                            : "outlined"
                        }
                        color={
                          formik.values.cronExpression === p.value
                            ? "primary"
                            : "default"
                        }
                        onClick={() =>
                          formik.setFieldValue("cronExpression", p.value)
                        }
                        sx={{ fontSize: 10 }}
                      />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Webhook URL"
                    placeholder="https://api.example.com/webhook"
                    {...formik.getFieldProps("webhookUrl")}
                    error={
                      formik.touched.webhookUrl &&
                      Boolean(formik.errors.webhookUrl)
                    }
                    helperText={
                      formik.touched.webhookUrl && formik.errors.webhookUrl
                    }
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    select
                    label="HTTP Method"
                    {...formik.getFieldProps("method")}
                  >
                    {METHODS.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Timeout (ms)"
                    type="number"
                    {...formik.getFieldProps("timeout")}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Headers (JSON)"
                    multiline
                    rows={2}
                    placeholder='{"Authorization": "Bearer token"}'
                    {...formik.getFieldProps("headers")}
                    error={
                      formik.touched.headers && Boolean(formik.errors.headers)
                    }
                    helperText={formik.touched.headers && formik.errors.headers}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Request Body"
                    multiline
                    rows={2}
                    placeholder='{"event": "health-check"}'
                    {...formik.getFieldProps("body")}
                  />
                </Grid>
                <Grid item xs={12}>
                  <ActionButton
                    type="submit"
                    variant="contained"
                    startIcon={<Schedule />}
                    loading={formik.isSubmitting}
                  >
                    Create Cron Job
                  </ActionButton>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Created Job
            </Typography>
            {createdJob ? (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2">Name:</Typography>
                  <Chip label={createdJob.name} size="small" />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2">Status:</Typography>
                  <Chip
                    label={createdJob.status}
                    size="small"
                    color={
                      createdJob.status === "active" ? "success" : "default"
                    }
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 1,
                  }}
                >
                  <Typography variant="subtitle2">Schedule:</Typography>
                  <Chip
                    label={createdJob.cronExpression}
                    size="small"
                    variant="outlined"
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle2">Webhook:</Typography>
                  <Typography variant="body2" sx={{ fontSize: 11 }}>
                    {createdJob.webhookUrl}
                  </Typography>
                </Box>
                <ActionButton
                  variant="outlined"
                  startIcon={<PlayArrow />}
                  onClick={handleExecute}
                  loading={executing}
                >
                  Execute Now
                </ActionButton>
              </Box>
            ) : (
              <Typography color="text.secondary">
                Create a cron job to see details here
              </Typography>
            )}
          </Paper>

          {executeResult && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Execution Result
              </Typography>
              <Box
                component="pre"
                sx={{
                  p: 2,
                  bgcolor: "grey.900",
                  color: "grey.100",
                  borderRadius: 1,
                  fontSize: 11,
                  overflow: "auto",
                  maxHeight: 300,
                }}
              >
                {JSON.stringify(executeResult, null, 2)}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        message={success}
      />
    </Box>
  );
};

export default CronJobDemo;
