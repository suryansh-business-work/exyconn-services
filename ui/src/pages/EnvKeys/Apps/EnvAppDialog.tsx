import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useFormik } from "formik";
import * as Yup from "yup";
import { envAppApi } from "../../../api/envKeysApi";
import { useOrg } from "../../../context/OrgContext";
import { EnvApp, CreateEnvAppInput } from "../../../types/envKeys";

interface EnvAppDialogProps {
  open: boolean;
  onClose: () => void;
  app: EnvApp | null;
  onSaved: () => void;
}

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required").min(2).max(100),
  description: Yup.string().max(500),
  environment: Yup.string()
    .oneOf(["development", "staging", "production"])
    .required(),
});

const EnvAppDialog = ({ open, onClose, app, onSaved }: EnvAppDialogProps) => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const isEdit = !!app;

  const formik = useFormik<CreateEnvAppInput>({
    initialValues: {
      name: app?.name || "",
      description: app?.description || "",
      environment: app?.environment || "development",
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      if (!selectedOrg) return;
      try {
        if (isEdit && app) {
          await envAppApi.update(
            selectedOrg.id,
            app.id,
            values,
            selectedApiKey?.apiKey,
          );
        } else {
          await envAppApi.create(
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

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>
          {isEdit ? "Edit Application" : "Add New Application"}
        </DialogTitle>
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
                label="Description"
                name="description"
                multiline
                rows={2}
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                select
                label="Environment"
                name="environment"
                value={formik.values.environment}
                onChange={formik.handleChange}
              >
                <MenuItem value="development">Development</MenuItem>
                <MenuItem value="staging">Staging</MenuItem>
                <MenuItem value="production">Production</MenuItem>
              </TextField>
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

export default EnvAppDialog;
