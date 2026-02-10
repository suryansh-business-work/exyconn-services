import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
} from "@mui/material";
import { Terminal } from "@mui/icons-material";
import { PageBreadcrumb } from "../../components/common";
import { systemInfoApi } from "../../api/systemInfoApi";
import { SystemInfoResponse } from "../../types/systemInfo";
import OSInfoSection from "./OSInfoSection";
import NetworkSection from "./NetworkSection";

const SystemInfoPage = () => {
  const [data, setData] = useState<SystemInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const info = await systemInfoApi.getSystemInfo();
        setData(info);
      } catch {
        setError("Failed to fetch system information");
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/dashboard" },
          { label: "Dev Tools" },
          { label: "System Info" },
        ]}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Terminal sx={{ fontSize: 32, color: "primary.main" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            System Information
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Server runtime, OS details, hardware, and network information
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : data ? (
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
          >
            <Tab label="System & Hardware" />
            <Tab label="Network" />
          </Tabs>
          <Box sx={{ p: 2 }}>
            {tab === 0 && <OSInfoSection data={data} />}
            {tab === 1 && <NetworkSection data={data.network} />}
          </Box>
        </Paper>
      ) : null}
    </Box>
  );
};

export default SystemInfoPage;
