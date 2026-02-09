import { Box, Typography, Paper } from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from "@mui/material";
import { EmailAnalytics } from "../../../api/emailApi";

interface EmailDashboardChartsProps {
  analytics: EmailAnalytics;
}

const EmailDashboardCharts = ({ analytics }: EmailDashboardChartsProps) => {
  return (
    <Grid container spacing={3}>
      {/* Success Rate Overview */}
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Summary</Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>{analytics.summary.total}</Typography>
                <Typography variant="body2" color="text.secondary">Total</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: "success.main" }}>{analytics.summary.sent}</Typography>
                <Typography variant="body2" color="text.secondary">Sent</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: "error.main" }}>{analytics.summary.failed}</Typography>
                <Typography variant="body2" color="text.secondary">Failed</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6, sm: 2.4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: "warning.main" }}>{analytics.summary.pending}</Typography>
                <Typography variant="body2" color="text.secondary">Pending</Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 2.4 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: "info.main" }}>{analytics.summary.successRate}</Typography>
                <Typography variant="body2" color="text.secondary">Success Rate</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Grid>

      {/* Daily Stats Table */}
      <Grid size={{ xs: 12, md: 7 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Daily Activity (Last 30 Days)</Typography>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Sent</TableCell>
                  <TableCell align="right">Failed</TableCell>
                  <TableCell align="right">Pending</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.dailyStats.length > 0 ? (
                  analytics.dailyStats.map((day) => (
                    <TableRow key={day.date} hover>
                      <TableCell>{day.date}</TableCell>
                      <TableCell align="right"><Chip label={day.sent} size="small" color="success" variant="outlined" /></TableCell>
                      <TableCell align="right"><Chip label={day.failed} size="small" color="error" variant="outlined" /></TableCell>
                      <TableCell align="right"><Chip label={day.pending} size="small" color="warning" variant="outlined" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary" sx={{ py: 2 }}>No data available</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>

      {/* Template Stats */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Top Templates</Typography>
          <TableContainer sx={{ maxHeight: 400 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Template</TableCell>
                  <TableCell align="right">Count</TableCell>
                  <TableCell align="right">Sent</TableCell>
                  <TableCell align="right">Failed</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analytics.templateStats.length > 0 ? (
                  analytics.templateStats.map((tpl) => (
                    <TableRow key={tpl.templateId} hover>
                      <TableCell>{tpl.templateName || tpl.templateId}</TableCell>
                      <TableCell align="right">{tpl.count}</TableCell>
                      <TableCell align="right"><Chip label={tpl.sent} size="small" color="success" variant="outlined" /></TableCell>
                      <TableCell align="right"><Chip label={tpl.failed} size="small" color="error" variant="outlined" /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography color="text.secondary" sx={{ py: 2 }}>No data available</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default EmailDashboardCharts;
