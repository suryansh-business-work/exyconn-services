import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Add,
  Delete,
  ContentCopy,
  Star,
  StarBorder,
  Palette,
} from "@mui/icons-material";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { themeApi } from "../../api/translationsThemeApi";
import { ThemeData } from "../../types/translationsTheme";

const DEFAULT_COLORS = {
  primary: "#1976d2",
  secondary: "#9c27b0",
  success: "#2e7d32",
  warning: "#ed6c02",
  error: "#d32f2f",
  info: "#0288d1",
  background: "#ffffff",
  surface: "#f5f5f5",
  text: "#212121",
  textSecondary: "#757575",
  border: "#e0e0e0",
};

const DEFAULT_TYPOGRAPHY = {
  fontFamily: "Roboto, sans-serif",
  fontSize: 14,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  h1Size: "2.5rem",
  h2Size: "2rem",
  h3Size: "1.5rem",
  bodySize: "1rem",
  captionSize: "0.75rem",
};

const DEFAULT_SPACING = { unit: 8, xs: 4, sm: 8, md: 16, lg: 24, xl: 32 };
const DEFAULT_BORDER_RADIUS = { none: 0, sm: 4, md: 8, lg: 12, full: 9999 };

const ThemeListPage = () => {
  const { selectedOrg } = useOrg();
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const fetchThemes = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const res = await themeApi.list(selectedOrg.id);
      setThemes(res.data);
    } catch {
      setError("Failed to load themes");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg]);

  useEffect(() => {
    fetchThemes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrg]);

  const handleCreate = async () => {
    if (!selectedOrg || !newName) return;
    try {
      await themeApi.create(selectedOrg.id, {
        name: newName,
        description: newDesc,
        isDefault: themes.length === 0,
        isActive: true,
        colors: DEFAULT_COLORS,
        typography: DEFAULT_TYPOGRAPHY,
        spacing: DEFAULT_SPACING,
        borderRadius: DEFAULT_BORDER_RADIUS,
        components: {},
      });
      setCreateOpen(false);
      setNewName("");
      setNewDesc("");
      await fetchThemes();
    } catch {
      setError("Failed to create theme");
    }
  };

  const handleDuplicate = async (themeId: string) => {
    if (!selectedOrg) return;
    try {
      await themeApi.duplicate(selectedOrg.id, themeId);
      await fetchThemes();
    } catch {
      setError("Failed to duplicate theme");
    }
  };

  const handleDelete = async (themeId: string) => {
    if (!selectedOrg) return;
    try {
      await themeApi.delete(selectedOrg.id, themeId);
      await fetchThemes();
    } catch {
      setError("Failed to delete theme");
    }
  };

  const breadcrumbs = [
    { label: "Home", href: "/dashboard" },
    { label: selectedOrg?.orgName || "Organization" },
    { label: "Themes" },
    { label: "Theme List" },
  ];

  return (
    <Box>
      <PageBreadcrumb items={breadcrumbs} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">Themes</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setCreateOpen(true)}>
          Create Theme
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : themes.length === 0 ? (
        <Alert severity="info">No themes created yet. Create your first theme to get started.</Alert>
      ) : (
        <Grid container spacing={2}>
          {themes.map((theme) => (
            <Grid key={theme._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Palette color="primary" />
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                      {theme.name}
                    </Typography>
                    {theme.isDefault ? <Star color="warning" /> : <StarBorder color="disabled" />}
                  </Box>
                  {theme.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {theme.description}
                    </Typography>
                  )}
                  <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
                    {Object.entries(theme.colors).slice(0, 6).map(([key, color]) => (
                      <Tooltip key={key} title={`${key}: ${color}`}>
                        <Box
                          sx={{
                            width: 24,
                            height: 24,
                            borderRadius: 1,
                            bgcolor: color,
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Chip label={theme.isActive ? "Active" : "Inactive"} size="small" color={theme.isActive ? "success" : "default"} />
                    <Chip label={theme.typography.fontFamily.split(",")[0]} size="small" variant="outlined" />
                  </Box>
                </CardContent>
                <CardActions>
                  <Tooltip title="Duplicate">
                    <IconButton size="small" onClick={() => handleDuplicate(theme._id)}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Box sx={{ flexGrow: 1 }} />
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(theme._id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Theme</DialogTitle>
        <DialogContent>
          <TextField
            label="Theme Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
            margin="dense"
            size="small"
          />
          <TextField
            label="Description (optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            fullWidth
            margin="dense"
            size="small"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate} disabled={!newName}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ThemeListPage;
