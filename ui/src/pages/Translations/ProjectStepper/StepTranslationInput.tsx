import {
  Box,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress,
  TextField,
  TablePagination,
} from "@mui/material";
import { Translate, Save, Search } from "@mui/icons-material";
import TranslationKeyCard from "./TranslationKeyCard";
import AutoTranslateDialog from "./AutoTranslateDialog";
import { useTranslationEditor } from "./useTranslationEditor";

interface StepTranslationInputProps {
  projectId: string;
}

const StepTranslationInput = ({ projectId }: StepTranslationInputProps) => {
  const {
    entries, sections, selectedSection, setSelectedSection,
    search, setSearch, loading, error, setError, success,
    page, setPage, rowsPerPage, setRowsPerPage, total,
    editedCells, translateDialogOpen, setTranslateDialogOpen,
    translatingKey, activeLocales,
    getCellValue, handleCellEdit, handleSaveAll, handleDelete,
    handleAutoTranslateSingle, handleBulkTranslated,
  } = useTranslationEditor(projectId);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <Translate color="primary" />
        <Typography variant="h6">Translation Input</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Enter translations for each locale. Use auto-translate to fill values using AI, toggle rich text for formatted content.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        {sections.map((s) => (
          <Chip key={s.slug} label={s.name} size="small"
            variant={selectedSection === s.slug ? "filled" : "outlined"}
            color={selectedSection === s.slug ? "primary" : "default"}
            onClick={() => { setSelectedSection(s.slug); setPage(0); }} />
        ))}
        <Box sx={{ flexGrow: 1 }} />
        <TextField size="small" placeholder="Search keys..."  value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          InputProps={{ endAdornment: <Search fontSize="small" color="action" /> }}
          sx={{ minWidth: 180 }} />
        <Button variant="outlined" size="small" startIcon={<Translate />} onClick={() => setTranslateDialogOpen(true)}
          disabled={entries.length === 0}>Auto-Translate All</Button>
        {editedCells.size > 0 && (
          <Button variant="contained" size="small" startIcon={<Save />} onClick={handleSaveAll}>
            Save ({editedCells.size})
          </Button>
        )}
      </Box>
      {loading && entries.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
      ) : entries.length === 0 ? (
        <Typography color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
          No translation entries found. Add variables in Step 3 first.
        </Typography>
      ) : (
        <>
          {entries.map((entry) => (
            <TranslationKeyCard key={entry._id} entry={entry} locales={activeLocales}
              getCellValue={getCellValue} onCellEdit={handleCellEdit}
              onDelete={handleDelete} onAutoTranslateSingle={handleAutoTranslateSingle}
              translatingKey={translatingKey} />
          ))}
          <TablePagination component="div" count={total} page={page}
            onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]} />
        </>
      )}
      <AutoTranslateDialog open={translateDialogOpen} onClose={() => setTranslateDialogOpen(false)}
        projectId={projectId} entries={entries} locales={activeLocales}
        onTranslated={handleBulkTranslated} />
    </Box>
  );
};

export default StepTranslationInput;
