import { useState, useEffect, useCallback } from "react";
import {
  Box, Typography, Button, Alert, CircularProgress, Chip, Snackbar,
} from "@mui/material";
import { Save } from "@mui/icons-material";
import { useParams } from "react-router-dom";
import { PageBreadcrumb } from "../../../components/common";
import { useOrg } from "../../../context/OrgContext";
import { themeProjectApi, themeApi } from "../../../api/translationsThemeApi";
import {
  ThemeProject, ThemeData, ThemeColors, ThemeTypography, ThemeSpacing, ThemeBorderRadius,
} from "../../../types/translationsTheme";
import ColorEditor from "./ColorEditor";
import TypographyEditor from "./TypographyEditor";
import SpacingEditor from "./SpacingEditor";

type Category = "colors" | "typography" | "spacing";

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "colors", label: "Colors" },
  { key: "typography", label: "Typography" },
  { key: "spacing", label: "Spacing & Border Radius" },
];

const ThemeEditorPage = () => {
  const { projectId, themeId } = useParams<{ projectId: string; themeId: string }>();
  const { selectedOrg, selectedApiKey } = useOrg();
  const [project, setProject] = useState<ThemeProject | null>(null);
  const [theme, setTheme] = useState<ThemeData | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [snackbar, setSnackbar] = useState("");
  const [category, setCategory] = useState<Category>("colors");

  // Editable copies
  const [colors, setColors] = useState<ThemeColors | null>(null);
  const [typography, setTypography] = useState<ThemeTypography | null>(null);
  const [spacing, setSpacing] = useState<ThemeSpacing | null>(null);
  const [borderRadius, setBorderRadius] = useState<ThemeBorderRadius | null>(null);

  const basePath = selectedApiKey
    ? `/organization/${selectedOrg?.id}/apikey/${selectedApiKey.apiKey}`
    : `/organization/${selectedOrg?.id}`;

  const fetchData = useCallback(async () => {
    if (!selectedOrg || !projectId || !themeId) return;
    setLoading(true);
    try {
      const [projRes, themeData] = await Promise.all([
        themeProjectApi.list(selectedOrg.id, 1, 100),
        themeApi.get(selectedOrg.id, projectId, themeId),
      ]);
      setProject(projRes.data.find((p) => p._id === projectId) || null);
      setTheme(themeData);
      setColors(themeData.colors);
      setTypography(themeData.typography);
      setSpacing(themeData.spacing);
      setBorderRadius(themeData.borderRadius);
      setDirty(false);
    } catch {
      setError("Failed to load theme");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, projectId, themeId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    if (!selectedOrg || !projectId || !themeId || !colors || !typography || !spacing || !borderRadius) return;
    setSaving(true);
    try {
      await themeApi.update(selectedOrg.id, projectId, themeId, { colors, typography, spacing, borderRadius });
      setDirty(false);
      setSnackbar("Theme saved successfully");
    } catch {
      setError("Failed to save theme");
    } finally {
      setSaving(false);
    }
  };

  const breadcrumbs = [
    { label: "Home", href: "/dashboard" },
    { label: selectedOrg?.orgName || "Organization", href: basePath },
    { label: "Theme Projects", href: `${basePath}/service/themes/projects` },
    { label: project?.name || "Project", href: `${basePath}/service/themes/projects/${projectId}` },
    { label: theme?.name || "Theme" },
  ];

  if (!selectedOrg) return <Alert severity="warning">Select an organization first</Alert>;
  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>;

  return (
    <Box>
      <PageBreadcrumb items={breadcrumbs} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 2 }}>
        <Typography variant="h5" fontWeight={600}>{theme?.name || "Theme Editor"}</Typography>
        <Button variant="contained" startIcon={<Save />} disabled={!dirty || saving} onClick={handleSave}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {/* Category Chips */}
      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {CATEGORIES.map((c) => (
          <Chip key={c.key} label={c.label} variant={category === c.key ? "filled" : "outlined"}
            color={category === c.key ? "primary" : "default"}
            onClick={() => setCategory(c.key)} clickable />
        ))}
      </Box>
      {/* Editors */}
      {category === "colors" && colors && (
        <ColorEditor colors={colors} onChange={(v) => { setColors(v); setDirty(true); }} />
      )}
      {category === "typography" && typography && (
        <TypographyEditor typography={typography} onChange={(v) => { setTypography(v); setDirty(true); }} />
      )}
      {category === "spacing" && spacing && borderRadius && (
        <SpacingEditor spacing={spacing} borderRadius={borderRadius}
          onSpacingChange={(v) => { setSpacing(v); setDirty(true); }}
          onBorderRadiusChange={(v) => { setBorderRadius(v); setDirty(true); }} />
      )}
      <Snackbar open={Boolean(snackbar)} autoHideDuration={3000} onClose={() => setSnackbar("")} message={snackbar} />
    </Box>
  );
};

export default ThemeEditorPage;
