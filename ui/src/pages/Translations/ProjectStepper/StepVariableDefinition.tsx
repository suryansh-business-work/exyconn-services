import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Paper,
} from "@mui/material";
import { Add, DataObject } from "@mui/icons-material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useOrg } from "../../../context/OrgContext";
import { translationApi } from "../../../api/translationsApi";
import { TranslationEntry, Section } from "../../../types/translationsTheme";
import VariableTable from "./VariableTable";
import AddVariableDialog from "./AddVariableDialog";

interface StepVariableDefinitionProps {
  projectId: string;
  onVariablesChange: (count: number) => void;
}

const variableSchema = Yup.object({
  section: Yup.string().required("Section is required"),
  key: Yup.string().required("Key is required").max(200)
    .matches(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores"),
  defaultValue: Yup.string().max(5000).default(""),
  description: Yup.string().max(500).default(""),
});

const StepVariableDefinition = ({ projectId, onVariablesChange }: StepVariableDefinitionProps) => {
  const { selectedOrg } = useOrg();
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [entries, setEntries] = useState<TranslationEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [total, setTotal] = useState(0);

  const fetchSections = useCallback(async () => {
    if (!selectedOrg) return;
    try {
      const res = await translationApi.getSections(selectedOrg.id, projectId);
      setSections(res.sections);
      if (res.sections.length > 0 && !selectedSection) setSelectedSection(res.sections[0].slug);
    } catch { /* ignore */ }
  }, [selectedOrg, projectId]);

  const fetchEntries = useCallback(async () => {
    if (!selectedOrg || !selectedSection) return;
    setLoading(true);
    try {
      const res = await translationApi.list(selectedOrg.id, projectId, {
        page: page + 1, limit: rowsPerPage, section: selectedSection,
      });
      setEntries(res.data);
      setTotal(res.pagination.total);
      onVariablesChange(res.pagination.total);
    } catch {
      setError("Failed to load variables");
    } finally {
      setLoading(false);
    }
  }, [selectedOrg, projectId, selectedSection, page, rowsPerPage, onVariablesChange]);

  useEffect(() => { fetchSections(); }, [fetchSections]);
  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  const formik = useFormik({
    initialValues: { section: selectedSection, key: "", defaultValue: "", description: "" },
    enableReinitialize: true,
    validationSchema: variableSchema,
    onSubmit: async (values, { resetForm }) => {
      if (!selectedOrg) return;
      try {
        await translationApi.upsert(selectedOrg.id, projectId, {
          section: values.section, key: values.key, values: {},
          defaultValue: values.defaultValue || undefined,
          description: values.description || undefined,
        });
        resetForm();
        setDialogOpen(false);
        await fetchEntries();
      } catch {
        setError("Failed to add variable");
      }
    },
  });

  const handleDelete = async (entryId: string) => {
    if (!selectedOrg) return;
    try {
      await translationApi.delete(selectedOrg.id, projectId, entryId);
      await fetchEntries();
    } catch {
      setError("Failed to delete variable");
    }
  };

  const handleDefaultValueBlur = async (entry: TranslationEntry, newDefault: string) => {
    if (!selectedOrg || newDefault === (entry.defaultValue || "")) return;
    try {
      await translationApi.upsert(selectedOrg.id, projectId, {
        section: entry.section, key: entry.key, values: entry.values,
        defaultValue: newDefault, description: entry.description,
      });
      await fetchEntries();
    } catch {
      setError("Failed to update default value");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
        <DataObject color="primary" />
        <Typography variant="h6">Section Variables</Typography>
        <Chip label={`${total} variables`} color="primary" size="small" sx={{ ml: 1 }} />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Define translation keys with default values. Use <code>{"${variable_name}"}</code> for dynamic content.
      </Typography>
      <Paper variant="outlined" sx={{ p: 1.5, mb: 2, bgcolor: "action.hover" }}>
        <Typography variant="caption" color="text.secondary">
          Example: <code>The price of this product is {"${product_price}"}</code> — dynamic variables get replaced at runtime.
        </Typography>
      </Paper>
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>{error}</Alert>}
      <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {sections.map((s) => (
            <Chip key={s.slug} label={`${s.name} (${s.variableCount ?? 0})`} size="small"
              variant={selectedSection === s.slug ? "filled" : "outlined"}
              color={selectedSection === s.slug ? "primary" : "default"}
              onClick={() => { setSelectedSection(s.slug); setPage(0); }} />
          ))}
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Button variant="outlined" startIcon={<Add />} size="small"
          onClick={() => { formik.resetForm(); setDialogOpen(true); }}>
          Add Variable
        </Button>
      </Box>
      {loading && entries.length === 0 ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>
      ) : entries.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <DataObject sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography color="text.secondary">No variables in this section. Add a variable to define translation keys.</Typography>
        </Paper>
      ) : (
        <VariableTable entries={entries} onDelete={handleDelete} onDefaultBlur={handleDefaultValueBlur}
          page={page} rowsPerPage={rowsPerPage} total={total}
          onPageChange={setPage} onRowsPerPageChange={(r) => { setRowsPerPage(r); setPage(0); }} />
      )}
      <AddVariableDialog open={dialogOpen} onClose={() => setDialogOpen(false)}
        formik={formik} sections={sections} />
    </Box>
  );
};

export default StepVariableDefinition;
