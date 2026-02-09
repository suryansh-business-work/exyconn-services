import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Chip,
  CircularProgress,
  TextField,
  MenuItem,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { History } from "@mui/icons-material";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { cronJobsApi } from "../../api/cronJobsApi";
import { CronJobHistory as CronJobHistoryType } from "../../types/cronJobs";

const CronJobHistoryPage = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const [history, setHistory] = useState<CronJobHistoryType[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      if (!selectedOrg) return;
      setLoading(true);
      try {
        const result = await cronJobsApi.getHistory(selectedOrg.id, {
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter || undefined,
        });
        setHistory(result.data);
        setTotal(result.pagination.total);
      } catch (err) {
        console.error("Failed to fetch cron job history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [selectedOrg, selectedApiKey, page, rowsPerPage, statusFilter]);

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">
          No organization selected
        </Typography>
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
          { label: "Cron Jobs", href: `${basePath}/service/cron-jobs/demo` },
          { label: "History" },
        ]}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <History sx={{ fontSize: 32, color: "primary.main" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18 }}>
            Cron Job Execution History
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View past cron job executions and their results
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4} md={3}>
          <TextField
            fullWidth
            size="small"
            select
            label="Status Filter"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="success">Success</MenuItem>
            <MenuItem value="failure">Failure</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Job Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Method</TableCell>
                <TableCell>URL</TableCell>
                <TableCell align="center">HTTP Status</TableCell>
                <TableCell align="center">Duration</TableCell>
                <TableCell>Error</TableCell>
                <TableCell>Executed At</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="text.secondary">
                      No execution history
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                history.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {entry.jobName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={entry.status}
                        size="small"
                        color={
                          entry.status === "success" ? "success" : "error"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={entry.requestMethod}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 10 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: 11,
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.requestUrl}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {entry.responseStatus ? (
                        <Chip
                          label={entry.responseStatus}
                          size="small"
                          color={
                            entry.responseStatus < 400
                              ? "success"
                              : "error"
                          }
                          sx={{ fontSize: 10 }}
                        />
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontSize: 11 }}>
                        {entry.duration}ms
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {entry.error ? (
                        <Typography
                          variant="body2"
                          color="error"
                          sx={{
                            fontSize: 11,
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {entry.error}
                        </Typography>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: 11 }}>
                        {new Date(entry.executedAt).toLocaleString()}
                      </Typography>
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
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>
    </Box>
  );
};

export default CronJobHistoryPage;
