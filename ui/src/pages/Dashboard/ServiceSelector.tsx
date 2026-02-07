import {
  MenuItem,
  FormControl,
  Select,
  Typography,
  Box,
  SelectChangeEvent,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { APP_DATA, AppDefinition } from "../../data/app-data";
import { useOrg } from "../../context/OrgContext";

interface ServiceSelectorProps {
  value: string;
  onChange: (serviceId: string) => void;
}

// Get all live services (flat list)
const getLiveServices = (): AppDefinition[] => {
  const services: AppDefinition[] = [];

  APP_DATA.forEach((app) => {
    if (app.isGroup && app.children) {
      app.children.forEach((child) => {
        if (child.status === "live") {
          services.push(child);
        }
      });
    } else if (app.status === "live") {
      services.push(app);
    }
  });

  return services;
};

const ServiceSelector = ({ value, onChange }: ServiceSelectorProps) => {
  const services = getLiveServices();
  const navigate = useNavigate();
  const { selectedOrg, selectedApiKey } = useOrg();

  const handleChange = (event: SelectChangeEvent<string>) => {
    const serviceId = event.target.value;
    onChange(serviceId);

    // Navigate to service-specific dashboard URL
    if (selectedOrg && serviceId) {
      const basePath = selectedApiKey
        ? `/organization/${selectedOrg.id}/apikey/${selectedApiKey.apiKey}`
        : `/organization/${selectedOrg.id}`;

      // Find the service and navigate to its path
      const service = services.find((s) => s.id === serviceId);
      if (service) {
        navigate(`${basePath}/${service.basePath}/dashboard`);
      }
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontWeight: 500 }}
      >
        Service:
      </Typography>
      <FormControl size="small" sx={{ minWidth: 180 }}>
        <Select
          value={value}
          onChange={handleChange}
          displayEmpty
          sx={{
            "& .MuiSelect-select": { py: 0.75, fontSize: 13 },
          }}
        >
          {services.map((service) => (
            <MenuItem key={service.id} value={service.id}>
              <Typography sx={{ fontSize: 13 }}>{service.name}</Typography>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default ServiceSelector;
export { getLiveServices };
