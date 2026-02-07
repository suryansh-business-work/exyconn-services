import { useState, useEffect } from "react";
import { Box, Typography, Paper, Skeleton } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { SmartToy, Business, Chat, Token } from "@mui/icons-material";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { aiCompanyApi, aiChatApi } from "../../api/aiApi";
import { AICompanyStats, AIChatStats } from "../../types/ai";

const AIDashboard = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const [companyStats, setCompanyStats] = useState<AICompanyStats | null>(null);
  const [chatStats, setChatStats] = useState<AIChatStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedOrg) return;
      setLoading(true);
      try {
        const [companies, chats] = await Promise.all([
          aiCompanyApi.getStats(selectedOrg.id, selectedApiKey?.apiKey),
          aiChatApi.getStats(selectedOrg.id, selectedApiKey?.apiKey),
        ]);
        setCompanyStats(companies);
        setChatStats(chats);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedOrg, selectedApiKey]);

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  const statCards = [
    {
      label: "Total Companies",
      value: companyStats?.totalCompanies ?? 0,
      icon: <Business />,
      color: "#1976d2",
    },
    {
      label: "Active Companies",
      value: companyStats?.activeCompanies ?? 0,
      icon: <SmartToy />,
      color: "#2e7d32",
    },
    {
      label: "Total Chats",
      value: chatStats?.totalChats ?? 0,
      icon: <Chat />,
      color: "#ed6c02",
    },
    {
      label: "Total Messages",
      value: chatStats?.totalMessages ?? 0,
      icon: <Chat />,
      color: "#9c27b0",
    },
    {
      label: "Total Tokens",
      value: chatStats?.totalTokens ?? 0,
      icon: <Token />,
      color: "#d32f2f",
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
          { label: "AI" },
          { label: "Dashboard" },
        ]}
      />
      <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
        AI Services Overview
      </Typography>

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Grid key={i} size={{ xs: 6, sm: 4, md: 2.4 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Skeleton variant="text" width={80} />
                <Skeleton variant="text" width={60} height={32} />
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={2}>
          {statCards.map((stat, index) => (
            <Grid key={index} size={{ xs: 6, sm: 4, md: 2.4 }}>
              <Paper variant="outlined" sx={{ p: 2, textAlign: "center" }}>
                <Box sx={{ color: stat.color, mb: 1 }}>{stat.icon}</Box>
                <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 20 }}>
                  {stat.value}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: 11 }}
                >
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {companyStats?.byProvider &&
        Object.keys(companyStats.byProvider).length > 0 && (
          <Paper variant="outlined" sx={{ p: 2, mt: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Companies by Provider
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              {Object.entries(companyStats.byProvider).map(
                ([provider, count]) => (
                  <Box key={provider} sx={{ textAlign: "center", p: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {count}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ textTransform: "capitalize" }}
                    >
                      {provider}
                    </Typography>
                  </Box>
                ),
              )}
            </Box>
          </Paper>
        )}

      <Paper variant="outlined" sx={{ p: 3, mt: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          About AI Services
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Integrate multiple AI providers (OpenAI, Gemini, Anthropic) and manage
          chat conversations with history tracking. Set token limits and history
          size in chat settings.
        </Typography>
      </Paper>
    </Box>
  );
};

export default AIDashboard;
