import { useEffect, useState } from "react";
import { Box, Paper, Typography, Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { TrendingUp, Email, CheckCircle, Error } from "@mui/icons-material";
import { emailLogApi, EmailAnalytics } from "../../api/emailApi";

interface StatsCardsProps {
  orgId: string;
  apiKey?: string;
}

interface StatItem {
  label: string;
  value: string | number;
  icon: typeof Email;
  color: string;
}

const StatsCards = ({ orgId, apiKey }: StatsCardsProps) => {
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!orgId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await emailLogApi.getAnalytics(orgId, apiKey);
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
        setError("Failed to load stats");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [orgId, apiKey]);

  if (!orgId) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Select an organization to view statistics
        </Typography>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Skeleton variant="text" width={80} height={20} />
              <Skeleton variant="text" width={60} height={32} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Paper>
    );
  }

  const stats: StatItem[] = [
    {
      label: "Total Emails",
      value: analytics?.summary.total ?? 0,
      icon: Email,
      color: "#1976d2",
    },
    {
      label: "Sent Successfully",
      value: analytics?.summary.sent ?? 0,
      icon: CheckCircle,
      color: "#2e7d32",
    },
    {
      label: "Failed",
      value: analytics?.summary.failed ?? 0,
      icon: Error,
      color: "#d32f2f",
    },
    {
      label: "Success Rate",
      value: `${analytics?.summary.successRate ?? 0}%`,
      icon: TrendingUp,
      color: "#9c27b0",
    },
  ];

  return (
    <Grid container spacing={2}>
      {stats.map((stat, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 11, mb: 0.5 }}
                >
                  {stat.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 20 }}>
                  {stat.value}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: `${stat.color}15`,
                }}
              >
                <stat.icon sx={{ color: stat.color, fontSize: 22 }} />
              </Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default StatsCards;
