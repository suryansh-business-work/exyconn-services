import { Box, Typography, Chip } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { DockerInfoResponse } from "../../../types/systemInfo";

interface DockerOverviewProps {
  data: DockerInfoResponse;
}

const DockerOverview = ({ data }: DockerOverviewProps) => {
  if (!data.installed) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="error" variant="h6">
          Docker is not installed
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Install Docker to see container and image information here.
        </Typography>
      </Box>
    );
  }

  if (data.error) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="warning.main" variant="h6">
          Docker Warning
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {data.error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Chip label="Docker Installed" color="success" size="small" />
        {data.version && (
          <Chip label={data.version} variant="outlined" size="small" />
        )}
      </Box>

      {data.info && (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Docker Daemon
              </Typography>
              {[
                {
                  label: "Server Version",
                  value: data.info.serverVersion,
                },
                {
                  label: "Storage Driver",
                  value: data.info.storageDriver,
                },
                { label: "OS", value: data.info.operatingSystem },
                { label: "OS Type", value: data.info.osType },
                {
                  label: "Architecture",
                  value: data.info.architecture,
                },
                { label: "CPUs", value: data.info.cpus },
                {
                  label: "Total Memory",
                  value: data.info.totalMemory,
                },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box
              sx={{
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Container Stats
              </Typography>
              {[
                {
                  label: "Total Containers",
                  value: data.info.containers,
                },
                {
                  label: "Running",
                  value: data.info.containersRunning,
                  color: "success" as const,
                },
                {
                  label: "Paused",
                  value: data.info.containersPaused,
                  color: "warning" as const,
                },
                {
                  label: "Stopped",
                  value: data.info.containersStopped,
                  color: "error" as const,
                },
                { label: "Images", value: data.info.images },
              ].map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 0.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {item.label}
                  </Typography>
                  {"color" in item ? (
                    <Chip
                      label={item.value}
                      size="small"
                      color={item.color}
                      sx={{ fontSize: 11, height: 20 }}
                    />
                  ) : (
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.value}
                    </Typography>
                  )}
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DockerOverview;
