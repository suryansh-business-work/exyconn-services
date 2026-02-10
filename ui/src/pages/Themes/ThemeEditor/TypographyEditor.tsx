import { Box, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ThemeTypography } from "../../../types/translationsTheme";

interface TypographyEditorProps {
  typography: ThemeTypography;
  onChange: (typography: ThemeTypography) => void;
}

interface FieldConfig {
  key: keyof ThemeTypography;
  label: string;
  type: "text" | "number";
}

const FIELDS: FieldConfig[] = [
  { key: "fontFamily", label: "Font Family", type: "text" },
  { key: "fontSize", label: "Base Font Size (px)", type: "number" },
  { key: "fontWeightLight", label: "Font Weight Light", type: "number" },
  { key: "fontWeightRegular", label: "Font Weight Regular", type: "number" },
  { key: "fontWeightMedium", label: "Font Weight Medium", type: "number" },
  { key: "fontWeightBold", label: "Font Weight Bold", type: "number" },
  { key: "h1Size", label: "H1 Size", type: "text" },
  { key: "h2Size", label: "H2 Size", type: "text" },
  { key: "h3Size", label: "H3 Size", type: "text" },
  { key: "bodySize", label: "Body Size", type: "text" },
  { key: "captionSize", label: "Caption Size", type: "text" },
];

const TypographyEditor = ({ typography, onChange }: TypographyEditorProps) => {
  const handleChange = (key: keyof ThemeTypography, value: string) => {
    const numFields: (keyof ThemeTypography)[] = ["fontSize", "fontWeightLight", "fontWeightRegular", "fontWeightMedium", "fontWeightBold"];
    if (numFields.includes(key)) {
      onChange({ ...typography, [key]: Number(value) || 0 });
    } else {
      onChange({ ...typography, [key]: value });
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
        Typography tokens control font families, sizes, and weights.
      </Typography>
      <Grid container spacing={2}>
        {FIELDS.map(({ key, label, type }) => (
          <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              label={label}
              type={type}
              fullWidth
              size="small"
              value={typography[key]}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          </Grid>
        ))}
      </Grid>
      {/* Preview */}
      <Box sx={{ mt: 3, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>Preview</Typography>
        <Box sx={{ fontFamily: typography.fontFamily }}>
          <Box sx={{ fontSize: typography.h1Size, fontWeight: typography.fontWeightBold, mb: 0.5 }}>
            Heading 1
          </Box>
          <Box sx={{ fontSize: typography.h2Size, fontWeight: typography.fontWeightMedium, mb: 0.5 }}>
            Heading 2
          </Box>
          <Box sx={{ fontSize: typography.h3Size, fontWeight: typography.fontWeightMedium, mb: 0.5 }}>
            Heading 3
          </Box>
          <Box sx={{ fontSize: typography.bodySize, fontWeight: typography.fontWeightRegular, mb: 0.5 }}>
            Body text with regular weight
          </Box>
          <Box sx={{ fontSize: typography.captionSize, fontWeight: typography.fontWeightLight, color: "text.secondary" }}>
            Caption text with light weight
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default TypographyEditor;
