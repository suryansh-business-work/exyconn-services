import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { aiCompanyApi } from '../../../api/aiApi';
import { useOrg } from '../../../context/OrgContext';
import { AICompany, CreateAICompanyInput } from '../../../types/ai';

interface AICompanyDialogProps {
  open: boolean;
  onClose: () => void;
  company: AICompany | null;
  onSaved: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required').min(2).max(100),
  provider: Yup.string().oneOf(['openai', 'gemini', 'anthropic', 'custom']).required(),
  apiKey: Yup.string().required('API Key is required'),
  baseUrl: Yup.string().url('Must be a valid URL'),
  defaultModel: Yup.string().max(100),
});

const AICompanyDialog = ({ open, onClose, company, onSaved }: AICompanyDialogProps) => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const isEdit = !!company;

  const formik = useFormik<CreateAICompanyInput>({
    initialValues: {
      name: company?.name || '',
      provider: company?.provider || 'openai',
      apiKey: '', // Always empty for security
      apiSecret: '',
      baseUrl: company?.baseUrl || '',
      defaultModel: company?.defaultModel || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      if (!selectedOrg) return;
      try {
        const data = { ...values };
        // Don't send empty apiKey on edit if not changed
        if (isEdit && !data.apiKey) delete (data as Record<string, unknown>).apiKey;
        if (!data.apiSecret) delete (data as Record<string, unknown>).apiSecret;

        if (isEdit && company) {
          await aiCompanyApi.update(selectedOrg.id, company.id, data, selectedApiKey?.apiKey);
        } else {
          await aiCompanyApi.create(selectedOrg.id, data, selectedApiKey?.apiKey);
        }
        onSaved();
        onClose();
      } catch (err) {
        console.error('Save failed:', err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const defaultModels: Record<string, string[]> = {
    openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    gemini: ['gemini-pro', 'gemini-pro-vision'],
    anthropic: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
    custom: [],
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit AI Company' : 'Add AI Company'}</DialogTitle>
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
                select
                label="Provider"
                name="provider"
                value={formik.values.provider}
                onChange={formik.handleChange}
              >
                <MenuItem value="openai">OpenAI</MenuItem>
                <MenuItem value="gemini">Google Gemini</MenuItem>
                <MenuItem value="anthropic">Anthropic</MenuItem>
                <MenuItem value="custom">Custom</MenuItem>
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                type="password"
                label={isEdit ? 'API Key (leave blank to keep current)' : 'API Key'}
                name="apiKey"
                value={formik.values.apiKey}
                onChange={formik.handleChange}
                error={formik.touched.apiKey && Boolean(formik.errors.apiKey)}
                helperText={formik.touched.apiKey && formik.errors.apiKey}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                type="password"
                label="API Secret (optional)"
                name="apiSecret"
                value={formik.values.apiSecret}
                onChange={formik.handleChange}
              />
            </Grid>
            {formik.values.provider === 'custom' && (
              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Base URL"
                  name="baseUrl"
                  placeholder="https://api.example.com"
                  value={formik.values.baseUrl}
                  onChange={formik.handleChange}
                  error={formik.touched.baseUrl && Boolean(formik.errors.baseUrl)}
                  helperText={formik.touched.baseUrl && formik.errors.baseUrl}
                />
              </Grid>
            )}
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                select
                label="Default Model"
                name="defaultModel"
                value={formik.values.defaultModel}
                onChange={formik.handleChange}
              >
                <MenuItem value="">Select a model</MenuItem>
                {defaultModels[formik.values.provider]?.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={formik.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? <CircularProgress size={20} /> : isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AICompanyDialog;
