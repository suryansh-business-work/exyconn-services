import { useState, useEffect, useMemo, Fragment } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TextField,
  Switch,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Collapse,
  CircularProgress,
} from "@mui/material";
import { ExpandMore, ExpandLess, Star, StarBorder, Search } from "@mui/icons-material";
import { Locale, LocaleJsonEntry } from "../../../types/translationsTheme";
import LocaleDetailRow from "./LocaleDetailRow";

interface UnifiedLocaleTableProps {
  activeLocales: Locale[];
  onToggleActive: (code: string, name: string, nativeName: string, flag: string, active: boolean) => void;
  onSetDefault: (locale: Locale) => void;
}

const UnifiedLocaleTable = ({ activeLocales, onToggleActive, onSetDefault }: UnifiedLocaleTableProps) => {
  const [allLocales, setAllLocales] = useState<LocaleJsonEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const activeCodesMap = useMemo(() => {
    const map = new Map<string, Locale>();
    activeLocales.forEach((l) => map.set(l.code, l));
    return map;
  }, [activeLocales]);

  useEffect(() => {
    fetch("/locales.json")
      .then((res) => res.json())
      .then((data: LocaleJsonEntry[]) => {
        setAllLocales(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!search) return allLocales;
    const s = search.toLowerCase();
    return allLocales.filter(
      (l) =>
        l.locale.toLowerCase().includes(s) ||
        l.language.name.toLowerCase().includes(s) ||
        l.language.name_local.toLowerCase().includes(s) ||
        l.country.name.toLowerCase().includes(s) ||
        l.country.continent.toLowerCase().includes(s)
    );
  }, [allLocales, search]);

  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );

  const toggleExpand = (code: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(code) ? next.delete(code) : next.add(code);
      return next;
    });
  };

  const handleToggle = (entry: LocaleJsonEntry, checked: boolean) => {
    onToggleActive(entry.locale, entry.language.name, entry.language.name_local, entry.country.flag, checked);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search locales, languages, countries..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0); }}
          sx={{ minWidth: 320 }}
          InputProps={{ endAdornment: <Search fontSize="small" color="action" /> }}
        />
        <Chip label={`${activeLocales.length} active`} color="primary" size="small" variant="outlined" />
        <Chip label={`${filtered.length} total`} size="small" variant="outlined" />
      </Box>
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "65vh" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 40 }} />
              <TableCell sx={{ width: 50 }}>Flag</TableCell>
              <TableCell>Locale Code</TableCell>
              <TableCell>Language</TableCell>
              <TableCell>Country</TableCell>
              <TableCell>Continent</TableCell>
              <TableCell align="center">Default</TableCell>
              <TableCell align="center">Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginated.map((entry) => {
              const dbLocale = activeCodesMap.get(entry.locale);
              const isActive = !!dbLocale;
              const isExpanded = expandedRows.has(entry.locale);
              return (
                <Fragment key={entry.locale}>
                  <TableRow hover sx={{ "& > *": { borderBottom: isExpanded ? "none" : undefined } }}>
                    <TableCell>
                      <IconButton size="small" onClick={() => toggleExpand(entry.locale)}>
                        {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                      </IconButton>
                    </TableCell>
                    <TableCell sx={{ fontSize: "1.4rem" }}>{entry.country.flag}</TableCell>
                    <TableCell>
                      <Chip label={entry.locale} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{entry.language?.name || "—"}</Typography>
                      <Typography variant="caption" color="text.secondary">{entry.language?.name_local || ""}</Typography>
                    </TableCell>
                    <TableCell>{entry.country?.name || "—"}</TableCell>
                    <TableCell>
                      <Chip label={entry.country?.continent || "—"} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell align="center">
                      {isActive && (
                        <Tooltip title={dbLocale?.isDefault ? "Default locale" : "Set as default"}>
                          <IconButton size="small" onClick={() => dbLocale && !dbLocale.isDefault && onSetDefault(dbLocale)}>
                            {dbLocale?.isDefault ? <Star color="warning" fontSize="small" /> : <StarBorder fontSize="small" color="disabled" />}
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Switch size="small" checked={isActive} onChange={(_, checked) => handleToggle(entry, checked)} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ padding: 0 }} colSpan={8}>
                      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                        <LocaleDetailRow entry={entry} />
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filtered.length}
        page={page}
        onPageChange={(_, p) => setPage(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Box>
  );
};

export default UnifiedLocaleTable;
