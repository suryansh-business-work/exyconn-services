import { useState, useEffect, useCallback, useMemo } from 'react';
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
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Add, Edit, Delete, Visibility, Code, CheckCircle, Cancel } from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import Editor from '@monaco-editor/react';
import { PageBreadcrumb, Spinner, ActionButton } from '../../components/common';
import { useOrg } from '../../context/OrgContext';
import { emailTemplateApi } from '../../api/emailApi';
import { EmailTemplate, EmailTemplateFormValues, TemplateVariable } from '../../types/email';
import { emailTemplateValidationSchema } from '../../validation/emailValidation';
import debounce from 'lodash/debounce';

const defaultMjmlTemplate = `<mjml>
  <mj-body>
    <mj-section>
      <mj-column>
        <mj-text font-size="20px" color="#333" font-family="helvetica">
          Hello {{name}}!
        </mj-text>
        <mj-text font-size="14px" color="#666">
          Welcome to our service. We're excited to have you on board.
        </mj-text>
        <mj-button background-color="#007bff" href="{{link}}">
          Get Started
        </mj-button>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>`;

const initialFormValues: EmailTemplateFormValues = {
  name: '',
  description: '',
  subject: '',
  mjmlContent: defaultMjmlTemplate,
  variables: [],
  isActive: true,
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <div hidden={value !== index} style={{ height: '100%' }}>
    {value === index && children}
  </div>
);

const EmailTemplates = () => {
  const { selectedOrg } = useOrg();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewErrors, setPreviewErrors] = useState<Array<{ message: string }>>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<EmailTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState(0);
  const [livePreviewHtml, setLivePreviewHtml] = useState('');
  const [livePreviewLoading, setLivePreviewLoading] = useState(false);

  const fetchTemplates = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const response = await emailTemplateApi.list(selectedOrg.id);
      setTemplates(response.data);
    } catch (err) {
      setError('Failed to load email templates');
    } finally {
      setLoading(false);
    }
  }, [selectedOrg]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const fetchPreview = useMemo(
    () =>
      debounce(async (mjmlContent: string, variables: Record<string, string>) => {
        if (!selectedOrg || !mjmlContent) {
          setLivePreviewHtml('');
          return;
        }
        setLivePreviewLoading(true);
        try {
          const result = await emailTemplateApi.preview(selectedOrg.id, mjmlContent, variables);
          setLivePreviewHtml(result.html);
          setPreviewErrors(result.errors);
        } catch (err) {
          setLivePreviewHtml('<p style="color: red;">Failed to compile MJML</p>');
        } finally {
          setLivePreviewLoading(false);
        }
      }, 500),
    [selectedOrg]
  );

  const handleOpenDialog = (template?: EmailTemplate) => {
    setEditingTemplate(template || null);
    setDialogOpen(true);
    setEditorTab(0);
    setLivePreviewHtml('');
    setPreviewErrors([]);

    // Trigger initial preview
    const content = template?.mjmlContent || defaultMjmlTemplate;
    const vars = extractVariablesAsValues(template?.variables || []);
    setTimeout(() => fetchPreview(content, vars), 100);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTemplate(null);
    setLivePreviewHtml('');
    setPreviewErrors([]);
    fetchPreview.cancel();
  };

  const handleSubmit = async (values: EmailTemplateFormValues) => {
    if (!selectedOrg) return;
    try {
      // Use variables from the form which already include default values
      // If variables is empty or undefined, extract from MJML content
      let finalVariables = values.variables || [];

      // If no variables set in form, extract from content
      if (finalVariables.length === 0) {
        finalVariables = extractVariablesFromMjml(values.mjmlContent);
      }

      const updatedValues = {
        ...values,
        variables: finalVariables,
      };

      if (editingTemplate) {
        await emailTemplateApi.update(selectedOrg.id, editingTemplate.id, updatedValues);
      } else {
        await emailTemplateApi.create(selectedOrg.id, updatedValues);
      }
      handleCloseDialog();
      fetchTemplates();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save template';
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrg || !templateToDelete) return;
    try {
      await emailTemplateApi.delete(selectedOrg.id, templateToDelete.id);
      setDeleteConfirmOpen(false);
      setTemplateToDelete(null);
      fetchTemplates();
    } catch (err) {
      setError('Failed to delete template');
    }
  };

  const handlePreview = async (template: EmailTemplate) => {
    setPreviewHtml(template.htmlContent || '');
    setPreviewDialogOpen(true);
  };

  const extractVariablesFromMjml = (content: string): TemplateVariable[] => {
    const regex = /\{\{\s*(\w+)\s*\}\}/g;
    const variables: Set<string> = new Set();
    let match;
    while ((match = regex.exec(content)) !== null) {
      variables.add(match[1]);
    }
    return Array.from(variables).map((name) => ({
      name,
      description: '',
      defaultValue: '',
    }));
  };

  const extractVariablesAsValues = (variables: TemplateVariable[]): Record<string, string> => {
    const result: Record<string, string> = {};
    variables.forEach((v) => {
      result[v.name] = v.defaultValue || `{{${v.name}}}`;
    });
    return result;
  };

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
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
          { label: 'Home', href: '/' },
          { label: selectedOrg.orgName, href: `/organization/${selectedOrg.id}` },
          { label: 'Communications' },
          { label: 'Email' },
          { label: 'Templates' },
        ]}
      />

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Email Templates
        </Typography>
        <ActionButton variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
          Add Template
        </ActionButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {templates.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No email templates found
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            Create Your First Template
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Variables</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template) => (
                <TableRow key={template.id} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {template.name}
                    </Typography>
                    {template.description && (
                      <Typography variant="caption" color="text.secondary">
                        {template.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{template.subject}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {template.variables.slice(0, 3).map((v) => (
                        <Chip key={v.name} label={v.name} size="small" variant="outlined" />
                      ))}
                      {template.variables.length > 3 && (
                        <Chip label={`+${template.variables.length - 3}`} size="small" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    {template.isActive ? (
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
                  <TableCell align="right">
                    <Tooltip title="Preview">
                      <IconButton size="small" onClick={() => handlePreview(template)}>
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => handleOpenDialog(template)}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setTemplateToDelete(template);
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
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xl" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Edit Email Template' : 'Create Email Template'}
        </DialogTitle>
        <Formik
          initialValues={
            editingTemplate
              ? {
                  name: editingTemplate.name,
                  description: editingTemplate.description || '',
                  subject: editingTemplate.subject,
                  mjmlContent: editingTemplate.mjmlContent,
                  variables: editingTemplate.variables,
                  isActive: editingTemplate.isActive,
                }
              : initialFormValues
          }
          validationSchema={emailTemplateValidationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ errors, touched, isSubmitting, values, setFieldValue }) => (
            <Form>
              <DialogContent sx={{ minHeight: '70vh' }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Field
                      as={TextField}
                      name="name"
                      label="Template Name"
                      fullWidth
                      size="small"
                      error={touched.name && Boolean(errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 5 }}>
                    <Field
                      as={TextField}
                      name="subject"
                      label="Email Subject"
                      fullWidth
                      size="small"
                      error={touched.subject && Boolean(errors.subject)}
                      helperText={
                        (touched.subject && errors.subject) ||
                        'Use {{variable}} for dynamic content'
                      }
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 3 }}>
                    <Field
                      as={TextField}
                      name="description"
                      label="Description"
                      fullWidth
                      size="small"
                      error={touched.description && Boolean(errors.description)}
                      helperText={touched.description && errors.description}
                    />
                  </Grid>

                  {/* MJML Editor with Preview */}
                  <Grid size={12}>
                    <Paper variant="outlined" sx={{ height: '55vh', overflow: 'hidden' }}>
                      <Grid container sx={{ height: '100%' }}>
                        {/* Code Editor Side */}
                        <Grid
                          size={6}
                          sx={{
                            borderRight: 1,
                            borderColor: 'divider',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                          }}
                        >
                          <Box
                            sx={{
                              px: 2,
                              py: 1,
                              borderBottom: 1,
                              borderColor: 'divider',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Code fontSize="small" />
                            <Typography variant="subtitle2">MJML Editor</Typography>
                          </Box>
                          <Box sx={{ flex: 1, overflow: 'hidden' }}>
                            <Editor
                              height="100%"
                              defaultLanguage="xml"
                              value={values.mjmlContent}
                              onChange={(value) => {
                                const newValue = value || '';
                                setFieldValue('mjmlContent', newValue);
                                const vars = extractVariablesFromMjml(newValue);
                                // Merge existing variable default values with newly detected vars
                                const existingVars = values.variables || [];
                                const updatedVars = vars.map((v) => {
                                  const existing = existingVars.find((ev) => ev.name === v.name);
                                  return existing
                                    ? { ...v, defaultValue: existing.defaultValue }
                                    : v;
                                });
                                setFieldValue('variables', updatedVars);
                                fetchPreview(newValue, extractVariablesAsValues(updatedVars));
                              }}
                              options={{
                                minimap: { enabled: false },
                                fontSize: 13,
                                fontFamily: "'Fira Code', 'Consolas', monospace",
                                wordWrap: 'on',
                                automaticLayout: true,
                                scrollBeyondLastLine: false,
                                lineNumbers: 'on',
                                tabSize: 2,
                                formatOnPaste: true,
                                formatOnType: true,
                                folding: true,
                                bracketPairColorization: { enabled: true },
                              }}
                              theme="vs-dark"
                            />
                          </Box>
                        </Grid>

                        {/* Preview Side */}
                        <Grid
                          size={6}
                          sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                        >
                          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <Tabs value={editorTab} onChange={(_, v) => setEditorTab(v)}>
                              <Tab label="Preview" />
                              <Tab label="Variables" />
                            </Tabs>
                          </Box>
                          <TabPanel value={editorTab} index={0}>
                            <Box sx={{ height: '100%', overflow: 'auto', bgcolor: 'grey.50' }}>
                              {previewErrors.length > 0 && (
                                <Alert severity="warning" sx={{ m: 1 }}>
                                  {previewErrors.map((e, i) => (
                                    <Typography key={i} variant="caption" display="block">
                                      {e.message}
                                    </Typography>
                                  ))}
                                </Alert>
                              )}
                              {livePreviewLoading ? (
                                <Box
                                  sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: '100%',
                                  }}
                                >
                                  <Spinner size={40} />
                                </Box>
                              ) : (
                                <iframe
                                  srcDoc={
                                    livePreviewHtml ||
                                    '<p style="color: #999; padding: 20px;">Start typing MJML to see preview...</p>'
                                  }
                                  style={{ width: '100%', height: '100%', border: 'none' }}
                                  title="Email Preview"
                                />
                              )}
                            </Box>
                          </TabPanel>
                          <TabPanel value={editorTab} index={1}>
                            <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
                              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                                Detected Variables (Set Default Values)
                              </Typography>
                              {extractVariablesFromMjml(values.mjmlContent).length === 0 ? (
                                <Typography color="text.secondary" variant="body2">
                                  No variables detected. Use {'{{variableName}}'} syntax in your
                                  MJML.
                                </Typography>
                              ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                  {extractVariablesFromMjml(values.mjmlContent).map((v) => {
                                    const existingVar = values.variables?.find(
                                      (ev) => ev.name === v.name
                                    );
                                    return (
                                      <Box
                                        key={v.name}
                                        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                                      >
                                        <Chip
                                          label={`{{${v.name}}}`}
                                          variant="outlined"
                                          color="primary"
                                          size="small"
                                          sx={{ minWidth: 120 }}
                                        />
                                        <TextField
                                          size="small"
                                          label="Default Value"
                                          placeholder={`Default for ${v.name}`}
                                          value={existingVar?.defaultValue || ''}
                                          onChange={(e) => {
                                            const detectedVars = extractVariablesFromMjml(
                                              values.mjmlContent
                                            );
                                            const updatedVars = detectedVars.map((dv) => {
                                              if (dv.name === v.name) {
                                                return { ...dv, defaultValue: e.target.value };
                                              }
                                              const existing = values.variables?.find(
                                                (ev) => ev.name === dv.name
                                              );
                                              return existing
                                                ? { ...dv, defaultValue: existing.defaultValue }
                                                : dv;
                                            });
                                            setFieldValue('variables', updatedVars);
                                            fetchPreview(
                                              values.mjmlContent,
                                              extractVariablesAsValues(updatedVars)
                                            );
                                          }}
                                          sx={{ flex: 1 }}
                                        />
                                      </Box>
                                    );
                                  })}
                                </Box>
                              )}
                            </Box>
                          </TabPanel>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseDialog}>Cancel</Button>
                <ActionButton type="submit" variant="contained" loading={isSubmitting}>
                  {editingTemplate ? 'Update' : 'Create'}
                </ActionButton>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Template Preview</DialogTitle>
        <DialogContent>
          <Box sx={{ bgcolor: 'grey.50', borderRadius: 1, minHeight: 400 }}>
            <iframe
              srcDoc={previewHtml}
              style={{ width: '100%', height: 500, border: 'none' }}
              title="Email Preview"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Delete Email Template</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{templateToDelete?.name}"? This action cannot be
            undone.
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

export default EmailTemplates;
