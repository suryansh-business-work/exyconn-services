import { Box, Typography, Paper } from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  CheckCircle,
  Error as ErrorIcon,
  Schedule,
  Email,
} from "@mui/icons-material";
import { EmailStats } from "../../../types/email";

interface EmailDashboardStatsProps {
  stats: EmailStats;
}

const EmailDashboardStats = ({ stats }: EmailDashboardStatsProps) => {
  const successRate = stats.total > 0
    ? ((stats.sent / stats.total) * 100).toFixed(1)
    : "0";

  const statItems = [
    { label: "Total Emails", value: stats.total, icon: <Email />, color: "primary.main" },
    { label: "Sent", value: stats.sent, icon: <CheckCircle />, color: "success.main" },
    { label: "Failed", value: stats.failed, icon: <ErrorIcon />, color: "error.main" },
    { label: "Pending", value: stats.pending, icon: <Schedule />, color: "warning.main" },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      {statItems.map((item) => (
        <Grid size={{ xs: 6, sm: 3 }} key={item.label}>
          <Paper sx={{ p: 2, textAlign: "center", borderTop: 3, borderColor: item.color }}>
            <Box sx={{ color: item.color, mb: 1 }}>{item.icon}</Box>
            <Typography variant="h4" sx={{ fontWeight: 600, color: item.color }}>{item.value}</Typography>
            <Typography variant="body2" color="text.secondary">{item.label}</Typography>
          </Paper>
        </Grid>
      ))}
      <Grid size={{ xs: 12 }}>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: "success.main" }}>{successRate}%</Typography>
          <Typography variant="body2" color="text.secondary">Delivery Success Rate</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default EmailDashboardStats;
