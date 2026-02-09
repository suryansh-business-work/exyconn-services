import { TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";

interface LogRetentionFieldProps {
  retentionDays: number;
  maxLogsPerDay: number;
  onRetentionChange: (value: number) => void;
  onMaxLogsChange: (value: number) => void;
}

const LogRetentionField = ({
  retentionDays,
  maxLogsPerDay,
  onRetentionChange,
  onMaxLogsChange,
}: LogRetentionFieldProps) => {
  return (
    <>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
        Data Retention
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Retention Days"
            value={retentionDays}
            onChange={(e) => onRetentionChange(parseInt(e.target.value, 10) || 90)}
            helperText="Logs older than this will be auto-deleted (1-365)"
            inputProps={{ min: 1, max: 365 }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            type="number"
            label="Max Logs Per Day"
            value={maxLogsPerDay}
            onChange={(e) => onMaxLogsChange(parseInt(e.target.value, 10) || 100000)}
            helperText="Maximum logs accepted per day (min 1000)"
            inputProps={{ min: 1000 }}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default LogRetentionField;
