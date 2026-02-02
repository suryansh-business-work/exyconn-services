import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { emailLogApi, EmailAnalytics } from '../../api/emailApi';
import { uploadHistoryApi } from '../../api/imagekitApi';
import { UploadStats } from '../../types/imagekit';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ServiceChartsProps {
  serviceId: string;
  orgId: string;
  apiKey?: string;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const, labels: { font: { size: 11 } } } },
  scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' as const, labels: { font: { size: 11 } } } },
  cutout: '60%',
};

const ServiceCharts = ({ serviceId, orgId, apiKey }: ServiceChartsProps) => {
  const [emailStats, setEmailStats] = useState<EmailAnalytics | null>(null);
  const [imageKitStats, setImageKitStats] = useState<UploadStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!orgId) return;
      setLoading(true);
      try {
        if (serviceId === 'all' || serviceId === 'email') {
          setEmailStats(await emailLogApi.getAnalytics(orgId, apiKey));
        }
        if (serviceId === 'all' || serviceId === 'imagekit') {
          setImageKitStats(await uploadHistoryApi.getStats(orgId));
        }
      } catch (err) {
        console.error('Failed to fetch charts:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [serviceId, orgId, apiKey]);

  if (loading) {
    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Skeleton variant="rectangular" height={250} />
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Skeleton variant="circular" width={180} height={180} sx={{ mx: 'auto' }} />
          </Paper>
        </Grid>
      </Grid>
    );
  }

  const renderEmailCharts = () => {
    const dailyData = emailStats?.dailyStats || [];
    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Email Activity (Last 7 Days)
            </Typography>
            <Box sx={{ height: 250 }}>
              <Bar
                data={{
                  labels: dailyData.map((d) => d.date),
                  datasets: [
                    {
                      label: 'Sent',
                      data: dailyData.map((d) => d.sent),
                      backgroundColor: '#4caf50',
                    },
                    {
                      label: 'Failed',
                      data: dailyData.map((d) => d.failed),
                      backgroundColor: '#f44336',
                    },
                  ],
                }}
                options={chartOptions}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Email Status
            </Typography>
            <Box sx={{ height: 220 }}>
              <Doughnut
                data={{
                  labels: ['Sent', 'Failed', 'Pending'],
                  datasets: [
                    {
                      data: [
                        emailStats?.summary.sent ?? 0,
                        emailStats?.summary.failed ?? 0,
                        emailStats?.summary.pending ?? 0,
                      ],
                      backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={doughnutOptions}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderImageKitCharts = () => {
    const byType = imageKitStats?.byFileType || {};
    return (
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Files by Type
            </Typography>
            <Box sx={{ height: 250 }}>
              <Doughnut
                data={{
                  labels: Object.keys(byType).map((k) => k.charAt(0).toUpperCase() + k.slice(1)),
                  datasets: [
                    {
                      data: Object.values(byType),
                      backgroundColor: ['#1976d2', '#4caf50', '#ff9800', '#9c27b0'],
                      borderWidth: 0,
                    },
                  ],
                }}
                options={doughnutOptions}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
              Monthly Uploads
            </Typography>
            <Box sx={{ height: 250 }}>
              <Bar
                data={{
                  labels: (imageKitStats?.byMonth || []).map((m) => m.month),
                  datasets: [
                    {
                      label: 'Files',
                      data: (imageKitStats?.byMonth || []).map((m) => m.count),
                      backgroundColor: '#1976d2',
                    },
                  ],
                }}
                options={chartOptions}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  if (serviceId === 'email') return renderEmailCharts();
  if (serviceId === 'imagekit') return renderImageKitCharts();

  // All services - show both
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Email
      </Typography>
      {renderEmailCharts()}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mt: 2 }}>
        ImageKit
      </Typography>
      {renderImageKitCharts()}
    </Box>
  );
};

export default ServiceCharts;
