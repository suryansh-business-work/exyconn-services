import { Box, Typography } from '@mui/material';
import { PageBreadcrumb } from '../../components/common';
import { useOrg } from '../../context/OrgContext';
import ApiDocsViewer from '../../components/common/ApiDocsViewer';
import { EndpointDefinition } from '../../components/common/ApiDocsViewer/types';
import { API_BASE } from '../../api/config';

// Extract base URL without /api for ApiDocsViewer component
const getBaseUrlWithoutApi = () => API_BASE.replace(/\/api$/, '');

const EnvKeysApiDocs = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const apiKey = selectedApiKey?.apiKey || 'YOUR_API_KEY';
  const orgId = selectedOrg?.id || 'ORG_ID';

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  const endpoints: EndpointDefinition[] = [
    {
      method: 'GET',
      path: `/api/organizations/${orgId}/env-keys/apps`,
      description: 'Get all environment applications for this organization.',
      body: null,
      response: JSON.stringify(
        {
          data: [{ id: 'app_123', name: 'My App', environment: 'development' }],
          pagination: { page: 1, limit: 10, total: 1 },
        },
        null,
        2
      ),
    },
    {
      method: 'POST',
      path: `/api/organizations/${orgId}/env-keys/apps`,
      description: 'Create a new environment application.',
      body: JSON.stringify(
        { name: 'My App', description: 'App description', environment: 'development' },
        null,
        2
      ),
      response: JSON.stringify(
        {
          id: 'app_123',
          name: 'My App',
          environment: 'development',
          createdAt: new Date().toISOString(),
        },
        null,
        2
      ),
    },
    {
      method: 'GET',
      path: `/api/organizations/${orgId}/env-keys/apps/{appId}/variables`,
      description: 'Get all variables for an application.',
      body: null,
      response: JSON.stringify(
        {
          data: [{ id: 'var_123', key: 'DATABASE_URL', value: '****', isSecret: true }],
          pagination: { page: 1, limit: 10, total: 1 },
        },
        null,
        2
      ),
    },
    {
      method: 'POST',
      path: `/api/organizations/${orgId}/env-keys/apps/{appId}/variables`,
      description: 'Create a new environment variable.',
      body: JSON.stringify(
        {
          key: 'DATABASE_URL',
          value: 'postgres://localhost:5432/db',
          isSecret: true,
          description: 'Database connection string',
        },
        null,
        2
      ),
      response: JSON.stringify(
        { id: 'var_123', key: 'DATABASE_URL', value: '****', isSecret: true },
        null,
        2
      ),
    },
    {
      method: 'GET',
      path: `/api/organizations/${orgId}/env-keys/apps/{appId}/variables/{variableId}/value`,
      description: 'Get the actual (unmasked) value of a secret variable.',
      body: null,
      response: JSON.stringify({ value: 'postgres://localhost:5432/db' }, null, 2),
    },
    {
      method: 'GET',
      path: `/api/organizations/${orgId}/env-keys/apps/{appId}/variables/all`,
      description: 'Get all variables as key-value pairs (for .env file generation).',
      body: null,
      response: JSON.stringify(
        { DATABASE_URL: 'postgres://localhost:5432/db', API_KEY: 'secret-key' },
        null,
        2
      ),
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
          { label: 'Environment Keys', href: `${basePath}/service/env-keys/dashboard` },
          { label: 'API Docs' },
        ]}
      />
      <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
        Environment Keys API Documentation
      </Typography>
      <ApiDocsViewer
        title="Environment Keys API"
        subtitle="Manage environment variables for your applications"
        baseUrl={getBaseUrlWithoutApi()}
        apiKey={apiKey}
        orgId={orgId}
        endpoints={endpoints}
        tabLabels={['Apps', 'Variables']}
      />
    </Box>
  );
};

export default EnvKeysApiDocs;
