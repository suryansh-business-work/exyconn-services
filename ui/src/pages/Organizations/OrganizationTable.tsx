import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  IconButton,
  Chip,
  Tooltip,
  Paper,
  Box,
  Typography,
  Collapse,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Edit,
  Delete,
  KeyboardArrowDown,
  KeyboardArrowUp,
  ContentCopy,
  Check,
} from '@mui/icons-material';
import { Organization } from '../../types/organization';

interface OrganizationTableProps {
  organizations: Organization[];
  total: number;
  page: number;
  limit: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  isLoading?: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSortChange: (field: string) => void;
  onEdit: (org: Organization) => void;
  onDelete: (org: Organization) => void;
}

interface ApiKeyCopyButtonProps {
  apiKey: string;
}

const ApiKeyCopyButton = ({ apiKey }: ApiKeyCopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Tooltip title={copied ? 'Copied!' : 'Copy API Key'}>
      <IconButton size="small" onClick={handleCopy} color={copied ? 'success' : 'default'}>
        {copied ? <Check sx={{ fontSize: 14 }} /> : <ContentCopy sx={{ fontSize: 14 }} />}
      </IconButton>
    </Tooltip>
  );
};

interface OrganizationRowProps {
  org: Organization;
  onEdit: (org: Organization) => void;
  onDelete: (org: Organization) => void;
}

const OrganizationRow = ({ org, onEdit, onDelete }: OrganizationRowProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TableRow
        hover
        onClick={() => setOpen(!open)}
        sx={{ cursor: 'pointer', '& > *': { borderBottom: open ? 'none' : undefined } }}
      >
        <TableCell sx={{ width: 40, py: 1 }}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
          >
            {open ? (
              <KeyboardArrowUp sx={{ fontSize: 18 }} />
            ) : (
              <KeyboardArrowDown sx={{ fontSize: 18 }} />
            )}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontSize: 12 }}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 12 }}>
              {org.orgName}
            </Typography>
            {org.orgDescription && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10 }}>
                {org.orgDescription.slice(0, 50)}
                {org.orgDescription.length > 50 ? '...' : ''}
              </Typography>
            )}
          </Box>
        </TableCell>
        <TableCell sx={{ fontSize: 11, fontFamily: 'monospace' }}>{org.orgSlug}</TableCell>
        <TableCell>
          <Chip
            label={org.orgType}
            size="small"
            color={org.orgType === 'Service' ? 'primary' : 'secondary'}
            sx={{ height: 20, fontSize: 10 }}
          />
        </TableCell>
        <TableCell>
          <Chip
            label={`${org.orgApiKeys?.length || 0} keys`}
            size="small"
            variant="outlined"
            sx={{ height: 20, fontSize: 10 }}
          />
        </TableCell>
        <TableCell sx={{ fontSize: 11 }}>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(org)}>
                <Edit sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => onDelete(org)}>
                <Delete sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ py: 0 }} colSpan={7}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ py: 2, px: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>
                    Organization Details
                  </Typography>
                  <Box sx={{ bgcolor: 'background.default', p: 1.5, borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ width: 80 }}>
                        Name:
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 500 }}>
                        {org.orgName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ width: 80 }}>
                        Slug:
                      </Typography>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                        {org.orgSlug}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ width: 80 }}>
                        Type:
                      </Typography>
                      <Typography variant="caption">{org.orgType}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ width: 80 }}>
                        Created:
                      </Typography>
                      <Typography variant="caption">
                        {new Date(org.createdAt).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ width: 80 }}>
                        Updated:
                      </Typography>
                      <Typography variant="caption">
                        {new Date(org.updatedAt).toLocaleString()}
                      </Typography>
                    </Box>
                    {org.orgDescription && (
                      <Box
                        sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', mb: 0.5 }}
                        >
                          Description:
                        </Typography>
                        <Typography variant="caption">{org.orgDescription}</Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle2" sx={{ fontSize: 12, fontWeight: 600, mb: 1 }}>
                    API Keys ({org.orgApiKeys?.length || 0})
                  </Typography>
                  <Box sx={{ bgcolor: 'background.default', p: 1.5, borderRadius: 1 }}>
                    {!org.orgApiKeys || org.orgApiKeys.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        No API keys configured
                      </Typography>
                    ) : (
                      org.orgApiKeys.map((key, index) => (
                        <Box
                          key={index}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            py: 0.75,
                            borderBottom: index < org.orgApiKeys.length - 1 ? '1px solid' : 'none',
                            borderColor: 'divider',
                          }}
                        >
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography
                              variant="caption"
                              sx={{ fontWeight: 500, display: 'block' }}
                            >
                              {key.keyName}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontFamily: 'monospace', fontSize: 10 }}
                            >
                              {key.apiKey.slice(0, 24)}...
                            </Typography>
                          </Box>
                          <ApiKeyCopyButton apiKey={key.apiKey} />
                        </Box>
                      ))
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

const OrganizationTable = ({
  organizations,
  total,
  page,
  limit,
  sortBy,
  sortOrder,
  isLoading,
  onPageChange,
  onLimitChange,
  onSortChange,
  onEdit,
  onDelete,
}: OrganizationTableProps) => {
  const columns = [
    { id: 'expand', label: '', sortable: false },
    { id: 'orgName', label: 'Name', sortable: true },
    { id: 'orgSlug', label: 'Slug', sortable: true },
    { id: 'orgType', label: 'Type', sortable: true },
    { id: 'orgApiKeys', label: 'API Keys', sortable: false },
    { id: 'createdAt', label: 'Created', sortable: true },
    { id: 'actions', label: 'Actions', sortable: false },
  ];

  return (
    <Paper variant="outlined" sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  sx={{
                    fontSize: 12,
                    fontWeight: 600,
                    py: 1,
                    width: col.id === 'expand' ? 40 : col.id === 'actions' ? 100 : undefined,
                  }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={sortBy === col.id}
                      direction={sortBy === col.id ? sortOrder : 'asc'}
                      onClick={() => onSortChange(col.id)}
                      sx={{ fontSize: 12 }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    Loading...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : organizations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No organizations found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org) => (
                <OrganizationRow key={org.id} org={org} onEdit={onEdit} onDelete={onDelete} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={total}
        page={page - 1}
        rowsPerPage={limit}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        onRowsPerPageChange={(e) => onLimitChange(parseInt(e.target.value, 10))}
        sx={{
          '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
            fontSize: 12,
          },
        }}
      />
    </Paper>
  );
};

export default OrganizationTable;
