import { useState, useEffect, useCallback } from "react";
import { Box, Typography, Alert } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Dashboard, Refresh } from "@mui/icons-material";
import { PageBreadcrumb, Spinner, ActionButton } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { emailLogApi, EmailAnalytics } from "../../api/emailApi";
import { EmailStats } from "../../types/email";
import EmailDashboardStats from "./components/EmailDashboardStats";
import EmailDashboardCharts from "./components/EmailDashboardCharts";

const EmailDashboard = () => {
  const { selectedOrg } = useOrg();
  const [stats, setStats] = useState<EmailStats | null>(null);
  const [analytics, setAnalytics] = useState<EmailAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        emailLogApi.getStats(selectedOrg.id),
        emailLogApi.getAnalytics(selectedOrg.id),
      ]);
      setStats(statsRes);
      setAnalytics(analyticsRes);
    } catch {
      setError("Failed to load email dashboard data");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: selectedOrg.orgName, href: `/organization/${selectedOrg.id}` },
          { label: "Communications" },
          { label: "Email" },
          { label: "Dashboard" },
        ]}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Dashboard sx={{ fontSize: 32, color: "primary.main" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Email Dashboard</Typography>
          <Typography variant="body2" color="text.secondary">Email analytics, delivery stats, and performance overview</Typography>
        </Box>
        <ActionButton variant="outlined" startIcon={<Refresh />} onClick={fetchData} disabled={loading}>Refresh</ActionButton>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {loading ? <Spinner /> : (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            {stats && <EmailDashboardStats stats={stats} />}
          </Grid>
          <Grid size={{ xs: 12 }}>
            {analytics && <EmailDashboardCharts analytics={analytics} />}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default EmailDashboard;
