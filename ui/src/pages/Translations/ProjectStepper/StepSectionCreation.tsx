import { useState, useEffect, useCallback } from "react";
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
  Paper,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Add, FolderOpen } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useOrg } from "../../../context/OrgContext";
import { sectionApi, translationApi } from "../../../api/translationsApi";
import { Section } from "../../../types/translationsTheme";
import SectionTable from "./SectionTable";

interface StepSectionCreationProps {
  projectId: string;
  onSectionsChange: (count: number) => void;
}

const generateSlug = (name: string): string =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const sectionSchema = Yup.object({
  name: Yup.string().required("Section name is required").max(100),
  slug: Yup.string()
    .required("Slug is required")
    .max(100)
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and hyphens only"),
});

const StepSectionCreation = ({ projectId, onSectionsChange }: StepSectionCreationProps) => {
  const { selectedOrg } = useOrg();
  const [sections, setSections] = useState<Section[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchSections = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const res = await translationApi.getSections(selectedOrg.id, projectId);
      setSections(res.sections);
      onSectionsChange(res.sections.length);
    } catch {
      setError("Failed to load sections");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, projectId, onSectionsChange]);

  useEffect(() => { fetchSections(); }, [fetchSections]);

  const formik = useFormik({
    initialValues: { name: "", slug: "" },
    validationSchema: sectionSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!selectedOrg) return;
      try {
        await sectionApi.add(selectedOrg.id, projectId, { name: values.name, slug: values.slug });
        resetForm();
        setDialogOpen(false);
        await fetchSections();
      } catch {
        setError("Failed to add section");
      }
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    formik.setFieldValue("name", name);
    if (!formik.touched.slug || !formik.values.slug) {
      formik.setFieldValue("slug", generateSlug(name));
    }
  };

  const handleRemoveSection = async (slug: string) => {
    if (!selectedOrg) return;
    try {
      await sectionApi.remove(selectedOrg.id, projectId, slug);
      await fetchSections();
    } catch {
      setError("Failed to remove section");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <FolderOpen color="primary" />
        <Typography variant="h6">Create Sections</Typography>
        <Chip label={`${sections.length} sections`} color="primary" size="small" sx={{ ml: 1 }} />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Organize translations into sections. Each section has a display name and a slug used in the access pattern.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
        <Button variant="outlined" startIcon={<Add />} size="small"
          onClick={() => { formik.resetForm(); setDialogOpen(true); }}>
          Add Section
        </Button>
      </Box>
      {loading && sections.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
      ) : sections.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <FolderOpen sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography color="text.secondary">No sections yet. Add a section to organize your translation keys.</Typography>
        </Paper>
      ) : (
        <SectionTable sections={sections} onRemove={handleRemoveSection} />
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Add Section</DialogTitle>
          <DialogContent>
            <TextField label="Section Name" fullWidth margin="dense" size="small"
              placeholder="e.g., Homepage, Authentication, Common"
              value={formik.values.name} onChange={handleNameChange}
              onBlur={formik.handleBlur} name="name"
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name} />
            <TextField label="Slug" fullWidth margin="dense" size="small"
              placeholder="e.g., homepage, authentication, common"
              {...formik.getFieldProps("slug")}
              error={formik.touched.slug && Boolean(formik.errors.slug)}
              helperText={(formik.touched.slug && formik.errors.slug) || "Auto-generated from name. Used in access pattern."} />
            {formik.values.slug && (
              <Paper variant="outlined" sx={{ p: 1.5, mt: 1, bgcolor: "action.hover" }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace" }}>
                  Access: locale.&lt;code&gt;.{formik.values.slug}.&lt;key&gt;
                </Typography>
              </Paper>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>Add</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default StepSectionCreation;
