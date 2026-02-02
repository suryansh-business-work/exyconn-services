import { useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

type DrawerMode = 'expanded' | 'collapsed' | 'icon-only';

interface LayoutProps {
  children?: React.ReactNode;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

const Layout = ({ children, currentPath = '' }: LayoutProps) => {
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('expanded');
  const navigate = useNavigate();

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
    navigate('/manage-organization');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Header
        drawerMode={drawerMode}
        onToggleDrawer={cycleDrawerMode}
        onManageOrganizations={handleManageOrganizations}
      />
      <Sidebar drawerMode={drawerMode} currentPath={currentPath} />
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

export default Layout;
