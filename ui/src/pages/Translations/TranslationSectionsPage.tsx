import { useState, useEffect, useCallback, useMemo } from "react";
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
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Delete, Save, Search } from "@mui/icons-material";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import { translationApi, localeApi } from "../../api/translationsThemeApi";
import { Locale, TranslationEntry } from "../../types/translationsTheme";

const TranslationSectionsPage = () => {
  const { selectedOrg } = useOrg();
  const [locales, setLocales] = useState<Locale[]>([]);
  const [entries, setEntries] = useState<TranslationEntry[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [total, setTotal] = useState(0);
  const [editedCells, setEditedCells] = useState<Map<string, string>>(new Map());

  const activeLocales = useMemo(() => locales.filter((l) => l.isActive), [locales]);

  const fetchLocales = useCallback(async () => {
    if (!selectedOrg) return;
    try {
      const res = await localeApi.list(selectedOrg.id);
      setLocales(res.data);
    } catch {
      /* ignore */
    }
  }, [selectedOrg]);

  const fetchSections = useCallback(async () => {
    if (!selectedOrg) return;
    try {
      const res = await translationApi.getSections(selectedOrg.id);
      setSections(res.sections);
    } catch {
      /* ignore */
    }
  }, [selectedOrg]);

  const fetchEntries = useCallback(async () => {
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
    fetchLocales();
    fetchSections();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrg]);

  useEffect(() => {
    fetchEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrg, page, rowsPerPage, selectedSection, search]);

  const handleCellChange = (entryId: string, localeCode: string, value: string) => {
    setEditedCells((prev) => {
      const next = new Map(prev);
      next.set(`${entryId}:${localeCode}`, value);
      return next;
    });
  };

  const getCellValue = (entry: TranslationEntry, code: string) => {
    const key = `${entry._id}:${code}`;
    return editedCells.has(key) ? editedCells.get(key)! : (entry.values[code] || "");
  };

  const handleSaveAll = async () => {
    if (!selectedOrg || editedCells.size === 0) return;

    const byEntry = new Map<string, Record<string, string>>();
    editedCells.forEach((value, key) => {
      const [entryId, localeCode] = key.split(":");
      const entry = entries.find((e) => e._id === entryId);
      if (!entry) return;
      if (!byEntry.has(entryId)) byEntry.set(entryId, { ...entry.values });
      byEntry.get(entryId)![localeCode] = value;
    });

    try {
      const promises = Array.from(byEntry.entries()).map(([entryId, values]) => {
        const entry = entries.find((e) => e._id === entryId);
        if (!entry) return Promise.resolve();
        return translationApi.upsert(selectedOrg.id, {
          section: entry.section,
          key: entry.key,
          values,
        });
      });
      await Promise.all(promises);
      setEditedCells(new Map());
      setSuccess("Saved successfully");
      setTimeout(() => setSuccess(""), 3000);
      await fetchEntries();
    } catch {
      setError("Failed to save");
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!selectedOrg) return;
    try {
      await translationApi.delete(selectedOrg.id, entryId);
      await fetchEntries();
    } catch {
      setError("Failed to delete entry");
    }
  };

  const breadcrumbs = [
    { label: "Home", href: "/dashboard" },
    { label: selectedOrg?.orgName || "Organization" },
    { label: "Translations" },
    { label: "Translation Text" },
  ];

  return (
    <Box>
      <PageBreadcrumb items={breadcrumbs} />
      <Typography variant="h5" sx={{ mb: 2 }}>
        Translation Text
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          select
          label="Section"
          value={selectedSection}
          onChange={(e) => {
            setSelectedSection(e.target.value);
            setPage(0);
          }}
          size="small"
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All Sections</MenuItem>
          {sections.map((s) => (
            <MenuItem key={s} value={s}>{s}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Search keys"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          size="small"
          InputProps={{ endAdornment: <Search fontSize="small" color="action" /> }}
          sx={{ minWidth: 200 }}
        />
        <Chip label={`${activeLocales.length} locales`} size="small" variant="outlined" />
        <Box sx={{ flexGrow: 1 }} />
        {editedCells.size > 0 && (
          <Button variant="contained" startIcon={<Save />} size="small" onClick={handleSaveAll}>
            Save ({editedCells.size})
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>{success}</Alert>}

      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "65vh" }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700, minWidth: 100 }}>Section</TableCell>
              <TableCell sx={{ fontWeight: 700, minWidth: 140 }}>Key</TableCell>
              {activeLocales.map((l) => (
                <TableCell key={l.code} sx={{ fontWeight: 700, minWidth: 180 }}>
                  {l.name} ({l.code})
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
                  <Typography color="text.secondary" variant="body2">
                    No translation entries
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry._id} hover>
                  <TableCell sx={{ fontSize: 12, color: "text.secondary" }}>{entry.section}</TableCell>
                  <TableCell sx={{ fontSize: 12, fontFamily: "monospace" }}>{entry.key}</TableCell>
                  {activeLocales.map((l) => (
                    <TableCell key={l.code} sx={{ p: 0.5 }}>
                      <TextField
                        value={getCellValue(entry, l.code)}
                        onChange={(e) => handleCellChange(entry._id, l.code, e.target.value)}
                        size="small"
                        fullWidth
                        variant="outlined"
                        sx={{
                          "& .MuiOutlinedInput-root": { fontSize: 12 },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: editedCells.has(`${entry._id}:${l.code}`) ? "primary.main" : "divider",
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
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[25, 50, 100, 200]}
      />
    </Box>
  );
};

export default TranslationSectionsPage;
