import { Box, TextField, MenuItem, Typography, Chip } from "@mui/material";
import { Settings, Description } from "@mui/icons-material";
import { Field, FormikErrors, FormikTouched } from "formik";
import { SmtpConfig, EmailTemplate } from "../../../types/email";
import { SendEmailFormValues } from "./types";

interface ConfigSectionProps {
  smtpConfigs: SmtpConfig[];
  templates: EmailTemplate[];
  hasNoConfigs: boolean;
  hasNoTemplates: boolean;
  touched: FormikTouched<SendEmailFormValues>;
  errors: FormikErrors<SendEmailFormValues>;
  selectedTemplate: EmailTemplate | null;
  values: SendEmailFormValues;
  setFieldValue: (field: string, value: unknown) => void;
  onTemplateChange: (
    templateId: string,
    setFieldValue: (field: string, value: unknown) => void,
  ) => void;
  onVariableChange: (
    variableName: string,
    value: string,
    currentVariables: Record<string, string>,
    setFieldValue: (field: string, value: unknown) => void,
  ) => void;
}

const ConfigSection = ({
  smtpConfigs,
  templates,
  hasNoConfigs,
  hasNoTemplates,
  touched,
  errors,
  selectedTemplate,
  values,
  setFieldValue,
  onTemplateChange,
  onVariableChange,
}: ConfigSectionProps) => {
  return (
    <>
      {/* SMTP Configuration */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Settings fontSize="small" color="primary" />
          <Typography variant="subtitle2">SMTP Configuration</Typography>
        </Box>
        <Field
          as={TextField}
          select
          name="smtpConfigId"
          label="Select SMTP Configuration"
          fullWidth
          disabled={hasNoConfigs}
          error={touched.smtpConfigId && Boolean(errors.smtpConfigId)}
          helperText={touched.smtpConfigId && errors.smtpConfigId}
        >
          {smtpConfigs.map((config) => (
            <MenuItem key={config.id} value={config.id}>
              <Box>
                <Typography variant="body2">{config.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {config.host}:{config.port}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Field>
      </Box>

      {/* Email Template */}
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Description fontSize="small" color="primary" />
          <Typography variant="subtitle2">Email Template</Typography>
        </Box>
        <Field
          as={TextField}
          select
          name="templateId"
          label="Select Email Template"
          fullWidth
          disabled={hasNoTemplates}
          error={touched.templateId && Boolean(errors.templateId)}
          helperText={touched.templateId && errors.templateId}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onTemplateChange(e.target.value, setFieldValue)
          }
        >
          {templates.map((template) => (
            <MenuItem key={template.id} value={template.id}>
              <Box>
                <Typography variant="body2">{template.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {template.subject}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Field>
      </Box>

      {/* Template Variables */}
      {selectedTemplate && selectedTemplate.variables.length > 0 && (
        <Box>
          <Typography variant="subtitle2" sx={{ mb: 2 }}>
            Template Variables
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {selectedTemplate.variables.map((variable) => (
              <TextField
                key={variable.name}
                label={variable.name}
                value={values.variables[variable.name] || ""}
                placeholder={variable.defaultValue || `Enter ${variable.name}`}
                onChange={(e) =>
                  onVariableChange(
                    variable.name,
                    e.target.value,
                    values.variables,
                    setFieldValue,
                  )
                }
                fullWidth
                size="small"
                helperText={
                  variable.defaultValue
                    ? `Default: ${variable.defaultValue}`
                    : variable.description
                }
                InputProps={{
                  endAdornment:
                    variable.defaultValue &&
                    !values.variables[variable.name] ? (
                      <Chip
                        label="default"
                        size="small"
                        variant="outlined"
                        color="info"
                        sx={{ fontSize: 10 }}
                      />
                    ) : null,
                }}
              />
            ))}
          </Box>
        </Box>
      )}
    </>
  );
};

export default ConfigSection;
