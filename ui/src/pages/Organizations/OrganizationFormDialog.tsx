import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Box,
  IconButton,
  Typography,
  Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Close, Add } from '@mui/icons-material';
import { useFormik, FieldArray, FormikProvider } from 'formik';
import { organizationValidationSchema } from '../../validation/organizationSchema';
import { Organization, OrganizationFormValues } from '../../types/organization';
import { ActionButton } from '../../components/common';

interface OrganizationFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: OrganizationFormValues) => Promise<void>;
  organization?: Organization | null;
  isLoading?: boolean;
}

const OrganizationFormDialog = ({
  open,
  onClose,
  onSubmit,
  organization,
  isLoading,
}: OrganizationFormDialogProps) => {
  const isEdit = Boolean(organization);

  const formik = useFormik<OrganizationFormValues>({
    initialValues: {
      orgName: organization?.orgName || '',
      orgDescription: organization?.orgDescription || '',
      orgSlug: organization?.orgSlug || '',
      orgType: organization?.orgType || 'Service',
      orgApiKeys: [],
    },
    validationSchema: organizationValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      await onSubmit(values);
      resetForm();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const generateSlug = (name: string): string => {
    return name
      .trim()
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}
      >
        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
          {isEdit ? 'Edit Organization' : 'Create Organization'}
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ py: 2 }}>
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                name="orgName"
                label="Organization Name"
                placeholder="e.g., Acme Corporation"
                value={formik.values.orgName}
                onChange={(e) => {
                  formik.handleChange(e);
                  if (!isEdit && !formik.touched.orgSlug) {
                    formik.setFieldValue('orgSlug', generateSlug(e.target.value));
                  }
                }}
                onBlur={formik.handleBlur}
                error={formik.touched.orgName && Boolean(formik.errors.orgName)}
                helperText={
                  (formik.touched.orgName && formik.errors.orgName) ||
                  'A unique name for your organization (must be unique across all organizations)'
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                name="orgSlug"
                label="Slug (camelCase)"
                placeholder="e.g., acmeCorporation"
                value={formik.values.orgSlug}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.orgSlug && Boolean(formik.errors.orgSlug)}
                helperText={
                  (formik.touched.orgSlug && formik.errors.orgSlug) ||
                  'URL-friendly identifier in camelCase (auto-generated from name)'
                }
                disabled={isEdit}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                name="orgType"
                label="Type"
                select
                value={formik.values.orgType}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.orgType && Boolean(formik.errors.orgType)}
                helperText={
                  (formik.touched.orgType && formik.errors.orgType) ||
                  'Service: API-based services | Product: End-user applications'
                }
              >
                <MenuItem value="Service">Service</MenuItem>
                <MenuItem value="Product">Product</MenuItem>
              </TextField>
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                name="orgDescription"
                label="Description"
                placeholder="Brief description of your organization..."
                multiline
                rows={3}
                value={formik.values.orgDescription}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.orgDescription && Boolean(formik.errors.orgDescription)}
                helperText={
                  (formik.touched.orgDescription && formik.errors.orgDescription) ||
                  'Optional description (max 500 characters)'
                }
              />
            </Grid>
            {!isEdit && (
              <Grid size={12}>
                <FormikProvider value={formik}>
                  <FieldArray name="orgApiKeys">
                    {({ push, remove }) => (
                      <Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 1,
                          }}
                        >
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13 }}>
                              API Keys (Optional)
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: 11 }}
                            >
                              Key names must be unique within this organization
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            startIcon={<Add />}
                            onClick={() => push({ keyName: '' })}
                          >
                            Add Key
                          </Button>
                        </Box>
                        {formik.values.orgApiKeys.map((_, index) => (
                          <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                            <TextField
                              fullWidth
                              size="small"
                              name={`orgApiKeys.${index}.keyName`}
                              placeholder="e.g., Production, Staging, Development"
                              value={formik.values.orgApiKeys[index].keyName}
                              onChange={formik.handleChange}
                            />
                            <IconButton size="small" color="error" onClick={() => remove(index)}>
                              <Close fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </FieldArray>
                </FormikProvider>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={handleClose} size="small" disabled={isLoading}>
            Cancel
          </Button>
          <ActionButton
            type="submit"
            variant="contained"
            size="small"
            disabled={!formik.isValid}
            loading={isLoading}
            loadingText={isEdit ? 'Updating...' : 'Creating...'}
          >
            {isEdit ? 'Update' : 'Create'}
          </ActionButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default OrganizationFormDialog;
