import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from "@mui/material";
import { DockerContainerDetail } from "../../../types/systemInfo";

interface ContainerDetailDialogProps {
  open: boolean;
  onClose: () => void;
  detail: DockerContainerDetail | null;
}

const ContainerDetailDialog = ({
  open,
  onClose,
  detail,
}: ContainerDetailDialogProps) => {
  if (!detail) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        Container: {detail.name}
        <Chip
          label={
            (detail.state as Record<string, unknown>)?.Status as string ||
            "unknown"
          }
          size="small"
          color={
            (detail.state as Record<string, unknown>)?.Running
              ? "success"
              : "error"
          }
        />
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Basic Info
          </Typography>
          {[
            { label: "ID", value: detail.id.slice(0, 24) },
            { label: "Image", value: detail.image },
            { label: "Created", value: new Date(detail.created).toLocaleString() },
          ].map((item) => (
            <Box
              key={item.label}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                py: 0.5,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: 12 }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Configuration
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 1.5,
              bgcolor: "grey.900",
              color: "grey.100",
              borderRadius: 1,
              fontSize: 11,
              overflow: "auto",
              maxHeight: 200,
            }}
          >
            {JSON.stringify(detail.config, null, 2)}
          </Box>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Network Settings
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 1.5,
              bgcolor: "grey.900",
              color: "grey.100",
              borderRadius: 1,
              fontSize: 11,
              overflow: "auto",
              maxHeight: 150,
            }}
          >
            {JSON.stringify(detail.networkSettings, null, 2)}
          </Box>
        </Box>

        {detail.mounts.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Mounts ({detail.mounts.length})
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 1.5,
                bgcolor: "grey.900",
                color: "grey.100",
                borderRadius: 1,
                fontSize: 11,
                overflow: "auto",
                maxHeight: 150,
              }}
            >
              {JSON.stringify(detail.mounts, null, 2)}
            </Box>
          </Box>
        )}

        {detail.logs && (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Recent Logs (last 50 lines)
            </Typography>
            <Box
              component="pre"
              sx={{
                p: 1.5,
                bgcolor: "grey.900",
                color: "grey.100",
                borderRadius: 1,
                fontSize: 11,
                overflow: "auto",
                maxHeight: 200,
                whiteSpace: "pre-wrap",
              }}
            >
              {detail.logs}
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContainerDetailDialog;
