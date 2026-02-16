import { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  Switch,
  FormControlLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Delete, Translate } from "@mui/icons-material";
import { Locale, TranslationEntry } from "../../../types/translationsTheme";
import RichTextEditor from "./RichTextEditor";

interface TranslationKeyCardProps {
  entry: TranslationEntry;
  locales: Locale[];
  getCellValue: (entryId: string, localeCode: string) => string;
  onCellEdit: (entryId: string, localeCode: string, value: string) => void;
  onDelete: (entryId: string) => void;
  onAutoTranslateSingle: (entry: TranslationEntry) => void;
  translatingKey: string | null;
}

const TranslationKeyCard = ({
  entry, locales, getCellValue, onCellEdit, onDelete, onAutoTranslateSingle, translatingKey,
}: TranslationKeyCardProps) => {
  const [richTextMode, setRichTextMode] = useState(false);
  const isTranslating = translatingKey === entry._id;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2, opacity: isTranslating ? 0.7 : 1 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Chip label={entry.section} size="small" variant="outlined" color="primary" />
            <Typography variant="subtitle2" sx={{ fontFamily: "monospace" }}>{entry.key}</Typography>
          </Box>
          {entry.description && (
            <Typography variant="caption" color="text.secondary" display="block">{entry.description}</Typography>
          )}
          {entry.defaultValue && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              Default: <em>&quot;{entry.defaultValue}&quot;</em>
            </Typography>
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 0.5, flexShrink: 0 }}>
          <FormControlLabel
            control={<Switch size="small" checked={richTextMode} onChange={(_, c) => setRichTextMode(c)} />}
            label={<Typography variant="caption">Rich</Typography>}
            sx={{ mr: 0 }}
          />
          <Tooltip title="Auto-translate this key">
            <IconButton size="small" color="primary" onClick={() => onAutoTranslateSingle(entry)} disabled={isTranslating}>
              <Translate fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete key">
            <IconButton size="small" color="error" onClick={() => onDelete(entry._id)}>
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Grid container spacing={2}>
        {locales.map((locale) => {
          const cellValue = getCellValue(entry._id, locale.code);
          return (
            <Grid key={locale._id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
                  <span>{locale.flag}</span>
                  <strong>{locale.code}</strong>
                  <span>— {locale.name}</span>
                  {locale.isDefault && <Chip label="default" size="small" color="warning" sx={{ height: 16, fontSize: 10 }} />}
                </Typography>
                {richTextMode ? (
                  <RichTextEditor
                    value={cellValue}
                    onChange={(val) => onCellEdit(entry._id, locale.code, val)}
                    placeholder={entry.defaultValue || `Translation for ${locale.name}...`}
                  />
                ) : (
                  <TextField
                    value={cellValue}
                    onChange={(e) => onCellEdit(entry._id, locale.code, e.target.value)}
                    size="small"
                    fullWidth
                    multiline
                    minRows={2}
                    maxRows={6}
                    placeholder={entry.defaultValue || `Translation for ${locale.name}...`}
                    variant="outlined"
                    sx={{ "& .MuiOutlinedInput-root": { fontSize: 13 } }}
                  />
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default TranslationKeyCard;
