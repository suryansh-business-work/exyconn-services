import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  Tooltip,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  History,
  Search,
  Delete,
  OpenInNew,
  ContentCopy,
  Image,
  InsertDriveFile,
} from "@mui/icons-material";
import { PageBreadcrumb, Spinner } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { uploadHistoryApi, fileUploadApi } from "../../api/imagekitApi";
import { UploadedFile, UploadMode } from "../../types/imagekit";

type SortField = "createdAt" | "fileName" | "size" | "fileType";
type SortOrder = "asc" | "desc";

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getUploadModeColor = (mode: UploadMode) => {
  switch (mode) {
    case "single":
      return "default";
    case "multiple":
      return "primary";
    case "single-array":
      return "secondary";
    case "multiple-array":
      return "info";
    default:
      return "default";
  }
};

const ImageKitHistory = () => {
  const { selectedOrg } = useOrg();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [fileTypeFilter, setFileTypeFilter] = useState("");
  const [uploadModeFilter, setUploadModeFilter] = useState<UploadMode | "">("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const fetchHistory = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const response = await uploadHistoryApi.list(selectedOrg.id, {
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
        fileType: fileTypeFilter || undefined,
        uploadMode: uploadModeFilter || undefined,
      });
      setFiles(response.data);
      setTotal(response.pagination.total);
    } catch {
      setError("Failed to load upload history");
    } finally {
      setLoading(false);
    }
  }, [
    selectedOrg,
    page,
    rowsPerPage,
    search,
    fileTypeFilter,
    uploadModeFilter,
  ]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!selectedOrg || !confirm("Delete this file?")) return;
    try {
      await fileUploadApi.delete(selectedOrg.id, fileId);
      fetchHistory();
    } catch {
      setError("Failed to delete file");
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const sortedFiles = [...files].sort((a, b) => {
    let comparison = 0;
    switch (sortField) {
      case "fileName":
        comparison = a.fileName.localeCompare(b.fileName);
        break;
      case "size":
        comparison = a.size - b.size;
        break;
      case "fileType":
        comparison = a.fileType.localeCompare(b.fileType);
        break;
      case "createdAt":
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

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
          { label: "History" },
        ]}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <History sx={{ fontSize: 32, color: "primary.main" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Upload History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View and manage uploaded files
          </Typography>
        </Box>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search files..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                select
                size="small"
                fullWidth
                label="File Type"
                value={fileTypeFilter}
                onChange={(e) => {
                  setFileTypeFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="image">Images</MenuItem>
                <MenuItem value="video">Videos</MenuItem>
                <MenuItem value="document">Documents</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField
                select
                size="small"
                fullWidth
                label="Upload Mode"
                value={uploadModeFilter}
                onChange={(e) => {
                  setUploadModeFilter(e.target.value as UploadMode | "");
                  setPage(0);
                }}
              >
                <MenuItem value="">All Modes</MenuItem>
                <MenuItem value="single">Single</MenuItem>
                <MenuItem value="multiple">Multiple</MenuItem>
                <MenuItem value="single-array">Single Array</MenuItem>
                <MenuItem value="multiple-array">Multiple Array</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </Box>
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Spinner />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Preview</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortField === "fileName"}
                        direction={sortField === "fileName" ? sortOrder : "asc"}
                        onClick={() => handleSort("fileName")}
                      >
                        File Name
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortField === "fileType"}
                        direction={sortField === "fileType" ? sortOrder : "asc"}
                        onClick={() => handleSort("fileType")}
                      >
                        Type
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortField === "size"}
                        direction={sortField === "size" ? sortOrder : "asc"}
                        onClick={() => handleSort("size")}
                      >
                        Size
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Mode</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortField === "createdAt"}
                        direction={
                          sortField === "createdAt" ? sortOrder : "asc"
                        }
                        onClick={() => handleSort("createdAt")}
                      >
                        Uploaded
                      </TableSortLabel>
                    </TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedFiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          No files found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedFiles.map((file) => (
                      <TableRow key={file.id} hover>
                        <TableCell>
                          {file.thumbnailUrl ? (
                            <Box
                              component="img"
                              src={file.thumbnailUrl}
                              alt={file.fileName}
                              sx={{
                                width: 40,
                                height: 40,
                                objectFit: "cover",
                                borderRadius: 1,
                              }}
                            />
                          ) : file.mimeType.startsWith("image/") ? (
                            <Image color="primary" />
                          ) : (
                            <InsertDriveFile color="action" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={500}
                            noWrap
                            sx={{ maxWidth: 200 }}
                          >
                            {file.fileName}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ maxWidth: 200, display: "block" }}
                          >
                            {file.originalName}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={file.fileType}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{formatFileSize(file.size)}</TableCell>
                        <TableCell>
                          <Chip
                            label={file.uploadMode}
                            size="small"
                            color={getUploadModeColor(file.uploadMode)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">
                            {formatDate(file.createdAt)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Copy URL">
                            <IconButton
                              size="small"
                              onClick={() => handleCopyUrl(file.url)}
                            >
                              <ContentCopy fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Open">
                            <IconButton
                              size="small"
                              component="a"
                              href={file.url}
                              target="_blank"
                            >
                              <OpenInNew fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(file.id)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default ImageKitHistory;
