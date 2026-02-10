import { Box, Typography, Chip } from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Computer,
  Memory,
  Storage,
  Speed,
} from "@mui/icons-material";
import { SystemInfoResponse } from "../../types/systemInfo";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  items: Array<{ label: string; value: string | number }>;
}

const InfoCard = ({ icon, title, items }: InfoCardProps) => (
  <Box
    sx={{
      p: 2,
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 1,
      height: "100%",
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      {icon}
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
    </Box>
    {items.map((item) => (
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
);

interface OSInfoSectionProps {
  data: SystemInfoResponse;
}

const OSInfoSection = ({ data }: OSInfoSectionProps) => {
  const getPlatformColor = (
    platform: string,
  ): "primary" | "secondary" | "success" => {
    switch (platform) {
      case "win32":
        return "primary";
      case "darwin":
        return "secondary";
      case "linux":
        return "success";
      default:
        return "primary";
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <Chip
          label={data.os.platformName}
          color={getPlatformColor(data.os.platform)}
          size="small"
        />
        <Chip label={data.os.arch} variant="outlined" size="small" />
        <Chip
          label={`Uptime: ${data.uptime.systemUptimeFormatted}`}
          variant="outlined"
          size="small"
        />
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoCard
            icon={<Computer color="primary" />}
            title="Operating System"
            items={[
              { label: "Platform", value: data.os.platformName },
              { label: "Type", value: data.os.type },
              { label: "Release", value: data.os.release },
              { label: "Version", value: data.os.version },
              { label: "Architecture", value: data.os.arch },
              { label: "Hostname", value: data.os.hostname },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoCard
            icon={<Memory color="secondary" />}
            title="Hardware"
            items={[
              { label: "CPU Model", value: data.hardware.cpuModel },
              { label: "CPU Cores", value: data.hardware.cpuCores },
              { label: "CPU Speed", value: `${data.hardware.cpuSpeed} MHz` },
              {
                label: "Total Memory",
                value: formatBytes(data.hardware.totalMemory),
              },
              {
                label: "Free Memory",
                value: formatBytes(data.hardware.freeMemory),
              },
              {
                label: "Memory Usage",
                value: `${data.hardware.memoryUsagePercent}%`,
              },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoCard
            icon={<Speed color="info" />}
            title="Runtime"
            items={[
              { label: "Node.js", value: data.runtime.nodeVersion },
              { label: "NPM", value: data.runtime.npmVersion },
              { label: "V8 Engine", value: data.runtime.v8Version },
              { label: "PID", value: data.runtime.pid },
              { label: "Environment", value: data.runtime.env },
              {
                label: "Heap Used",
                value: formatBytes(data.runtime.memoryUsage.heapUsed),
              },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <InfoCard
            icon={<Storage color="warning" />}
            title="Process Memory"
            items={[
              {
                label: "RSS",
                value: formatBytes(data.runtime.memoryUsage.rss),
              },
              {
                label: "Heap Total",
                value: formatBytes(data.runtime.memoryUsage.heapTotal),
              },
              {
                label: "Heap Used",
                value: formatBytes(data.runtime.memoryUsage.heapUsed),
              },
              {
                label: "External",
                value: formatBytes(data.runtime.memoryUsage.external),
              },
              {
                label: "Array Buffers",
                value: formatBytes(data.runtime.memoryUsage.arrayBuffers),
              },
              {
                label: "Process Uptime",
                value: data.uptime.processUptimeFormatted,
              },
            ]}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default OSInfoSection;
