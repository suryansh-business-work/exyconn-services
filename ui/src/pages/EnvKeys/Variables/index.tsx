import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
} from "@mui/material";
import {
  Add,
  ArrowBack,
  Delete,
  Edit,
  Visibility,
  VisibilityOff,
  Refresh,
} from "@mui/icons-material";
import { PageBreadcrumb } from "../../../components/common";
import { useOrg } from "../../../context/OrgContext";
import { envAppApi, envVariableApi } from "../../../api/envKeysApi";
import { EnvApp, EnvVariable } from "../../../types/envKeys";
import EnvVariableDialog from "./EnvVariableDialog";

const EnvVariablesPage = () => {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const { selectedOrg, selectedApiKey } = useOrg();
  const [app, setApp] = useState<EnvApp | null>(null);
  const [variables, setVariables] = useState<EnvVariable[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVariable, setEditingVariable] = useState<EnvVariable | null>(
    null,
  );
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());

  const fetchData = async () => {
    if (!selectedOrg || !appId) return;
    setLoading(true);
    try {
      const [appData, varResult] = await Promise.all([
        envAppApi.get(selectedOrg.id, appId, selectedApiKey?.apiKey),
        envVariableApi.list(
          selectedOrg.id,
          appId,
          { page: page + 1, limit: rowsPerPage },
          selectedApiKey?.apiKey,
        ),
      ]);
      setApp(appData);
      setVariables(varResult.data);
      setTotal(varResult.pagination.total);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedOrg, selectedApiKey, appId, page, rowsPerPage]);

  const handleDelete = async (variableId: string) => {
    if (!selectedOrg || !appId || !confirm("Delete this variable?")) return;
    try {
      await envVariableApi.delete(
        selectedOrg.id,
        appId,
        variableId,
        selectedApiKey?.apiKey,
      );
      fetchData();
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleReveal = async (variableId: string) => {
    if (!selectedOrg || !appId) return;
    if (revealedIds.has(variableId)) {
      setRevealedIds((prev) => {
        const next = new Set(prev);
        next.delete(variableId);
        return next;
      });
      return;
    }
    try {
      const actualValue = await envVariableApi.getActualValue(
        selectedOrg.id,
        appId,
        variableId,
        selectedApiKey?.apiKey,
      );
      setVariables((prev) =>
        prev.map((v) =>
          v.id === variableId ? { ...v, value: actualValue } : v,
        ),
      );
      setRevealedIds((prev) => new Set(prev).add(variableId));
    } catch (err) {
      console.error("Reveal failed:", err);
    }
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
          {
            label: "Environment Keys",
            href: `${basePath}/service/env-keys/dashboard`,
          },
          {
            label: "Applications",
            href: `${basePath}/service/env-keys/applications`,
          },
          { label: app?.name || "Variables" },
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() =>
              navigate(`${basePath}/service/env-keys/applications`)
            }
          >
            <ArrowBack fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18 }}>
              {app?.name || "Variables"}
            </Typography>
            {app && (
              <Chip
                label={app.environment}
                size="small"
                color={
                  app.environment === "production"
                    ? "error"
                    : app.environment === "staging"
                      ? "warning"
                      : "info"
                }
                sx={{ fontSize: 10, mt: 0.5 }}
              />
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Refresh />}
            onClick={fetchData}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => {
              setEditingVariable(null);
              setDialogOpen(true);
            }}
          >
            Add Variable
          </Button>
        </Box>
      </Box>

      <Paper variant="outlined">
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Key</TableCell>
                <TableCell>Value</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="center">Secret</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : variables.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography color="text.secondary">
                      No variables defined
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                variables.map((variable) => (
                  <TableRow key={variable.id} hover>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: 600,
                          fontSize: 12,
                        }}
                      >
                        {variable.key}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontFamily: "monospace",
                            fontSize: 11,
                            maxWidth: 200,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {variable.value}
                        </Typography>
                        {variable.isSecret && (
                          <IconButton
                            size="small"
                            onClick={() => handleReveal(variable.id)}
                          >
                            {revealedIds.has(variable.id) ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: 11 }}
                      >
                        {variable.description || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {variable.isSecret && (
                        <Chip
                          label="Secret"
                          size="small"
                          color="warning"
                          sx={{ fontSize: 10 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setEditingVariable(variable);
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
                          onClick={() => handleDelete(variable.id)}
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
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {appId && (
        <EnvVariableDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          appId={appId}
          variable={editingVariable}
          onSaved={fetchData}
        />
      )}
    </Box>
  );
};

export default EnvVariablesPage;
