import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Divider,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useFormik } from "formik";
import {
  createSiteMonitorSchema,
  defaultCheckOptions,
} from "../../../validation/siteStatusValidation";
import { siteMonitorApi } from "../../../api/siteStatusApi";
import { useOrg } from "../../../context/OrgContext";
import {
  SiteMonitorConfig,
  CreateSiteMonitorInput,
} from "../../../types/siteStatus";

interface SiteMonitorDialogProps {
  open: boolean;
  onClose: () => void;
  monitor: SiteMonitorConfig | null;
  onSaved: () => void;
}

const SiteMonitorDialog = ({
  open,
  onClose,
  monitor,
  onSaved,
}: SiteMonitorDialogProps) => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const isEdit = !!monitor;

  const formik = useFormik<CreateSiteMonitorInput>({
    initialValues: {
      url: monitor?.url || "",
      name: monitor?.name || "",
      checks: monitor?.checks || defaultCheckOptions,
    },
    validationSchema: createSiteMonitorSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      if (!selectedOrg) return;
      try {
        if (isEdit && monitor) {
          await siteMonitorApi.update(
            selectedOrg.id,
            monitor.id,
            values,
            selectedApiKey?.apiKey,
          );
        } else {
          await siteMonitorApi.create(
            selectedOrg.id,
            values,
            selectedApiKey?.apiKey,
          );
        }
        onSaved();
        onClose();
      } catch (err) {
        console.error("Save failed:", err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const checkOptions = [
    {
      key: "httpStatus",
      label: "HTTP Status (200 OK)",
      description: "Check if site returns a successful HTTP response",
    },
    {
      key: "sslCertificate",
      label: "SSL Certificate",
      description: "Verify SSL certificate validity and expiry",
    },
    {
      key: "dnsRecords",
      label: "DNS Records",
      description: "Retrieve A, AAAA, NS, TXT, CNAME records",
    },
    {
      key: "mxRecords",
      label: "MX Records",
      description: "Check mail server configuration",
    },
    {
      key: "screenshot",
      label: "Screenshot",
      description: "Capture a screenshot of the page",
    },
    {
      key: "pageInfo",
      label: "Page Info",
      description: "Extract title, description, meta tags",
    },
    {
      key: "responseTime",
      label: "Response Time",
      description: "Measure server response time",
    },
  ] as const;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{isEdit ? "Edit Monitor" : "Add New Monitor"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                label="Name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                label="URL"
                name="url"
                placeholder="https://example.com"
                value={formik.values.url}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.url && Boolean(formik.errors.url)}
                helperText={formik.touched.url && formik.errors.url}
              />
            </Grid>
            <Grid size={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Checks to Perform
              </Typography>
              {checkOptions.map((opt) => (
                <Box key={opt.key} sx={{ mb: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        size="small"
                        checked={formik.values.checks[opt.key]}
                        onChange={(e) =>
                          formik.setFieldValue(
                            `checks.${opt.key}`,
                            e.target.checked,
                          )
                        }
                      />
                    }
                    label={<Typography variant="body2">{opt.label}</Typography>}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", ml: 4, mt: -0.5 }}
                  >
                    {opt.description}
                  </Typography>
                </Box>
              ))}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={formik.isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? (
              <CircularProgress size={20} />
            ) : isEdit ? (
              "Update"
            ) : (
              "Create"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SiteMonitorDialog;
