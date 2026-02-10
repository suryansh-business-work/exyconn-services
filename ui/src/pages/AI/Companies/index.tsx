import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  IconButton,
  Tooltip,
  Chip,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Switch,
} from "@mui/material";
import { Add, Delete, Edit, Refresh } from "@mui/icons-material";
import { PageBreadcrumb } from "../../../components/common";
import { useOrg } from "../../../context/OrgContext";
import { aiCompanyApi } from "../../../api/aiApi";
import { AICompany } from "../../../types/ai";
import AICompanyDialog from "./AICompanyDialog";

const AICompaniesPage = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const [companies, setCompanies] = useState<AICompany[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<AICompany | null>(null);

  const fetchCompanies = async () => {
    if (!selectedOrg) return;
    setLoading(true);
    try {
      const result = await aiCompanyApi.list(
        selectedOrg.id,
        { page: page + 1, limit: rowsPerPage },
        selectedApiKey?.apiKey,
      );
      setCompanies(result.data);
      setTotal(result.pagination.total);
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrg, selectedApiKey, page, rowsPerPage]);

  const handleDelete = async (companyId: string) => {
    if (!selectedOrg || !confirm("Delete this AI company?")) return;
    try {
      await aiCompanyApi.delete(
        selectedOrg.id,
        companyId,
        selectedApiKey?.apiKey,
      );
      fetchCompanies();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleToggleActive = async (company: AICompany) => {
    if (!selectedOrg) return;
    try {
      await aiCompanyApi.update(
        selectedOrg.id,
        company.id,
        { isActive: !company.isActive },
        selectedApiKey?.apiKey,
      );
      fetchCompanies();
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const getProviderColor = (provider: string) => {
    if (provider === "openai") return "success";
    if (provider === "gemini") return "primary";
    if (provider === "anthropic") return "warning";
    return "default";
  };

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  const basePath = selectedApiKey
    ? `/organization/${selectedOrg.id}/apikey/${selectedApiKey.apiKey}`
    : `/organization/${selectedOrg.id}`;

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/dashboard" },
          { label: selectedOrg.orgName, href: basePath },
          { label: "AI", href: `${basePath}/service/ai/dashboard` },
          { label: "Companies" },
        ]}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18 }}>
          AI Companies
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={fetchCompanies}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => {
              setEditingCompany(null);
              setDialogOpen(true);
            }}
          >
            Add Company
          </Button>
        </Box>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Provider</TableCell>
                <TableCell>API Key</TableCell>
                <TableCell>Default Model</TableCell>
                <TableCell align="center">Active</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography color="text.secondary">
                      No companies found
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {company.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={company.provider}
                        size="small"
                        color={getProviderColor(company.provider)}
                        sx={{ textTransform: "capitalize", fontSize: 10 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", fontSize: 11 }}
                      >
                        {company.apiKey}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: 12 }}>
                        {company.defaultModel || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        size="small"
                        checked={company.isActive}
                        onChange={() => handleToggleActive(company)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingCompany(company);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(company.id)}
                        >
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
          onPageChange={(_, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      <AICompanyDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        company={editingCompany}
        onSaved={fetchCompanies}
      />
    </Box>
  );
};

export default AICompaniesPage;
