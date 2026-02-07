import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  Switch,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { CloudUpload, Upload } from "@mui/icons-material";
import {
  PageBreadcrumb,
  Spinner,
  ActionButton,
  ChipInput,
} from "../../../components/common";
import { useOrg } from "../../../context/OrgContext";
import { imageKitConfigApi, fileUploadApi } from "../../../api/imagekitApi";
import { ImageKitConfig, UploadMode } from "../../../types/imagekit";
import FileDropZone from "./FileDropZone";
import FilePreviewItem from "./FilePreviewItem";

interface FileWithStatus {
  file: File;
  status: "pending" | "uploading" | "success" | "error";
  progress: number;
  error?: string;
  uploadedUrl?: string;
}

const ImageKitDemo = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const [configs, setConfigs] = useState<ImageKitConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState("");
  const [uploadMode, setUploadMode] = useState<UploadMode>("single");
  const [folder, setFolder] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [useUniqueFileName, setUseUniqueFileName] = useState(true);
  const [files, setFiles] = useState<FileWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const response = await imageKitConfigApi.list(selectedOrg.id, {
        isActive: true,
      });
      setConfigs(response.data);
      if (response.data.length > 0) {
        const defaultConfig =
          response.data.find((c) => c.isDefault) || response.data[0];
        setSelectedConfigId(defaultConfig.id);
      }
    } catch {
      setError("Failed to load configurations");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const isMultiple =
    uploadMode === "multiple" || uploadMode === "multiple-array";

  const handleFilesSelected = (selectedFiles: File[]) => {
    const newFiles = selectedFiles.map((file) => ({
      file,
      status: "pending" as const,
      progress: 0,
    }));
    if (isMultiple) {
      setFiles((prev) => [...prev, ...newFiles]);
    } else {
      setFiles(newFiles.slice(0, 1));
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (!selectedOrg || !selectedConfigId || files.length === 0) return;
    setUploading(true);
    setError(null);
    const options = {
      folder: folder || undefined,
      tags: tags.length > 0 ? tags : undefined,
      useUniqueFileName,
      apiKey: selectedApiKey?.apiKey,
    };

    try {
      if (isMultiple && files.length > 1) {
        setFiles((prev) =>
          prev.map((f) => ({
            ...f,
            status: "uploading" as const,
            progress: 50,
          })),
        );
        const result = await fileUploadApi.uploadMultiple(
          selectedOrg.id,
          selectedConfigId,
          files.map((f) => f.file),
          options,
        );
        setFiles((prev) =>
          prev.map((f) => {
            const uploaded = result.files.find(
              (uf) => uf.originalName === f.file.name,
            );
            const err = result.errors.find((e) => e.fileName === f.file.name);
            return {
              ...f,
              status: uploaded ? "success" : "error",
              progress: 100,
              uploadedUrl: uploaded?.url,
              error: err?.error,
            };
          }),
        );
      } else {
        for (let i = 0; i < files.length; i++) {
          setFiles((prev) =>
            prev.map((f, idx) =>
              idx === i ? { ...f, status: "uploading", progress: 50 } : f,
            ),
          );
          try {
            const result = await fileUploadApi.uploadSingle(
              selectedOrg.id,
              selectedConfigId,
              files[i].file,
              options,
            );
            if (result.success && result.file) {
              setFiles((prev) =>
                prev.map((f, idx) =>
                  idx === i
                    ? {
                        ...f,
                        status: "success",
                        progress: 100,
                        uploadedUrl: result.file!.url,
                      }
                    : f,
                ),
              );
            } else {
              setFiles((prev) =>
                prev.map((f, idx) =>
                  idx === i
                    ? {
                        ...f,
                        status: "error",
                        progress: 100,
                        error: result.error,
                      }
                    : f,
                ),
              );
            }
          } catch {
            setFiles((prev) =>
              prev.map((f, idx) =>
                idx === i
                  ? {
                      ...f,
                      status: "error",
                      progress: 100,
                      error: "Upload failed",
                    }
                  : f,
              ),
            );
          }
        }
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((f) => f.status !== "success"));
  };

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  if (loading) return <Spinner />;

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/" },
          {
            label: selectedOrg.orgName,
            href: `/organization/${selectedOrg.id}`,
          },
          { label: "Storage" },
          { label: "ImageKit" },
          { label: "Demo" },
        ]}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <CloudUpload sx={{ fontSize: 32, color: "primary.main" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            File Upload Demo
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Test file uploads with ImageKit
          </Typography>
        </Box>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {configs.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No ImageKit configurations found. Please add one in Settings.
        </Alert>
      )}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              size="small"
              label="ImageKit Configuration"
              value={selectedConfigId}
              onChange={(e) => setSelectedConfigId(e.target.value)}
              fullWidth
              disabled={configs.length === 0}
            >
              {configs.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Upload Mode
              </Typography>
              <ToggleButtonGroup
                value={uploadMode}
                exclusive
                onChange={(_, v) => v && setUploadMode(v)}
                size="small"
                fullWidth
              >
                <ToggleButton value="single">Single</ToggleButton>
                <ToggleButton value="multiple">Multiple</ToggleButton>
                <ToggleButton value="single-array">Single→Array</ToggleButton>
                <ToggleButton value="multiple-array">Multi→Array</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <TextField
              size="small"
              label="Folder (optional)"
              value={folder}
              onChange={(e) => setFolder(e.target.value)}
              placeholder="/uploads"
              fullWidth
            />
            <ChipInput
              value={tags}
              onChange={setTags}
              label="Tags (optional)"
              placeholder="Add tag and press Enter"
              fullWidth
              size="small"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={useUniqueFileName}
                  onChange={(e) => setUseUniqueFileName(e.target.checked)}
                />
              }
              label={
                <Typography variant="body2">Use unique file names</Typography>
              }
            />
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 7 }}>
          <FileDropZone
            onFilesSelected={handleFilesSelected}
            multiple={isMultiple}
            disabled={!selectedConfigId}
          />
          {files.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography variant="subtitle2">
                  {files.length} file(s) selected
                </Typography>
                {files.some((f) => f.status === "success") && (
                  <Typography
                    variant="caption"
                    color="primary"
                    sx={{ cursor: "pointer" }}
                    onClick={clearCompleted}
                  >
                    Clear completed
                  </Typography>
                )}
              </Box>
              {files.map((f, i) => (
                <FilePreviewItem
                  key={`${f.file.name}-${i}`}
                  file={f.file}
                  status={f.status}
                  progress={f.progress}
                  error={f.error}
                  uploadedUrl={f.uploadedUrl}
                  onRemove={() => handleRemoveFile(i)}
                />
              ))}
              <ActionButton
                variant="contained"
                fullWidth
                startIcon={<Upload />}
                onClick={handleUpload}
                loading={uploading}
                disabled={
                  !selectedConfigId ||
                  files.every((f) => f.status === "success")
                }
                sx={{ mt: 2 }}
              >
                Upload {files.filter((f) => f.status === "pending").length}{" "}
                file(s)
              </ActionButton>
            </Box>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ImageKitDemo;
