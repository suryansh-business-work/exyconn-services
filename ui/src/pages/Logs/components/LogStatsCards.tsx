import { Box, Typography, Paper, Chip } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ApiLogStats } from "../../../types/apiLogs";

interface LogStatsCardsProps {
  stats: ApiLogStats;
}

const LogStatsCards = ({ stats }: LogStatsCardsProps) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 6, sm: 3 }}>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>{stats.total}</Typography>
          <Typography variant="body2" color="text.secondary">Total Logs</Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <Paper sx={{ p: 2, textAlign: "center", borderTop: 3, borderColor: "error.main" }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "error.main" }}>{stats.errorCount}</Typography>
          <Typography variant="body2" color="text.secondary">Errors</Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <Paper sx={{ p: 2, textAlign: "center", borderTop: 3, borderColor: "info.main" }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "info.main" }}>{stats.avgResponseTime}ms</Typography>
          <Typography variant="body2" color="text.secondary">Avg Response Time</Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, flexWrap: "wrap", mb: 1 }}>
            <Chip label={`Info: ${stats.byLevel.info}`} size="small" color="info" />
            <Chip label={`Warn: ${stats.byLevel.warn}`} size="small" color="warning" />
            <Chip label={`Error: ${stats.byLevel.error}`} size="small" color="error" />
            <Chip label={`Debug: ${stats.byLevel.debug}`} size="small" color="secondary" />
          </Box>
          <Typography variant="body2" color="text.secondary">By Level</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default LogStatsCards;
