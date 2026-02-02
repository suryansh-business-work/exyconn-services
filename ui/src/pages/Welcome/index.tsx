import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { Business, CheckCircle } from '@mui/icons-material';
import { getAllAppsFlat, AppDefinition } from '../../data/app-data';
import { getIcon } from '../../utils/iconMap';

interface WelcomePageProps {
  onCreateOrganization: () => void;
}

const WelcomePage = ({ onCreateOrganization }: WelcomePageProps) => {
  const allApps = getAllAppsFlat().filter((app) => !app.isGroup);

  const getStatusChip = (status: AppDefinition['status']) => {
    if (status === 'live')
      return <Chip label="Live" size="small" color="success" sx={{ fontSize: 10, height: 20 }} />;
    if (status === 'dev')
      return (
        <Chip
          label="In Development"
          size="small"
          color="warning"
          sx={{ fontSize: 10, height: 20 }}
        />
      );
    return (
      <Chip label="Coming Soon" size="small" color="default" sx={{ fontSize: 10, height: 20 }} />
    );
  };

  const liveServices = allApps.filter((app) => app.status === 'live');
  const devServices = allApps.filter((app) => app.status === 'dev');
  const soonServices = allApps.filter((app) => app.status === 'soon');

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Business sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
          Welcome to Services Portal
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          A comprehensive suite of APIs and services for your applications. Create an organization
          to get started.
        </Typography>
      </Box>

      {/* Getting Started Steps */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
          Getting Started
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
          {[
            { step: 1, title: 'Create Organization', desc: 'Set up your organization profile' },
            { step: 2, title: 'Generate API Key', desc: 'Get your unique API key' },
            { step: 3, title: 'Integrate Services', desc: 'Start using services via APIs' },
          ].map((item) => (
            <Box
              key={item.step}
              sx={{ flex: 1, display: 'flex', alignItems: 'flex-start', gap: 1.5 }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {item.step}
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {item.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.desc}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="small"
            startIcon={<CheckCircle />}
            onClick={onCreateOrganization}
            sx={{ textTransform: 'none' }}
          >
            Create Your First Organization
          </Button>
        </Box>
      </Paper>

      {/* Stats Summary */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 120, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'success.main' }}>
            {liveServices.length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Live Services
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 120, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'warning.main' }}>
            {devServices.length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            In Development
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 120, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {soonServices.length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Coming Soon
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 120, textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            {allApps.length}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Total Services
          </Typography>
        </Paper>
      </Box>

      {/* Services Table */}
      <Paper variant="outlined">
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            All Available Services
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Service</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Description</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>Category</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: 12 }}>
                  Status
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {allApps.map((app) => {
                const IconComponent = getIcon(app.iconName);
                return (
                  <TableRow key={app.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ color: 'primary.main', display: 'flex' }}>
                          <IconComponent fontSize="small" />
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {app.name}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: 12 }}>
                        {app.description}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={app.category}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: 10, height: 20 }}
                      />
                    </TableCell>
                    <TableCell align="center">{getStatusChip(app.status)}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Footer Note */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          More services are being added regularly. Check back for updates!
        </Typography>
      </Box>
    </Box>
  );
};

export default WelcomePage;
