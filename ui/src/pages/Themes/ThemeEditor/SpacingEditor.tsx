import { Box, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ThemeSpacing, ThemeBorderRadius } from "../../../types/translationsTheme";

interface SpacingEditorProps {
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  onSpacingChange: (spacing: ThemeSpacing) => void;
  onBorderRadiusChange: (borderRadius: ThemeBorderRadius) => void;
}

interface NumField<T> {
  key: keyof T;
  label: string;
}

const SPACING_FIELDS: NumField<ThemeSpacing>[] = [
  { key: "unit", label: "Base Unit (px)" },
  { key: "xs", label: "Extra Small (px)" },
  { key: "sm", label: "Small (px)" },
  { key: "md", label: "Medium (px)" },
  { key: "lg", label: "Large (px)" },
  { key: "xl", label: "Extra Large (px)" },
];

const BORDER_FIELDS: NumField<ThemeBorderRadius>[] = [
  { key: "none", label: "None (px)" },
  { key: "sm", label: "Small (px)" },
  { key: "md", label: "Medium (px)" },
  { key: "lg", label: "Large (px)" },
  { key: "full", label: "Full (px)" },
];

const SpacingEditor = ({ spacing, borderRadius, onSpacingChange, onBorderRadiusChange }: SpacingEditorProps) => {
  const handleSpacing = (key: keyof ThemeSpacing, value: string) => {
    onSpacingChange({ ...spacing, [key]: Number(value) || 0 });
  };

  const handleBorder = (key: keyof ThemeBorderRadius, value: string) => {
    onBorderRadiusChange({ ...borderRadius, [key]: Number(value) || 0 });
  };

  return (
    <Box>
      {/* Spacing Section */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        Spacing
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Controls padding, margin, and gap values throughout the theme.
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {SPACING_FIELDS.map(({ key, label }) => (
          <Grid key={key} size={{ xs: 6, sm: 4, md: 3 }}>
            <TextField
              label={label}
              type="number"
              fullWidth
              size="small"
              value={spacing[key]}
              onChange={(e) => handleSpacing(key, e.target.value)}
            />
          </Grid>
        ))}
      </Grid>
      {/* Spacing Preview */}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 4, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
        {SPACING_FIELDS.map(({ key, label }) => (
          <Box key={key} sx={{ textAlign: "center" }}>
            <Box sx={{ width: spacing[key], height: spacing[key], bgcolor: "primary.main", borderRadius: 0.5, minWidth: 4, minHeight: 4 }} />
            <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
              {label.split(" ")[0]}: {spacing[key]}px
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Border Radius Section */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        Border Radius
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Controls the roundness of corners for UI elements.
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {BORDER_FIELDS.map(({ key, label }) => (
          <Grid key={key} size={{ xs: 6, sm: 4, md: 3 }}>
            <TextField
              label={label}
              type="number"
              fullWidth
              size="small"
              value={borderRadius[key]}
              onChange={(e) => handleBorder(key, e.target.value)}
            />
          </Grid>
        ))}
      </Grid>
      {/* Border Radius Preview */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
        {BORDER_FIELDS.map(({ key, label }) => (
          <Box key={key} sx={{ textAlign: "center" }}>
            <Box sx={{ width: 48, height: 48, bgcolor: "primary.main", borderRadius: `${borderRadius[key]}px` }} />
            <Typography variant="caption" sx={{ mt: 0.5, display: "block" }}>
              {label.split(" ")[0]}: {borderRadius[key]}px
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default SpacingEditor;
