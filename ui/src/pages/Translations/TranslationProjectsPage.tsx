import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActionArea,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Add, Delete, Edit, Search, Language } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { translationProjectApi } from "../../api/translationsApi";
import {
  TranslationProject,
  TranslationProjectFormValues,
} from "../../types/translationsTheme";

const projectSchema = Yup.object({
  name: Yup.string().required("Name is required").max(100),
  description: Yup.string().max(500),
});

const TranslationProjectsPage = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<TranslationProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<TranslationProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TranslationProject | null>(null);
  const [localeCounts, setLocaleCounts] = useState<Record<string, number>>({});

  const basePath = selectedApiKey
    ? `/organization/${selectedOrg?.id}/apikey/${selectedApiKey.apiKey}`
    : `/organization/${selectedOrg?.id}`;

  const fetchProjects = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const res = await translationProjectApi.list(selectedOrg.id, 1, 100, search || undefined);
      setProjects(res.data);
      if (res.data.length > 0) {
        const ids = res.data.map((p) => p._id);
        const countsRes = await translationProjectApi.getLocaleCounts(selectedOrg.id, ids);
        setLocaleCounts(countsRes.counts);
      }
    } catch {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, search]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const formik = useFormik<TranslationProjectFormValues>({
    initialValues: { name: "", description: "" },
    validationSchema: projectSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      if (!selectedOrg) return;
      try {
        if (editProject) {
          await translationProjectApi.update(selectedOrg.id, editProject._id, values);
        } else {
          await translationProjectApi.create(selectedOrg.id, values);
        }
        setDialogOpen(false);
        resetForm();
        setEditProject(null);
        await fetchProjects();
      } catch {
        setError("Failed to save project");
      }
    },
  });

  const openCreate = () => {
    setEditProject(null);
    formik.resetForm({ values: { name: "", description: "" } });
    setDialogOpen(true);
  };

  const openEdit = (p: TranslationProject) => {
    setEditProject(p);
    formik.resetForm({ values: { name: p.name, description: p.description || "" } });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedOrg || !deleteTarget) return;
    try {
      await translationProjectApi.delete(selectedOrg.id, deleteTarget._id);
      setDeleteTarget(null);
      await fetchProjects();
    } catch {
      setError("Failed to delete project");
    }
  };

  const breadcrumbs = [
    { label: "Home", href: "/dashboard" },
    { label: selectedOrg?.orgName || "Organization", href: basePath },
    { label: "Translations" },
    { label: "Projects" },
  ];

  return (
    <Box>
      <PageBreadcrumb items={breadcrumbs} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">Translation Projects</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Project</Button>
      </Box>
      <TextField
        placeholder="Search projects..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        size="small"
        sx={{ mb: 2, minWidth: 280 }}
        InputProps={{ endAdornment: <Search fontSize="small" color="action" /> }}
      />
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
      ) : projects.length === 0 ? (
        <Alert severity="info">No projects yet. Create your first translation project.</Alert>
      ) : (
        <Grid container spacing={2}>
          {projects.map((p) => (
            <Grid key={p._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined">
                <CardActionArea onClick={() => navigate(`${basePath}/service/translations/projects/${p._id}`)}>
                  <CardContent>
                    <Typography variant="h6" noWrap>{p.name}</Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>{p.description || "No description"}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">{new Date(p.createdAt).toLocaleDateString()}</Typography>
                      <Chip icon={<Language sx={{ fontSize: 14 }} />} label={`${localeCounts[p._id] || 0} locales`} size="small" variant="outlined" />
                    </Box>
                  </CardContent>
                </CardActionArea>
                <Box sx={{ display: "flex", justifyContent: "flex-end", px: 1, pb: 1 }}>
                  <Tooltip title="Edit"><IconButton size="small" onClick={(e) => { e.stopPropagation(); openEdit(p); }}><Edit fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}><Delete fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>{editProject ? "Edit Project" : "Create Project"}</DialogTitle>
          <DialogContent>
            <TextField label="Name" fullWidth margin="dense" size="small" {...formik.getFieldProps("name")} error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && formik.errors.name} />
            <TextField label="Description" fullWidth margin="dense" size="small" multiline rows={3} {...formik.getFieldProps("description")} error={formik.touched.description && Boolean(formik.errors.description)} helperText={formik.touched.description && formik.errors.description} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>Save</Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent><Typography>Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This cannot be undone.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TranslationProjectsPage;
