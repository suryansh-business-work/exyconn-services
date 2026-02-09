import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Box,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ApiLog } from "../../../types/apiLogs";

interface LogDetailDialogProps {
  log: ApiLog | null;
  open: boolean;
  onClose: () => void;
}

const LogDetailDialog = ({ log, open, onClose }: LogDetailDialogProps) => {
  if (!log) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        Log Details
        <Chip label={log.level} size="small" color={log.level === "error" ? "error" : log.level === "warn" ? "warning" : "info"} />
        <Chip label={log.method} size="small" variant="outlined" />
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary">Message</Typography>
            <Typography>{log.message}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">URL</Typography>
            <Typography sx={{ wordBreak: "break-all" }}>{log.url || "N/A"}</Typography>
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Status Code</Typography>
            <Chip label={log.statusCode || "N/A"} size="small" color={log.statusCode >= 400 ? "error" : "success"} />
          </Grid>
          <Grid size={{ xs: 3 }}>
            <Typography variant="subtitle2" color="text.secondary">Response Time</Typography>
            <Typography>{log.responseTime}ms</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Source</Typography>
            <Typography>{log.source || "N/A"}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">IP</Typography>
            <Typography>{log.ip || "N/A"}</Typography>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Typography variant="subtitle2" color="text.secondary">Tags</Typography>
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {log.tags?.length ? log.tags.map((t, i) => <Chip key={i} label={t} size="small" />) : <Typography color="text.secondary">None</Typography>}
            </Box>
          </Grid>
          {log.error && (
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="error.main">Error</Typography>
              <Typography sx={{ fontFamily: "monospace", fontSize: 13 }}>{log.error}</Typography>
            </Grid>
          )}
          {log.stack && (
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" color="error.main">Stack Trace</Typography>
              <Box sx={{ bgcolor: "grey.100", p: 1, borderRadius: 1, maxHeight: 200, overflow: "auto" }}>
                <Typography sx={{ fontFamily: "monospace", fontSize: 12, whiteSpace: "pre-wrap" }}>{log.stack}</Typography>
              </Box>
            </Grid>
          )}
          {!!log.requestBody && (
            <Grid size={{ xs: 12 }}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" color="text.secondary">Request Body</Typography>
              <Box sx={{ bgcolor: "grey.100", p: 1, borderRadius: 1, maxHeight: 200, overflow: "auto" }}>
                <Typography sx={{ fontFamily: "monospace", fontSize: 12, whiteSpace: "pre-wrap" }}>{JSON.stringify(log.requestBody, null, 2)}</Typography>
              </Box>
            </Grid>
          )}
          <Grid size={{ xs: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">Created At</Typography>
            <Typography>{new Date(log.createdAt).toLocaleString()}</Typography>
          </Grid>
          <Grid size={{ xs: 6 }}>
            <Typography variant="subtitle2" color="text.secondary">User Agent</Typography>
            <Typography sx={{ fontSize: 12, wordBreak: "break-all" }}>{log.userAgent || "N/A"}</Typography>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogDetailDialog;
