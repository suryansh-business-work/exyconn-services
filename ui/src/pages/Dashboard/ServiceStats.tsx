import { useEffect, useState } from 'react';
import { Box, Paper, Typography, Skeleton } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Email, CloudUpload, Check, Error as ErrorIcon, TrendingUp } from '@mui/icons-material';
import { emailLogApi, EmailAnalytics } from '../../api/emailApi';
import { uploadHistoryApi } from '../../api/imagekitApi';
import { UploadStats } from '../../types/imagekit';

interface ServiceStatsProps {
  serviceId: string;
  orgId: string;
  apiKey?: string;
}

interface StatCardData {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const ServiceStats = ({ serviceId, orgId, apiKey }: ServiceStatsProps) => {
  const [emailStats, setEmailStats] = useState<EmailAnalytics | null>(null);
  const [imageKitStats, setImageKitStats] = useState<UploadStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!orgId) return;
      setLoading(true);
      try {
        if (serviceId === 'all' || serviceId === 'email') {
          const data = await emailLogApi.getAnalytics(orgId, apiKey);
          setEmailStats(data);
        }
        if (serviceId === 'all' || serviceId === 'imagekit') {
          const data = await uploadHistoryApi.getStats(orgId);
          setImageKitStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [serviceId, orgId, apiKey]);

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Skeleton variant="text" width={80} />
              <Skeleton variant="text" width={60} height={32} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  const getStats = (): StatCardData[] => {
    if (serviceId === 'email') {
      return [
        {
          label: 'Total Emails',
          value: emailStats?.summary.total ?? 0,
          icon: <Email />,
          color: '#1976d2',
        },
        { label: 'Sent', value: emailStats?.summary.sent ?? 0, icon: <Check />, color: '#2e7d32' },
        {
          label: 'Failed',
          value: emailStats?.summary.failed ?? 0,
          icon: <ErrorIcon />,
          color: '#d32f2f',
        },
        {
          label: 'Success Rate',
          value: `${emailStats?.summary.successRate ?? 0}%`,
          icon: <TrendingUp />,
          color: '#9c27b0',
        },
      ];
    }

    if (serviceId === 'imagekit') {
      const sizeInMB = ((imageKitStats?.totalSize ?? 0) / (1024 * 1024)).toFixed(2);
      return [
        {
          label: 'Total Files',
          value: imageKitStats?.totalFiles ?? 0,
          icon: <CloudUpload />,
          color: '#1976d2',
        },
        {
          label: 'Images',
          value: imageKitStats?.byFileType?.image ?? 0,
          icon: <CloudUpload />,
          color: '#2e7d32',
        },
        {
          label: 'Documents',
          value: imageKitStats?.byFileType?.document ?? 0,
          icon: <CloudUpload />,
          color: '#ff9800',
        },
        { label: 'Storage Used', value: `${sizeInMB} MB`, icon: <TrendingUp />, color: '#9c27b0' },
      ];
    }

    // All services combined
    return [
      {
        label: 'Total Emails',
        value: emailStats?.summary.total ?? 0,
        icon: <Email />,
        color: '#1976d2',
      },
      {
        label: 'Email Success',
        value: `${emailStats?.summary.successRate ?? 0}%`,
        icon: <Check />,
        color: '#2e7d32',
      },
      {
        label: 'Total Files',
        value: imageKitStats?.totalFiles ?? 0,
        icon: <CloudUpload />,
        color: '#ff9800',
      },
      {
        label: 'Storage',
        value: `${((imageKitStats?.totalSize ?? 0) / (1024 * 1024)).toFixed(1)} MB`,
        icon: <TrendingUp />,
        color: '#9c27b0',
      },
    ];
  };

  const stats = getStats();

  return (
    <Grid container spacing={2}>
      {stats.map((stat, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: 11, mb: 0.5 }}>
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
                  bgcolor: `${stat.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: stat.color,
                }}
              >
                {stat.icon}
              </Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default ServiceStats;
