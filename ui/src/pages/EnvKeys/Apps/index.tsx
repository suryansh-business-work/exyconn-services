import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
} from '@mui/material';
import { Add, Search, Delete, Edit, Visibility, Refresh } from '@mui/icons-material';
import { PageBreadcrumb } from '../../../components/common';
import { useOrg } from '../../../context/OrgContext';
import { envAppApi } from '../../../api/envKeysApi';
import { EnvApp } from '../../../types/envKeys';
import EnvAppDialog from './EnvAppDialog';

const EnvAppsPage = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const navigate = useNavigate();
  const [apps, setApps] = useState<EnvApp[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<EnvApp | null>(null);

  const fetchApps = async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const result = await envAppApi.list(
        selectedOrg.id,
        { page: page + 1, limit: rowsPerPage, search },
        selectedApiKey?.apiKey
      );
      setApps(result.data);
      setTotal(result.pagination.total);
    } catch (err) {
      console.error('Failed to fetch apps:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [selectedOrg, selectedApiKey, page, rowsPerPage, search]);

  const handleDelete = async (appId: string) => {
    if (!selectedOrg || !confirm('Delete this application and all its variables?')) return;
    try {
      await envAppApi.delete(selectedOrg.id, appId, selectedApiKey?.apiKey);
      fetchApps();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const getEnvColor = (env: string) => {
    if (env === 'production') return 'error';
    if (env === 'staging') return 'warning';
    return 'info';
  };

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  const basePath = selectedApiKey
    ? `/organization/${selectedOrg.id}/apikey/${selectedApiKey.apiKey}`
    : `/organization/${selectedOrg.id}`;

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: 'Home', href: '/dashboard' },
          { label: selectedOrg.orgName, href: basePath },
          { label: 'Environment Keys', href: `${basePath}/service/env-keys/dashboard` },
          { label: 'Applications' },
        ]}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18 }}>
          Applications
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 200 }}
          />
          <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={fetchApps}>
            Refresh
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => {
              setEditingApp(null);
              setDialogOpen(true);
            }}
          >
            Add App
          </Button>
        </Box>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Environment</TableCell>
                <TableCell align="center">Variables</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : apps.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">No applications found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                apps.map((app) => (
                  <TableRow key={app.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {app.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                        {app.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={app.environment}
                        size="small"
                        color={getEnvColor(app.environment)}
                        sx={{ fontSize: 10 }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={app.variableCount || 0} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Variables">
                        <IconButton
                          size="small"
                          onClick={() =>
                            navigate(
                              `${basePath}/service/env-keys/applications/${app.id}/variables`
                            )
                          }
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingApp(app);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDelete(app.id)}>
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
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <EnvAppDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        app={editingApp}
        onSaved={fetchApps}
      />
    </Box>
  );
};

export default EnvAppsPage;
