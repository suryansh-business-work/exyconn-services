import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Slider,
  Typography,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useFormik } from "formik";
import { useOrg } from "../../../context/OrgContext";
import { featureFlagsApi } from "../../../api/featureFlagsApi";
import { FeatureFlag } from "../../../types/featureFlags";
import { featureFlagValidationSchema } from "../../../validation/featureFlagsValidation";
import { useState } from "react";

interface FlagFormDialogProps {
  open: boolean;
  flag: FeatureFlag | null;
  onClose: () => void;
  onSaved: () => void;
}

const FlagFormDialog = ({ open, flag, onClose, onSaved }: FlagFormDialogProps) => {
  const { selectedOrg } = useOrg();
  const [error, setError] = useState<string | null>(null);
  const isEdit = !!flag;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      key: flag?.key ?? "",
      name: flag?.name ?? "",
      description: flag?.description ?? "",
      status: flag?.status ?? "active",
      enabled: flag?.enabled ?? false,
      rolloutType: flag?.rolloutType ?? "boolean",
      rolloutPercentage: flag?.rolloutPercentage ?? 100,
      targetUsers: flag?.targetUsers ?? [],
      tags: flag?.tags ?? [],
      defaultValue: flag?.defaultValue ?? false,
    },
    validationSchema: featureFlagValidationSchema,
    onSubmit: async (values) => {
      if (!selectedOrg) return;
      try {
        if (isEdit) {
          await featureFlagsApi.update(selectedOrg.id, flag.id, {
            ...values,
            targetingRules: flag?.targetingRules ?? [],
          });
        } else {
          await featureFlagsApi.create(selectedOrg.id, {
            ...values,
            targetingRules: [],
          });
        }
        onSaved();
        onClose();
      } catch (err) {
        const errMsg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        setError(errMsg || "Failed to save feature flag");
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEdit ? "Edit Feature Flag" : "Create Feature Flag"}</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
        <form id="flag-form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Key" disabled={isEdit} {...formik.getFieldProps("key")} error={formik.touched.key && Boolean(formik.errors.key)} helperText={formik.touched.key && formik.errors.key} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField fullWidth label="Name" {...formik.getFieldProps("name")} error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && formik.errors.name} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField fullWidth multiline rows={2} label="Description" {...formik.getFieldProps("description")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth label="Status" {...formik.getFieldProps("status")}>
                {["active", "inactive", "archived"].map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField select fullWidth label="Rollout Type" {...formik.getFieldProps("rolloutType")}>
                {["boolean", "percentage", "user-list"].map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
            </Grid>
            {formik.values.rolloutType === "percentage" && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" gutterBottom>Rollout Percentage: {formik.values.rolloutPercentage}%</Typography>
                <Slider value={formik.values.rolloutPercentage} onChange={(_, v) => formik.setFieldValue("rolloutPercentage", v)} min={0} max={100} valueLabelDisplay="auto" />
              </Grid>
            )}
            <Grid size={{ xs: 6 }}>
              <FormControlLabel control={<Switch checked={formik.values.enabled} onChange={(e) => formik.setFieldValue("enabled", e.target.checked)} />} label="Enabled" />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControlLabel control={<Switch checked={formik.values.defaultValue} onChange={(e) => formik.setFieldValue("defaultValue", e.target.checked)} />} label="Default Value" />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="flag-form" variant="contained" disabled={formik.isSubmitting}>{isEdit ? "Update" : "Create"}</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlagFormDialog;
