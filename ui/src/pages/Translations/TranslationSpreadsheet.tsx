import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Add, Delete, Save, Search } from "@mui/icons-material";
import { useOrg } from "../../context/OrgContext";
import { translationApi } from "../../api/translationsThemeApi";
import { Locale, TranslationEntry } from "../../types/translationsTheme";

interface TranslationSpreadsheetProps {
  locales: Locale[];
}

interface EditedCell {
  entryId: string;
  localeCode: string;
  value: string;
}

const TranslationSpreadsheet = ({ locales }: TranslationSpreadsheetProps) => {
  const { selectedOrg } = useOrg();
  const [entries, setEntries] = useState<TranslationEntry[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);
  const [editedCells, setEditedCells] = useState<Map<string, EditedCell>>(new Map());
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newEntry, setNewEntry] = useState({ section: "", key: "", description: "" });

  const activeLocales = useMemo(
    () => locales.filter((l) => l.isActive),
    [locales],
  );

  const fetchSections = useCallback(async () => {
    if (!selectedOrg) return;
    try {
      const res = await translationApi.getSections(selectedOrg.id);
      setSections(res.sections);
    } catch {
      /* ignore */
    }
  }, [selectedOrg]);

  const fetchTranslations = useCallback(async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const res = await translationApi.list(selectedOrg.id, {
        page: page + 1,
        limit: rowsPerPage,
        section: selectedSection || undefined,
        search: search || undefined,
      });
      setEntries(res.data);
      setTotal(res.pagination.total);
    } catch {
      setError("Failed to load translations");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, page, rowsPerPage, selectedSection, search]);

  useEffect(() => {
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrg]);

  useEffect(() => {
    fetchTranslations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrg, page, rowsPerPage, selectedSection, search]);

  const handleCellEdit = (entryId: string, localeCode: string, value: string) => {
    const key = `${entryId}:${localeCode}`;
    setEditedCells((prev) => {
      const next = new Map(prev);
      next.set(key, { entryId, localeCode, value });
      return next;
    });
  };

  const getCellValue = (entry: TranslationEntry, localeCode: string): string => {
    const key = `${entry._id}:${localeCode}`;
    const edited = editedCells.get(key);
    if (edited) return edited.value;
    return entry.values[localeCode] || "";
  };

  const handleSaveAll = async () => {
    if (!selectedOrg || editedCells.size === 0) return;

    const grouped = new Map<string, Record<string, string>>();
    editedCells.forEach(({ entryId, localeCode, value }) => {
      if (!grouped.has(entryId)) {
        const entry = entries.find((e) => e._id === entryId);
        grouped.set(entryId, { ...(entry?.values || {}) });
      }
      grouped.get(entryId)![localeCode] = value;
    });

    try {
      const promises = Array.from(grouped.entries()).map(([entryId, values]) => {
        const entry = entries.find((e) => e._id === entryId);
        if (!entry) return Promise.resolve();
        return translationApi.upsert(selectedOrg.id, {
          section: entry.section,
          key: entry.key,
          values,
          description: entry.description,
        });
      });
      await Promise.all(promises);
      setEditedCells(new Map());
      setSuccess("Translations saved successfully");
      setTimeout(() => setSuccess(""), 3000);
      await fetchTranslations();
    } catch {
      setError("Failed to save translations");
    }
  };

  const handleAddEntry = async () => {
    if (!selectedOrg || !newEntry.section || !newEntry.key) return;
    try {
      await translationApi.upsert(selectedOrg.id, {
        section: newEntry.section,
        key: newEntry.key,
        values: {},
        description: newEntry.description || undefined,
      });
      setAddDialogOpen(false);
      setNewEntry({ section: "", key: "", description: "" });
      await fetchSections();
      await fetchTranslations();
    } catch {
      setError("Failed to add translation entry");
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!selectedOrg) return;
    try {
      await translationApi.delete(selectedOrg.id, entryId);
      await fetchTranslations();
    } catch {
      setError("Failed to delete translation");
    }
  };

  const hasEdits = editedCells.size > 0;

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          select
          label="Section"
          value={selectedSection}
          onChange={(e) => { setSelectedSection(e.target.value); setPage(0); }}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Sections</MenuItem>
          {sections.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Search"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          size="small"
          InputProps={{ endAdornment: <Search fontSize="small" color="action" /> }}
          sx={{ minWidth: 200 }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" startIcon={<Add />} size="small" onClick={() => setAddDialogOpen(true)}>
          Add Key
        </Button>
        {hasEdits && (
          <Button variant="contained" startIcon={<Save />} size="small" onClick={handleSaveAll}>
            Save ({editedCells.size} changes)
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      {activeLocales.length === 0 ? (
        <Alert severity="info">Add at least one active locale to start translating.</Alert>
      ) : (
        <>
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "60vh" }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 100, fontWeight: 700 }}>Section</TableCell>
                  <TableCell sx={{ minWidth: 140, fontWeight: 700 }}>Key</TableCell>
                  {activeLocales.map((loc) => (
                    <TableCell key={loc.code} sx={{ minWidth: 180, fontWeight: 700 }}>
                      {loc.name} ({loc.code})
                    </TableCell>
                  ))}
                  <TableCell sx={{ width: 50 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={activeLocales.length + 3} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={24} />
                    </TableCell>
                  </TableRow>
                ) : entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={activeLocales.length + 3} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No translation entries found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={entry._id} hover>
                      <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>{entry.section}</TableCell>
                      <TableCell sx={{ fontSize: 12, fontFamily: "monospace" }}>{entry.key}</TableCell>
                      {activeLocales.map((loc) => (
                        <TableCell key={loc.code} sx={{ p: 0.5 }}>
                          <TextField
                            value={getCellValue(entry, loc.code)}
                            onChange={(e) => handleCellEdit(entry._id, loc.code, e.target.value)}
                            size="small"
                            fullWidth
                            variant="outlined"
                            sx={{
                              "& .MuiOutlinedInput-root": { fontSize: 12 },
                              "& .MuiOutlinedInput-notchedOutline": {
                                borderColor: editedCells.has(`${entry._id}:${loc.code}`)
                                  ? "primary.main" : "divider",
                              },
                            }}
                          />
                        </TableCell>
                      ))}
                      <TableCell sx={{ p: 0.5 }}>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteEntry(entry._id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(_, p) => setPage(p)}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </>
      )}

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Translation Key</DialogTitle>
        <DialogContent>
          <TextField
            label="Section"
            value={newEntry.section}
            onChange={(e) => setNewEntry({ ...newEntry, section: e.target.value })}
            fullWidth
            margin="dense"
            size="small"
            placeholder="e.g., header, footer, auth"
          />
          <TextField
            label="Key"
            value={newEntry.key}
            onChange={(e) => setNewEntry({ ...newEntry, key: e.target.value })}
            fullWidth
            margin="dense"
            size="small"
            placeholder="e.g., welcome_message"
          />
          <TextField
            label="Description (optional)"
            value={newEntry.description}
            onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
            fullWidth
            margin="dense"
            size="small"
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleAddEntry}
            disabled={!newEntry.section || !newEntry.key}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TranslationSpreadsheet;
