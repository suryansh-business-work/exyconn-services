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
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Search, Refresh, Visibility } from "@mui/icons-material";
import { PageBreadcrumb, Spinner, ActionButton } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { apiLogsApi } from "../../api/apiLogsApi";
import { ApiLog, ApiLogStats } from "../../types/apiLogs";
import LogDetailDialog from "./components/LogDetailDialog";
import LogStatsCards from "./components/LogStatsCards";

const SearchLogs = () => {
  const { selectedOrg } = useOrg();
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [stats, setStats] = useState<ApiLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [levelFilter, setLevelFilter] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        apiLogsApi.list(selectedOrg.id, {
          page: page + 1,
          limit: rowsPerPage,
          level: levelFilter || undefined,
          method: methodFilter || undefined,
          search: searchQuery || undefined,
        }),
        apiLogsApi.getStats(selectedOrg.id),
      ]);
      setLogs(logsRes.data);
      setTotal(logsRes.pagination.total);
      setStats(statsRes);
    } catch {
      setError("Failed to load API logs");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, page, rowsPerPage, levelFilter, methodFilter, searchQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);

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
          { label: selectedOrg.orgName, href: `/organization/${selectedOrg.id}` },
          { label: "Developer Tools" },
          { label: "Logs" },
          { label: "Search Logs" },
        ]}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Search sx={{ fontSize: 32, color: "primary.main" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Search Logs</Typography>
          <Typography variant="body2" color="text.secondary">Search and filter API logs</Typography>
        </Box>
        <ActionButton variant="outlined" startIcon={<Refresh />} onClick={fetchData} disabled={loading}>Refresh</ActionButton>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {stats && <LogStatsCards stats={stats} />}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth size="small" label="Search" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }} />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField fullWidth select size="small" label="Level" value={levelFilter} onChange={(e) => { setLevelFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">All</MenuItem>
              {["info", "warn", "error", "debug"].map((l) => <MenuItem key={l} value={l}>{l.toUpperCase()}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField fullWidth select size="small" label="Method" value={methodFilter} onChange={(e) => { setMethodFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">All</MenuItem>
              {["GET", "POST", "PUT", "DELETE", "PATCH"].map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      {loading ? <Spinner /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>URL</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Response Time</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  <TableCell><Chip label={log.level} size="small" color={log.level === "error" ? "error" : log.level === "warn" ? "warning" : log.level === "debug" ? "secondary" : "info"} /></TableCell>
                  <TableCell><Chip label={log.method} size="small" variant="outlined" /></TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{log.url}</TableCell>
                  <TableCell><Chip label={log.statusCode || "N/A"} size="small" color={log.statusCode >= 400 ? "error" : "success"} variant="outlined" /></TableCell>
                  <TableCell>{log.responseTime}ms</TableCell>
                  <TableCell sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>{log.message}</TableCell>
                  <TableCell>
                    <Tooltip title="View Details"><IconButton size="small" onClick={() => { setSelectedLog(log); setDetailOpen(true); }}><Visibility fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow><TableCell colSpan={8} align="center"><Typography color="text.secondary" sx={{ py: 4 }}>No logs found</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[10, 20, 50, 100]} />
        </TableContainer>
      )}
      <LogDetailDialog log={selectedLog} open={detailOpen} onClose={() => setDetailOpen(false)} />
    </Box>
  );
};

export default SearchLogs;
