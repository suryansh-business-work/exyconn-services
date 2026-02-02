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
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Visibility, CheckCircle, Error, Schedule, History, Refresh } from '@mui/icons-material';
import { PageBreadcrumb, Spinner, ActionButton } from '../../components/common';
import { useOrg } from '../../context/OrgContext';
import { emailLogApi } from '../../api/emailApi';
import { EmailLog, EmailStats } from '../../types/email';

const EmailHistory = () => {
  const { selectedOrg } = useOrg();
  const [logs, setLogs] = useState<EmailLog[]>([]);
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<EmailLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const fetchLogs = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const [logsResponse, statsResponse] = await Promise.all([
        emailLogApi.list(selectedOrg.id, {
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter as 'sent' | 'failed' | 'pending' | undefined,
        }),
        emailLogApi.getStats(selectedOrg.id),
      ]);
      setLogs(logsResponse.data);
      setTotal(logsResponse.pagination.total);
      setStats(statsResponse);
    } catch (err) {
      setError('Failed to load email logs');
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, page, rowsPerPage, statusFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewDetails = (log: EmailLog) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const getStatusIcon = (status: string): React.ReactElement | undefined => {
    switch (status) {
      case 'sent':
        return <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />;
      case 'failed':
        return <Error sx={{ fontSize: 16, color: 'error.main' }} />;
      case 'pending':
        return <Schedule sx={{ fontSize: 16, color: 'warning.main' }} />;
      default:
        return undefined;
    }
  };

  const getStatusColor = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
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
          { label: 'Communications' },
          { label: 'Email' },
          { label: 'History' },
        ]}
      />

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <History sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Email History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View all sent email logs and their status
          </Typography>
        </Box>
        <ActionButton
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchLogs}
          disabled={loading}
        >
          Refresh
        </ActionButton>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 600 }}>
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Emails
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center', borderTop: 3, borderColor: 'success.main' }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'success.main' }}>
                {stats.sent}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sent
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center', borderTop: 3, borderColor: 'error.main' }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'error.main' }}>
                {stats.failed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Failed
              </Typography>
            </Paper>
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <Paper sx={{ p: 2, textAlign: 'center', borderTop: 3, borderColor: 'warning.main' }}>
              <Typography variant="h4" sx={{ fontWeight: 600, color: 'warning.main' }}>
                {stats.pending}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          select
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(0);
          }}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="sent">Sent</MenuItem>
          <MenuItem value="failed">Failed</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
        </TextField>
      </Box>

      {loading ? (
        <Spinner />
      ) : logs.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No email logs found</Typography>
        </Paper>
      ) : (
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Recipient</TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Sent At</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>
                      <Typography variant="body2">{log.recipient}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 300 }} noWrap>
                        {log.subject}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        icon={getStatusIcon(log.status)}
                        label={log.status}
                        size="small"
                        color={getStatusColor(log.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(log.sentAt).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => handleViewDetails(log)}>
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 20, 50, 100]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Email Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Recipient
                </Typography>
                <Typography>{selectedLog.recipient}</Typography>
              </Box>
              {selectedLog.cc && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    CC
                  </Typography>
                  <Typography>{selectedLog.cc}</Typography>
                </Box>
              )}
              {selectedLog.bcc && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    BCC
                  </Typography>
                  <Typography>{selectedLog.bcc}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Subject
                </Typography>
                <Typography>{selectedLog.subject}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Status
                </Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    icon={getStatusIcon(selectedLog.status)}
                    label={selectedLog.status}
                    size="small"
                    color={getStatusColor(selectedLog.status)}
                  />
                </Box>
              </Box>
              {selectedLog.messageId && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Message ID
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {selectedLog.messageId}
                  </Typography>
                </Box>
              )}
              {selectedLog.error && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Error
                  </Typography>
                  <Alert severity="error" sx={{ mt: 0.5 }}>
                    {selectedLog.error}
                  </Alert>
                </Box>
              )}
              {selectedLog.apiKeyUsed && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    API Key Used
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {selectedLog.apiKeyUsed.substring(0, 20)}...
                  </Typography>
                </Box>
              )}
              {Object.keys(selectedLog.variables || {}).length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Variables
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                    {Object.entries(selectedLog.variables).map(([key, value]) => (
                      <Chip key={key} label={`${key}: ${value}`} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Sent At
                </Typography>
                <Typography>{new Date(selectedLog.sentAt).toLocaleString()}</Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailHistory;
