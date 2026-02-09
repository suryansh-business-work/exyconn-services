import { Box, Typography } from "@mui/material";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import ApiDocsViewer from "../../components/common/ApiDocsViewer";
import { EndpointDefinition } from "../../components/common/ApiDocsViewer/types";
import { API_BASE } from "../../api/config";

const getBaseUrlWithoutApi = () => API_BASE.replace(/\/api$/, "");

const LogsApiDocs = () => {
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
      path: `/api/organizations/${orgId}/logs`,
      description:
        "List API logs with pagination, filtering by level, method, status code, source, date range, tags, and response time.",
      body: null,
      response: JSON.stringify(
        {
          data: [
            {
              id: "log_123",
              method: "POST",
              url: "/api/users",
              statusCode: 201,
              level: "info",
              message: "User created successfully",
              responseTime: 125,
              ip: "192.168.1.1",
              source: "user-service",
              tags: ["user", "create"],
              createdAt: "2024-01-15T10:30:00.000Z",
            },
          ],
          pagination: { page: 1, limit: 20, total: 150, totalPages: 8 },
        },
        null,
        2,
      ),
    },
    {
      method: "POST",
      path: `/api/organizations/${orgId}/logs`,
      description:
        "Create a single API log entry. Supports all HTTP methods and log levels.",
      body: JSON.stringify(
        {
          method: "POST",
          url: "/api/users",
          statusCode: 201,
          level: "info",
          message: "User created successfully",
          responseTime: 125,
          ip: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          tags: ["user", "create"],
          source: "user-service",
          metadata: { userId: "usr_123" },
        },
        null,
        2,
      ),
      response: JSON.stringify(
        {
          id: "log_123",
          method: "POST",
          url: "/api/users",
          statusCode: 201,
          level: "info",
          message: "User created successfully",
          createdAt: "2024-01-15T10:30:00.000Z",
        },
        null,
        2,
      ),
    },
    {
      method: "POST",
      path: `/api/organizations/${orgId}/logs/batch`,
      description:
        "Create multiple log entries in a single request. Supports up to 1000 logs per batch.",
      body: JSON.stringify(
        {
          logs: [
            {
              method: "GET",
              url: "/api/users",
              statusCode: 200,
              level: "info",
              message: "Users listed",
              responseTime: 45,
            },
            {
              method: "POST",
              url: "/api/orders",
              statusCode: 500,
              level: "error",
              message: "Order creation failed",
              error: "Database connection timeout",
              responseTime: 5000,
            },
          ],
        },
        null,
        2,
      ),
      response: JSON.stringify({ inserted: 2 }, null, 2),
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/logs/{logId}`,
      description:
        "Get a specific log entry by ID with full details including request/response bodies.",
      body: null,
      response: JSON.stringify(
        {
          id: "log_123",
          method: "POST",
          url: "/api/users",
          statusCode: 201,
          level: "info",
          message: "User created successfully",
          requestHeaders: { "Content-Type": "application/json" },
          requestBody: { name: "John Doe", email: "john@example.com" },
          responseBody: { id: "usr_123", name: "John Doe" },
          responseTime: 125,
          ip: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          tags: ["user", "create"],
          source: "user-service",
          createdAt: "2024-01-15T10:30:00.000Z",
        },
        null,
        2,
      ),
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/logs/stats`,
      description:
        "Get aggregate statistics including counts by level/method, average response times, and recent errors.",
      body: null,
      response: JSON.stringify(
        {
          total: 15000,
          avgResponseTime: 230,
          maxResponseTime: 12500,
          errorCount: 45,
          byLevel: { info: 12000, warn: 2500, error: 450, debug: 50 },
          byMethod: { GET: 8000, POST: 4500, PUT: 1500, DELETE: 1000 },
          recentErrors: [
            {
              id: "log_456",
              message: "Database timeout",
              url: "/api/orders",
              createdAt: "2024-01-15T10:25:00.000Z",
            },
          ],
        },
        null,
        2,
      ),
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/logs/analytics`,
      description:
        "Get time-series analytics with daily stats, source breakdowns, and status code distribution.",
      body: null,
      response: JSON.stringify(
        {
          dailyStats: [
            {
              date: "2024-01-15",
              total: 500,
              errors: 5,
              avgResponseTime: 210,
            },
            {
              date: "2024-01-14",
              total: 480,
              errors: 3,
              avgResponseTime: 195,
            },
          ],
          sourceStats: [
            { source: "user-service", count: 5000, errors: 20 },
            { source: "order-service", count: 3000, errors: 15 },
          ],
          statusCodeStats: [
            { statusCode: 200, count: 10000 },
            { statusCode: 201, count: 3000 },
            { statusCode: 500, count: 45 },
          ],
        },
        null,
        2,
      ),
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/logs/settings`,
      description: "Get current log settings including retention and capture configuration.",
      body: null,
      response: JSON.stringify(
        {
          id: "settings_123",
          retentionDays: 90,
          maxLogsPerDay: 100000,
          enabledLevels: ["info", "warn", "error", "debug"],
          enableRequestBodyCapture: true,
          enableResponseBodyCapture: false,
          excludedPaths: ["/health", "/ping"],
        },
        null,
        2,
      ),
    },
    {
      method: "PUT",
      path: `/api/organizations/${orgId}/logs/settings`,
      description: "Update log settings. Changes apply immediately.",
      body: JSON.stringify(
        {
          retentionDays: 60,
          maxLogsPerDay: 50000,
          enabledLevels: ["info", "warn", "error"],
          enableRequestBodyCapture: true,
          enableResponseBodyCapture: true,
          excludedPaths: ["/health", "/ping", "/metrics"],
        },
        null,
        2,
      ),
      response: JSON.stringify(
        {
          id: "settings_123",
          retentionDays: 60,
          maxLogsPerDay: 50000,
          enabledLevels: ["info", "warn", "error"],
          updatedAt: "2024-01-15T12:00:00.000Z",
        },
        null,
        2,
      ),
    },
    {
      method: "DELETE",
      path: `/api/organizations/${orgId}/logs`,
      description:
        "Bulk delete logs by filter criteria. Supports filtering by level, date, and source.",
      body: null,
      response: JSON.stringify({ deleted: 250 }, null, 2),
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
          { label: "Logs", href: `${basePath}/service/logs/search` },
          { label: "API Docs" },
        ]}
      />
      <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
        API Logs Documentation
      </Typography>
      <ApiDocsViewer
        title="API Logs"
        subtitle="Centralized logging for application debugging, monitoring, and analytics"
        baseUrl={getBaseUrlWithoutApi()}
        apiKey={apiKey}
        orgId={orgId}
        endpoints={endpoints}
        tabLabels={[
          "List Logs",
          "Create",
          "Batch Create",
          "Get Log",
          "Stats",
          "Analytics",
          "Get Settings",
          "Update Settings",
          "Delete",
        ]}
      />
    </Box>
  );
};

export default LogsApiDocs;
