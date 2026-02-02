import { useState } from 'react';
import { Box } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

type DrawerMode = 'expanded' | 'collapsed' | 'icon-only';

interface OrgLayoutProps {
  children?: React.ReactNode;
  currentPath?: string;
  onNavigate?: (path: string) => void;
  orgId: string;
}

const OrgLayout = ({ children, currentPath = '', onNavigate, orgId }: OrgLayoutProps) => {
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('expanded');

  const cycleDrawerMode = () => {
    setDrawerMode((prev) => {
      switch (prev) {
        case 'expanded':
          return 'collapsed';
        case 'collapsed':
          return 'icon-only';
        case 'icon-only':
          return 'expanded';
      }
    });
  };

  const handleManageOrganizations = () => {
    onNavigate?.('/organizations');
  };

  // For org layout, sidebar navigation should prepend /organization/:orgId
  const handleSidebarNavigate = (path: string) => {
    onNavigate?.(`/organization/${orgId}/${path}`);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header
        drawerMode={drawerMode}
        onToggleDrawer={cycleDrawerMode}
        onManageOrganizations={handleManageOrganizations}
        onNavigate={onNavigate}
      />
      <Sidebar
        drawerMode={drawerMode}
        currentPath={currentPath}
        onNavigate={handleSidebarNavigate}
      />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: '100vh',
          pt: '44px',
        }}
      >
        <Box sx={{ p: 1.5 }}>{children}</Box>
      </Box>
    </Box>
  );
};

export default OrgLayout;
