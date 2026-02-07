import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
  Chip,
  Menu,
  MenuItem,
  Divider,
  ListSubheader,
} from "@mui/material";
import {
  Search,
  FilterList,
  UnfoldMore,
  UnfoldLess,
} from "@mui/icons-material";
import { AppStatus } from "../../data/app-data";

type StatusFilter = "all" | AppStatus;

interface SidebarFiltersProps {
  drawerMode: "expanded" | "collapsed" | "icon-only";
  searchQuery: string;
  statusFilter: StatusFilter;
  filterAnchorEl: HTMLElement | null;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  onFilterMenuOpen: (event: React.MouseEvent<HTMLElement>) => void;
  onFilterMenuClose: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

const getStatusChipColor = (
  status: AppStatus,
): "success" | "warning" | "default" => {
  switch (status) {
    case "live":
      return "success";
    case "dev":
      return "warning";
    case "soon":
      return "default";
  }
};

const SidebarFilters = ({
  drawerMode,
  searchQuery,
  statusFilter,
  filterAnchorEl,
  onSearchChange,
  onStatusFilterChange,
  onFilterMenuOpen,
  onFilterMenuClose,
  onExpandAll,
  onCollapseAll,
}: SidebarFiltersProps) => {
  if (drawerMode === "icon-only") {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          py: 1,
          gap: 0.5,
        }}
      >
        <Tooltip title="Search" placement="right">
          <IconButton size="small">
            <Search sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Filter" placement="right">
          <IconButton size="small" onClick={onFilterMenuOpen}>
            <FilterList sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
        <FilterMenu
          anchorEl={filterAnchorEl}
          statusFilter={statusFilter}
          onClose={onFilterMenuClose}
          onStatusFilterChange={onStatusFilterChange}
          onExpandAll={onExpandAll}
          onCollapseAll={onCollapseAll}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, pb: 0.5 }}>
      <TextField
        size="small"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search sx={{ fontSize: 16, color: "text.secondary" }} />
            </InputAdornment>
          ),
          sx: { fontSize: 12, height: 28 },
        }}
        sx={{ mb: 0.5 }}
      />
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton size="small" onClick={onFilterMenuOpen} sx={{ p: 0.25 }}>
            <FilterList sx={{ fontSize: 16 }} />
          </IconButton>
          {statusFilter !== "all" && (
            <Chip
              label={
                statusFilter === "live"
                  ? "Live"
                  : statusFilter === "dev"
                    ? "Dev"
                    : "Soon"
              }
              size="small"
              color={getStatusChipColor(statusFilter)}
              onDelete={() => onStatusFilterChange("all")}
              sx={{ height: 18, fontSize: 9 }}
            />
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
          <Tooltip title="Expand All">
            <IconButton size="small" onClick={onExpandAll} sx={{ p: 0.25 }}>
              <UnfoldMore sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Collapse All">
            <IconButton size="small" onClick={onCollapseAll} sx={{ p: 0.25 }}>
              <UnfoldLess sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <FilterMenu
        anchorEl={filterAnchorEl}
        statusFilter={statusFilter}
        onClose={onFilterMenuClose}
        onStatusFilterChange={onStatusFilterChange}
        onExpandAll={onExpandAll}
        onCollapseAll={onCollapseAll}
      />
    </Box>
  );
};

interface FilterMenuProps {
  anchorEl: HTMLElement | null;
  statusFilter: StatusFilter;
  onClose: () => void;
  onStatusFilterChange: (status: StatusFilter) => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
}

const FilterMenu = ({
  anchorEl,
  statusFilter,
  onClose,
  onStatusFilterChange,
  onExpandAll,
  onCollapseAll,
}: FilterMenuProps) => (
  <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={onClose}>
    <ListSubheader sx={{ fontSize: 11, lineHeight: "28px" }}>
      Filter by Status
    </ListSubheader>
    <MenuItem
      onClick={() => {
        onStatusFilterChange("all");
        onClose();
      }}
      selected={statusFilter === "all"}
      sx={{ fontSize: 12, py: 0.5 }}
    >
      All
    </MenuItem>
    <MenuItem
      onClick={() => {
        onStatusFilterChange("live");
        onClose();
      }}
      selected={statusFilter === "live"}
      sx={{ fontSize: 12, py: 0.5 }}
    >
      <Chip
        label="Live"
        size="small"
        color="success"
        sx={{ height: 16, fontSize: 9, mr: 1 }}
      />
      Production Ready
    </MenuItem>
    <MenuItem
      onClick={() => {
        onStatusFilterChange("dev");
        onClose();
      }}
      selected={statusFilter === "dev"}
      sx={{ fontSize: 12, py: 0.5 }}
    >
      <Chip
        label="Dev"
        size="small"
        color="warning"
        sx={{ height: 16, fontSize: 9, mr: 1 }}
      />
      In Development
    </MenuItem>
    <MenuItem
      onClick={() => {
        onStatusFilterChange("soon");
        onClose();
      }}
      selected={statusFilter === "soon"}
      sx={{ fontSize: 12, py: 0.5 }}
    >
      <Chip
        label="Soon"
        size="small"
        color="default"
        sx={{ height: 16, fontSize: 9, mr: 1 }}
      />
      Coming Soon
    </MenuItem>
    <Divider sx={{ my: 0.5 }} />
    <ListSubheader sx={{ fontSize: 11, lineHeight: "28px" }}>
      Quick Actions
    </ListSubheader>
    <MenuItem
      onClick={() => {
        onExpandAll();
        onClose();
      }}
      sx={{ fontSize: 12, py: 0.5 }}
    >
      <UnfoldMore sx={{ fontSize: 16, mr: 1 }} /> Expand All
    </MenuItem>
    <MenuItem
      onClick={() => {
        onCollapseAll();
        onClose();
      }}
      sx={{ fontSize: 12, py: 0.5 }}
    >
      <UnfoldLess sx={{ fontSize: 16, mr: 1 }} /> Collapse All
    </MenuItem>
  </Menu>
);

export default SidebarFilters;
