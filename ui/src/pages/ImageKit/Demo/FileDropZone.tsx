import { useCallback } from "react";
import { Typography, Paper } from "@mui/material";
import { CloudUpload } from "@mui/icons-material";

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
}

const FileDropZone = ({
  onFilesSelected,
  multiple = false,
  accept,
  disabled,
}: FileDropZoneProps) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      const files = Array.from(e.dataTransfer.files);
      onFilesSelected(multiple ? files : files.slice(0, 1));
    },
    [onFilesSelected, multiple, disabled],
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleClick = () => {
    if (disabled) return;
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = multiple;
    if (accept) input.accept = accept;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files) {
        onFilesSelected(Array.from(target.files));
      }
    };
    input.click();
  };

  return (
    <Paper
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={handleClick}
      sx={{
        p: 4,
        textAlign: "center",
        border: "2px dashed",
        borderColor: disabled ? "action.disabled" : "primary.main",
        bgcolor: disabled ? "action.disabledBackground" : "action.hover",
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.2s",
        "&:hover": disabled
          ? {}
          : {
              borderColor: "primary.dark",
              bgcolor: "primary.light",
              opacity: 0.1,
            },
      }}
    >
      <CloudUpload
        sx={{
          fontSize: 48,
          color: disabled ? "action.disabled" : "primary.main",
          mb: 1,
        }}
      />
      <Typography
        variant="body1"
        color={disabled ? "text.disabled" : "text.primary"}
        fontWeight={500}
      >
        {multiple
          ? "Drop files here or click to select"
          : "Drop a file here or click to select"}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {accept ? `Accepted: ${accept}` : "All file types accepted"}
      </Typography>
    </Paper>
  );
};

export default FileDropZone;
