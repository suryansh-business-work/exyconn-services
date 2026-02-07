import {
  Box,
  Typography,
  IconButton,
  LinearProgress,
  Paper,
  Chip,
} from "@mui/material";
import {
  Delete,
  CheckCircle,
  Error,
  Image,
  InsertDriveFile,
  VideoFile,
  AudioFile,
} from "@mui/icons-material";

interface FilePreviewItemProps {
  file: File;
  progress?: number;
  status?: "pending" | "uploading" | "success" | "error";
  error?: string;
  uploadedUrl?: string;
  onRemove: () => void;
}

const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith("image/")) return <Image color="primary" />;
  if (mimeType.startsWith("video/")) return <VideoFile color="secondary" />;
  if (mimeType.startsWith("audio/")) return <AudioFile color="warning" />;
  return <InsertDriveFile color="action" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FilePreviewItem = ({
  file,
  progress = 0,
  status = "pending",
  error,
  uploadedUrl,
  onRemove,
}: FilePreviewItemProps) => {
  return (
    <Paper
      sx={{ p: 1.5, mb: 1, display: "flex", alignItems: "center", gap: 2 }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {getFileIcon(file.type)}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1 }}>
            {file.name}
          </Typography>
          {status === "success" && (
            <CheckCircle color="success" fontSize="small" />
          )}
          {status === "error" && <Error color="error" fontSize="small" />}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            {formatFileSize(file.size)}
          </Typography>
          <Chip
            label={file.type || "unknown"}
            size="small"
            variant="outlined"
            sx={{ fontSize: 10, height: 18 }}
          />
        </Box>
        {status === "uploading" && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ mt: 1, height: 4, borderRadius: 2 }}
          />
        )}
        {status === "error" && error && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: "block", mt: 0.5 }}
          >
            {error}
          </Typography>
        )}
        {status === "success" && uploadedUrl && (
          <Typography
            variant="caption"
            color="primary"
            component="a"
            href={uploadedUrl}
            target="_blank"
            rel="noopener"
            sx={{
              display: "block",
              mt: 0.5,
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            View uploaded file
          </Typography>
        )}
      </Box>
      <IconButton
        size="small"
        onClick={onRemove}
        disabled={status === "uploading"}
      >
        <Delete fontSize="small" />
      </IconButton>
    </Paper>
  );
};

export default FilePreviewItem;
