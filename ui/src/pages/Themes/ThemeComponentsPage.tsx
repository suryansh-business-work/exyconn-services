import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Chip,
  MenuItem,
} from "@mui/material";
import { Save } from "@mui/icons-material";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { themeApi } from "../../api/translationsThemeApi";
import { ThemeData } from "../../types/translationsTheme";

type TokenCategory = "colors" | "typography" | "spacing" | "borderRadius";

const ThemeComponentsPage = () => {
  const { selectedOrg } = useOrg();
  const [themes, setThemes] = useState<ThemeData[]>([]);
  const [selectedThemeId, setSelectedThemeId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TokenCategory>("colors");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editedTokens, setEditedTokens] = useState<Record<string, string | number>>({});

  const fetchThemes = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const res = await themeApi.list(selectedOrg.id);
      setThemes(res.data);
      if (res.data.length > 0 && !selectedThemeId) {
        setSelectedThemeId(res.data[0]._id);
      }
    } catch {
      setError("Failed to load themes");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, selectedThemeId]);

  useEffect(() => {
    fetchThemes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrg]);

  const selectedTheme = themes.find((t) => t._id === selectedThemeId);

  const getTokens = (): Record<string, string | number> => {
    if (!selectedTheme) return {};
    const category = selectedTheme[selectedCategory];
    if (!category) return {};
    return category as unknown as Record<string, string | number>;
  };

  const getDisplayValue = (key: string): string | number => {
    if (key in editedTokens) return editedTokens[key];
    const tokens = getTokens();
    return tokens[key] ?? "";
  };

  const handleTokenChange = (key: string, value: string) => {
    setEditedTokens((prev) => ({
      ...prev,
      [key]: selectedCategory === "colors" ? value : (isNaN(Number(value)) ? value : Number(value)),
    }));
  };

  const handleSave = async () => {
    if (!selectedOrg || !selectedThemeId || Object.keys(editedTokens).length === 0) return;
    try {
      const existing = getTokens();
      const merged = { ...existing, ...editedTokens };
      await themeApi.update(selectedOrg.id, selectedThemeId, {
        [selectedCategory]: merged,
      } as unknown as Partial<ThemeData>);
      setEditedTokens({});
      setSuccess("Theme tokens saved");
      setTimeout(() => setSuccess(""), 3000);
      await fetchThemes();
    } catch {
      setError("Failed to save theme tokens");
    }
  };

  const tokens = getTokens();
  const tokenEntries = Object.entries(tokens);
  const hasEdits = Object.keys(editedTokens).length > 0;

  const breadcrumbs = [
    { label: "Home", href: "/dashboard" },
    { label: selectedOrg?.orgName || "Organization" },
    { label: "Themes" },
    { label: "Components" },
  ];

  return (
    <Box>
      <PageBreadcrumb items={breadcrumbs} />
      <Typography variant="h5" sx={{ mb: 2 }}>
        Theme Design Tokens
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          select
          label="Theme"
          value={selectedThemeId}
          onChange={(e) => {
            setSelectedThemeId(e.target.value);
            setEditedTokens({});
          }}
          size="small"
          sx={{ minWidth: 200 }}
        >
          {themes.map((t) => (
            <MenuItem key={t._id} value={t._id}>
              {t.name} {t.isDefault ? "(Default)" : ""}
            </MenuItem>
          ))}
        </TextField>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {(["colors", "typography", "spacing", "borderRadius"] as TokenCategory[]).map((cat) => (
            <Chip
              key={cat}
              label={cat.charAt(0).toUpperCase() + cat.slice(1)}
              onClick={() => {
                setSelectedCategory(cat);
                setEditedTokens({});
              }}
              color={selectedCategory === cat ? "primary" : "default"}
              variant={selectedCategory === cat ? "filled" : "outlined"}
              size="small"
            />
          ))}
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        {hasEdits && (
          <Button variant="contained" startIcon={<Save />} size="small" onClick={handleSave}>
            Save ({Object.keys(editedTokens).length})
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : !selectedTheme ? (
        <Alert severity="info">Select or create a theme to edit design tokens.</Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 200 }}>Token</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 200 }}>Value</TableCell>
                {selectedCategory === "colors" && (
                  <TableCell sx={{ fontWeight: 700, width: 60 }}>Preview</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {tokenEntries.map(([key]) => {
                const val = getDisplayValue(key);
                return (
                  <TableRow key={key} hover>
                    <TableCell sx={{ fontFamily: "monospace", fontSize: 13 }}>{key}</TableCell>
                    <TableCell sx={{ p: 0.5 }}>
                      {selectedCategory === "colors" ? (
                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                          <input
                            type="color"
                            value={String(val)}
                            onChange={(e) => handleTokenChange(key, e.target.value)}
                            style={{ width: 36, height: 28, border: "none", cursor: "pointer" }}
                          />
                          <TextField
                            value={String(val)}
                            onChange={(e) => handleTokenChange(key, e.target.value)}
                            size="small"
                            sx={{ "& .MuiOutlinedInput-root": { fontSize: 12 } }}
                          />
                        </Box>
                      ) : (
                        <TextField
                          value={String(val)}
                          onChange={(e) => handleTokenChange(key, e.target.value)}
                          size="small"
                          fullWidth
                          sx={{ "& .MuiOutlinedInput-root": { fontSize: 12 } }}
                        />
                      )}
                    </TableCell>
                    {selectedCategory === "colors" && (
                      <TableCell>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            bgcolor: String(val),
                            border: "1px solid",
                            borderColor: "divider",
                          }}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {tokenEntries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                    <Typography color="text.secondary" variant="body2">
                      No tokens found for this category
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default ThemeComponentsPage;
