import { useState, useEffect, useCallback } from 'react';
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
  IconButton,
  Chip,
  Alert,
  Tooltip,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Settings, Add, Edit, Delete, CheckCircle, Cancel, Search } from '@mui/icons-material';
import { PageBreadcrumb, Spinner, ActionButton } from '../../components/common';
import { useOrg } from '../../context/OrgContext';
import { imageKitConfigApi } from '../../api/imagekitApi';
import { ImageKitConfig } from '../../types/imagekit';
import ImageKitConfigDialog from './ImageKitConfigDialog';

const ImageKitSettings = () => {
  const { selectedOrg } = useOrg();
  const [configs, setConfigs] = useState<ImageKitConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editConfig, setEditConfig] = useState<ImageKitConfig | null>(null);

  const fetchConfigs = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const response = await imageKitConfigApi.list(selectedOrg.id, {
        page: page + 1,
        limit: rowsPerPage,
        search: search || undefined,
      });
      setConfigs(response.data);
      setTotal(response.pagination.total);
    } catch {
      setError('Failed to load configurations');
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, page, rowsPerPage, search]);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  const handleCreate = () => {
    setEditConfig(null);
    setDialogOpen(true);
  };

  const handleEdit = (config: ImageKitConfig) => {
    setEditConfig(config);
    setDialogOpen(true);
  };

  const handleDelete = async (configId: string) => {
    if (!selectedOrg || !confirm('Delete this configuration?')) return;
    try {
      await imageKitConfigApi.delete(selectedOrg.id, configId);
      fetchConfigs();
    } catch {
      setError('Failed to delete configuration');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditConfig(null);
  };

  const handleDialogSuccess = () => {
    handleDialogClose();
    fetchConfigs();
  };

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: selectedOrg.orgName, href: `/organization/${selectedOrg.id}` },
          { label: 'Storage' },
          { label: 'ImageKit' },
          { label: 'Settings' },
        ]}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Settings sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              ImageKit Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage your ImageKit configurations
            </Typography>
          </Box>
        </Box>
        <ActionButton variant="contained" startIcon={<Add />} onClick={handleCreate}>
          Add Configuration
        </ActionButton>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Paper sx={{ mb: 2 }}>
        <Box sx={{ p: 2 }}>
          <TextField
            size="small"
            placeholder="Search configurations..."
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
            sx={{ width: 300 }}
          />
        </Box>
        {loading ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Spinner />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>URL Endpoint</TableCell>
                    <TableCell>Public Key</TableCell>
                    <TableCell align="center">Default</TableCell>
                    <TableCell align="center">Active</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {configs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">No configurations found</Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    configs.map((config) => (
                      <TableRow key={config.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {config.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {config.urlEndpoint}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                            {config.publicKey.substring(0, 20)}...
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {config.isDefault ? (
                            <Chip label="Default" size="small" color="primary" />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {config.isActive ? (
                            <CheckCircle color="success" fontSize="small" />
                          ) : (
                            <Cancel color="disabled" fontSize="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEdit(config)}>
                              <Edit fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(config.id)}
                              color="error"
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
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </Paper>
      <ImageKitConfigDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
        config={editConfig}
      />
    </Box>
  );
};

export default ImageKitSettings;
