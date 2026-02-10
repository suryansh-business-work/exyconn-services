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
} from "@mui/material";
import { NetworkCheck } from "@mui/icons-material";
import { NetworkInfo } from "../../types/systemInfo";

interface NetworkSectionProps {
  data: NetworkInfo;
}

const NetworkSection = ({ data }: NetworkSectionProps) => (
  <Box>
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <NetworkCheck color="primary" />
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Network Interfaces
      </Typography>
    </Box>
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Interface</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Netmask</TableCell>
            <TableCell>Family</TableCell>
            <TableCell>MAC</TableCell>
            <TableCell>Internal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.interfaces.flatMap((iface) =>
            iface.addresses.map((addr, idx) => (
              <TableRow key={`${iface.name}-${idx}`} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {iface.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: 12 }}>
                    {addr.address}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: 12 }}>
                    {addr.netmask}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={addr.family}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: 10 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: 11 }}>
                    {addr.mac}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={addr.internal ? "Yes" : "No"}
                    size="small"
                    color={addr.internal ? "warning" : "success"}
                    sx={{ fontSize: 10 }}
                  />
                </TableCell>
              </TableRow>
            )),
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>
);

export default NetworkSection;
