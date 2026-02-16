import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Typography,
} from "@mui/material";
import { FormikProps } from "formik";
import { Section } from "../../../types/translationsTheme";

interface VariableFormValues {
  section: string;
  key: string;
  defaultValue: string;
  description: string;
}

interface AddVariableDialogProps {
  open: boolean;
  onClose: () => void;
  formik: FormikProps<VariableFormValues>;
  sections: Section[];
}

const AddVariableDialog = ({ open, onClose, formik, sections }: AddVariableDialogProps) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <form onSubmit={formik.handleSubmit}>
      <DialogTitle>Add Variable</DialogTitle>
      <DialogContent>
        <TextField select label="Section" fullWidth margin="dense" size="small"
          {...formik.getFieldProps("section")}
          error={formik.touched.section && Boolean(formik.errors.section)}
          helperText={formik.touched.section && formik.errors.section}>
          {sections.map((s) => <MenuItem key={s.slug} value={s.slug}>{s.name}</MenuItem>)}
        </TextField>
        <TextField label="Key" fullWidth margin="dense" size="small" placeholder="e.g., welcome_message"
          {...formik.getFieldProps("key")}
          error={formik.touched.key && Boolean(formik.errors.key)}
          helperText={formik.touched.key && formik.errors.key} />
        <TextField label="Default Value" fullWidth margin="dense" size="small" multiline rows={3}
          placeholder='e.g., The price of this product is ${product_price}'
          {...formik.getFieldProps("defaultValue")}
          error={formik.touched.defaultValue && Boolean(formik.errors.defaultValue)}
          helperText={(formik.touched.defaultValue && formik.errors.defaultValue) || "Use ${var_name} for dynamic variables"} />
        <TextField label="Description (optional)" fullWidth margin="dense" size="small" multiline rows={2}
          placeholder="Context for translators"
          {...formik.getFieldProps("description")}
          error={formik.touched.description && Boolean(formik.errors.description)}
          helperText={formik.touched.description && formik.errors.description} />
        {formik.values.section && formik.values.key && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
            Access: locale.&lt;code&gt;.{formik.values.section}.{formik.values.key}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" variant="contained" disabled={formik.isSubmitting}>Add</Button>
      </DialogActions>
    </form>
  </Dialog>
);

export default AddVariableDialog;
