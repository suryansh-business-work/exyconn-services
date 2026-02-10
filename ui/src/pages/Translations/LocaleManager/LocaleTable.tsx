import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Switch,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { Delete, Edit, Star, StarBorder } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Locale, LocaleFormValues } from "../../../types/translationsTheme";

const editSchema = Yup.object({
  name: Yup.string().required("Name is required").max(50),
});

interface LocaleTableProps {
  locales: Locale[];
  onSetDefault: (locale: Locale) => void;
  onToggleActive: (locale: Locale) => void;
  onEdit: (locale: Locale, data: Partial<LocaleFormValues>) => void;
  onDelete: (localeId: string) => void;
}

const LocaleTable = ({ locales, onSetDefault, onToggleActive, onEdit, onDelete }: LocaleTableProps) => {
  const [editLocale, setEditLocale] = useState<Locale | null>(null);

  const formik = useFormik({
    initialValues: { name: "" },
    validationSchema: editSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (editLocale) {
        onEdit(editLocale, { name: values.name });
        setEditLocale(null);
      }
    },
  });

  const openEdit = (locale: Locale) => {
    setEditLocale(locale);
    formik.resetForm({ values: { name: locale.name } });
  };

  return (
    <>
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
                  <Tooltip title={locale.isDefault ? "Default locale" : "Set as default"}>
                    <IconButton size="small" onClick={() => !locale.isDefault && onSetDefault(locale)}>
                      {locale.isDefault ? <Star color="warning" fontSize="small" /> : <StarBorder fontSize="small" color="disabled" />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Switch size="small" checked={locale.isActive} onChange={() => onToggleActive(locale)} />
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => openEdit(locale)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton size="small" color="error" onClick={() => onDelete(locale._id)}>
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
                    No locales added yet. Check predefined locales above or add a custom one.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(editLocale)} onClose={() => setEditLocale(null)} maxWidth="xs" fullWidth>
        <form onSubmit={formik.handleSubmit}>
          <DialogTitle>Edit Locale — {editLocale?.code}</DialogTitle>
          <DialogContent>
            <TextField
              label="Name"
              fullWidth
              margin="dense"
              size="small"
              {...formik.getFieldProps("name")}
              error={formik.touched.name && Boolean(formik.errors.name)}
              helperText={formik.touched.name && formik.errors.name}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditLocale(null)}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
};

export default LocaleTable;
