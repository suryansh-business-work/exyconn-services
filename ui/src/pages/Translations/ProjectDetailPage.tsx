import { useState, useEffect, useCallback } from "react";
import { Box, Typography, CircularProgress, Alert } from "@mui/material";
import { useParams } from "react-router-dom";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { translationProjectApi } from "../../api/translationsApi";
import { TranslationProject } from "../../types/translationsTheme";
import ProjectStepper from "./ProjectStepper";

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { selectedOrg, selectedApiKey } = useOrg();
  const [project, setProject] = useState<TranslationProject | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {project.description}
        </Typography>
      )}
      {projectId && <ProjectStepper projectId={projectId} />}
    </Box>
  );
};

export default ProjectDetailPage;
