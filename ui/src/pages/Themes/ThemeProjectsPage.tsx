import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, TextField, Alert, CircularProgress,
  Card, CardContent, CardActionArea, IconButton, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Add, Delete, Edit, Search } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { themeProjectApi } from "../../api/translationsThemeApi";
import { ThemeProject, ThemeProjectFormValues } from "../../types/translationsTheme";

const schema = Yup.object({
  name: Yup.string().required("Name is required").max(100),
  description: Yup.string().max(500),
});

const ThemeProjectsPage = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ThemeProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editProject, setEditProject] = useState<ThemeProject | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ThemeProject | null>(null);

  const basePath = selectedApiKey
    ? `/organization/${selectedOrg?.id}/apikey/${selectedApiKey.apiKey}`
    : `/organization/${selectedOrg?.id}`;

  const fetchProjects = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const res = await themeProjectApi.list(selectedOrg.id, 1, 100, search || undefined);
      setProjects(res.data);
    } catch {
      setError("Failed to load theme projects");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, search]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const formik = useFormik<ThemeProjectFormValues>({
    initialValues: { name: "", description: "" },
    validationSchema: schema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      if (!selectedOrg) return;
      try {
        if (editProject) {
          await themeProjectApi.update(selectedOrg.id, editProject._id, values);
        } else {
          await themeProjectApi.create(selectedOrg.id, values);
        }
        resetForm();
        setDialogOpen(false);
        setEditProject(null);
        fetchProjects();
      } catch {
        setError("Failed to save project");
      }
    },
  });

  const openCreate = () => { formik.resetForm(); setEditProject(null); setDialogOpen(true); };
  const openEdit = (p: ThemeProject) => {
    setEditProject(p);
    formik.setValues({ name: p.name, description: p.description || "" });
    setDialogOpen(true);
  };
  const handleDelete = async () => {
    if (!selectedOrg || !deleteTarget) return;
    try {
      await themeProjectApi.delete(selectedOrg.id, deleteTarget._id);
      setDeleteTarget(null);
      fetchProjects();
    } catch { setError("Failed to delete project"); }
  };

  const breadcrumbs = [
    { label: "Home", href: "/dashboard" },
    { label: selectedOrg?.orgName || "Organization", href: basePath },
    { label: "Theme Projects" },
  ];

  if (!selectedOrg) return <Alert severity="warning">Select an organization first</Alert>;

  return (
    <Box>
      <PageBreadcrumb items={breadcrumbs} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h5" fontWeight={600}>Theme Projects</Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <TextField size="small" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)}
            slotProps={{ input: { startAdornment: <Search sx={{ mr: 0.5, color: "text.secondary" }} /> } }} />
          <Button variant="contained" startIcon={<Add />} onClick={openCreate}>Add Project</Button>
        </Box>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {loading ? <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box> : (
        <Grid container spacing={2}>
          {projects.map((p) => (
            <Grid key={p._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardActionArea onClick={() => navigate(`${basePath}/service/themes/projects/${p._id}`)}>
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>{p.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, minHeight: 40 }}>
                      {p.description || "No description"}
                    </Typography>
                    <Typography variant="caption" color="text.disabled">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <Box sx={{ display: "flex", justifyContent: "flex-end", px: 1, pb: 1 }}>
                  <Tooltip title="Edit"><IconButton size="small" onClick={() => openEdit(p)}><Edit fontSize="small" /></IconButton></Tooltip>
                  <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => setDeleteTarget(p)}><Delete fontSize="small" /></IconButton></Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
          {!projects.length && !loading && (
            <Grid size={12}><Typography color="text.secondary" textAlign="center" py={4}>No theme projects found.</Typography></Grid>
          )}
        </Grid>
      )}
      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>{editProject ? "Edit Project" : "Create Project"}</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
            <TextField label="Name" fullWidth {...formik.getFieldProps("name")}
              error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && formik.errors.name} />
            <TextField label="Description" fullWidth multiline rows={3} {...formik.getFieldProps("description")}
              error={formik.touched.description && Boolean(formik.errors.description)} helperText={formik.touched.description && formik.errors.description} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>Save</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Delete Confirmation */}
      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent><Typography>Delete "{deleteTarget?.name}"? This will also remove all themes within it.</Typography></DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThemeProjectsPage;
