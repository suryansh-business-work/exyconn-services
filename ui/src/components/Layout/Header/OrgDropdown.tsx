import { useState } from "react";
import {
  Box,
  Menu,
  MenuItem,
  Typography,
  TextField,
  InputAdornment,
  Divider,
  ListItemIcon,
  ListItemText,
  CircularProgress,
} from "@mui/material";
import {
  KeyboardArrowDown,
  Search,
  Settings,
  Business,
} from "@mui/icons-material";
import { Organization } from "../../../types/organization";

interface OrgDropdownProps {
  organizations: Organization[];
  selectedOrg: Organization | null;
  isLoading: boolean;
  anchorEl: HTMLElement | null;
  onOpen: (e: React.MouseEvent<HTMLElement>) => void;
  onClose: () => void;
  onSelect: (org: Organization) => void;
  onManage: () => void;
}

const OrgDropdown = ({
  organizations,
  selectedOrg,
  isLoading,
  anchorEl,
  onOpen,
  onClose,
  onSelect,
  onManage,
}: OrgDropdownProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrgs = organizations.filter(
    (org) =>
      org.orgName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.orgSlug.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const displayText =
    organizations.length === 0
      ? "No Organization - Please create"
      : selectedOrg?.orgName || "Select Organization";

  const handleClose = () => {
    onClose();
    setSearchQuery("");
  };

  return (
    <>
      <Box
        onClick={onOpen}
        sx={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Business sx={{ fontSize: 18, mr: 1, color: "text.secondary" }} />
        <Typography variant="body2" sx={{ fontSize: 13, fontWeight: 500 }}>
          {displayText}
        </Typography>
        <KeyboardArrowDown
          sx={{ fontSize: 18, ml: 0.5, color: "text.secondary" }}
        />
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{ sx: { width: 280, maxHeight: 400 } }}
      >
        <Box sx={{ px: 1.5, py: 1 }}>
          <TextField
            size="small"
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
                onClick={() => {
                  onSelect(org);
                  handleClose();
                }}
                selected={selectedOrg?.id === org.id}
                sx={{ fontSize: 12, py: 1 }}
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
            onManage();
            handleClose();
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
    </>
  );
};

export default OrgDropdown;
