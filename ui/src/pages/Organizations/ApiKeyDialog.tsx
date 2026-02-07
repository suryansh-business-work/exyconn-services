import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Typography,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Box,
  Tooltip,
  Alert,
} from "@mui/material";
import { Close, Add, ContentCopy, Delete } from "@mui/icons-material";
import { useFormik } from "formik";
import { apiKeyValidationSchema } from "../../validation/organizationSchema";
import { Organization, ApiKey } from "../../types/organization";

interface ApiKeyDialogProps {
  open: boolean;
  onClose: () => void;
  organization: Organization | null;
  onAddKey: (keyName: string) => Promise<ApiKey>;
  onRemoveKey: (apiKey: string) => Promise<void>;
}

const ApiKeyDialog = ({
  open,
  onClose,
  organization,
  onAddKey,
  onRemoveKey,
}: ApiKeyDialogProps) => {
  const [newKey, setNewKey] = useState<ApiKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: { keyName: "" },
    validationSchema: apiKeyValidationSchema,
    onSubmit: async (values, { resetForm }) => {
      setIsLoading(true);
      try {
        const key = await onAddKey(values.keyName);
        setNewKey(key);
        resetForm();
      } finally {
        setIsLoading(false);
      }
    },
  });

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleRemove = async (apiKey: string) => {
    setIsLoading(true);
    try {
      await onRemoveKey(apiKey);
      if (newKey?.apiKey === apiKey) setNewKey(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewKey(null);
    formik.resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 1.5,
        }}
      >
        <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 600 }}>
          API Keys - {organization?.orgName}
        </Typography>
        <IconButton size="small" onClick={handleClose}>
          <Close fontSize="small" />
        </IconButton>
      </DialogTitle>
      <Divider />
      <DialogContent sx={{ py: 2 }}>
        {newKey && (
          <Alert
            severity="success"
            sx={{ mb: 2, fontSize: 12 }}
            onClose={() => setNewKey(null)}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12 }}>
              API Key Created!
            </Typography>
            <Typography variant="caption" sx={{ wordBreak: "break-all" }}>
              Save this key now. You won't be able to see it again:{" "}
              <strong>{newKey.apiKey}</strong>
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleCopy(newKey.apiKey)}
              sx={{ ml: 1 }}
            >
              <ContentCopy sx={{ fontSize: 14 }} />
            </IconButton>
          </Alert>
        )}
        <Box
          component="form"
          onSubmit={formik.handleSubmit}
          sx={{ display: "flex", gap: 1, mb: 2 }}
        >
          <TextField
            size="small"
            name="keyName"
            placeholder="New API Key Name"
            value={formik.values.keyName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.keyName && Boolean(formik.errors.keyName)}
            helperText={formik.touched.keyName && formik.errors.keyName}
            sx={{ flex: 1 }}
          />
          <Button
            type="submit"
            variant="contained"
            size="small"
            startIcon={<Add />}
            disabled={isLoading}
          >
            Add Key
          </Button>
        </Box>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>
                Key Name
              </TableCell>
              <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>
                API Key
              </TableCell>
              <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>
                Created
              </TableCell>
              <TableCell sx={{ fontSize: 12, fontWeight: 600, width: 80 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organization?.orgApiKeys?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  sx={{ textAlign: "center", py: 3, fontSize: 12 }}
                >
                  No API keys yet
                </TableCell>
              </TableRow>
            ) : (
              organization?.orgApiKeys?.map((key, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ fontSize: 12 }}>{key.keyName}</TableCell>
                  <TableCell sx={{ fontSize: 11, fontFamily: "monospace" }}>
                    {key.apiKey.slice(0, 20)}...
                    <Tooltip title="Copy">
                      <IconButton
                        size="small"
                        onClick={() => handleCopy(key.apiKey)}
                      >
                        <ContentCopy sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ fontSize: 11 }}>
                    {key.createdAt
                      ? new Date(key.createdAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemove(key.apiKey)}
                      disabled={isLoading}
                    >
                      <Delete sx={{ fontSize: 16 }} />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ px: 3, py: 1.5 }}>
        <Button onClick={handleClose} size="small">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ApiKeyDialog;
