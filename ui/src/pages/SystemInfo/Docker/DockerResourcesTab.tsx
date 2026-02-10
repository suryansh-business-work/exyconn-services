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
import { DockerImage, DockerVolume, DockerNetwork } from "../../../types/systemInfo";

interface DockerResourcesTabProps {
  images: DockerImage[];
  volumes: DockerVolume[];
  networks: DockerNetwork[];
}

const DockerResourcesTab = ({
  images,
  volumes,
  networks,
}: DockerResourcesTabProps) => (
  <Box>
    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
      Images ({images.length})
    </Typography>
    {images.length > 0 ? (
      <TableContainer sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Repository</TableCell>
              <TableCell>Tag</TableCell>
              <TableCell>Size</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {images.map((img) => (
              <TableRow key={img.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: 11, fontFamily: "monospace" }}>
                    {img.id.slice(0, 12)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {img.repository}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={img.tag} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                </TableCell>
                <TableCell>{img.size}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{img.created}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        No images found
      </Typography>
    )}

    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
      Volumes ({volumes.length})
    </Typography>
    {volumes.length > 0 ? (
      <TableContainer sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Mountpoint</TableCell>
              <TableCell>Scope</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {volumes.map((vol) => (
              <TableRow key={vol.name} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {vol.name.slice(0, 20)}
                  </Typography>
                </TableCell>
                <TableCell>{vol.driver}</TableCell>
                <TableCell sx={{ fontSize: 11 }}>{vol.mountpoint}</TableCell>
                <TableCell>
                  <Chip label={vol.scope} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        No volumes found
      </Typography>
    )}

    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
      Networks ({networks.length})
    </Typography>
    {networks.length > 0 ? (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Driver</TableCell>
              <TableCell>Scope</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {networks.map((net) => (
              <TableRow key={net.id} hover>
                <TableCell>
                  <Typography variant="body2" sx={{ fontSize: 11, fontFamily: "monospace" }}>
                    {net.id.slice(0, 12)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {net.name}
                  </Typography>
                </TableCell>
                <TableCell>{net.driver}</TableCell>
                <TableCell>
                  <Chip label={net.scope} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    ) : (
      <Typography color="text.secondary">No networks found</Typography>
    )}
  </Box>
);

export default DockerResourcesTab;
