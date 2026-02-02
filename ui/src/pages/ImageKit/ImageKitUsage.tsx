import { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Analytics, Image, VideoFile, InsertDriveFile, CloudUpload } from '@mui/icons-material';
import { PageBreadcrumb, Spinner } from '../../components/common';
import { useOrg } from '../../context/OrgContext';
import { uploadHistoryApi } from '../../api/imagekitApi';
import { UploadStats } from '../../types/imagekit';

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
}

const StatCard = ({ title, value, subtitle, icon, color }: StatCardProps) => (
  <Paper sx={{ p: 2.5 }}>
    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="caption" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 600, my: 0.5 }}>
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ p: 1, borderRadius: 1, bgcolor: `${color}.light`, color: `${color}.main` }}>
        {icon}
      </Box>
    </Box>
  </Paper>
);

const ImageKitUsage = () => {
  const { selectedOrg } = useOrg();
  const [stats, setStats] = useState<UploadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const data = await uploadHistoryApi.getStats(selectedOrg.id);
      setStats(data);
    } catch {
      setError('Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  }, [selectedOrg]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  if (loading) return <Spinner />;

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: selectedOrg.orgName, href: `/organization/${selectedOrg.id}` },
          { label: 'Storage' },
          { label: 'ImageKit' },
          { label: 'Usage' },
        ]}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Analytics sx={{ fontSize: 32, color: 'primary.main' }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Usage Statistics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View your ImageKit storage usage
          </Typography>
        </Box>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {stats && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total Files"
                value={stats.totalFiles}
                icon={<CloudUpload />}
                color="primary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Total Storage"
                value={formatBytes(stats.totalSize)}
                icon={<InsertDriveFile />}
                color="secondary"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Images"
                value={stats.byFileType['image'] || 0}
                icon={<Image />}
                color="success"
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <StatCard
                title="Videos"
                value={stats.byFileType['video'] || 0}
                icon={<VideoFile />}
                color="warning"
              />
            </Grid>
          </Grid>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Files by Type
                </Typography>
                {Object.entries(stats.byFileType).map(([type, count]) => (
                  <Box
                    key={type}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {type}
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {count}
                    </Typography>
                  </Box>
                ))}
                {Object.keys(stats.byFileType).length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 2, textAlign: 'center' }}
                  >
                    No data
                  </Typography>
                )}
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 2 }}>
                  Files by Upload Mode
                </Typography>
                {Object.entries(stats.byUploadMode).map(([mode, count]) => (
                  <Box
                    key={mode}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body2">{mode}</Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {count}
                    </Typography>
                  </Box>
                ))}
                {Object.keys(stats.byUploadMode).length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ py: 2, textAlign: 'center' }}
                  >
                    No data
                  </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default ImageKitUsage;
