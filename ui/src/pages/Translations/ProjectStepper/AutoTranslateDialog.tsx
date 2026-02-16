import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  Box,
} from "@mui/material";
import { Translate } from "@mui/icons-material";
import { useOrg } from "../../../context/OrgContext";
import { translationApi } from "../../../api/translationsApi";
import { Locale, TranslationEntry } from "../../../types/translationsTheme";

interface AutoTranslateDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  entries: TranslationEntry[];
  locales: Locale[];
  onTranslated: (results: Map<string, Record<string, string>>) => void;
}

const AutoTranslateDialog = ({
  open, onClose, projectId, entries, locales, onTranslated,
}: AutoTranslateDialogProps) => {
  const { selectedOrg } = useOrg();
  const [translating, setTranslating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [completed, setCompleted] = useState(0);

  const defaultLocale = locales.find((l) => l.isDefault) || locales[0];
  const targetLocales = locales.filter((l) => l.code !== defaultLocale?.code);

  const handleTranslate = async () => {
    if (!selectedOrg || !defaultLocale || targetLocales.length === 0) return;
    setTranslating(true);
    setError("");
    setProgress(0);
    setCompleted(0);

    const textsToTranslate: Record<string, string> = {};
    entries.forEach((entry) => {
      const sourceText = entry.values?.[defaultLocale.code] || entry.defaultValue || "";
      if (sourceText) textsToTranslate[entry.key] = sourceText;
    });

    if (Object.keys(textsToTranslate).length === 0) {
      setError("No source texts found. Fill in the default locale values or set default values in Step 3.");
      setTranslating(false);
      return;
    }

    const results = new Map<string, Record<string, string>>();
    const totalTargets = targetLocales.length;

    try {
      for (let i = 0; i < targetLocales.length; i++) {
        const target = targetLocales[i];
        const response = await translationApi.autoTranslate(selectedOrg.id, projectId, {
          sourceLocaleCode: defaultLocale.code,
          targetLocaleCode: target.code,
          texts: textsToTranslate,
        });
        Object.entries(response.translations).forEach(([key, translatedText]) => {
          if (!results.has(key)) results.set(key, {});
          results.get(key)![target.code] = translatedText;
        });
        setCompleted(i + 1);
        setProgress(((i + 1) / totalTargets) * 100);
      }
      onTranslated(results);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Auto-translation failed";
      setError(msg);
    } finally {
      setTranslating(false);
    }
  };

  return (
    <Dialog open={open} onClose={translating ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Translate color="primary" /> Auto-Translate
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Translate all entries from the default locale to other active locales using AI.
        </Typography>
        {defaultLocale && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary">Source locale:</Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip label={`${defaultLocale.flag} ${defaultLocale.name} (${defaultLocale.code})`} size="small" color="primary" />
            </Box>
          </Box>
        )}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">Target locales ({targetLocales.length}):</Typography>
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", mt: 0.5 }}>
            {targetLocales.map((l) => (
              <Chip key={l.code} label={`${l.flag} ${l.code}`} size="small" variant="outlined" />
            ))}
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {entries.length} entries will be translated to {targetLocales.length} locales.
        </Typography>
        {translating && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              Translating... {completed}/{targetLocales.length} locales done
            </Typography>
          </Box>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={translating}>Cancel</Button>
        <Button onClick={handleTranslate} variant="contained" disabled={translating || targetLocales.length === 0}
          startIcon={<Translate />}>
          {translating ? "Translating..." : "Translate All"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutoTranslateDialog;
