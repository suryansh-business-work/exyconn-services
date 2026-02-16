import { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Tooltip,
  Paper,
  Alert,
} from "@mui/material";
import { Add, Delete, Folder } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Section } from "../../../types/translationsTheme";

interface SectionManagerProps {
  sections: Section[];
  selectedSection: string;
  onSectionSelect: (section: string) => void;
  onAddSection: (name: string) => Promise<void>;
  onRemoveSection: (slug: string) => Promise<void>;
}

const sectionSchema = Yup.object({
  name: Yup.string()
    .required("Section name is required")
    .max(100)
    .matches(/^[a-zA-Z0-9_-]+$/, "Only letters, numbers, underscores and hyphens"),
});

const SectionManager = ({
  sections,
  selectedSection,
  onSectionSelect,
  onAddSection,
  onRemoveSection,
}: SectionManagerProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: { name: "" },
    validationSchema: sectionSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await onAddSection(values.name);
        resetForm();
        setDialogOpen(false);
      } catch {
        setError("Failed to add section");
      }
    },
  });

  return (
    <Box sx={{ mb: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Folder fontSize="small" color="action" />
        <Typography variant="subtitle2">Sections</Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Add />}
          onClick={() => {
            formik.resetForm();
            setDialogOpen(true);
          }}
          sx={{ ml: "auto" }}
        >
          Add Section
        </Button>
      </Box>
      {sections.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No sections yet. Add a section to start organizing translation keys.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <Chip
            label="All Sections"
            variant={selectedSection === "" ? "filled" : "outlined"}
            color={selectedSection === "" ? "primary" : "default"}
            onClick={() => onSectionSelect("")}
            size="small"
          />
          {sections.map((s) => (
            <Chip
              key={s.slug}
              label={s.name}
              variant={selectedSection === s.slug ? "filled" : "outlined"}
              color={selectedSection === s.slug ? "primary" : "default"}
              onClick={() => onSectionSelect(s.slug)}
              size="small"
              onDelete={() => onRemoveSection(s.slug)}
              deleteIcon={
                <Tooltip title="Remove section">
                  <IconButton size="small" sx={{ p: 0 }}>
                    <Delete sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              }
            />
          ))}
        </Box>
      )}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Add Section</DialogTitle>
          <DialogContent>
            <TextField
              label="Section Name"
              fullWidth
              margin="dense"
              size="small"
              placeholder="e.g., common, homepage, auth"
              {...formik.getFieldProps("name")}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Access pattern: locale.&lt;code&gt;.{formik.values.name || "<section>"}.&lt;key&gt;
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
              Add
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default SectionManager;
