import { Box, Typography, Button } from '@mui/material';
import { Home, ErrorOutline } from '@mui/icons-material';

interface NotFoundPageProps {
  onNavigateHome?: () => void;
}

const NotFoundPage = ({ onNavigateHome }: NotFoundPageProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 100px)',
        textAlign: 'center',
        p: 3,
      }}
    >
      <ErrorOutline sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
      <Typography variant="h1" sx={{ fontSize: 72, fontWeight: 700, color: 'text.primary', mb: 1 }}>
        404
      </Typography>
      <Typography
        variant="h5"
        sx={{ fontSize: 20, fontWeight: 600, color: 'text.secondary', mb: 1 }}
      >
        Page Not Found
      </Typography>
      <Typography
        variant="body2"
        sx={{ fontSize: 14, color: 'text.secondary', mb: 3, maxWidth: 400 }}
      >
        The page you are looking for might have been removed, had its name changed, or is
        temporarily unavailable.
      </Typography>
      <Button
        variant="contained"
        startIcon={<Home />}
        onClick={onNavigateHome}
        sx={{ textTransform: 'none' }}
      >
        Go to Home
      </Button>
    </Box>
  );
};

export default NotFoundPage;
