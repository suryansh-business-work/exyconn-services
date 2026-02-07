import { Box, Typography, Paper, Chip } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Business, Key, CalendarToday, Category } from "@mui/icons-material";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";

const OrgDashboard = () => {
  const { selectedOrg } = useOrg();

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  const stats = [
    {
      label: "Organization Type",
      value: selectedOrg.orgType,
      icon: <Category sx={{ fontSize: 24 }} />,
      color: "primary.main",
    },
    {
      label: "API Keys",
      value: selectedOrg.orgApiKeys?.length || 0,
      icon: <Key sx={{ fontSize: 24 }} />,
      color: "success.main",
    },
    {
      label: "Created",
      value: new Date(selectedOrg.createdAt).toLocaleDateString(),
      icon: <CalendarToday sx={{ fontSize: 24 }} />,
      color: "info.main",
    },
    {
      label: "Last Updated",
      value: new Date(selectedOrg.updatedAt).toLocaleDateString(),
      icon: <CalendarToday sx={{ fontSize: 24 }} />,
      color: "warning.main",
    },
  ];

  return (
    <Box>
      <PageBreadcrumb
        items={[{ label: "Home", href: "/" }, { label: selectedOrg.orgName }]}
      />

      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Business sx={{ fontSize: 32, color: "primary.main" }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 20 }}>
            {selectedOrg.orgName}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              {selectedOrg.orgSlug}
            </Typography>
            <Chip
              label={selectedOrg.orgType}
              size="small"
              color={
                selectedOrg.orgType === "Service" ? "primary" : "secondary"
              }
              sx={{ height: 20, fontSize: 10 }}
            />
          </Box>
        </Box>
      </Box>

      {selectedOrg.orgDescription && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            {selectedOrg.orgDescription}
          </Typography>
        </Paper>
      )}

      <Grid container spacing={2}>
        {stats.map((stat, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: `${stat.color}15`,
                    color: stat.color,
                  }}
                >
                  {stat.icon}
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontSize: 11 }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, fontSize: 16 }}
                  >
                    {stat.value}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {selectedOrg.orgApiKeys && selectedOrg.orgApiKeys.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, fontSize: 14, mb: 2 }}
          >
            API Keys
          </Typography>
          <Grid container spacing={2}>
            {selectedOrg.orgApiKeys.map((key, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Key sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {key.keyName}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1, fontFamily: "monospace" }}
                  >
                    {key.apiKey.slice(0, 20)}...
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default OrgDashboard;
