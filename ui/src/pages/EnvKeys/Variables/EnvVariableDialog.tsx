import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { envVariableApi } from '../../../api/envKeysApi';
import { useOrg } from '../../../context/OrgContext';
import { EnvVariable, CreateEnvVariableInput } from '../../../types/envKeys';

interface EnvVariableDialogProps {
  open: boolean;
  onClose: () => void;
  appId: string;
  variable: EnvVariable | null;
  onSaved: () => void;
}

const validationSchema = Yup.object({
  key: Yup.string()
    .required('Key is required')
    .min(1)
    .max(100)
    .matches(/^[A-Z_][A-Z0-9_]*$/, 'Must be uppercase with underscores'),
  value: Yup.string().required('Value is required'),
  description: Yup.string().max(500),
});

const EnvVariableDialog = ({ open, onClose, appId, variable, onSaved }: EnvVariableDialogProps) => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const isEdit = !!variable;

  const formik = useFormik<CreateEnvVariableInput>({
    initialValues: {
      key: variable?.key || '',
      value: '',
      description: variable?.description || '',
      isSecret: variable?.isSecret ?? false,
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      if (!selectedOrg) return;
      try {
        if (isEdit && variable) {
          await envVariableApi.update(
            selectedOrg.id,
            appId,
            variable.id,
            values,
            selectedApiKey?.apiKey
          );
        } else {
          await envVariableApi.create(selectedOrg.id, appId, values, selectedApiKey?.apiKey);
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>{isEdit ? 'Edit Variable' : 'Add Variable'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                label="Key"
                name="key"
                placeholder="MY_ENV_VARIABLE"
                value={formik.values.key}
                onChange={(e) =>
                  formik.setFieldValue(
                    'key',
                    e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_')
                  )
                }
                onBlur={formik.handleBlur}
                error={formik.touched.key && Boolean(formik.errors.key)}
                helperText={formik.touched.key && formik.errors.key}
                disabled={isEdit}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                label={isEdit ? 'Value (leave blank to keep current)' : 'Value'}
                name="value"
                type={formik.values.isSecret ? 'password' : 'text'}
                value={formik.values.value}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.value && Boolean(formik.errors.value)}
                helperText={formik.touched.value && formik.errors.value}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                label="Description"
                name="description"
                multiline
                rows={2}
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={12}>
              <FormControlLabel
                control={
                  <Switch
                    size="small"
                    checked={formik.values.isSecret}
                    onChange={(e) => formik.setFieldValue('isSecret', e.target.checked)}
                    disabled={isEdit}
                  />
                }
                label="Secret (value will be masked)"
              />
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

export default EnvVariableDialog;
