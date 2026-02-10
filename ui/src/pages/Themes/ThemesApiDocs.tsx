import { Box, Typography } from "@mui/material";
import { PageBreadcrumb, ApiDocsViewer } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { EndpointDefinition } from "../../components/common/ApiDocsViewer/types";
import { API_BASE } from "../../api/config";

const getBaseUrlWithoutApi = () => API_BASE.replace(/\/api$/, "");

const ThemesApiDocs = () => {
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
      path: `/api/organizations/${orgId}/translations-theme/theme-projects`,
      description: "List all theme projects for the organization.",
      body: null,
      response: `{
  "data": [
    { "id": "proj_1", "name": "Brand Themes", "createdAt": "2024-01-15T10:00:00.000Z" }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}`,
    },
    {
      method: "POST",
      path: `/api/organizations/${orgId}/translations-theme/theme-projects`,
      description: "Create a new theme project.",
      body: `{
  "name": "New Theme Project",
  "description": "Project description"
}`,
      response: `{
  "id": "proj_2",
  "name": "New Theme Project",
  "description": "Project description",
  "createdAt": "2024-01-15T10:00:00.000Z"
}`,
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/translations-theme/theme-projects/{projectId}/themes`,
      description: "List all themes within a theme project.",
      body: null,
      response: `{
  "data": [
    { "id": "theme_1", "name": "Light Mode", "isDefault": true, "createdAt": "2024-01-15T10:00:00.000Z" }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}`,
    },
    {
      method: "POST",
      path: `/api/organizations/${orgId}/translations-theme/theme-projects/{projectId}/themes`,
      description: "Create a new theme with design tokens.",
      body: `{
  "name": "Dark Mode",
  "tokens": {
    "colors": { "primary": "#1976d2", "background": "#121212" },
    "typography": { "fontFamily": "Roboto" }
  }
}`,
      response: `{
  "id": "theme_2",
  "name": "Dark Mode",
  "tokens": { "colors": { "primary": "#1976d2", "background": "#121212" }, "typography": { "fontFamily": "Roboto" } },
  "createdAt": "2024-01-15T10:00:00.000Z"
}`,
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/translations-theme/theme-projects/{projectId}/themes/{themeId}`,
      description: "Get a single theme by ID with all its design tokens.",
      body: null,
      response: `{
  "id": "theme_1",
  "name": "Light Mode",
  "isDefault": true,
  "tokens": {
    "colors": { "primary": "#1976d2", "secondary": "#9c27b0", "background": "#ffffff" },
    "typography": { "fontFamily": "Roboto", "fontSize": 14 },
    "spacing": { "unit": 8 }
  },
  "createdAt": "2024-01-15T10:00:00.000Z"
}`,
    },
    {
      method: "PUT",
      path: `/api/organizations/${orgId}/translations-theme/theme-projects/{projectId}/themes/{themeId}`,
      description: "Update an existing theme and its design tokens.",
      body: `{
  "name": "Light Mode (Updated)",
  "tokens": {
    "colors": { "primary": "#2196f3", "background": "#fafafa" }
  }
}`,
      response: `{
  "id": "theme_1",
  "name": "Light Mode (Updated)",
  "tokens": { "colors": { "primary": "#2196f3", "background": "#fafafa" } },
  "updatedAt": "2024-01-16T10:00:00.000Z"
}`,
    },
    {
      method: "POST",
      path: `/api/organizations/${orgId}/translations-theme/theme-projects/{projectId}/themes/{themeId}/duplicate`,
      description: "Duplicate an existing theme with a new name.",
      body: `{
  "name": "Light Mode Copy"
}`,
      response: `{
  "id": "theme_3",
  "name": "Light Mode Copy",
  "tokens": { "colors": { "primary": "#1976d2", "background": "#ffffff" } },
  "createdAt": "2024-01-16T10:00:00.000Z"
}`,
    },
  ];

  return (
    <Box>
      <PageBreadcrumb
        items={[
          {
            label: "Themes",
            href: `${basePath}/service/themes/projects`,
          },
          { label: "API Docs" },
        ]}
      />
      <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
        Themes API Documentation
      </Typography>
      <ApiDocsViewer
        title="Themes API"
        subtitle="Manage theme projects and design tokens for your applications"
        baseUrl={getBaseUrlWithoutApi()}
        apiKey={apiKey}
        orgId={orgId}
        endpoints={endpoints}
        tabLabels={[
          "List Projects",
          "Create Project",
          "List Themes",
          "Create Theme",
          "Get Theme",
          "Update Theme",
          "Duplicate",
        ]}
      />
    </Box>
  );
};

export default ThemesApiDocs;
