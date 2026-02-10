import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Add,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  PlayArrow,
  Star,
} from "@mui/icons-material";
import { Formik, Form, Field } from "formik";
import { PageBreadcrumb, Spinner, ActionButton } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { smtpConfigApi } from "../../api/emailApi";
import { SmtpConfig, SmtpConfigFormValues } from "../../types/email";
import { smtpConfigValidationSchema } from "../../validation/emailValidation";

const initialFormValues: SmtpConfigFormValues = {
  name: "",
  host: "",
  port: 587,
  secure: true,
  username: "",
  password: "",
  fromEmail: "",
  fromName: "",
  isDefault: false,
  isActive: true,
};

const EmailSettings = () => {
  const { selectedOrg } = useOrg();
  const [configs, setConfigs] = useState<SmtpConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SmtpConfig | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [configToDelete, setConfigToDelete] = useState<SmtpConfig | null>(null);
  const [testingConnection, setTestingConnection] = useState<string | null>(
    null,
  );
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const response = await smtpConfigApi.list(selectedOrg.id);
      setConfigs(response.data);
    } catch {
      setError("Failed to load SMTP configurations");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleOpenDialog = (config?: SmtpConfig) => {
    setEditingConfig(config || null);
    setDialogOpen(true);
    setTestResult(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingConfig(null);
    setTestResult(null);
  };

  const handleSubmit = async (values: SmtpConfigFormValues) => {
    if (!selectedOrg) return;
    try {
      if (editingConfig) {
        await smtpConfigApi.update(selectedOrg.id, editingConfig.id, values);
      } else {
        await smtpConfigApi.create(selectedOrg.id, values);
      }
      handleCloseDialog();
      fetchConfigs();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save configuration";
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrg || !configToDelete) return;
    try {
      await smtpConfigApi.delete(selectedOrg.id, configToDelete.id);
      setDeleteConfirmOpen(false);
      setConfigToDelete(null);
      fetchConfigs();
    } catch {
      setError("Failed to delete configuration");
    }
  };

  const handleTestConnection = async (configId: string) => {
    if (!selectedOrg) return;
    setTestingConnection(configId);
    setTestResult(null);
    try {
      const result = await smtpConfigApi.testConnection(
        selectedOrg.id,
        configId,
      );
      setTestResult({
        success: result.success,
        message: result.success
          ? "Connection successful!"
          : result.error || "Connection failed",
      });
    } catch {
      setTestResult({ success: false, message: "Failed to test connection" });
    } finally {
      setTestingConnection(null);
    }
  };

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/" },
          {
            label: selectedOrg.orgName,
            href: `/organization/${selectedOrg.id}`,
          },
          { label: "Communications" },
          { label: "Email" },
          { label: "Settings" },
        ]}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          SMTP Configurations
        </Typography>
        <ActionButton
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenDialog()}
        >
          Add Configuration
        </ActionButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {testResult && (
        <Alert
          severity={testResult.success ? "success" : "error"}
          sx={{ mb: 2 }}
          onClose={() => setTestResult(null)}
        >
          {testResult.message}
        </Alert>
      )}

      {configs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No SMTP configurations found
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenDialog()}
          >
            Add Your First Configuration
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Host</TableCell>
                <TableCell>Port</TableCell>
                <TableCell>From</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Default</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {config.name}
                    </Typography>
                  </TableCell>
                  <TableCell>{config.host}</TableCell>
                  <TableCell>
                    {config.port}
                    {config.secure && (
                      <Chip
                        label="SSL"
                        size="small"
                        sx={{ ml: 1 }}
                        color="success"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{config.fromName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {config.fromEmail}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {config.isActive ? (
                      <Chip
                        icon={<CheckCircle sx={{ fontSize: 16 }} />}
                        label="Active"
                        size="small"
                        color="success"
                      />
                    ) : (
                      <Chip
                        icon={<Cancel sx={{ fontSize: 16 }} />}
                        label="Inactive"
                        size="small"
                        color="default"
                      />
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {config.isDefault && (
                      <Star sx={{ color: "warning.main", fontSize: 20 }} />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Test Connection">
                      <IconButton
                        size="small"
                        onClick={() => handleTestConnection(config.id)}
                        disabled={testingConnection === config.id}
                      >
                        {testingConnection === config.id ? (
                          <CircularProgress size={18} />
                        ) : (
                          <PlayArrow />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(config)}
                      >
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setConfigToDelete(config);
                          setDeleteConfirmOpen(true);
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingConfig ? "Edit SMTP Configuration" : "Add SMTP Configuration"}
        </DialogTitle>
        <Formik
          initialValues={
            editingConfig
              ? {
                  name: editingConfig.name,
                  host: editingConfig.host,
                  port: editingConfig.port,
                  secure: editingConfig.secure,
                  username: editingConfig.username,
                  password: editingConfig.password,
                  fromEmail: editingConfig.fromEmail,
                  fromName: editingConfig.fromName,
                  isDefault: editingConfig.isDefault,
                  isActive: editingConfig.isActive,
                }
              : initialFormValues
          }
          validationSchema={smtpConfigValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting, values, setFieldValue }) => (
            <Form>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid size={12}>
                    <Field
                      as={TextField}
                      name="name"
                      label="Configuration Name"
                      fullWidth
                      error={touched.name && Boolean(errors.name)}
                      helperText={
                        (touched.name && errors.name) ||
                        "A friendly name to identify this configuration"
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <Field
                      as={TextField}
                      name="host"
                      label="SMTP Host"
                      fullWidth
                      error={touched.host && Boolean(errors.host)}
                      helperText={
                        (touched.host && errors.host) || "e.g., smtp.gmail.com"
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Field
                      as={TextField}
                      name="port"
                      label="Port"
                      type="number"
                      fullWidth
                      error={touched.port && Boolean(errors.port)}
                      helperText={
                        (touched.port && errors.port) || "Usually 587 or 465"
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Field
                      as={TextField}
                      name="username"
                      label="Username"
                      fullWidth
                      error={touched.username && Boolean(errors.username)}
                      helperText={touched.username && errors.username}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Field
                      as={TextField}
                      name="password"
                      label="Password"
                      type="password"
                      fullWidth
                      error={touched.password && Boolean(errors.password)}
                      helperText={touched.password && errors.password}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Field
                      as={TextField}
                      name="fromEmail"
                      label="From Email"
                      fullWidth
                      error={touched.fromEmail && Boolean(errors.fromEmail)}
                      helperText={
                        (touched.fromEmail && errors.fromEmail) ||
                        "Sender email address"
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Field
                      as={TextField}
                      name="fromName"
                      label="From Name"
                      fullWidth
                      error={touched.fromName && Boolean(errors.fromName)}
                      helperText={
                        (touched.fromName && errors.fromName) ||
                        "Sender display name"
                      }
                    />
                  </Grid>
                  <Grid size={12}>
                    <Box sx={{ display: "flex", gap: 3 }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.secure}
                            onChange={(e) =>
                              setFieldValue("secure", e.target.checked)
                            }
                          />
                        }
                        label="Use SSL/TLS"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.isActive}
                            onChange={(e) =>
                              setFieldValue("isActive", e.target.checked)
                            }
                          />
                        }
                        label="Active"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={values.isDefault}
                            onChange={(e) =>
                              setFieldValue("isDefault", e.target.checked)
                            }
                          />
                        }
                        label="Set as Default"
                      />
                    </Box>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <ActionButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                >
                  {editingConfig ? "Update" : "Create"}
                </ActionButton>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete SMTP Configuration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{configToDelete?.name}"? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailSettings;
