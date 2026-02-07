import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControlLabel,
  Switch,
  IconButton,
  Typography,
  Divider,
  Box,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Close, Visibility, VisibilityOff } from "@mui/icons-material";
import { useFormik } from "formik";
import { imageKitConfigValidationSchema } from "../../validation/imagekitValidation";
import { ImageKitConfig, ImageKitConfigFormValues } from "../../types/imagekit";
import { imageKitConfigApi } from "../../api/imagekitApi";
import { useOrg } from "../../context/OrgContext";
import { ActionButton } from "../../components/common";

interface ImageKitConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  config?: ImageKitConfig | null;
}

const ImageKitConfigDialog = ({
  open,
  onClose,
  onSuccess,
  config,
}: ImageKitConfigDialogProps) => {
  const { selectedOrg } = useOrg();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(config);

  const formik = useFormik<ImageKitConfigFormValues>({
    initialValues: {
      name: config?.name || "",
      publicKey: config?.publicKey || "",
      privateKey: config?.privateKey || "",
      urlEndpoint: config?.urlEndpoint || "",
      isDefault: config?.isDefault || false,
      isActive: config?.isActive ?? true,
    },
    validationSchema: imageKitConfigValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      if (!selectedOrg) return;
      setError(null);
      try {
        if (isEdit && config) {
          await imageKitConfigApi.update(selectedOrg.id, config.id, values);
        } else {
          await imageKitConfigApi.create(selectedOrg.id, values);
        }
        resetForm();
        onSuccess();
      } catch (err) {
        const axiosError = err as { response?: { data?: { error?: string } } };
        setError(
          axiosError.response?.data?.error || "Failed to save configuration",
        );
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setError(null);
    setShowPrivateKey(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 1.5,
        }}
      >
        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
          {isEdit ? "Edit Configuration" : "Add ImageKit Configuration"}
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <form onSubmit={formik.handleSubmit}>
        <DialogContent sx={{ py: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                name="name"
                label="Configuration Name"
                placeholder="e.g., Production ImageKit"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={
                  (formik.touched.name && formik.errors.name) ||
                  "A friendly name for this configuration"
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                name="urlEndpoint"
                label="URL Endpoint"
                placeholder="https://ik.imagekit.io/your_id"
                value={formik.values.urlEndpoint}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.urlEndpoint &&
                  Boolean(formik.errors.urlEndpoint)
                }
                helperText={
                  (formik.touched.urlEndpoint && formik.errors.urlEndpoint) ||
                  "Your ImageKit URL endpoint"
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                name="publicKey"
                label="Public Key"
                placeholder="public_xxxxxxx"
                value={formik.values.publicKey}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.publicKey && Boolean(formik.errors.publicKey)
                }
                helperText={
                  (formik.touched.publicKey && formik.errors.publicKey) ||
                  "Your ImageKit public API key"
                }
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                name="privateKey"
                label="Private Key"
                placeholder="private_xxxxxxx"
                type={showPrivateKey ? "text" : "password"}
                value={formik.values.privateKey}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.privateKey && Boolean(formik.errors.privateKey)
                }
                helperText={
                  (formik.touched.privateKey && formik.errors.privateKey) ||
                  "Your ImageKit private API key (kept secure)"
                }
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={() => setShowPrivateKey(!showPrivateKey)}
                    >
                      {showPrivateKey ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  ),
                }}
              />
            </Grid>
            <Grid size={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isDefault}
                    onChange={formik.handleChange}
                    name="isDefault"
                  />
                }
                label={<Typography variant="body2">Set as Default</Typography>}
              />
            </Grid>
            <Grid size={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isActive}
                    onChange={formik.handleChange}
                    name="isActive"
                  />
                }
                label={<Typography variant="body2">Active</Typography>}
              />
            </Grid>
          </Grid>
          <Box sx={{ mt: 2, p: 2, bgcolor: "action.hover", borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              You can find these credentials in your ImageKit dashboard under
              Developer Options. The private key is stored securely and never
              exposed to the client.
            </Typography>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ px: 3, py: 1.5 }}>
          <Button onClick={handleClose} size="small">
            Cancel
          </Button>
          <ActionButton
            type="submit"
            variant="contained"
            size="small"
            loading={formik.isSubmitting}
          >
            {isEdit ? "Update" : "Create"}
          </ActionButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ImageKitConfigDialog;
