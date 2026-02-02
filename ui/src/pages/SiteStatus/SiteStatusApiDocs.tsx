import { Box, Typography } from '@mui/material';
import { PageBreadcrumb, ApiDocsViewer } from '../../components/common';
import { useOrg } from '../../context/OrgContext';
import { EndpointDefinition } from '../../components/common/ApiDocsViewer/types';
import { API_BASE } from '../../api/config';

const SiteStatusApiDocs = () => {
  const { selectedOrg, selectedApiKey } = useOrg();

  const apiKey = selectedApiKey?.apiKey || 'YOUR_API_KEY';
  const orgId = selectedOrg?.id || 'YOUR_ORG_ID';
  const baseUrl = API_BASE;

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  const endpoints: EndpointDefinition[] = [
    {
      method: 'POST',
      path: `/organizations/${orgId}/site-status/monitors`,
      description: 'Create a new site monitor with specified check options.',
      body: `{
  "url": "https://example.com",
  "name": "My Website",
  "checkInterval": 5,
  "checks": {
    "httpStatus": true,
    "sslCertificate": true,
    "dnsRecords": false,
    "mxRecords": false,
    "screenshot": true,
    "pageInfo": true,
    "responseTime": true
  }
}`,
      response: `{
  "id": "monitor_123",
  "url": "https://example.com",
  "name": "My Website",
  "isActive": true,
  "checkInterval": 5,
  "checks": { ... },
  "createdAt": "2024-01-15T10:00:00.000Z"
}`,
    },
    {
      method: 'GET',
      path: `/organizations/${orgId}/site-status/monitors`,
      description: 'List all site monitors with pagination, search, and filtering.',
      body: null,
      response: `{
  "data": [
    {
      "id": "monitor_123",
      "url": "https://example.com",
      "name": "My Website",
      "isActive": true,
      "lastStatus": "healthy",
      "lastCheckedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}`,
    },
    {
      method: 'POST',
      path: `/organizations/${orgId}/site-status/monitors/:monitorId/check`,
      description: 'Trigger an immediate check for a specific monitor.',
      body: null,
      response: `{
  "id": "check_456",
  "monitorId": "monitor_123",
  "url": "https://example.com",
  "timestamp": "2024-01-15T10:35:00.000Z",
  "overallStatus": "healthy",
  "httpStatus": {
    "statusCode": 200,
    "statusText": "OK",
    "isOk": true
  },
  "sslCertificate": {
    "valid": true,
    "issuer": "Let's Encrypt",
    "daysUntilExpiry": 60
  },
  "responseTime": 250,
  "pageInfo": {
    "title": "Example Domain",
    "description": "...",
    "loadTime": 450
  }
}`,
    },
    {
      method: 'GET',
      path: `/organizations/${orgId}/site-status/history`,
      description: 'Get check history with filtering by monitor, status, and date range.',
      body: null,
      response: `{
  "data": [
    {
      "id": "check_456",
      "monitorId": "monitor_123",
      "url": "https://example.com",
      "timestamp": "2024-01-15T10:35:00.000Z",
      "overallStatus": "healthy",
      "responseTime": 250
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}`,
    },
    {
      method: 'GET',
      path: `/organizations/${orgId}/site-status/stats`,
      description: 'Get aggregated statistics including uptime percentage and response times.',
      body: null,
      response: `{
  "totalMonitors": 5,
  "activeMonitors": 4,
  "healthyCount": 3,
  "warningCount": 1,
  "errorCount": 0,
  "averageResponseTime": 320,
  "uptimePercentage": 99
}`,
    },
    {
      method: 'DELETE',
      path: `/organizations/${orgId}/site-status/monitors/:monitorId`,
      description: 'Delete a monitor and all its check history.',
      body: null,
      response: `{
  "success": true,
  "message": "Monitor deleted"
}`,
    },
  ];

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: selectedOrg.orgName, href: `/organization/${selectedOrg.id}` },
          { label: 'Site Status' },
          { label: 'API Docs' },
        ]}
      />

      <ApiDocsViewer
        title="Site Status API Documentation"
        subtitle="Monitor website uptime, SSL certificates, DNS records, and page information"
        baseUrl={baseUrl}
        apiKey={apiKey}
        orgId={orgId}
        endpoints={endpoints}
        tabLabels={['Create Monitor', 'List Monitors', 'Run Check', 'History', 'Stats', 'Delete']}
      />
    </Box>
  );
};

export default SiteStatusApiDocs;
