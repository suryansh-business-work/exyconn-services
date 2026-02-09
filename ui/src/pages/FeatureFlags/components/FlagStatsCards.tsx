import { Typography, Paper } from "@mui/material";
import Grid from "@mui/material/Grid2";
import { FeatureFlagStats } from "../../../types/featureFlags";

interface FlagStatsCardsProps {
  stats: FeatureFlagStats;
}

const FlagStatsCards = ({ stats }: FlagStatsCardsProps) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 6, sm: 2 }}>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>{stats.total}</Typography>
          <Typography variant="body2" color="text.secondary">Total</Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, sm: 2 }}>
        <Paper sx={{ p: 2, textAlign: "center", borderTop: 3, borderColor: "success.main" }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "success.main" }}>{stats.active}</Typography>
          <Typography variant="body2" color="text.secondary">Active</Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, sm: 2 }}>
        <Paper sx={{ p: 2, textAlign: "center", borderTop: 3, borderColor: "warning.main" }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "warning.main" }}>{stats.inactive}</Typography>
          <Typography variant="body2" color="text.secondary">Inactive</Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, sm: 2 }}>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>{stats.archived}</Typography>
          <Typography variant="body2" color="text.secondary">Archived</Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, sm: 2 }}>
        <Paper sx={{ p: 2, textAlign: "center", borderTop: 3, borderColor: "info.main" }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "info.main" }}>{stats.enabled}</Typography>
          <Typography variant="body2" color="text.secondary">Enabled</Typography>
        </Paper>
      </Grid>
      <Grid size={{ xs: 6, sm: 2 }}>
        <Paper sx={{ p: 2, textAlign: "center", borderTop: 3, borderColor: "error.main" }}>
          <Typography variant="h4" sx={{ fontWeight: 600, color: "error.main" }}>{stats.disabled}</Typography>
          <Typography variant="body2" color="text.secondary">Disabled</Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default FlagStatsCards;
