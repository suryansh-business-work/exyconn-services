import { Box, Typography } from "@mui/material";
import { PageBreadcrumb, ApiDocsViewer } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { EndpointDefinition } from "../../components/common/ApiDocsViewer/types";
import { API_BASE } from "../../api/config";

const getBaseUrlWithoutApi = () => API_BASE.replace(/\/api$/, "");

const SystemInfoApiDocs = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const apiKey = selectedApiKey?.apiKey || "YOUR_API_KEY";
  const orgId = selectedOrg?.id || "YOUR_ORG_ID";

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">
          No organization selected
        </Typography>
      </Box>
    );
  }

  const basePath = selectedApiKey
    ? `/organization/${selectedOrg.id}/apikey/${selectedApiKey.apiKey}`
    : `/organization/${selectedOrg.id}`;

  const endpoints: EndpointDefinition[] = [
    {
      method: "GET",
      path: `/api/organizations/${orgId}/system-info/system`,
      description:
        "Get server system information including CPU, memory, OS, and uptime.",
      body: null,
      response: `{
  "hostname": "server-01",
  "platform": "linux",
  "arch": "x64",
  "cpus": 4,
  "totalMemory": 8589934592,
  "freeMemory": 4294967296,
  "uptime": 86400,
  "nodeVersion": "v20.10.0"
}`,
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/system-info/docker`,
      description:
        "Get Docker daemon information including version, OS, and resource usage.",
      body: null,
      response: `{
  "version": "24.0.7",
  "apiVersion": "1.43",
  "os": "linux",
  "architecture": "x86_64",
  "containers": 12,
  "containersRunning": 8,
  "images": 25,
  "memoryLimit": true
}`,
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/system-info/docker/containers`,
      description: "List all Docker containers with status and resource usage.",
      body: null,
      response: `{
  "data": [
    {
      "id": "abc123",
      "name": "web-server",
      "image": "nginx:latest",
      "state": "running",
      "status": "Up 2 days",
      "ports": [{ "private": 80, "public": 8080 }]
    }
  ]
}`,
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/system-info/docker/containers/{containerId}`,
      description:
        "Get detailed information about a specific Docker container.",
      body: null,
      response: `{
  "id": "abc123",
  "name": "web-server",
  "image": "nginx:latest",
  "state": "running",
  "status": "Up 2 days",
  "ports": [{ "private": 80, "public": 8080 }],
  "mounts": [{ "source": "/data", "destination": "/usr/share/nginx/html" }],
  "networks": ["bridge"],
  "cpuUsage": 2.5,
  "memoryUsage": 134217728
}`,
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/system-info/docker/images`,
      description: "List all Docker images with tags, sizes, and creation dates.",
      body: null,
      response: `{
  "data": [
    {
      "id": "sha256:abc123",
      "tags": ["nginx:latest"],
      "size": 142000000,
      "created": "2024-01-10T10:00:00.000Z"
    }
  ]
}`,
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/system-info/docker/volumes`,
      description: "List all Docker volumes with driver and mount information.",
      body: null,
      response: `{
  "data": [
    {
      "name": "app-data",
      "driver": "local",
      "mountpoint": "/var/lib/docker/volumes/app-data/_data",
      "createdAt": "2024-01-10T10:00:00.000Z"
    }
  ]
}`,
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/system-info/docker/networks`,
      description: "List all Docker networks with driver and subnet details.",
      body: null,
      response: `{
  "data": [
    {
      "id": "net_123",
      "name": "bridge",
      "driver": "bridge",
      "scope": "local",
      "subnet": "172.17.0.0/16",
      "gateway": "172.17.0.1"
    }
  ]
}`,
    },
  ];

  return (
    <Box>
      <PageBreadcrumb
        items={[
          {
            label: "System Info",
            href: `${basePath}/dev/system-info/system`,
          },
          { label: "API Docs" },
        ]}
      />
      <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
        System Info API Documentation
      </Typography>
      <ApiDocsViewer
        title="System Info & Docker API"
        subtitle="Access server system information and manage Docker resources"
        baseUrl={getBaseUrlWithoutApi()}
        apiKey={apiKey}
        orgId={orgId}
        endpoints={endpoints}
        tabLabels={[
          "System Info",
          "Docker Info",
          "Containers",
          "Container Detail",
          "Images",
          "Volumes",
          "Networks",
        ]}
      />
    </Box>
  );
};

export default SystemInfoApiDocs;
