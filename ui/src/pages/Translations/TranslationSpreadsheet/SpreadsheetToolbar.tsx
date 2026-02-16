import { Box, TextField, Chip, Button } from "@mui/material";
import { Add, Save, Search } from "@mui/icons-material";

interface SpreadsheetToolbarProps {
  search: string;
  onSearchChange: (search: string) => void;
  localeCount: number;
  hasEdits: boolean;
  editCount: number;
  onSave: () => void;
  onAddKey: () => void;
}

const SpreadsheetToolbar = ({
  search,
  onSearchChange,
  localeCount,
  hasEdits,
  editCount,
  onSave,
  onAddKey,
}: SpreadsheetToolbarProps) => {
  return (
    <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
      <TextField
        label="Search keys"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        size="small"
        InputProps={{ endAdornment: <Search fontSize="small" color="action" /> }}
        sx={{ minWidth: 200 }}
      />
      <Chip label={`${localeCount} locales`} size="small" variant="outlined" />
      <Box sx={{ flexGrow: 1 }} />
      <Button variant="outlined" startIcon={<Add />} size="small" onClick={onAddKey}>
        Add Key
      </Button>
      {hasEdits && (
        <Button variant="contained" startIcon={<Save />} size="small" onClick={onSave}>
          Save ({editCount})
        </Button>
      )}
    </Box>
  );
};

export default SpreadsheetToolbar;
