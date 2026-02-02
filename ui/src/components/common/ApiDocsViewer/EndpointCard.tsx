import { Box, Typography, Chip, Divider, Paper } from '@mui/material';
import CodeViewer from './CodeViewer';
import { EndpointCardProps } from './types';

const getMethodColor = (method: string): 'primary' | 'success' | 'warning' | 'error' => {
  const colors: Record<string, 'primary' | 'success' | 'warning' | 'error'> = {
    POST: 'primary',
    GET: 'success',
    PUT: 'warning',
    DELETE: 'error',
    PATCH: 'warning',
  };
  return colors[method] || 'primary';
};

const EndpointCard = ({
  endpoint,
  baseUrl,
  codeLanguage,
  generateCodeExample,
}: EndpointCardProps) => {
  return (
    <Box>
      {/* Endpoint URL */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          <Chip
            label={endpoint.method}
            size="small"
            color={getMethodColor(endpoint.method)}
            sx={{ fontWeight: 600, minWidth: 60 }}
          />
          <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
            {baseUrl}
            {endpoint.path}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {endpoint.description}
        </Typography>
      </Paper>

      {/* Request Body */}
      {endpoint.body && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
            Request Body
          </Typography>
          <CodeViewer code={endpoint.body} language="json" />
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Code Example */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Example Request
        </Typography>
        <CodeViewer code={generateCodeExample(endpoint)} language={codeLanguage} />
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Response */}
      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Response
        </Typography>
        <CodeViewer code={endpoint.response} language="json" />
      </Box>
    </Box>
  );
};

export default EndpointCard;
