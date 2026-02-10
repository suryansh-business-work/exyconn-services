import {
  Box,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { DockerContainer } from "../../../types/systemInfo";

interface ContainerListProps {
  containers: DockerContainer[];
  onViewDetail: (containerId: string) => void;
}

const ContainerList = ({ containers, onViewDetail }: ContainerListProps) => {
  if (containers.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography color="text.secondary">No containers found</Typography>
      </Box>
    );
  }

  const getStateColor = (
    state: string,
  ): "success" | "error" | "warning" | "default" => {
    switch (state.toLowerCase()) {
      case "running":
        return "success";
      case "exited":
        return "error";
      case "paused":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Image</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Ports</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {containers.map((c) => (
            <TableRow key={c.id} hover>
              <TableCell>
                <Typography variant="body2" sx={{ fontSize: 11, fontFamily: "monospace" }}>
                  {c.id.slice(0, 12)}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {c.names}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip label={c.image} size="small" variant="outlined" sx={{ fontSize: 10 }} />
              </TableCell>
              <TableCell>
                <Chip
                  label={c.state}
                  size="small"
                  color={getStateColor(c.state)}
                  sx={{ fontSize: 10 }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" sx={{ fontSize: 11 }}>
                  {c.status}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography
                  variant="body2"
                  sx={{ fontSize: 11, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}
                >
                  {c.ports || "-"}
                </Typography>
              </TableCell>
              <TableCell align="center">
                <Tooltip title="View Detail">
                  <IconButton size="small" onClick={() => onViewDetail(c.id)}>
                    <Visibility fontSize="small" />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ContainerList;
