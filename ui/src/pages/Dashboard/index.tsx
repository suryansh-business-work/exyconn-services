import { useState, useEffect } from "react";
import { Box, Typography, Paper, CircularProgress, Chip } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useNavigate, useParams } from "react-router-dom";
import PageBreadcrumb from "../../components/common/PageBreadcrumb";
import ServiceSelector, { getLiveServices } from "./ServiceSelector";
import ServiceStats from "./ServiceStats";
import ServiceCharts from "./ServiceCharts";
import { useOrg } from "../../context/OrgContext";
import { getIcon } from "../../utils/iconMap";

const DashboardPage = () => {
  const { selectedOrg, selectedApiKey, isLoading } = useOrg();
  const navigate = useNavigate();
  const { serviceSlug } = useParams<{ serviceSlug?: string }>();

  // Determine selected service from URL or default to first live service
  const liveServices = getLiveServices();
  const [selectedService, setSelectedService] = useState(() => {
    if (serviceSlug) {
      const service = liveServices.find(
        (s) => s.id === serviceSlug || s.basePath.includes(serviceSlug),
      );
      return service?.id || liveServices[0]?.id || "";
    }
    return liveServices[0]?.id || "";
  });

  // Sync service with URL parameter
  useEffect(() => {
    if (serviceSlug) {
      const service = liveServices.find(
        (s) => s.id === serviceSlug || s.basePath.includes(serviceSlug),
      );
      if (service && service.id !== selectedService) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedService(service.id);
      }
    }
  }, [serviceSlug, liveServices, selectedService]);

  const basePath =
    selectedOrg && selectedApiKey
      ? `/organization/${selectedOrg.id}/apikey/${selectedApiKey.apiKey}`
      : selectedOrg
        ? `/organization/${selectedOrg.id}`
        : "";

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
        }}
      >
        <CircularProgress size={32} />
      </Box>
    );
  }

  // Global dashboard - show all services overview
  const isGlobalDashboard = !serviceSlug;

  const handleServiceClick = (service: (typeof liveServices)[0]) => {
    if (!selectedOrg) return;
    const firstSubItem = service.subItems[0];
    if (firstSubItem) {
      navigate(`${basePath}/${service.basePath}${firstSubItem.pathSuffix}`);
    }
  };

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/dashboard" },
          ...(selectedOrg
            ? [{ label: selectedOrg.orgName, href: basePath }]
            : []),
          { label: "Dashboard" },
        ]}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18 }}>
          {isGlobalDashboard ? "Services Overview" : "Dashboard"}
          {selectedOrg && (
            <Typography
              component="span"
              sx={{ fontSize: 14, ml: 1, color: "text.secondary" }}
            >
              - {selectedOrg.orgName}
            </Typography>
          )}
          {selectedApiKey && (
            <Typography
              component="span"
              sx={{ fontSize: 12, ml: 1, color: "text.secondary" }}
            >
              ({selectedApiKey.keyName})
            </Typography>
          )}
        </Typography>
        {selectedOrg && !isGlobalDashboard && (
          <ServiceSelector
            value={selectedService}
            onChange={setSelectedService}
          />
        )}
      </Box>

      {!selectedOrg ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            No organization selected. Please select an organization from the
            header to view API usage data.
          </Typography>
        </Paper>
      ) : isGlobalDashboard ? (
        // Global Dashboard - Show all live services as cards
        <Grid container spacing={2}>
          {liveServices.map((service) => {
            const IconComponent = getIcon(service.iconName);
            return (
              <Grid key={service.id} size={{ xs: 12, sm: 6, md: 4 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}
                  onClick={() => handleServiceClick(service)}
                >
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 1.5,
                        bgcolor: "primary.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {IconComponent && <IconComponent />}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 0.5,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 600, fontSize: 15 }}
                        >
                          {service.name}
                        </Typography>
                        <Chip
                          label="Live"
                          size="small"
                          color="success"
                          sx={{ fontSize: 10, height: 18 }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: 12, lineHeight: 1.4 }}
                      >
                        {service.description}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 0.5,
                          mt: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        {service.subItems.slice(0, 3).map((item) => (
                          <Chip
                            key={item.pathSuffix}
                            label={item.label}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: 10, height: 20 }}
                          />
                        ))}
                        {service.subItems.length > 3 && (
                          <Chip
                            label={`+${service.subItems.length - 3}`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: 10, height: 20 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        // Service-specific Dashboard
        <Grid container spacing={2}>
          <Grid size={12}>
            <ServiceStats
              serviceId={selectedService}
              orgId={selectedOrg.id}
              apiKey={selectedApiKey?.apiKey}
            />
          </Grid>
          <Grid size={12}>
            <ServiceCharts
              serviceId={selectedService}
              orgId={selectedOrg.id}
              apiKey={selectedApiKey?.apiKey}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DashboardPage;
