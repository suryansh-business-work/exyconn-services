import { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Divider,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  KeyboardArrowDown,
  Search,
  Settings,
  Business,
  Home,
  Key,
} from "@mui/icons-material";
import { useOrg } from "../../context/OrgContext";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  drawerMode: "expanded" | "collapsed" | "icon-only";
  onToggleDrawer: () => void;
  onManageOrganizations: () => void;
  onNavigate?: (path: string) => void;
}

const Header = ({
  drawerMode,
  onToggleDrawer,
  onManageOrganizations,
}: HeaderProps) => {
  const {
    organizations,
    selectedOrg,
    selectedApiKey,
    selectOrganization,
    selectApiKey,
    isLoading,
  } = useOrg();
  const navigate = useNavigate();
  const [orgAnchorEl, setOrgAnchorEl] = useState<HTMLElement | null>(null);
  const [apiKeyAnchorEl, setApiKeyAnchorEl] = useState<HTMLElement | null>(
    null,
  );
  const [orgSearch, setOrgSearch] = useState("");

  const filteredOrgs = organizations.filter(
    (org) =>
      org.orgName.toLowerCase().includes(orgSearch.toLowerCase()) ||
      org.orgSlug.toLowerCase().includes(orgSearch.toLowerCase()),
  );

  const handleOrgSelect = (org: typeof selectedOrg) => {
    if (org) {
      selectOrganization(org);
      // Navigate to organization page with first API key if available
      const firstApiKey = org.orgApiKeys?.[0];
      if (firstApiKey) {
        navigate(`/organization/${org.id}/apikey/${firstApiKey.apiKey}`);
      } else {
        navigate(`/organization/${org.id}`);
      }
    }
    setOrgAnchorEl(null);
    setOrgSearch("");
  };

  const handleApiKeySelect = (apiKey: typeof selectedApiKey) => {
    if (apiKey && selectedOrg) {
      selectApiKey(apiKey);
      // Navigate to update URL with new API key
      navigate(`/organization/${selectedOrg.id}/apikey/${apiKey.apiKey}`);
    }
    setApiKeyAnchorEl(null);
  };

  const handleHomeClick = () => {
    navigate("/welcome");
  };

  const getOrgDisplayText = () => {
    if (organizations.length === 0) {
      return "No Organization - Please create and select";
    }
    return selectedOrg?.orgName || "Select Organization";
  };

  const getApiKeyDisplayText = () => {
    if (!selectedOrg?.orgApiKeys?.length) {
      return "No API Key";
    }
    return selectedApiKey?.keyName || "Select API Key";
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: "44px !important", height: 44, px: 1.5 }}>
        <IconButton
          edge="start"
          color="default"
          onClick={onToggleDrawer}
          size="small"
        >
          {drawerMode === "icon-only" ? (
            <ChevronRight fontSize="small" />
          ) : (
            <ChevronLeft fontSize="small" />
          )}
        </IconButton>
        <Typography
          variant="h6"
          color="text.primary"
          sx={{ fontWeight: 600, fontSize: 14, ml: 1 }}
        >
          Services
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Home">
          <IconButton size="small" onClick={handleHomeClick} sx={{ mr: 1 }}>
            <Home fontSize="small" />
          </IconButton>
        </Tooltip>

        {/* Organization Dropdown */}
        <Box
          onClick={(e) => setOrgAnchorEl(e.currentTarget)}
          sx={{
            display: "flex",
            alignItems: "center",
            cursor: "pointer",
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            mr: 1,
            bgcolor: "action.hover",
            "&:hover": { bgcolor: "action.selected" },
          }}
        >
          <Business sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
          <Typography
            variant="body2"
            sx={{ fontSize: 13, fontWeight: 500, color: "black" }}
          >
            {getOrgDisplayText()}
          </Typography>
          <KeyboardArrowDown
            sx={{ fontSize: 18, ml: 0.5, color: "text.secondary" }}
          />
        </Box>
        <Menu
          anchorEl={orgAnchorEl}
          open={Boolean(orgAnchorEl)}
          onClose={() => {
            setOrgAnchorEl(null);
            setOrgSearch("");
          }}
          PaperProps={{ sx: { width: 280, maxHeight: 400 } }}
        >
          <Box sx={{ px: 1.5, py: 1 }}>
            <TextField
              size="small"
              placeholder="Search organizations..."
              value={orgSearch}
              onChange={(e) => setOrgSearch(e.target.value)}
              fullWidth
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 16 }} />
                  </InputAdornment>
                ),
                sx: { fontSize: 12, height: 32 },
              }}
            />
          </Box>
          <Divider />
          <Box sx={{ maxHeight: 250, overflow: "auto" }}>
            {isLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                <CircularProgress size={20} />
              </Box>
            ) : filteredOrgs.length === 0 ? (
              <MenuItem disabled sx={{ fontSize: 12 }}>
                No organizations found
              </MenuItem>
            ) : (
              filteredOrgs.map((org) => (
                <MenuItem
                  key={org.id}
                  onClick={() => handleOrgSelect(org)}
                  selected={selectedOrg?.id === org.id}
                  sx={{
                    fontSize: 12,
                    py: 1,
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Business sx={{ fontSize: 18 }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={org.orgName}
                    secondary={org.orgSlug}
                    primaryTypographyProps={{ fontSize: 12 }}
                    secondaryTypographyProps={{ fontSize: 10 }}
                  />
                </MenuItem>
              ))
            )}
          </Box>
          <Divider />
          <MenuItem
            onClick={() => {
              onManageOrganizations();
              setOrgAnchorEl(null);
            }}
            sx={{ fontSize: 12, py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 32 }}>
              <Settings sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary="Manage Organizations"
              primaryTypographyProps={{ fontSize: 12 }}
            />
          </MenuItem>
        </Menu>

        {/* API Key Dropdown */}
        {selectedOrg &&
          selectedOrg.orgApiKeys &&
          selectedOrg.orgApiKeys.length > 0 && (
            <>
              <Box
                onClick={(e) => setApiKeyAnchorEl(e.currentTarget)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  cursor: "pointer",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: "action.hover",
                  "&:hover": { bgcolor: "action.selected" },
                }}
              >
                <Key sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }} />
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: 12,
                    fontWeight: 500,
                    maxWidth: 120,
                    color: "black",
                  }}
                  noWrap
                >
                  {getApiKeyDisplayText()}
                </Typography>
                <KeyboardArrowDown
                  sx={{ fontSize: 16, ml: 0.5, color: "text.secondary" }}
                />
              </Box>
              <Menu
                anchorEl={apiKeyAnchorEl}
                open={Boolean(apiKeyAnchorEl)}
                onClose={() => setApiKeyAnchorEl(null)}
              >
                {selectedOrg.orgApiKeys.map((key) => (
                  <MenuItem
                    key={key.apiKey}
                    onClick={() => handleApiKeySelect(key)}
                    selected={selectedApiKey?.apiKey === key.apiKey}
                    sx={{
                      fontSize: 12,
                      py: 1,
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 28 }}>
                      <Key sx={{ fontSize: 16 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={key.keyName}
                      secondary={`${key.apiKey.substring(0, 16)}...`}
                    />
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
