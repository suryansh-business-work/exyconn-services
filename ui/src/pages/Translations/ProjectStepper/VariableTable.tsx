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
import { TranslationEntry } from "../../../types/translationsTheme";

interface VariableTableProps {
  entries: TranslationEntry[];
  onDelete: (id: string) => void;
  onDefaultBlur: (entry: TranslationEntry, val: string) => void;
  page: number;
  rowsPerPage: number;
  total: number;
  onPageChange: (p: number) => void;
  onRowsPerPageChange: (r: number) => void;
}

const VariableTable = ({
  entries, onDelete, onDefaultBlur, page, rowsPerPage, total, onPageChange, onRowsPerPageChange,
}: VariableTableProps) => (
  <Box>
    <TableContainer component={Paper} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, minWidth: 120 }}>Section</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 160 }}>Key</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 240 }}>Default Value</TableCell>
            <TableCell sx={{ fontWeight: 600, minWidth: 160 }}>Description</TableCell>
            <TableCell sx={{ fontWeight: 600, width: 60 }} align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((e) => (
            <TableRow key={e._id} hover>
              <TableCell>
                <Chip label={e.section} size="small" variant="outlined" color="primary" />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontFamily: "monospace", fontSize: 12 }}>{e.key}</Typography>
              </TableCell>
              <TableCell>
                <TextField
                  size="small" fullWidth multiline maxRows={3} variant="outlined"
                  defaultValue={e.defaultValue || ""}
                  placeholder="Enter default value..."
                  onBlur={(ev) => onDefaultBlur(e, ev.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { fontSize: 13 } }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="caption" color="text.secondary">{e.description || "—"}</Typography>
              </TableCell>
              <TableCell align="right">
                <Tooltip title="Delete variable">
                  <IconButton size="small" color="error" onClick={() => onDelete(e._id)}>
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <TablePagination
      component="div" count={total} page={page}
      onPageChange={(_, p) => onPageChange(p)}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={(ev) => onRowsPerPageChange(parseInt(ev.target.value, 10))}
      rowsPerPageOptions={[10, 25, 50, 100]}
    />
  </Box>
);

export default VariableTable;
