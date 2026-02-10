import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, Alert, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Add } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { themeProjectApi, themeApi } from "../../api/translationsThemeApi";
import { ThemeProject, ThemeData } from "../../types/translationsTheme";
import ThemeCard from "./ThemeCard";

const DEFAULT_COLORS = { primary: "#1976d2", secondary: "#9c27b0", success: "#2e7d32", warning: "#ed6c02", error: "#d32f2f", info: "#0288d1", background: "#ffffff", surface: "#f5f5f5", text: "#212121", textSecondary: "#757575", border: "#e0e0e0" };
const DEFAULT_TYPOGRAPHY = { fontFamily: "Roboto, sans-serif", fontSize: 14, fontWeightLight: 300, fontWeightRegular: 400, fontWeightMedium: 500, fontWeightBold: 700, h1Size: "2.5rem", h2Size: "2rem", h3Size: "1.5rem", bodySize: "1rem", captionSize: "0.75rem" };
const DEFAULT_SPACING = { unit: 8, xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const DEFAULT_BORDER_RADIUS = { none: 0, sm: 4, md: 8, lg: 12, full: 9999 };

const schema = Yup.object({ name: Yup.string().required("Name is required").max(100), description: Yup.string().max(500) });

const ThemeProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { selectedOrg, selectedApiKey } = useOrg();
  const navigate = useNavigate();
  const [project, setProject] = useState<ThemeProject | null>(null);
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ThemeData | null>(null);

  const basePath = selectedApiKey
    ? `/organization/${selectedOrg?.id}/apikey/${selectedApiKey.apiKey}`
    : `/organization/${selectedOrg?.id}`;

  const fetchData = useCallback(async () => {
    if (!selectedOrg || !projectId) return;
    setLoading(true);
    try {
      const [projRes, themeRes] = await Promise.all([
        themeProjectApi.list(selectedOrg.id, 1, 100),
        themeApi.list(selectedOrg.id, projectId),
      ]);
      setProject(projRes.data.find((p) => p._id === projectId) || null);
      setThemes(themeRes.data);
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, projectId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formik = useFormik({
    initialValues: { name: "", description: "" },
    validationSchema: schema,
    onSubmit: async (values, { resetForm }) => {
      if (!selectedOrg || !projectId) return;
      try {
        await themeApi.create(selectedOrg.id, projectId, {
          name: values.name, description: values.description, isDefault: false, isActive: true,
          colors: DEFAULT_COLORS, typography: DEFAULT_TYPOGRAPHY,
          spacing: DEFAULT_SPACING, borderRadius: DEFAULT_BORDER_RADIUS, components: {},
        });
        resetForm();
        setCreateOpen(false);
        fetchData();
      } catch {
        setError("Failed to create theme");
      }
    },
  });

  const handleDuplicate = async (theme: ThemeData) => {
    if (!selectedOrg || !projectId) return;
    try { await themeApi.duplicate(selectedOrg.id, projectId, theme._id); fetchData(); }
    catch { setError("Failed to duplicate theme"); }
  };

  const handleDelete = async () => {
    if (!selectedOrg || !projectId || !deleteTarget) return;
    try { await themeApi.delete(selectedOrg.id, projectId, deleteTarget._id); setDeleteTarget(null); fetchData(); }
    catch { setError("Failed to delete theme"); }
  };

  const breadcrumbs = [
    { label: "Home", href: "/dashboard" },
    { label: selectedOrg?.orgName || "Organization", href: basePath },
    { label: "Theme Projects", href: `${basePath}/service/themes/projects` },
    { label: project?.name || "Project" },
  ];

  if (!selectedOrg) return <Alert severity="warning">Select an organization first</Alert>;

  return (
    <Box>
      <PageBreadcrumb items={breadcrumbs} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h5" fontWeight={600}>{project?.name || "Theme Project"}</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => { formik.resetForm(); setCreateOpen(true); }}>Create Theme</Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {loading ? <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box> : (
        <Grid container spacing={2}>
          {themes.map((t) => (
            <Grid key={t._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ThemeCard theme={t}
                onClick={() => navigate(`${basePath}/service/themes/projects/${projectId}/editor/${t._id}`)}
                onEdit={() => navigate(`${basePath}/service/themes/projects/${projectId}/editor/${t._id}`)}
                onDuplicate={() => handleDuplicate(t)}
                onDelete={() => setDeleteTarget(t)} />
            </Grid>
          ))}
          {!themes.length && !loading && (
            <Grid size={12}><Typography color="text.secondary" textAlign="center" py={4}>No themes yet. Create your first theme.</Typography></Grid>
          )}
        </Grid>
      )}
      {/* Create Dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Create Theme</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
            <TextField label="Name" fullWidth {...formik.getFieldProps("name")}
              error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && formik.errors.name} />
            <TextField label="Description" fullWidth multiline rows={3} {...formik.getFieldProps("description")}
              error={formik.touched.description && Boolean(formik.errors.description)} helperText={formik.touched.description && formik.errors.description} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>Create</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Delete Confirmation */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Theme</DialogTitle>
        <DialogContent><Typography>Delete "{deleteTarget?.name}"? This cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThemeProjectDetailPage;
