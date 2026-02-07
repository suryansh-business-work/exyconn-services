import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Refresh,
  Visibility,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
} from "@mui/icons-material";
import { PageBreadcrumb } from "../../../components/common";
import { useOrg } from "../../../context/OrgContext";
import {
  siteCheckHistoryApi,
  siteMonitorApi,
} from "../../../api/siteStatusApi";
import { SiteCheckResult, SiteMonitorConfig } from "../../../types/siteStatus";
import CheckDetailDialog from "./CheckDetailDialog";

const SiteStatusHistory = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const [history, setHistory] = useState<SiteCheckResult[]>([]);
  const [monitors, setMonitors] = useState<SiteMonitorConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filterMonitor, setFilterMonitor] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [selectedCheck, setSelectedCheck] = useState<SiteCheckResult | null>(
    null,
  );

  const fetchHistory = async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const [historyResult, monitorsResult] = await Promise.all([
        siteCheckHistoryApi.list(
          selectedOrg.id,
          {
            page: page + 1,
            limit: rowsPerPage,
            monitorId: filterMonitor || undefined,
            status:
              (filterStatus as "healthy" | "warning" | "error") || undefined,
          },
          selectedApiKey?.apiKey,
        ),
        siteMonitorApi.list(
          selectedOrg.id,
          { limit: 100 },
          selectedApiKey?.apiKey,
        ),
      ]);
      setHistory(historyResult.data);
      setTotal(historyResult.pagination.total);
      setMonitors(monitorsResult.data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [
    selectedOrg,
    selectedApiKey,
    page,
    rowsPerPage,
    filterMonitor,
    filterStatus,
  ]);

  const getStatusChip = (status: string) => {
    if (status === "healthy")
      return (
        <Chip
          icon={<CheckCircle />}
          label="Healthy"
          size="small"
          color="success"
        />
      );
    if (status === "warning")
      return (
        <Chip icon={<Warning />} label="Warning" size="small" color="warning" />
      );
    return (
      <Chip icon={<ErrorIcon />} label="Error" size="small" color="error" />
    );
  };

  const getMonitorName = (monitorId: string) =>
    monitors.find((m) => m.id === monitorId)?.name || "Unknown";

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
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
          { label: "Home", href: "/dashboard" },
          { label: selectedOrg.orgName, href: basePath },
          {
            label: "Site Status",
            href: `${basePath}/service/site-status/dashboard`,
          },
          { label: "History" },
        ]}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18 }}>
          Check History
        </Typography>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Refresh />}
          onClick={fetchHistory}
        >
          Refresh
        </Button>
      </Box>

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Monitor</InputLabel>
              <Select
                value={filterMonitor}
                onChange={(e) => {
                  setFilterMonitor(e.target.value);
                  setPage(0);
                }}
                label="Monitor"
              >
                <MenuItem value="">All Monitors</MenuItem>
                {monitors.map((m) => (
                  <MenuItem key={m.id} value={m.id}>
                    {m.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(0);
                }}
                label="Status"
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="healthy">Healthy</MenuItem>
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="error">Error</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Monitor</TableCell>
                <TableCell>URL</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Response Time</TableCell>
                <TableCell align="center">Timestamp</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      No history found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                history.map((check) => (
                  <TableRow key={check.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {getMonitorName(check.monitorId)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", fontSize: 11 }}
                      >
                        {check.url}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {getStatusChip(check.overallStatus)}
                    </TableCell>
                    <TableCell align="center">
                      {check.responseTime ? `${check.responseTime}ms` : "-"}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontSize: 11 }}>
                        {new Date(check.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => setSelectedCheck(check)}
                        >
                          <Visibility fontSize="small" />
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
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      <CheckDetailDialog
        open={!!selectedCheck}
        onClose={() => setSelectedCheck(null)}
        check={selectedCheck}
      />
    </Box>
  );
};

export default SiteStatusHistory;
