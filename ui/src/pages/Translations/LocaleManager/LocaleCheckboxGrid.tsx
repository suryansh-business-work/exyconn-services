import { Checkbox, FormControlLabel, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Locale, PredefinedLocale } from "../../../types/translationsTheme";

const PREDEFINED_LOCALES: PredefinedLocale[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "bn", name: "Bengali" },
  { code: "nl", name: "Dutch" },
  { code: "sv", name: "Swedish" },
  { code: "tr", name: "Turkish" },
  { code: "pl", name: "Polish" },
  { code: "vi", name: "Vietnamese" },
  { code: "th", name: "Thai" },
  { code: "id", name: "Indonesian" },
];

interface LocaleCheckboxGridProps {
  activeLocales: Locale[];
  onToggle: (code: string, name: string, checked: boolean) => void;
}

const LocaleCheckboxGrid = ({ activeLocales, onToggle }: LocaleCheckboxGridProps) => {
  const activeCodes = new Set(activeLocales.map((l) => l.code));

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Grid container spacing={1}>
        {PREDEFINED_LOCALES.map((locale) => (
          <Grid key={locale.code} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={activeCodes.has(locale.code)}
                  onChange={(e) => onToggle(locale.code, locale.name, e.target.checked)}
                />
              }
              label={
                <Typography variant="body2" noWrap>
                  {locale.name} ({locale.code})
                </Typography>
              }
              sx={{ mr: 0 }}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default LocaleCheckboxGrid;
