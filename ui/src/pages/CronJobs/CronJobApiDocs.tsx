import { Box, Typography } from "@mui/material";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import ApiDocsViewer from "../../components/common/ApiDocsViewer";
import { EndpointDefinition } from "../../components/common/ApiDocsViewer/types";
import { API_BASE } from "../../api/config";

const getBaseUrlWithoutApi = () => API_BASE.replace(/\/api$/, "");

const CronJobApiDocs = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const apiKey = selectedApiKey?.apiKey || "YOUR_API_KEY";
  const orgId = selectedOrg?.id || "ORG_ID";

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">
          No organization selected
        </Typography>
      </Box>
    );
  }

  const endpoints: EndpointDefinition[] = [
    {
      method: "GET",
      path: `/api/organizations/${orgId}/cron-jobs`,
      description:
        "List all cron jobs with pagination, search, status and tag filtering.",
      body: null,
      response: JSON.stringify(
        {
          data: [
            {
              id: "job_123",
              name: "Health Check",
              description: "Check server health every 5 minutes",
              cronExpression: "*/5 * * * *",
              timezone: "UTC",
              webhookUrl: "https://api.example.com/health",
              method: "GET",
              status: "active",
              executionCount: 150,
              successCount: 148,
              failureCount: 2,
              lastExecutedAt: "2024-01-15T10:30:00.000Z",
              nextExecutionAt: "2024-01-15T10:35:00.000Z",
              createdAt: "2024-01-01T00:00:00.000Z",
            },
          ],
          pagination: { page: 1, limit: 20, total: 5, totalPages: 1 },
        },
        null,
        2,
      ),
    },
    {
      method: "POST",
      path: `/api/organizations/${orgId}/cron-jobs`,
      description:
        "Create a new cron job. Uses standard 5-part cron expression format.",
      body: JSON.stringify(
        {
          name: "Health Check",
          description: "Check server health every 5 minutes",
          cronExpression: "*/5 * * * *",
          timezone: "UTC",
          webhookUrl: "https://api.example.com/health",
          method: "GET",
          headers: { Authorization: "Bearer token" },
          maxRetries: 3,
          timeout: 30000,
          tags: ["monitoring", "health"],
        },
        null,
        2,
      ),
      response: JSON.stringify(
        {
          id: "job_123",
          name: "Health Check",
          status: "active",
          cronExpression: "*/5 * * * *",
          nextExecutionAt: "2024-01-15T10:35:00.000Z",
          createdAt: "2024-01-15T10:30:00.000Z",
        },
        null,
        2,
      ),
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/cron-jobs/{jobId}`,
      description: "Get a specific cron job by ID with full details.",
      body: null,
      response: JSON.stringify(
        {
          id: "job_123",
          name: "Health Check",
          description: "Check server health",
          cronExpression: "*/5 * * * *",
          webhookUrl: "https://api.example.com/health",
          method: "GET",
          headers: { Authorization: "Bearer token" },
          status: "active",
          maxRetries: 3,
          timeout: 30000,
          executionCount: 150,
          successCount: 148,
          failureCount: 2,
          lastExecutedAt: "2024-01-15T10:30:00.000Z",
          nextExecutionAt: "2024-01-15T10:35:00.000Z",
        },
        null,
        2,
      ),
    },
    {
      method: "PUT",
      path: `/api/organizations/${orgId}/cron-jobs/{jobId}`,
      description: "Update a cron job configuration.",
      body: JSON.stringify(
        {
          name: "Health Check V2",
          cronExpression: "*/10 * * * *",
          maxRetries: 5,
        },
        null,
        2,
      ),
      response: JSON.stringify(
        {
          id: "job_123",
          name: "Health Check V2",
          cronExpression: "*/10 * * * *",
          maxRetries: 5,
          updatedAt: "2024-01-15T12:00:00.000Z",
        },
        null,
        2,
      ),
    },
    {
      method: "PATCH",
      path: `/api/organizations/${orgId}/cron-jobs/{jobId}/toggle`,
      description:
        "Toggle a cron job between active and paused states.",
      body: null,
      response: JSON.stringify(
        {
          id: "job_123",
          name: "Health Check",
          status: "paused",
          updatedAt: "2024-01-15T12:00:00.000Z",
        },
        null,
        2,
      ),
    },
    {
      method: "POST",
      path: `/api/organizations/${orgId}/cron-jobs/{jobId}/execute`,
      description:
        "Manually trigger immediate execution of a cron job. Returns the execution result.",
      body: null,
      response: JSON.stringify(
        {
          success: true,
          execution: {
            id: "exec_456",
            jobId: "job_123",
            jobName: "Health Check",
            status: "success",
            responseStatus: 200,
            duration: 250,
            executedAt: "2024-01-15T12:05:00.000Z",
          },
        },
        null,
        2,
      ),
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/cron-jobs/history`,
      description:
        "Get execution history with filtering by job, status, and date range.",
      body: null,
      response: JSON.stringify(
        {
          data: [
            {
              id: "exec_456",
              cronJobId: "job_123",
              jobName: "Health Check",
              executedAt: "2024-01-15T10:30:00.000Z",
              status: "success",
              responseStatus: 200,
              responseTime: 250,
              requestUrl: "https://api.example.com/health",
              requestMethod: "GET",
              duration: 250,
              retryAttempt: 0,
            },
          ],
          pagination: { page: 1, limit: 20, total: 150, totalPages: 8 },
        },
        null,
        2,
      ),
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/cron-jobs/stats`,
      description: "Get aggregate statistics for all cron jobs.",
      body: null,
      response: JSON.stringify(
        {
          total: 10,
          active: 7,
          paused: 2,
          failed: 1,
          totalExecutions: 5000,
          totalSuccess: 4950,
          totalFailures: 50,
          avgDuration: 320,
          maxDuration: 12000,
          historyCount: 5000,
        },
        null,
        2,
      ),
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/cron-jobs/events`,
      description: `**Server-Sent Events (SSE) endpoint.** Opens a persistent connection for real-time cron job events. Events include: job:created, job:updated, job:deleted, job:toggled, job:execution:start, job:execution:complete, heartbeat.

**Usage (JavaScript):**
\`\`\`javascript
const evtSource = new EventSource(
  '${API_BASE}/organizations/${orgId}/cron-jobs/events'
);

evtSource.addEventListener('job:execution:complete', (e) => {
  const data = JSON.parse(e.data);
  console.log('Job executed:', data);
});

evtSource.addEventListener('heartbeat', (e) => {
  console.log('Connection alive:', JSON.parse(e.data));
});
\`\`\``,
      body: null,
      response: JSON.stringify(
        {
          "event: connected": {
            message: "Connected to cron job events",
            orgId: orgId,
          },
          "event: job:execution:complete": {
            jobId: "job_123",
            name: "Health Check",
            status: "success",
            responseStatus: 200,
            duration: 250,
            timestamp: "2024-01-15T10:30:00.000Z",
          },
          "event: heartbeat": {
            timestamp: "2024-01-15T10:30:30.000Z",
          },
        },
        null,
        2,
      ),
    },
    {
      method: "DELETE",
      path: `/api/organizations/${orgId}/cron-jobs/{jobId}`,
      description:
        "Delete a cron job and all its execution history.",
      body: null,
      response: JSON.stringify({ success: true }, null, 2),
    },
  ];

  const basePath = selectedApiKey
    ? `/organization/${selectedOrg.id}/apikey/${selectedApiKey.apiKey}`
    : `/organization/${selectedOrg.id}`;

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/dashboard" },
          { label: selectedOrg.orgName, href: basePath },
          { label: "Cron Jobs", href: `${basePath}/service/cron-jobs/demo` },
          { label: "API Docs" },
        ]}
      />
      <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
        Cron Jobs API Documentation
      </Typography>
      <ApiDocsViewer
        title="Cron Jobs API"
        subtitle="Schedule recurring tasks with webhook execution and real-time SSE events"
        baseUrl={getBaseUrlWithoutApi()}
        apiKey={apiKey}
        orgId={orgId}
        endpoints={endpoints}
        tabLabels={[
          "List Jobs",
          "Create",
          "Get Job",
          "Update",
          "Toggle",
          "Execute",
          "History",
          "Stats",
          "SSE Events",
          "Delete",
        ]}
      />
    </Box>
  );
};

export default CronJobApiDocs;
