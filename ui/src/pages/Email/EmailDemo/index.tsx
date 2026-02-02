import { useState, useEffect, useCallback, useMemo } from 'react';
import { Box, Typography, Paper, Alert, Divider } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Send, Email } from '@mui/icons-material';
import { Formik, Form } from 'formik';
import debounce from 'lodash/debounce';
import { PageBreadcrumb, Spinner, ActionButton } from '../../../components/common';
import { useOrg } from '../../../context/OrgContext';
import { smtpConfigApi, emailTemplateApi, emailSendApi } from '../../../api/emailApi';
import { SmtpConfig, EmailTemplate, SendEmailResult } from '../../../types/email';
import { sendEmailValidationSchema } from '../../../validation/emailValidation';
import { SendEmailFormValues, initialFormValues } from './types';
import ConfigSection from './ConfigSection';
import RecipientSection from './RecipientSection';
import EmailPreview from './EmailPreview';

const EmailDemo = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const [smtpConfigs, setSmtpConfigs] = useState<SmtpConfig[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendResult, setSendResult] = useState<SendEmailResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const [smtpResponse, templatesResponse] = await Promise.all([
        smtpConfigApi.list(selectedOrg.id),
        emailTemplateApi.list(selectedOrg.id),
      ]);
      setSmtpConfigs(smtpResponse.data);
      setTemplates(templatesResponse.data);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [selectedOrg]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchPreview = useMemo(
    () =>
      debounce(async (mjmlContent: string, variables: Record<string, string>) => {
        if (!selectedOrg || !mjmlContent) return;
        setPreviewLoading(true);
        try {
          const result = await emailTemplateApi.preview(selectedOrg.id, mjmlContent, variables);
          setPreviewHtml(result.html);
        } catch {
          // Keep existing preview on error
        } finally {
          setPreviewLoading(false);
        }
      }, 300),
    [selectedOrg]
  );

  const handleTemplateChange = async (
    templateId: string,
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    if (!selectedOrg) return;
    setFieldValue('templateId', templateId);
    const template = templates.find((t) => t.id === templateId);
    setSelectedTemplate(template || null);

    if (template) {
      setFieldValue('subject', template.subject);
      const vars: Record<string, string> = {};
      template.variables.forEach((v) => {
        vars[v.name] = v.defaultValue || '';
      });
      setFieldValue('variables', vars);
      if (template.mjmlContent) {
        fetchPreview(template.mjmlContent, vars);
      } else {
        setPreviewHtml(template.htmlContent || '');
      }
    } else {
      setPreviewHtml('');
    }
  };

  const handleVariableChange = (
    variableName: string,
    value: string,
    currentVariables: Record<string, string>,
    setFieldValue: (field: string, value: unknown) => void
  ) => {
    const newVariables = { ...currentVariables, [variableName]: value };
    setFieldValue(`variables.${variableName}`, value);
    if (selectedTemplate?.mjmlContent) {
      const previewVars: Record<string, string> = {};
      selectedTemplate.variables.forEach((v) => {
        previewVars[v.name] = newVariables[v.name] || v.defaultValue || `{{${v.name}}}`;
      });
      fetchPreview(selectedTemplate.mjmlContent, previewVars);
    }
  };

  const handleSubmit = async (values: SendEmailFormValues) => {
    if (!selectedOrg) return;
    setSendResult(null);
    setError(null);
    try {
      const result = await emailSendApi.send(selectedOrg.id, {
        smtpConfigId: values.smtpConfigId,
        templateId: values.templateId,
        to: values.to,
        cc: values.cc.length > 0 ? values.cc : undefined,
        bcc: values.bcc.length > 0 ? values.bcc : undefined,
        subject: values.subject || undefined,
        variables: values.variables,
        apiKeyUsed: selectedApiKey?.apiKey,
      });
      setSendResult(result);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || errorMessage);
    }
  };

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  if (loading) return <Spinner />;

  const hasNoConfigs = smtpConfigs.length === 0;
  const hasNoTemplates = templates.length === 0;

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: selectedOrg.orgName, href: `/organization/${selectedOrg.id}` },
          { label: 'Communications' },
          { label: 'Email' },
          { label: 'Demo' },
        ]}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Email sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Send Demo Email
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Test your email configurations and templates
          </Typography>
        </Box>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {sendResult && (
        <Alert
          severity={sendResult.success ? 'success' : 'error'}
          sx={{ mb: 2 }}
          onClose={() => setSendResult(null)}
        >
          {sendResult.success ? (
            <>Email sent successfully to {sendResult.recipient.join(', ')}!</>
          ) : (
            <>Failed to send email: {sendResult.error}</>
          )}
        </Alert>
      )}
      {hasNoConfigs && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No SMTP configurations found.
        </Alert>
      )}
      {hasNoTemplates && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No email templates found.
        </Alert>
      )}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3 }}>
            <Formik
              initialValues={initialFormValues}
              validationSchema={sendEmailValidationSchema}
              onSubmit={handleSubmit}
            >
              {({ errors, touched, isSubmitting, values, setFieldValue }) => (
                <Form>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <ConfigSection
                      smtpConfigs={smtpConfigs}
                      templates={templates}
                      hasNoConfigs={hasNoConfigs}
                      hasNoTemplates={hasNoTemplates}
                      touched={touched}
                      errors={errors}
                      selectedTemplate={selectedTemplate}
                      values={values}
                      setFieldValue={setFieldValue}
                      onTemplateChange={handleTemplateChange}
                      onVariableChange={handleVariableChange}
                    />
                    <Divider />
                    <RecipientSection
                      values={values}
                      touched={touched}
                      errors={errors}
                      setFieldValue={setFieldValue}
                    />
                    <ActionButton
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      startIcon={<Send />}
                      loading={isSubmitting}
                      disabled={hasNoConfigs || hasNoTemplates}
                    >
                      Send Demo Email
                    </ActionButton>
                  </Box>
                </Form>
              )}
            </Formik>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <EmailPreview
            selectedTemplate={selectedTemplate}
            previewHtml={previewHtml}
            previewLoading={previewLoading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmailDemo;
