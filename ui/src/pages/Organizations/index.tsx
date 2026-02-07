import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { Add, Search } from "@mui/icons-material";
import { PageBreadcrumb, ActionButton } from "../../components/common";
import OrganizationTable from "./OrganizationTable";
import OrganizationFormDialog from "./OrganizationFormDialog";
import { organizationApi } from "../../api/organizationApi";
import { Organization, OrganizationFormValues } from "../../types/organization";

interface OrganizationsPageProps {
  onOrgCreated?: () => Promise<void>;
}

const OrganizationsPage = ({ onOrgCreated }: OrganizationsPageProps) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [orgTypeFilter, setOrgTypeFilter] = useState<
    "" | "Service" | "Product"
  >("");
  const [isLoading, setIsLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchOrganizations = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number> = {
        page,
        limit,
        sortBy,
        sortOrder,
      };
      if (search) params.search = search;
      if (orgTypeFilter) params.orgType = orgTypeFilter;
      const response = await organizationApi.list(params);
      setOrganizations(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error("Failed to fetch organizations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, search, sortBy, sortOrder, orgTypeFilter]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const handleCreate = () => {
    setSelectedOrg(null);
    setFormOpen(true);
  };

  const handleEdit = (org: Organization) => {
    setSelectedOrg(org);
    setFormOpen(true);
  };

  const handleFormSubmit = async (values: OrganizationFormValues) => {
    setIsSaving(true);
    try {
      if (selectedOrg) {
        await organizationApi.update(selectedOrg.id, values);
      } else {
        await organizationApi.create(values);
        // Notify parent that org was created (for header dropdown refresh)
        await onOrgCreated?.();
      }
      setFormOpen(false);
      fetchOrganizations();
    } catch (error) {
      console.error("Failed to save organization:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (org: Organization) => {
    setOrgToDelete(org);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!orgToDelete) return;
    setIsDeleting(true);
    try {
      await organizationApi.delete(orgToDelete.id);
      setDeleteDialogOpen(false);
      setOrgToDelete(null);
      fetchOrganizations();
      await onOrgCreated?.();
    } catch (error) {
      console.error("Failed to delete organization:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  return (
    <Box>
      <PageBreadcrumb
        items={[
          { label: "Home", href: "/welcome" },
          { label: "Manage Organizations" },
        ]}
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18 }}>
          Manage Organizations
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={handleCreate}
        >
          Create Organization
        </Button>
      </Box>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18 }} />
                </InputAdornment>
              ),
              sx: { fontSize: 12 },
            }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel sx={{ fontSize: 12 }}>Type</InputLabel>
            <Select
              value={orgTypeFilter}
              label="Type"
              onChange={(e) => {
                setOrgTypeFilter(e.target.value as "" | "Service" | "Product");
                setPage(1);
              }}
              sx={{ fontSize: 12 }}
            >
              <MenuItem value="" sx={{ fontSize: 12 }}>
                All
              </MenuItem>
              <MenuItem value="Service" sx={{ fontSize: 12 }}>
                Service
              </MenuItem>
              <MenuItem value="Product" sx={{ fontSize: 12 }}>
                Product
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      <OrganizationTable
        organizations={organizations}
        total={total}
        page={page}
        limit={limit}
        sortBy={sortBy}
        sortOrder={sortOrder}
        isLoading={isLoading}
        onPageChange={setPage}
        onLimitChange={(val) => {
          setLimit(val);
          setPage(1);
        }}
        onSortChange={handleSortChange}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <OrganizationFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleFormSubmit}
        organization={selectedOrg}
        isLoading={isSaving}
      />
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle sx={{ fontSize: 16 }}>Delete Organization</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ fontSize: 13 }}>
            Are you sure you want to delete "{orgToDelete?.orgName}"? This
            action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            size="small"
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <ActionButton
            size="small"
            color="error"
            variant="contained"
            onClick={confirmDelete}
            loading={isDeleting}
            loadingText="Deleting..."
          >
            Delete
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OrganizationsPage;
