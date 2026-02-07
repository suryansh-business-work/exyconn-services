import { Box, Typography, Paper, Chip } from "@mui/material";
import { Spinner } from "../../../components/common";
import { EmailTemplate } from "../../../types/email";

interface EmailPreviewProps {
  selectedTemplate: EmailTemplate | null;
  previewHtml: string;
  previewLoading: boolean;
}

const EmailPreview = ({
  selectedTemplate,
  previewHtml,
  previewLoading,
}: EmailPreviewProps) => {
  return (
    <Paper sx={{ p: 2, height: "100%", minHeight: 500 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="subtitle2">Template Preview</Typography>
          {previewLoading && <Spinner size={16} />}
        </Box>
        {selectedTemplate && (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {selectedTemplate.variables.slice(0, 3).map((v) => (
              <Chip
                key={v.name}
                label={`{{${v.name}}}`}
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </Box>
      <Box
        sx={{
          bgcolor: "grey.50",
          borderRadius: 1,
          height: "calc(100% - 40px)",
          overflow: "hidden",
        }}
      >
        {previewHtml ? (
          <iframe
            srcDoc={previewHtml}
            style={{ width: "100%", height: "100%", border: "none" }}
            title="Email Preview"
          />
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "text.secondary",
            }}
          >
            <Typography>Select a template to see preview</Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default EmailPreview;
