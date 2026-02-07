import { useState, useMemo, useEffect } from "react";
import { Box, Drawer, Toolbar, List } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { APP_DATA, AppDefinition, AppStatus } from "../../data/app-data";
import SidebarMenuItem from "./SidebarMenuItem";
import SidebarFilters from "./SidebarFilters";
import { useOrg } from "../../context/OrgContext";

const DRAWER_WIDTHS = {
  expanded: 260,
  collapsed: 180,
  "icon-only": 52,
} as const;
type DrawerMode = "expanded" | "collapsed" | "icon-only";
type StatusFilter = "all" | AppStatus;

interface SidebarProps {
  drawerMode: DrawerMode;
  currentPath?: string;
  onNavigate?: (path: string) => void;
}

// Collect group IDs that should be expanded based on current path
const collectExpandedGroupIds = (
  apps: AppDefinition[],
  currentPath: string,
): string[] => {
  const ids: string[] = [];
  const findActiveGroups = (
    items: AppDefinition[],
    parents: string[] = [],
  ): boolean => {
    for (const item of items) {
      const itemPath = item.basePath;
      const isActive = itemPath && currentPath.includes(itemPath);
      const hasActiveSubItem = item.subItems?.some((sub) =>
        currentPath.includes(`${itemPath}${sub.pathSuffix}`),
      );
      if (item.children?.length) {
        if (findActiveGroups(item.children, [...parents, item.id])) {
          ids.push(item.id, ...parents);
          return true;
        }
      }
      if (isActive || hasActiveSubItem) {
        ids.push(item.id, ...parents);
        return true;
      }
    }
    return false;
  };
  findActiveGroups(apps);
  return [...new Set(ids)];
};

// Collect all group IDs for expand all functionality
const collectAllGroupIds = (apps: AppDefinition[]): string[] => {
  const ids: string[] = [];
  const collect = (items: AppDefinition[]) => {
    items.forEach((item) => {
      if (item.children?.length || item.subItems?.length) ids.push(item.id);
      if (item.children) collect(item.children);
    });
  };
  collect(apps);
  return ids;
};

const Sidebar = ({ drawerMode }: SidebarProps) => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(),
  );
  const [filterAnchorEl, setFilterAnchorEl] = useState<HTMLElement | null>(
    null,
  );

  useEffect(() => {
    const activeGroupIds = collectExpandedGroupIds(APP_DATA, currentPath);
    if (activeGroupIds.length > 0)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setExpandedGroups((prev) => new Set([...prev, ...activeGroupIds]));
  }, [currentPath]);

  const handleNavigate = (path: string) => {
    const globalPaths = ["/dashboard", "/manage-organization", "/welcome"];
    if (globalPaths.some((p) => path.startsWith(p))) {
      navigate(path);
    } else if (selectedOrg && selectedApiKey) {
      const cleanPath = path.startsWith("/") ? path.slice(1) : path;
      navigate(
        `/organization/${selectedOrg.id}/apikey/${selectedApiKey.apiKey}/${cleanPath}`,
      );
    } else if (selectedOrg) {
      navigate(
        `/organization/${selectedOrg.id}/${path.startsWith("/") ? path.slice(1) : path}`,
      );
    } else {
      navigate("/dashboard");
    }
  };

  const filteredApps = useMemo(() => {
    const filterApp = (app: AppDefinition): AppDefinition | null => {
      const matchesSearch =
        !searchQuery ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.keywords?.some((k) =>
          k.toLowerCase().includes(searchQuery.toLowerCase()),
        );
      const matchesStatus =
        statusFilter === "all" || app.status === statusFilter;
      if (app.children?.length) {
        const filteredChildren = app.children
          .map(filterApp)
          .filter((c): c is AppDefinition => c !== null);
        if (filteredChildren.length > 0)
          return { ...app, children: filteredChildren };
        if (matchesSearch && matchesStatus) return { ...app, children: [] };
        return null;
      }
      return matchesSearch && matchesStatus ? app : null;
    };
    return APP_DATA.map(filterApp).filter(
      (app): app is AppDefinition => app !== null,
    );
  }, [searchQuery, statusFilter]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTHS[drawerMode],
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTHS[drawerMode],
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
          transition: "width 0.2s ease-in-out",
          overflowX: "hidden",
        },
      }}
    >
      <Toolbar sx={{ minHeight: "44px !important" }} />
      <Box
        sx={{
          position: "sticky",
          top: 44,
          bgcolor: "background.paper",
          zIndex: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <SidebarFilters
          drawerMode={drawerMode}
          searchQuery={searchQuery}
          statusFilter={statusFilter}
          filterAnchorEl={filterAnchorEl}
          onSearchChange={setSearchQuery}
          onStatusFilterChange={setStatusFilter}
          onFilterMenuOpen={(e) => setFilterAnchorEl(e.currentTarget)}
          onFilterMenuClose={() => setFilterAnchorEl(null)}
          onExpandAll={() =>
            setExpandedGroups(new Set(collectAllGroupIds(APP_DATA)))
          }
          onCollapseAll={() => setExpandedGroups(new Set())}
        />
      </Box>
      <Box sx={{ overflow: "auto", flex: 1 }}>
        <List sx={{ pt: 0.5, pb: 2 }}>
          {filteredApps.map((app) => (
            <SidebarMenuItem
              key={app.id}
              app={app}
              drawerMode={drawerMode}
              expandedGroups={expandedGroups}
              onToggleGroup={toggleGroup}
              currentPath={currentPath}
              onNavigate={handleNavigate}
            />
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
