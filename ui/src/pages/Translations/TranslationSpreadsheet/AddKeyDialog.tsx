import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";

interface AddKeyDialogProps {
  open: boolean;
  sections: string[];
  onClose: () => void;
  onAdd: (section: string, key: string, description: string) => Promise<void>;
}

const addKeySchema = Yup.object({
  section: Yup.string().required("Section is required").max(100),
  key: Yup.string().required("Key is required").max(200),
  description: Yup.string().max(500),
});

const AddKeyDialog = ({ open, onClose, onAdd }: AddKeyDialogProps) => {
  const formik = useFormik({
    initialValues: { section: "", key: "", description: "" },
    validationSchema: addKeySchema,
    onSubmit: async (values, { resetForm }) => {
      await onAdd(values.section, values.key, values.description);
      resetForm();
      onClose();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>Add Translation Key</DialogTitle>
        <DialogContent>
          <TextField
            label="Section"
            fullWidth
            margin="dense"
            size="small"
            placeholder="e.g., common, homepage, auth"
            {...formik.getFieldProps("section")}
            error={formik.touched.section && Boolean(formik.errors.section)}
            helperText={formik.touched.section && formik.errors.section}
          />
          <TextField
            label="Key"
            fullWidth
            margin="dense"
            size="small"
            placeholder="e.g., welcome_message, button_submit"
            {...formik.getFieldProps("key")}
            error={formik.touched.key && Boolean(formik.errors.key)}
            helperText={formik.touched.key && formik.errors.key}
          />
          <TextField
            label="Description (optional)"
            fullWidth
            margin="dense"
            size="small"
            multiline
            rows={2}
            placeholder="Describe the context for this key"
            {...formik.getFieldProps("description")}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            Add Key
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddKeyDialog;
