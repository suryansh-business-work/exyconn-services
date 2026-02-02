import { Fragment } from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
  Chip,
  Box,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { AppDefinition, AppStatus } from '../../data/app-data';
import { getIcon } from '../../utils/iconMap';

interface SidebarMenuItemProps {
  app: AppDefinition;
  depth?: number;
  drawerMode: 'expanded' | 'collapsed' | 'icon-only';
  expandedGroups: Set<string>;
  onToggleGroup: (groupId: string) => void;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

const getStatusChipColor = (status: AppStatus): 'success' | 'warning' | 'default' =>
  status === 'live' ? 'success' : status === 'dev' ? 'warning' : 'default';

const getStatusLabel = (status: AppStatus) =>
  status === 'live' ? 'Live' : status === 'dev' ? 'Dev' : 'Soon';

const selectedSx = {
  bgcolor: 'primary.main',
  color: 'primary.contrastText',
  '&:hover': { bgcolor: 'primary.dark' },
  '& .MuiListItemIcon-root': { color: 'primary.contrastText' },
};

const SidebarMenuItem = ({
  app,
  depth = 0,
  drawerMode,
  expandedGroups,
  onToggleGroup,
  currentPath = '',
  onNavigate,
}: SidebarMenuItemProps) => {
  const IconComponent = getIcon(app.iconName);
  const hasChildren = Boolean(app.children?.length);
  const hasSubItems = Boolean(app.subItems?.length);
  const isExpandable = hasChildren || hasSubItems;
  const isExpanded = expandedGroups.has(app.id);
  const showText = drawerMode !== 'icon-only';
  const showChip = drawerMode === 'expanded';
  const isItemActive = app.basePath && currentPath.includes(app.basePath);
  const isChildActive =
    hasChildren && app.children?.some((c) => c.basePath && currentPath.includes(c.basePath));
  const isSubItemActive =
    hasSubItems &&
    app.subItems?.some((s) => currentPath.includes(`${app.basePath}${s.pathSuffix}`));

  const handleClick = () => {
    if (isExpandable) onToggleGroup(app.id);
    else if (app.basePath && onNavigate) onNavigate(app.basePath);
  };

  return (
    <Fragment>
      <ListItem disablePadding sx={{ display: 'block' }}>
        <Tooltip title={drawerMode === 'icon-only' ? app.name : ''} placement="right">
          <ListItemButton
            onClick={handleClick}
            selected={Boolean(isItemActive && !hasSubItems && !hasChildren)}
            sx={{
              minHeight: 36,
              px: drawerMode === 'icon-only' ? 1.5 : 2,
              pl: showText ? 2 + depth * 1.5 : 1.5,
              py: 0.25,
              bgcolor: isChildActive || isSubItemActive ? 'action.selected' : 'transparent',
              '&.Mui-selected': selectedSx,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: drawerMode === 'icon-only' ? 0 : 32,
                mr: drawerMode === 'icon-only' ? 0 : 1,
                justifyContent: 'center',
              }}
            >
              <IconComponent
                sx={{
                  fontSize: 18,
                  color: isItemActive
                    ? 'inherit'
                    : app.status === 'dev'
                      ? 'primary.main'
                      : 'text.secondary',
                }}
              />
            </ListItemIcon>
            {showText && (
              <>
                <ListItemText
                  primary={app.name}
                  primaryTypographyProps={{
                    fontSize: 12,
                    fontWeight: app.isGroup || hasChildren ? 600 : 400,
                    noWrap: true,
                  }}
                />
                {showChip && !app.isGroup && !hasChildren && (
                  <Chip
                    label={getStatusLabel(app.status)}
                    size="small"
                    color={getStatusChipColor(app.status)}
                    sx={{ height: 16, fontSize: 9, ml: 0.5 }}
                  />
                )}
                {isExpandable && (
                  <ExpandMore
                    sx={{
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                      fontSize: 16,
                    }}
                  />
                )}
              </>
            )}
          </ListItemButton>
        </Tooltip>
      </ListItem>
      {hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {app.children?.map((child) => (
              <SidebarMenuItem
                key={child.id}
                app={child}
                depth={depth + 1}
                drawerMode={drawerMode}
                expandedGroups={expandedGroups}
                onToggleGroup={onToggleGroup}
                currentPath={currentPath}
                onNavigate={onNavigate}
              />
            ))}
          </List>
        </Collapse>
      )}
      {hasSubItems && !hasChildren && (
        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {app.subItems?.map((subItem) => {
              const isSubActive = currentPath.includes(`${app.basePath}${subItem.pathSuffix}`);
              return (
                <ListItem key={subItem.pathSuffix} disablePadding sx={{ display: 'block' }}>
                  <ListItemButton
                    onClick={() => onNavigate?.(`${app.basePath}${subItem.pathSuffix}`)}
                    disabled={subItem.isDisabled}
                    selected={isSubActive}
                    sx={{
                      minHeight: 32,
                      pl: showText ? 2 + (depth + 1) * 1.5 : 1.5,
                      py: 0.25,
                      '&.Mui-selected': selectedSx,
                    }}
                  >
                    {showText && (
                      <Box sx={{ display: 'flex', alignItems: 'center', pl: 4 }}>
                        <Box
                          sx={{
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            bgcolor: isSubActive ? 'primary.contrastText' : 'text.disabled',
                            mr: 1.5,
                          }}
                        />
                        <ListItemText
                          primary={subItem.label}
                          primaryTypographyProps={{
                            fontSize: 11,
                            fontWeight: isSubActive ? 500 : 400,
                            noWrap: true,
                          }}
                        />
                      </Box>
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Collapse>
      )}
    </Fragment>
  );
};

export default SidebarMenuItem;
