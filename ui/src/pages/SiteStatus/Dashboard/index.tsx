import { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  MonitorHeart,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Speed,
  TrendingUp,
} from '@mui/icons-material';
import { PageBreadcrumb } from '../../../components/common';
import { useOrg } from '../../../context/OrgContext';
import { siteCheckHistoryApi } from '../../../api/siteStatusApi';
import { SiteMonitorStats } from '../../../types/siteStatus';

const SiteStatusDashboard = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const [stats, setStats] = useState<SiteMonitorStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedOrg) return;
      setLoading(true);
      try {
        const data = await siteCheckHistoryApi.getStats(selectedOrg.id, selectedApiKey?.apiKey);
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedOrg, selectedApiKey]);

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  const statCards = [
    {
      label: 'Total Monitors',
      value: stats?.totalMonitors ?? 0,
      icon: <MonitorHeart />,
      color: '#1976d2',
    },
    { label: 'Active', value: stats?.activeMonitors ?? 0, icon: <TrendingUp />, color: '#2e7d32' },
    { label: 'Healthy', value: stats?.healthyCount ?? 0, icon: <CheckCircle />, color: '#4caf50' },
    { label: 'Warnings', value: stats?.warningCount ?? 0, icon: <Warning />, color: '#ff9800' },
    { label: 'Errors', value: stats?.errorCount ?? 0, icon: <ErrorIcon />, color: '#d32f2f' },
    {
      label: 'Avg Response',
      value: `${stats?.averageResponseTime ?? 0}ms`,
      icon: <Speed />,
      color: '#9c27b0',
    },
  ];

  const basePath = selectedApiKey
    ? `/organization/${selectedOrg.id}/apikey/${selectedApiKey.apiKey}`
    : `/organization/${selectedOrg.id}`;

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: 'Home', href: '/dashboard' },
          { label: selectedOrg.orgName, href: basePath },
          { label: 'Site Status' },
          { label: 'Dashboard' },
        ]}
      />
      <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
        Site Status Overview
      </Typography>

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid key={i} size={{ xs: 12, sm: 6, md: 4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Skeleton variant="text" width={80} />
                <Skeleton variant="text" width={60} height={32} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {statCards.map((stat, index) => (
              <Grid key={index} size={{ xs: 6, sm: 4, md: 2 }}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                  <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 20 }}>
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11 }}>
                    {stat.label}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>

          {/* Uptime Card */}
          <Paper variant="outlined" sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              24h Uptime
            </Typography>
            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
              <CircularProgress
                variant="determinate"
                value={stats?.uptimePercentage ?? 0}
                size={120}
                thickness={4}
                sx={{
                  color:
                    (stats?.uptimePercentage ?? 0) > 90
                      ? '#4caf50'
                      : (stats?.uptimePercentage ?? 0) > 70
                        ? '#ff9800'
                        : '#d32f2f',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h4" sx={{ fontWeight: 600 }}>
                  {stats?.uptimePercentage ?? 0}%
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Based on check results from the last 24 hours
            </Typography>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default SiteStatusDashboard;
