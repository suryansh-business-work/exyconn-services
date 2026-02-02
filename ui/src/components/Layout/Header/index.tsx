import { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Box, Tooltip } from '@mui/material';
import { ChevronLeft, ChevronRight, Home } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useOrg } from '../../../context/OrgContext';
import ApiKeyDropdown from './ApiKeyDropdown';
import OrgDropdown from './OrgDropdown';

interface HeaderProps {
  drawerMode: 'expanded' | 'collapsed' | 'icon-only';
  onToggleDrawer: () => void;
  onManageOrganizations: () => void;
}

const Header = ({ drawerMode, onToggleDrawer, onManageOrganizations }: HeaderProps) => {
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
  const [apiKeyAnchorEl, setApiKeyAnchorEl] = useState<HTMLElement | null>(null);

  const handleOrgSelect = (org: typeof selectedOrg) => {
    if (org) {
      selectOrganization(org);
      const firstApiKey = org.orgApiKeys?.[0];
      if (firstApiKey) {
        navigate(`/organization/${org.id}/apikey/${firstApiKey.apiKey}`);
      } else {
        navigate(`/organization/${org.id}`);
      }
    }
  };

  const handleApiKeySelect = (apiKey: typeof selectedApiKey) => {
    if (apiKey && selectedOrg) {
      selectApiKey(apiKey);
      navigate(`/organization/${selectedOrg.id}/apikey/${apiKey.apiKey}`);
    }
    setApiKeyAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ minHeight: '44px !important', height: 44, px: 1.5 }}>
        <IconButton edge="start" color="default" onClick={onToggleDrawer} size="small">
          {drawerMode === 'icon-only' ? (
            <ChevronRight fontSize="small" />
          ) : (
            <ChevronLeft fontSize="small" />
          )}
        </IconButton>
        <Typography variant="h6" color="text.primary" sx={{ fontWeight: 600, fontSize: 14, ml: 1 }}>
          Services
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Tooltip title="Home">
          <IconButton size="small" onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
            <Home fontSize="small" />
          </IconButton>
        </Tooltip>

        {selectedOrg?.orgApiKeys && selectedOrg.orgApiKeys.length > 0 && (
          <ApiKeyDropdown
            apiKeys={selectedOrg.orgApiKeys}
            selectedApiKey={selectedApiKey}
            anchorEl={apiKeyAnchorEl}
            onOpen={(e) => setApiKeyAnchorEl(e.currentTarget)}
            onClose={() => setApiKeyAnchorEl(null)}
            onSelect={handleApiKeySelect}
          />
        )}

        <OrgDropdown
          organizations={organizations}
          selectedOrg={selectedOrg}
          isLoading={isLoading}
          anchorEl={orgAnchorEl}
          onOpen={(e) => setOrgAnchorEl(e.currentTarget)}
          onClose={() => setOrgAnchorEl(null)}
          onSelect={handleOrgSelect}
          onManage={onManageOrganizations}
        />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
