import { Box, Typography } from "@mui/material";
import { PageBreadcrumb, ApiDocsViewer } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { API_BASE } from "../../api/config";
import { getTranslationsEndpoints } from "./translationsEndpoints";

const getBaseUrlWithoutApi = () => API_BASE.replace(/\/api$/, "");

const TranslationsApiDocs = () => {
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

  const endpoints = getTranslationsEndpoints(orgId);

  return (
    <Box>
      <PageBreadcrumb
        items={[
          {
            label: "Translations",
            href: `${basePath}/service/translations/projects`,
          },
          { label: "API Docs" },
        ]}
      />
      <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
        Translations API Documentation
      </Typography>
      <ApiDocsViewer
        title="Translations API"
        subtitle="Manage translation projects, locales, sections, and translation key-value pairs. Access pattern: locale.<code>.<section>.<key>"
        baseUrl={getBaseUrlWithoutApi()}
        apiKey={apiKey}
        orgId={orgId}
        endpoints={endpoints}
        tabLabels={[
          "List Projects",
          "Create Project",
          "Update Project",
          "Delete Project",
          "Locale Counts",
          "Add Section",
          "Remove Section",
          "List Locales",
          "Create Locale",
          "Bulk Locales",
          "List Translations",
          "Upsert",
          "Bulk Upsert",
        ]}
      />
    </Box>
  );
};

export default TranslationsApiDocs;
