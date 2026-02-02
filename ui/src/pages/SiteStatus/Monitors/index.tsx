import { useState, useEffect } from 'react';
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
  Switch,
  Dialog,
  DialogContent,
} from '@mui/material';
import {
  Add,
  Search,
  Refresh,
  Delete,
  Edit,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { PageBreadcrumb } from '../../../components/common';
import { useOrg } from '../../../context/OrgContext';
import { siteMonitorApi } from '../../../api/siteStatusApi';
import { SiteMonitorConfig } from '../../../types/siteStatus';
import SiteMonitorDialog from './SiteMonitorDialog';

const SiteStatusMonitors = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const [monitors, setMonitors] = useState<SiteMonitorConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMonitor, setEditingMonitor] = useState<SiteMonitorConfig | null>(null);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [screenshotDialog, setScreenshotDialog] = useState<{
    open: boolean;
    url: string;
    name: string;
  }>({ open: false, url: '', name: '' });

  const fetchMonitors = async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const result = await siteMonitorApi.list(
        selectedOrg.id,
        { page: page + 1, limit: rowsPerPage, search },
        selectedApiKey?.apiKey
      );
      setMonitors(result.data);
      setTotal(result.pagination.total);
    } catch (err) {
      console.error('Failed to fetch monitors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitors();
  }, [selectedOrg, selectedApiKey, page, rowsPerPage, search]);

  const handleCheckNow = async (monitorId: string) => {
    if (!selectedOrg) return;
    setCheckingId(monitorId);
    try {
      await siteMonitorApi.checkNow(selectedOrg.id, monitorId, selectedApiKey?.apiKey);
      fetchMonitors();
    } catch (err) {
      console.error('Check failed:', err);
    } finally {
      setCheckingId(null);
    }
  };

  const handleDelete = async (monitorId: string) => {
    if (!selectedOrg || !confirm('Are you sure you want to delete this monitor?')) return;
    try {
      await siteMonitorApi.delete(selectedOrg.id, monitorId, selectedApiKey?.apiKey);
      fetchMonitors();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleToggleActive = async (monitor: SiteMonitorConfig) => {
    if (!selectedOrg) return;
    try {
      await siteMonitorApi.update(
        selectedOrg.id,
        monitor.id,
        { isActive: !monitor.isActive },
        selectedApiKey?.apiKey
      );
      fetchMonitors();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  const getStatusIcon = (status?: string) => {
    if (status === 'healthy') return <CheckCircle fontSize="small" color="success" />;
    if (status === 'warning') return <Warning fontSize="small" color="warning" />;
    if (status === 'error') return <ErrorIcon fontSize="small" color="error" />;
    return <Chip label="Pending" size="small" variant="outlined" />;
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
          { label: 'Site Status', href: `${basePath}/service/site-status/dashboard` },
          { label: 'Monitors' },
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
          Site Monitors
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
          <Button variant="outlined" size="small" startIcon={<Refresh />} onClick={fetchMonitors}>
            Refresh
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => {
              setEditingMonitor(null);
              setDialogOpen(true);
            }}
          >
            Add Monitor
          </Button>
        </Box>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>URL</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Screenshot</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="center">Last Check</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : monitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary">No monitors found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                monitors.map((monitor) => (
                  <TableRow key={monitor.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {monitor.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: 12 }}>
                        {monitor.url}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{getStatusIcon(monitor.lastStatus)}</TableCell>
                    <TableCell align="center">
                      {monitor.lastScreenshotUrl ? (
                        <Box
                          component="img"
                          src={monitor.lastScreenshotUrl}
                          alt={`${monitor.name} screenshot`}
                          onClick={() =>
                            setScreenshotDialog({
                              open: true,
                              url: monitor.lastScreenshotUrl || '',
                              name: monitor.name,
                            })
                          }
                          sx={{
                            width: 60,
                            height: 40,
                            objectFit: 'cover',
                            borderRadius: 1,
                            cursor: 'pointer',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { opacity: 0.8 },
                          }}
                        />
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        size="small"
                        checked={monitor.isActive}
                        onChange={() => handleToggleActive(monitor)}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontSize: 11 }}>
                        {monitor.lastCheckedAt
                          ? new Date(monitor.lastCheckedAt).toLocaleString()
                          : 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Check Now">
                        <IconButton
                          size="small"
                          onClick={() => handleCheckNow(monitor.id)}
                          disabled={checkingId === monitor.id}
                        >
                          {checkingId === monitor.id ? (
                            <CircularProgress size={16} />
                          ) : (
                            <Refresh fontSize="small" />
                          )}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingMonitor(monitor);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(monitor.id)}
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
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <SiteMonitorDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        monitor={editingMonitor}
        onSaved={fetchMonitors}
      />

      {/* Screenshot Fullscreen Dialog */}
      <Dialog
        open={screenshotDialog.open}
        onClose={() => setScreenshotDialog({ open: false, url: '', name: '' })}
        maxWidth="lg"
        fullWidth
      >
        <DialogContent sx={{ p: 1, textAlign: 'center' }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            {screenshotDialog.name}
          </Typography>
          {screenshotDialog.url && (
            <Box
              component="img"
              src={screenshotDialog.url}
              alt={screenshotDialog.name}
              sx={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 1 }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SiteStatusMonitors;
