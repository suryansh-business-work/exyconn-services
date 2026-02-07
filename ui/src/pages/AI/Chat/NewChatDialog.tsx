import { useEffect } from "react";
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
import { useOrg } from "../../../context/OrgContext";
import { aiChatApi } from "../../../api/aiApi";
import { AIChat, AICompany } from "../../../types/ai";

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
  companies: AICompany[];
  onCreated: (chat: AIChat) => void;
}

const NewChatDialog = ({
  open,
  onClose,
  companies,
  onCreated,
}: NewChatDialogProps) => {
  const { selectedOrg, selectedApiKey } = useOrg();

  const formik = useFormik({
    initialValues: {
      companyId: "",
      title: "",
      model: "",
      maxHistoryMessages: 50,
      systemPrompt: "",
    },
    validationSchema: Yup.object({
      companyId: Yup.string().required("Company is required"),
      title: Yup.string().required("Title is required").min(1).max(200),
      model: Yup.string().required("Model is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      if (!selectedOrg) return;
      try {
        const chat = await aiChatApi.create(
          selectedOrg.id,
          values,
          selectedApiKey?.apiKey,
        );
        resetForm();
        onCreated(chat);
      } catch (err) {
        console.error("Create failed:", err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const selectedCompany = companies.find(
    (c) => c.id === formik.values.companyId,
  );
  const availableModels = selectedCompany?.availableModels || [];

  // Set default model when company changes
  useEffect(() => {
    if (selectedCompany) {
      // If no model selected or current model not in available models, set default
      if (
        !formik.values.model ||
        !availableModels.includes(formik.values.model)
      ) {
        const defaultModel =
          selectedCompany.defaultModel || availableModels[0] || "";
        formik.setFieldValue("model", defaultModel);
      }
    } else {
      // Clear model if no company selected
      formik.setFieldValue("model", "");
    }
  }, [formik.values.companyId, selectedCompany]);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      formik.resetForm();
    }
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>New Chat</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                select
                label="AI Company"
                name="companyId"
                value={formik.values.companyId}
                onChange={formik.handleChange}
                error={
                  formik.touched.companyId && Boolean(formik.errors.companyId)
                }
                helperText={formik.touched.companyId && formik.errors.companyId}
              >
                {companies
                  .filter((c) => c.isActive)
                  .map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name} ({c.provider})
                    </MenuItem>
                  ))}
              </TextField>
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                label="Title"
                name="title"
                placeholder="My AI Chat"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                select
                label="Model"
                name="model"
                value={formik.values.model}
                onChange={formik.handleChange}
                disabled={!selectedCompany}
                error={formik.touched.model && Boolean(formik.errors.model)}
                helperText={
                  (formik.touched.model && formik.errors.model) ||
                  "Select a company first"
                }
              >
                {availableModels.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Max History Messages"
                name="maxHistoryMessages"
                value={formik.values.maxHistoryMessages}
                onChange={formik.handleChange}
                inputProps={{ min: 1, max: 200 }}
                helperText="More messages = more tokens used"
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                label="System Prompt (optional)"
                name="systemPrompt"
                multiline
                rows={3}
                placeholder="You are a helpful assistant..."
                value={formik.values.systemPrompt}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={formik.isSubmitting}
          >
            {formik.isSubmitting ? <CircularProgress size={20} /> : "Create"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default NewChatDialog;
