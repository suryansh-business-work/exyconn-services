import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import { Add, Delete, Edit, Star, StarBorder } from "@mui/icons-material";
import { useOrg } from "../../context/OrgContext";
import { localeApi } from "../../api/translationsThemeApi";
import { Locale, LocaleFormValues } from "../../types/translationsTheme";

interface LocaleManagerProps {
  onLocalesChange: (locales: Locale[]) => void;
}

const LocaleManager = ({ onLocalesChange }: LocaleManagerProps) => {
  const { selectedOrg } = useOrg();
  const [locales, setLocales] = useState<Locale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editLocale, setEditLocale] = useState<Locale | null>(null);
  const [form, setForm] = useState<LocaleFormValues>({ code: "", name: "", isDefault: false });

  const fetchLocales = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const res = await localeApi.list(selectedOrg.id);
      setLocales(res.data);
      onLocalesChange(res.data);
    } catch {
      setError("Failed to load locales");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, onLocalesChange]);

  useEffect(() => {
    fetchLocales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrg]);

  const handleOpenCreate = () => {
    setEditLocale(null);
    setForm({ code: "", name: "", isDefault: false });
    setDialogOpen(true);
  };

  const handleOpenEdit = (locale: Locale) => {
    setEditLocale(locale);
    setForm({ code: locale.code, name: locale.name, isDefault: locale.isDefault });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!selectedOrg || !form.code || !form.name) return;
    try {
      if (editLocale) {
        await localeApi.update(selectedOrg.id, editLocale._id, {
          name: form.name,
          isDefault: form.isDefault,
        });
      } else {
        await localeApi.create(selectedOrg.id, form);
      }
      setDialogOpen(false);
      await fetchLocales();
    } catch {
      setError("Failed to save locale");
    }
  };

  const handleDelete = async (localeId: string) => {
    if (!selectedOrg) return;
    try {
      await localeApi.delete(selectedOrg.id, localeId);
      await fetchLocales();
    } catch {
      setError("Failed to delete locale");
    }
  };

  const handleToggleActive = async (locale: Locale) => {
    if (!selectedOrg) return;
    try {
      await localeApi.update(selectedOrg.id, locale._id, { isActive: !locale.isActive });
      await fetchLocales();
    } catch {
      setError("Failed to update locale");
    }
  };

  if (loading && locales.length === 0) {
    return <CircularProgress size={24} />;
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h6">Locales</Typography>
        <Button variant="contained" startIcon={<Add />} size="small" onClick={handleOpenCreate}>
          Add Locale
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Code</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Default</TableCell>
              <TableCell>Active</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locales.map((locale) => (
              <TableRow key={locale._id}>
                <TableCell>
                  <Chip label={locale.code} size="small" variant="outlined" />
                </TableCell>
                <TableCell>{locale.name}</TableCell>
                <TableCell>
                  {locale.isDefault ? <Star color="warning" fontSize="small" /> : <StarBorder fontSize="small" color="disabled" />}
                </TableCell>
                <TableCell>
                  <Switch
                    size="small"
                    checked={locale.isActive}
                    onChange={() => handleToggleActive(locale)}
                  />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => handleOpenEdit(locale)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => handleDelete(locale._id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {locales.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No locales added yet. Click &quot;Add Locale&quot; to start.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>{editLocale ? "Edit Locale" : "Add Locale"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            fullWidth
            margin="dense"
            placeholder="e.g., en, es, fr"
            disabled={!!editLocale}
            size="small"
          />
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            margin="dense"
            placeholder="e.g., English, Spanish"
            size="small"
          />
          <FormControlLabel
            control={
              <Switch checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            }
            label="Default locale"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={!form.code || !form.name}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LocaleManager;
