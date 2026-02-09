import { Box, Typography } from "@mui/material";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import ApiDocsViewer from "../../components/common/ApiDocsViewer";
import { EndpointDefinition } from "../../components/common/ApiDocsViewer/types";
import { API_BASE } from "../../api/config";

const getBaseUrlWithoutApi = () => API_BASE.replace(/\/api$/, "");

const FeatureFlagApiDocs = () => {
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
      path: `/api/organizations/${orgId}/feature-flags`,
      description:
        "List all feature flags with pagination, search, status and tag filtering.",
      body: null,
      response: JSON.stringify(
        {
          data: [
            {
              id: "flag_123",
              key: "dark-mode",
              name: "Dark Mode",
              description: "Enable dark mode for users",
              status: "active",
              enabled: true,
              rolloutType: "boolean",
              rolloutPercentage: 0,
              targetUsers: [],
              targetingRules: [],
              tags: ["ui", "theme"],
              defaultValue: false,
              createdAt: "2024-01-15T10:00:00.000Z",
              updatedAt: "2024-01-15T10:00:00.000Z",
            },
          ],
          pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
        },
        null,
        2,
      ),
    },
    {
      method: "POST",
      path: `/api/organizations/${orgId}/feature-flags`,
      description:
        "Create a new feature flag. Supports boolean, percentage, and user-list rollout types.",
      body: JSON.stringify(
        {
          key: "dark-mode",
          name: "Dark Mode",
          description: "Enable dark mode for users",
          status: "active",
          enabled: true,
          rolloutType: "boolean",
          defaultValue: false,
          tags: ["ui", "theme"],
        },
        null,
        2,
      ),
      response: JSON.stringify(
        {
          id: "flag_123",
          key: "dark-mode",
          name: "Dark Mode",
          status: "active",
          enabled: true,
          rolloutType: "boolean",
          createdAt: "2024-01-15T10:00:00.000Z",
        },
        null,
        2,
      ),
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/feature-flags/{flagId}`,
      description: "Get a specific feature flag by ID with full details.",
      body: null,
      response: JSON.stringify(
        {
          id: "flag_123",
          key: "dark-mode",
          name: "Dark Mode",
          description: "Enable dark mode for users",
          status: "active",
          enabled: true,
          rolloutType: "percentage",
          rolloutPercentage: 50,
          targetUsers: ["user-1", "user-2"],
          targetingRules: [
            { attribute: "plan", operator: "equals", value: "premium" },
          ],
          tags: ["ui"],
          defaultValue: false,
        },
        null,
        2,
      ),
    },
    {
      method: "PUT",
      path: `/api/organizations/${orgId}/feature-flags/{flagId}`,
      description:
        "Update a feature flag. All fields can be modified including rollout configuration.",
      body: JSON.stringify(
        {
          name: "Dark Mode V2",
          rolloutType: "percentage",
          rolloutPercentage: 75,
          targetingRules: [
            { attribute: "country", operator: "in", value: "US,UK,CA" },
          ],
        },
        null,
        2,
      ),
      response: JSON.stringify(
        {
          id: "flag_123",
          key: "dark-mode",
          name: "Dark Mode V2",
          rolloutType: "percentage",
          rolloutPercentage: 75,
        },
        null,
        2,
      ),
    },
    {
      method: "PATCH",
      path: `/api/organizations/${orgId}/feature-flags/{flagId}/toggle`,
      description: "Toggle a feature flag's enabled state on or off.",
      body: null,
      response: JSON.stringify(
        {
          id: "flag_123",
          key: "dark-mode",
          enabled: false,
          updatedAt: "2024-01-15T12:00:00.000Z",
        },
        null,
        2,
      ),
    },
    {
      method: "POST",
      path: `/api/organizations/${orgId}/feature-flags/evaluate`,
      description:
        "Evaluate a feature flag for a specific user context. Returns whether the flag is enabled and the reason.",
      body: JSON.stringify(
        {
          key: "dark-mode",
          userId: "user-123",
          attributes: { plan: "premium", country: "US" },
        },
        null,
        2,
      ),
      response: JSON.stringify(
        {
          key: "dark-mode",
          enabled: true,
          reason: "Matched targeting rule",
          percentage: 75,
        },
        null,
        2,
      ),
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/feature-flags/stats`,
      description:
        "Get aggregate statistics for all feature flags in the organization.",
      body: null,
      response: JSON.stringify(
        {
          total: 15,
          active: 10,
          inactive: 3,
          archived: 2,
          enabled: 8,
          disabled: 7,
        },
        null,
        2,
      ),
    },
    {
      method: "DELETE",
      path: `/api/organizations/${orgId}/feature-flags/{flagId}`,
      description: "Permanently delete a feature flag.",
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
          {
            label: "Feature Flags",
            href: `${basePath}/service/feature-flags/list`,
          },
          { label: "API Docs" },
        ]}
      />
      <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
        Feature Flags API Documentation
      </Typography>
      <ApiDocsViewer
        title="Feature Flags API"
        subtitle="Manage feature rollouts with toggles, percentages, and targeting rules"
        baseUrl={getBaseUrlWithoutApi()}
        apiKey={apiKey}
        orgId={orgId}
        endpoints={endpoints}
        tabLabels={[
          "List Flags",
          "Create",
          "Get Flag",
          "Update",
          "Toggle",
          "Evaluate",
          "Stats",
          "Delete",
        ]}
      />
    </Box>
  );
};

export default FeatureFlagApiDocs;
