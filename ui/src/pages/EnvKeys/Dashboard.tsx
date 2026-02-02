import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Apps, VpnKey, Code, Settings } from '@mui/icons-material';
import { PageBreadcrumb } from '../../components/common';
import { useOrg } from '../../context/OrgContext';
import { envAppApi } from '../../api/envKeysApi';
import { EnvKeysStats } from '../../types/envKeys';

const EnvKeysDashboard = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const [stats, setStats] = useState<EnvKeysStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedOrg) return;
      setLoading(true);
      try {
        const data = await envAppApi.getStats(selectedOrg.id, selectedApiKey?.apiKey);
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
    { label: 'Total Applications', value: stats?.totalApps ?? 0, icon: <Apps />, color: '#1976d2' },
    {
      label: 'Total Variables',
      value: stats?.totalVariables ?? 0,
      icon: <VpnKey />,
      color: '#2e7d32',
    },
    {
      label: 'Development',
      value: stats?.byEnvironment?.development ?? 0,
      icon: <Code />,
      color: '#ed6c02',
    },
    {
      label: 'Staging',
      value: stats?.byEnvironment?.staging ?? 0,
      icon: <Settings />,
      color: '#9c27b0',
    },
    {
      label: 'Production',
      value: stats?.byEnvironment?.production ?? 0,
      icon: <Settings />,
      color: '#d32f2f',
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
          { label: 'Environment Keys' },
          { label: 'Dashboard' },
        ]}
      />
      <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
        Environment Keys Overview
      </Typography>

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid key={i} size={{ xs: 6, sm: 4, md: 2.4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Skeleton variant="text" width={80} />
                <Skeleton variant="text" width={60} height={32} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {statCards.map((stat, index) => (
            <Grid key={index} size={{ xs: 6, sm: 4, md: 2.4 }}>
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
      )}

      <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          About Environment Keys
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage environment variables securely across your applications. Create applications for
          different environments (development, staging, production) and store sensitive
          configuration values with secret masking.
        </Typography>
      </Paper>
    </Box>
  );
};

export default EnvKeysDashboard;
