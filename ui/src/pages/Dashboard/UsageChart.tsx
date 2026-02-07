import { useEffect, useState } from "react";
import { Box, Paper, Typography, Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { emailLogApi, EmailAnalytics } from "../../api/emailApi";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
);

interface UsageChartProps {
  orgId: string;
  apiKey?: string;
}

const UsageChart = ({ orgId, apiKey }: UsageChartProps) => {
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!orgId) return;
      setLoading(true);
      try {
        const data = await emailLogApi.getAnalytics(orgId, apiKey);
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [orgId, apiKey]);

  if (!orgId) return null;

  if (loading) {
    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Skeleton variant="text" width={150} height={24} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={250} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Skeleton variant="text" width={120} height={24} sx={{ mb: 2 }} />
            <Skeleton
              variant="circular"
              width={180}
              height={180}
              sx={{ mx: "auto" }}
            />
          </Paper>
        </Grid>
      </Grid>
    );
  }

  const dailyData = analytics?.dailyStats || [];
  const hasData = dailyData.length > 0 || (analytics?.summary.total ?? 0) > 0;

  // Bar chart data for daily stats
  const barChartData = {
    labels: dailyData.map((d) => d.date),
    datasets: [
      {
        label: "Sent",
        data: dailyData.map((d) => d.sent),
        backgroundColor: "#4caf50",
      },
      {
        label: "Failed",
        data: dailyData.map((d) => d.failed),
        backgroundColor: "#f44336",
      },
    ],
  };

  // Doughnut chart for status breakdown
  const doughnutData = {
    labels: ["Sent", "Failed", "Pending"],
    datasets: [
      {
        data: [
          analytics?.summary.sent ?? 0,
          analytics?.summary.failed ?? 0,
          analytics?.summary.pending ?? 0,
        ],
        backgroundColor: ["#4caf50", "#f44336", "#ff9800"],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const, labels: { font: { size: 11 } } },
    },
    scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const, labels: { font: { size: 11 } } },
    },
    cutout: "60%",
  };

  if (!hasData) {
    return (
      <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No data yet. Start sending emails to see analytics.
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}
          >
            Email Activity (Last 30 Days)
          </Typography>
          <Box sx={{ height: 250 }}>
            <Bar data={barChartData} options={chartOptions} />
          </Box>
        </Paper>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography
            variant="h6"
            sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}
          >
            Status Breakdown
          </Typography>
          <Box sx={{ height: 200 }}>
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </Box>
        </Paper>
      </Grid>
      {analytics?.templateStats && analytics.templateStats.length > 0 && (
        <Grid size={12}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography
              variant="h6"
              sx={{ fontSize: 14, fontWeight: 600, mb: 2 }}
            >
              Top Templates
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              {analytics.templateStats.slice(0, 5).map((t, i) => (
                <Paper
                  key={i}
                  variant="outlined"
                  sx={{ p: 1.5, minWidth: 150, flex: "1 1 auto" }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, fontSize: 12 }}
                    noWrap
                  >
                    {t.templateName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {t.count} emails • {t.sent} sent • {t.failed} failed
                  </Typography>
                </Paper>
              ))}
            </Box>
          </Paper>
        </Grid>
      )}
    </Grid>
  );
};

export default UsageChart;
