import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useOrg } from '../../../context/OrgContext';
import { aiChatApi } from '../../../api/aiApi';
import { AIChat } from '../../../types/ai';

interface ChatSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  chat: AIChat;
  onUpdated: () => void;
}

const ChatSettingsDialog = ({ open, onClose, chat, onUpdated }: ChatSettingsDialogProps) => {
  const { selectedOrg, selectedApiKey } = useOrg();

  const formik = useFormik({
    initialValues: {
      title: chat.title,
      maxHistoryMessages: chat.maxHistoryMessages,
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Title is required').min(1).max(200),
      maxHistoryMessages: Yup.number().min(1).max(200),
    }),
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting }) => {
      if (!selectedOrg) return;
      try {
        await aiChatApi.update(selectedOrg.id, chat.id, values, selectedApiKey?.apiKey);
        onUpdated();
      } catch (err) {
        console.error('Update failed:', err);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={formik.handleSubmit}>
        <DialogTitle>Chat Settings</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                label="Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Max History Messages"
                name="maxHistoryMessages"
                value={formik.values.maxHistoryMessages}
                onChange={formik.handleChange}
                inputProps={{ min: 1, max: 200 }}
                helperText="More messages = more tokens used"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
            {formik.isSubmitting ? <CircularProgress size={20} /> : 'Update'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ChatSettingsDialog;
