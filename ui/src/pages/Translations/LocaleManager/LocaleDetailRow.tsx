import { Box, Typography, Chip } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { LocaleJsonEntry } from "../../../types/translationsTheme";

interface LocaleDetailRowProps {
  entry: LocaleJsonEntry;
}

interface DetailItemProps {
  label: string;
  value: string | number;
}

const DetailItem = ({ label, value }: DetailItemProps) => {
  const displayValue = value !== null && value !== undefined ? String(value) : "—";
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{displayValue}</Typography>
    </Box>
  );
};

const LocaleDetailRow = ({ entry }: LocaleDetailRowProps) => {
  const { language, country } = entry;

  if (!language || !country) {
    return (
      <Box sx={{ p: 2, bgcolor: "action.hover" }}>
        <Typography variant="body2" color="text.secondary">
          Incomplete locale data
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, bgcolor: "action.hover" }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Language
          </Typography>
          <DetailItem label="Name" value={language.name} />
          <DetailItem label="Native" value={language.name_local} />
          <DetailItem label="ISO 639-1" value={language.iso_639_1} />
          <DetailItem label="ISO 639-2" value={language.iso_639_2} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Country
          </Typography>
          <DetailItem label="Name" value={country.name} />
          <DetailItem label="Native" value={country.name_local} />
          <DetailItem label="Code" value={country.code} />
          <DetailItem label="Area" value={`${country.area_sq_km.toLocaleString()} km²`} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Geography
          </Typography>
          <DetailItem label="Continent" value={country.continent} />
          <DetailItem label="Region" value={country.region} />
          <DetailItem label="Capital" value={country.capital_name} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Currency
          </Typography>
          <DetailItem label="Currency" value={country.currency} />
          <DetailItem label="Code" value={country.currency_code} />
          <DetailItem label="Symbol" value={country.currency_symbol} />
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Languages
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
              {Array.isArray(country.languages) &&
                country.languages.slice(0, 8).map((lang, idx) => {
                  let displayValue = "";
                  if (typeof lang === "string") {
                    displayValue = lang;
                  } else if (lang && typeof lang === "object") {
                    // Handle object - try to extract name, code, or any string property
                    displayValue = (lang as any).name || (lang as any).code || (lang as any).iso || JSON.stringify(lang);
                  } else {
                    displayValue = String(lang);
                  }
                  return (
                    <Chip
                      key={idx}
                      label={displayValue}
                      size="small"
                      variant="outlined"
                    />
                  );
                })}
              {(!Array.isArray(country.languages) || country.languages.length === 0) && (
                <Typography variant="caption" color="text.secondary">
                  No languages listed
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LocaleDetailRow;
