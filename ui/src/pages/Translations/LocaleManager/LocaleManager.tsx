import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useOrg } from "../../../context/OrgContext";
import { localeApi } from "../../../api/translationsThemeApi";
import { Locale, LocaleFormValues } from "../../../types/translationsTheme";
import LocaleCheckboxGrid from "./LocaleCheckboxGrid";
import LocaleTable from "./LocaleTable";

interface LocaleManagerProps {
  projectId: string;
  onLocalesChange?: () => void;
}

const customLocaleSchema = Yup.object({
  code: Yup.string().required("Code is required").max(10),
  name: Yup.string().required("Name is required").max(50),
});

const LocaleManager = ({ projectId, onLocalesChange }: LocaleManagerProps) => {
  const { selectedOrg } = useOrg();
  const [locales, setLocales] = useState<Locale[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customDialogOpen, setCustomDialogOpen] = useState(false);

  const fetchLocales = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const res = await localeApi.list(selectedOrg.id, projectId, 1, 200);
      setLocales(res.data);
      onLocalesChange?.();
    } catch {
      setError("Failed to load locales");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, projectId, onLocalesChange]);

  useEffect(() => {
    fetchLocales();
  }, [fetchLocales]);

  const handleToggleLocale = async (code: string, name: string, checked: boolean) => {
    if (!selectedOrg) return;
    try {
      if (checked) {
        await localeApi.create(selectedOrg.id, projectId, { code, name, isDefault: false });
      } else {
        const locale = locales.find((l) => l.code === code);
        if (locale) await localeApi.delete(selectedOrg.id, projectId, locale._id);
      }
      await fetchLocales();
    } catch {
      setError(`Failed to ${checked ? "add" : "remove"} locale`);
    }
  };

  const handleSetDefault = async (locale: Locale) => {
    if (!selectedOrg) return;
    try {
      await localeApi.update(selectedOrg.id, projectId, locale._id, { isDefault: true });
      await fetchLocales();
    } catch {
      setError("Failed to set default");
    }
  };

  const handleToggleActive = async (locale: Locale) => {
    if (!selectedOrg) return;
    try {
      await localeApi.update(selectedOrg.id, projectId, locale._id, { isActive: !locale.isActive });
      await fetchLocales();
    } catch {
      setError("Failed to update locale");
    }
  };

  const handleEditLocale = async (locale: Locale, data: Partial<LocaleFormValues>) => {
    if (!selectedOrg) return;
    try {
      await localeApi.update(selectedOrg.id, projectId, locale._id, data);
      await fetchLocales();
    } catch {
      setError("Failed to update locale");
    }
  };

  const handleDeleteLocale = async (localeId: string) => {
    if (!selectedOrg) return;
    try {
      await localeApi.delete(selectedOrg.id, projectId, localeId);
      await fetchLocales();
    } catch {
      setError("Failed to delete locale");
    }
  };

  const formik = useFormik({
    initialValues: { code: "", name: "" },
    validationSchema: customLocaleSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!selectedOrg) return;
      try {
        await localeApi.create(selectedOrg.id, projectId, { ...values, isDefault: false });
        setCustomDialogOpen(false);
        resetForm();
        await fetchLocales();
      } catch {
        setError("Failed to add custom locale");
      }
    },
  });

  if (loading && locales.length === 0) {
    return <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Typography variant="h6" sx={{ mb: 1 }}>Predefined Locales</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Check locales to add them to this project.
      </Typography>
      <LocaleCheckboxGrid activeLocales={locales} onToggle={handleToggleLocale} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 4, mb: 2 }}>
        <Typography variant="h6">Active Locales</Typography>
        <Button variant="outlined" startIcon={<Add />} size="small" onClick={() => { formik.resetForm(); setCustomDialogOpen(true); }}>
          Add Custom Locale
        </Button>
      </Box>
      <LocaleTable
        locales={locales}
        onSetDefault={handleSetDefault}
        onToggleActive={handleToggleActive}
        onEdit={handleEditLocale}
        onDelete={handleDeleteLocale}
      />
      <Dialog open={customDialogOpen} onClose={() => setCustomDialogOpen(false)} maxWidth="xs" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Add Custom Locale</DialogTitle>
          <DialogContent>
            <TextField label="Code" fullWidth margin="dense" size="small" placeholder="e.g., pt-BR" {...formik.getFieldProps("code")} error={formik.touched.code && Boolean(formik.errors.code)} helperText={formik.touched.code && formik.errors.code} />
            <TextField label="Name" fullWidth margin="dense" size="small" placeholder="e.g., Portuguese (Brazil)" {...formik.getFieldProps("name")} error={formik.touched.name && Boolean(formik.errors.name)} helperText={formik.touched.name && formik.errors.name} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCustomDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={formik.isSubmitting}>Add</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default LocaleManager;
