import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  IconButton,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { Locale, TranslationEntry } from "../../../types/translationsTheme";

interface SpreadsheetTableProps {
  entries: TranslationEntry[];
  activeLocales: Locale[];
  getCellValue: (entry: TranslationEntry, localeCode: string) => string;
  onCellEdit: (entryId: string, localeCode: string, value: string) => void;
  onDelete: (entryId: string) => void;
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

const SpreadsheetTable = ({
  entries,
  activeLocales,
  getCellValue,
  onCellEdit,
  onDelete,
  page,
  rowsPerPage,
  total,
  onPageChange,
  onRowsPerPageChange,
}: SpreadsheetTableProps) => {
  return (
    <Box>
      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "60vh" }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 120, fontWeight: 600 }}>Section</TableCell>
              <TableCell sx={{ minWidth: 160, fontWeight: 600 }}>Key</TableCell>
              {activeLocales.map((locale) => (
                <TableCell key={locale._id} sx={{ minWidth: 180, fontWeight: 600 }}>
                  <Chip label={locale.code} size="small" variant="outlined" sx={{ mr: 0.5 }} />
                  {locale.name}
                </TableCell>
              ))}
              <TableCell sx={{ width: 60, fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry._id} hover>
                <TableCell>
                  <Chip label={entry.section} size="small" color="primary" variant="outlined" />
                </TableCell>
                <TableCell>
                  <Tooltip title={`Access: locale.<code>.${entry.section}.${entry.key}`} placement="top">
                    <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: 12, cursor: "help" }}>
                      {entry.key}
                    </Typography>
                  </Tooltip>
                  {entry.description && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {entry.description}
                    </Typography>
                  )}
                </TableCell>
                {activeLocales.map((locale) => (
                  <TableCell key={locale._id} sx={{ p: 0.5 }}>
                    <TextField
                      value={getCellValue(entry, locale.code)}
                      onChange={(e) => onCellEdit(entry._id, locale.code, e.target.value)}
                      size="small"
                      fullWidth
                      variant="outlined"
                      multiline
                      maxRows={3}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          fontSize: 13,
                          "& fieldset": { borderColor: "transparent" },
                          "&:hover fieldset": { borderColor: "divider" },
                          "&.Mui-focused fieldset": { borderColor: "primary.main" },
                        },
                      }}
                    />
                  </TableCell>
                ))}
                <TableCell align="right">
                  <Tooltip title="Delete key">
                    <IconButton size="small" color="error" onClick={() => onDelete(entry._id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {entries.length === 0 && (
              <TableRow>
                <TableCell colSpan={activeLocales.length + 3} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    No translation keys found. Add a key to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page}
        onPageChange={(_, p) => onPageChange(p)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </Box>
  );
};

export default SpreadsheetTable;
