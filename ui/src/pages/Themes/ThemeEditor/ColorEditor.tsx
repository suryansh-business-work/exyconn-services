import { Box, TextField, Typography, IconButton, Tooltip, Button } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Add, Delete } from "@mui/icons-material";
import { ThemeColors } from "../../../types/translationsTheme";

const BUILT_IN_KEYS = ["primary", "secondary", "success", "warning", "error", "info", "background", "surface", "text", "textSecondary", "border"];

interface ColorEditorProps {
  colors: ThemeColors;
  onChange: (colors: ThemeColors) => void;
}

const ColorEditor = ({ colors, onChange }: ColorEditorProps) => {
  const handleChange = (key: string, value: string) => {
    onChange({ ...colors, [key]: value });
  };

  const handleDelete = (key: string) => {
    const next = { ...colors };
    delete next[key];
    onChange(next);
  };

  const handleAddCustom = () => {
    const key = `custom_${Date.now()}`;
    onChange({ ...colors, [key]: "#000000" });
  };

  const entries = Object.entries(colors);

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          {entries.length} color tokens
        </Typography>
        <Button size="small" startIcon={<Add />} onClick={handleAddCustom}>
          Add Custom Color
        </Button>
      </Box>
      <Grid container spacing={2}>
        {entries.map(([key, value]) => {
          const isBuiltIn = BUILT_IN_KEYS.includes(key);
          return (
            <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                {/* Color swatch with native picker */}
                <Box sx={{ position: "relative", width: 36, height: 36, flexShrink: 0 }}>
                  <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: value, border: "1px solid", borderColor: "divider" }} />
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    style={{
                      position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                      opacity: 0, cursor: "pointer",
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="caption" fontWeight={600} noWrap>
                    {key}
                  </Typography>
                  <TextField
                    size="small"
                    fullWidth
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    sx={{ mt: 0.5, "& .MuiInputBase-input": { fontSize: 13, py: 0.5 } }}
                  />
                </Box>
                {!isBuiltIn && (
                  <Tooltip title="Remove">
                    <IconButton size="small" color="error" onClick={() => handleDelete(key)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ColorEditor;
