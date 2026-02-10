import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Tab, Tabs, CircularProgress, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { translationProjectApi } from "../../api/translationsThemeApi";
import { TranslationProject } from "../../types/translationsTheme";
import LocaleManager from "./LocaleManager/LocaleManager";
import TranslationSpreadsheet from "./TranslationSpreadsheet/TranslationSpreadsheet";

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { selectedOrg, selectedApiKey } = useOrg();
  const [project, setProject] = useState<TranslationProject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState(0);
  const [localeVersion, setLocaleVersion] = useState(0);

  const basePath = selectedApiKey
    ? `/organization/${selectedOrg?.id}/apikey/${selectedApiKey.apiKey}`
    : `/organization/${selectedOrg?.id}`;

  const fetchProject = useCallback(async () => {
    if (!selectedOrg || !projectId) return;
    setLoading(true);
    try {
      const res = await translationProjectApi.list(selectedOrg.id, 1, 100);
      const found = res.data.find((p) => p._id === projectId);
      setProject(found || null);
    } catch {
      setError("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  const handleLocalesChange = () => {
    setLocaleVersion((v) => v + 1);
  };

  const breadcrumbs = [
    { label: "Home", href: "/dashboard" },
    { label: selectedOrg?.orgName || "Organization", href: basePath },
    {
      label: "Translation Projects",
      href: `${basePath}/service/translations/projects`,
    },
    { label: project?.name || "Project" },
  ];

  if (loading && !project) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <PageBreadcrumb items={breadcrumbs} />
      <Typography variant="h5" sx={{ mb: 0.5 }}>
        {project?.name || "Project"}
      </Typography>
      {project?.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {project.description}
        </Typography>
      )}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label="Locales" />
          <Tab label="Translation Text" />
        </Tabs>
      </Box>
      {projectId && tab === 0 && (
        <LocaleManager
          projectId={projectId}
          onLocalesChange={handleLocalesChange}
        />
      )}
      {projectId && tab === 1 && (
        <TranslationSpreadsheet
          projectId={projectId}
          key={localeVersion}
        />
      )}
    </Box>
  );
};

export default ProjectDetailPage;
