import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { DirectionsBoat } from "@mui/icons-material";
import { PageBreadcrumb } from "../../components/common";
import { systemInfoApi } from "../../api/systemInfoApi";
import {
  DockerInfoResponse,
  DockerContainer,
  DockerContainerDetail,
  DockerImage,
  DockerVolume,
  DockerNetwork,
} from "../../types/systemInfo";
import DockerOverview from "./Docker/DockerOverview";
import ContainerList from "./Docker/ContainerList";
import ContainerDetailDialog from "./Docker/ContainerDetailDialog";
import DockerResourcesTab from "./Docker/DockerResourcesTab";

const DockerPage = () => {
  const [dockerInfo, setDockerInfo] = useState<DockerInfoResponse | null>(null);
  const [containers, setContainers] = useState<DockerContainer[]>([]);
  const [images, setImages] = useState<DockerImage[]>([]);
  const [volumes, setVolumes] = useState<DockerVolume[]>([]);
  const [networks, setNetworks] = useState<DockerNetwork[]>([]);
  const [selectedDetail, setSelectedDetail] =
    useState<DockerContainerDetail | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [info, containerData, imageData, volumeData, networkData] =
        await Promise.all([
          systemInfoApi.getDockerInfo(),
          systemInfoApi.getDockerContainers(true),
          systemInfoApi.getDockerImages(),
          systemInfoApi.getDockerVolumes(),
          systemInfoApi.getDockerNetworks(),
        ]);
      setDockerInfo(info);
      setContainers(containerData.containers);
      setImages(imageData.images);
      setVolumes(volumeData.volumes);
      setNetworks(networkData.networks);
    } catch {
      setError("Failed to fetch Docker information");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewDetail = async (containerId: string) => {
    try {
      const detail = await systemInfoApi.getDockerContainerDetail(containerId);
      setSelectedDetail(detail);
      setDialogOpen(true);
    } catch {
      setError("Failed to fetch container details");
    }
  };

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/dashboard" },
          { label: "Dev Tools" },
          { label: "Docker" },
        ]}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <DirectionsBoat sx={{ fontSize: 32, color: "primary.main" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Docker Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Container management, images, volumes, and network details
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
          >
            <Tab label="Overview" />
            <Tab label={`Containers (${containers.length})`} />
            <Tab label="Resources" />
          </Tabs>
          <Box sx={{ p: 2 }}>
            {tab === 0 && dockerInfo && (
              <DockerOverview data={dockerInfo} />
            )}
            {tab === 1 && (
              <ContainerList
                containers={containers}
                onViewDetail={handleViewDetail}
              />
            )}
            {tab === 2 && (
              <DockerResourcesTab
                images={images}
                volumes={volumes}
                networks={networks}
              />
            )}
          </Box>
        </Paper>
      )}

      <ContainerDetailDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        detail={selectedDetail}
      />
    </Box>
  );
};

export default DockerPage;
