import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  MenuItem,
  Switch,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Flag, Refresh, Edit, Delete, Add } from "@mui/icons-material";
import { PageBreadcrumb, Spinner, ActionButton } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { featureFlagsApi } from "../../api/featureFlagsApi";
import { FeatureFlag, FeatureFlagStats } from "../../types/featureFlags";
import FlagFormDialog from "./components/FlagFormDialog";
import FlagStatsCards from "./components/FlagStatsCards";

const FeatureFlagList = () => {
  const { selectedOrg } = useOrg();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [stats, setStats] = useState<FeatureFlagStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);

  const fetchData = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const [flagsRes, statsRes] = await Promise.all([
        featureFlagsApi.list(selectedOrg.id, {
          page: page + 1,
          limit: rowsPerPage,
          status: statusFilter || undefined,
          search: searchQuery || undefined,
        }),
        featureFlagsApi.getStats(selectedOrg.id),
      ]);
      setFlags(flagsRes.data);
      setTotal(flagsRes.pagination.total);
      setStats(statsRes);
    } catch {
      setError("Failed to load feature flags");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, page, rowsPerPage, statusFilter, searchQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggle = async (flag: FeatureFlag) => {
    if (!selectedOrg) return;
    try {
      await featureFlagsApi.toggle(selectedOrg.id, flag.id);
      fetchData();
    } catch {
      setError("Failed to toggle flag");
    }
  };

  const handleDelete = async (flagId: string) => {
    if (!selectedOrg || !confirm("Delete this feature flag?")) return;
    try {
      await featureFlagsApi.delete(selectedOrg.id, flagId);
      fetchData();
    } catch {
      setError("Failed to delete flag");
    }
  };

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: selectedOrg.orgName, href: `/organization/${selectedOrg.id}` },
          { label: "Developer Tools" },
          { label: "Feature Flags" },
          { label: "Flags" },
        ]}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Flag sx={{ fontSize: 32, color: "primary.main" }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>Feature Flags</Typography>
          <Typography variant="body2" color="text.secondary">Manage feature toggles, rollouts, and targeting rules</Typography>
        </Box>
        <ActionButton variant="outlined" startIcon={<Refresh />} onClick={fetchData} disabled={loading}>Refresh</ActionButton>
        <ActionButton variant="contained" startIcon={<Add />} onClick={() => { setEditingFlag(null); setFormOpen(true); }}>Create Flag</ActionButton>
      </Box>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
      {stats && <FlagStatsCards stats={stats} />}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth size="small" label="Search" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth select size="small" label="Status" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}>
              <MenuItem value="">All</MenuItem>
              {["active", "inactive", "archived"].map((s) => <MenuItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </Paper>
      {loading ? <Spinner /> : (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Key</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Enabled</TableCell>
                <TableCell>Rollout</TableCell>
                <TableCell>Tags</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {flags.map((flag) => (
                <TableRow key={flag.id} hover>
                  <TableCell><Typography sx={{ fontFamily: "monospace", fontSize: 13 }}>{flag.key}</Typography></TableCell>
                  <TableCell>{flag.name}</TableCell>
                  <TableCell><Chip label={flag.status} size="small" color={flag.status === "active" ? "success" : flag.status === "inactive" ? "warning" : "default"} /></TableCell>
                  <TableCell><Switch size="small" checked={flag.enabled} onChange={() => handleToggle(flag)} /></TableCell>
                  <TableCell><Chip label={flag.rolloutType === "percentage" ? `${flag.rolloutPercentage}%` : flag.rolloutType} size="small" variant="outlined" /></TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      {flag.tags.slice(0, 2).map((t, i) => <Chip key={i} label={t} size="small" />)}
                      {flag.tags.length > 2 && <Chip label={`+${flag.tags.length - 2}`} size="small" />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Edit"><IconButton size="small" onClick={() => { setEditingFlag(flag); setFormOpen(true); }}><Edit fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDelete(flag.id)}><Delete fontSize="small" /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {flags.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center"><Typography color="text.secondary" sx={{ py: 4 }}>No feature flags found</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
          <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[10, 20, 50]} />
        </TableContainer>
      )}
      <FlagFormDialog
        open={formOpen}
        flag={editingFlag}
        onClose={() => setFormOpen(false)}
        onSaved={fetchData}
      />
    </Box>
  );
};

export default FeatureFlagList;
