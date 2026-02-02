import { Box, Typography } from '@mui/material';
import { PageBreadcrumb, ApiDocsViewer } from '../../components/common';
import { useOrg } from '../../context/OrgContext';
import { EndpointDefinition } from '../../components/common/ApiDocsViewer/types';

const EmailApiDocs = () => {
  const { selectedOrg, selectedApiKey } = useOrg();

  const apiKey = selectedApiKey?.apiKey || 'YOUR_API_KEY';
  const orgId = selectedOrg?.id || 'YOUR_ORG_ID';
  const baseUrl = 'http://localhost:4004/api';

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
      path: `/organizations/${orgId}/email/send`,
      description:
        'Send an email using a template and SMTP configuration. Supports multiple recipients via to, cc, and bcc arrays.',
      body: `{
  "smtpConfigId": "SMTP_CONFIG_ID",
  "templateId": "TEMPLATE_ID",
  "to": ["recipient@example.com"],
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"],
  "subject": "Optional subject override",
  "variables": {
    "name": "John Doe",
    "link": "https://example.com"
  }
}`,
      response: `{
  "success": true,
  "messageId": "<abc123@smtp.example.com>",
  "recipient": ["recipient@example.com"],
  "cc": ["cc@example.com"],
  "bcc": ["bcc@example.com"],
  "subject": "Your Email Subject",
  "sentAt": "2024-01-15T10:30:00.000Z"
}`,
    },
    {
      method: 'GET',
      path: `/organizations/${orgId}/email/smtp`,
      description: 'List all SMTP configurations for the organization with pagination support.',
      body: null,
      response: `{
  "data": [
    {
      "id": "smtp_123",
      "name": "Primary SMTP",
      "host": "smtp.example.com",
      "port": 587,
      "username": "user@example.com",
      "secure": true,
      "isActive": true
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
      method: 'GET',
      path: `/organizations/${orgId}/email/templates`,
      description: 'List all email templates with their variables and metadata.',
      body: null,
      response: `{
  "data": [
    {
      "id": "template_123",
      "name": "Welcome Email",
      "subject": "Welcome {{name}}!",
      "variables": [
        { "name": "name", "defaultValue": "User" },
        { "name": "link", "defaultValue": "" }
      ],
      "createdAt": "2024-01-10T10:00:00.000Z"
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
      path: `/organizations/${orgId}/email/templates/preview`,
      description: 'Preview MJML template by compiling it to HTML with variable substitution.',
      body: `{
  "mjmlContent": "<mjml><mj-body>...</mj-body></mjml>",
  "variables": {
    "name": "John"
  }
}`,
      response: `{
  "html": "<html><body>...</body></html>",
  "errors": []
}`,
    },
  ];

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: selectedOrg.orgName, href: `/organization/${selectedOrg.id}` },
          { label: 'Communications' },
          { label: 'Email' },
          { label: 'API Docs' },
        ]}
      />

      <ApiDocsViewer
        title="Email API Documentation"
        subtitle="Integrate email sending into your applications with SMTP and template support"
        baseUrl={baseUrl}
        apiKey={apiKey}
        orgId={orgId}
        endpoints={endpoints}
        tabLabels={['Send Email', 'SMTP Configs', 'Templates', 'Preview']}
      />
    </Box>
  );
};

export default EmailApiDocs;
