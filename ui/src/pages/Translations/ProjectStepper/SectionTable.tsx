import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { Section } from "../../../types/translationsTheme";

interface SectionTableProps {
  sections: Section[];
  onRemove: (slug: string) => void;
}

const SectionTable = ({ sections, onRemove }: SectionTableProps) => (
  <TableContainer component={Paper} variant="outlined">
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>Slug</TableCell>
          <TableCell sx={{ fontWeight: 600 }} align="center">Variables</TableCell>
          <TableCell sx={{ fontWeight: 600 }}>Access Pattern</TableCell>
          <TableCell sx={{ fontWeight: 600, width: 60 }} align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sections.map((s) => (
          <TableRow key={s.slug} hover>
            <TableCell>
              <Typography variant="body2" fontWeight={500}>{s.name}</Typography>
            </TableCell>
            <TableCell>
              <Chip label={s.slug} size="small" variant="outlined" color="primary"
                sx={{ fontFamily: "monospace", fontSize: 12 }} />
            </TableCell>
            <TableCell align="center">
              <Chip label={s.variableCount ?? 0} size="small"
                color={s.variableCount ? "info" : "default"} />
            </TableCell>
            <TableCell>
              <Typography variant="caption" sx={{ fontFamily: "monospace", fontSize: 11, color: "text.secondary" }}>
                locale.&lt;code&gt;.{s.slug}.&lt;key&gt;
              </Typography>
            </TableCell>
            <TableCell align="right">
              <Tooltip title="Remove section">
                <IconButton size="small" color="error" onClick={() => onRemove(s.slug)}>
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export default SectionTable;
