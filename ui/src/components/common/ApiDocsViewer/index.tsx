import { useState } from "react";
import { Box, Typography, Paper, Tabs, Tab, Chip, Alert } from "@mui/material";
import { Api, Key } from "@mui/icons-material";
import LanguageSelector from "./LanguageSelector";
import EndpointCard from "./EndpointCard";
import CodeViewer from "./CodeViewer";
import { generateCodeExample } from "./codeGenerators";
import { ApiDocsViewerProps, CodeLanguage } from "./types";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = ({ children, value, index }: TabPanelProps) => (
  <Box hidden={value !== index} sx={{ pt: 2 }}>
    {value === index && children}
  </Box>
);

const ApiDocsViewer = ({
  title,
  subtitle,
  baseUrl,
  apiKey,
  orgId,
  endpoints,
  tabLabels,
}: ApiDocsViewerProps) => {
  const [tabValue, setTabValue] = useState(0);
  const [codeLanguage, setCodeLanguage] = useState<CodeLanguage>("curl");

  const handleGenerateCode = (endpoint: (typeof endpoints)[0]) => {
    return generateCodeExample(endpoint, codeLanguage, baseUrl, apiKey);
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2,
            bgcolor: "primary.main",
            color: "white",
          }}
        >
          <Api sx={{ fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Box>

      {/* API Key Info */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Key fontSize="small" color="primary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            API Authentication
          </Typography>
        </Box>
        {apiKey && apiKey !== "YOUR_API_KEY" ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Chip label="Active" color="success" size="small" />
            <Typography
              variant="body2"
              sx={{ fontFamily: "monospace", color: "text.secondary" }}
            >
              {apiKey.substring(0, 20)}...
            </Typography>
          </Box>
        ) : (
          <Alert severity="warning" sx={{ mt: 1 }}>
            No API key selected. Please select an API key from the header
            dropdown.
          </Alert>
        )}
      </Paper>

      {/* Authentication Example */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
          Authentication Header
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Include your API key in the{" "}
          <code
            style={{
              background: "#f5f5f5",
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            X-API-Key
          </code>{" "}
          header:
        </Typography>
        <CodeViewer
          code={`curl -X POST "${baseUrl}/organizations/${orgId}/..." \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${apiKey}"`}
          language="bash"
        />
      </Paper>

      {/* Language Selector */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <LanguageSelector value={codeLanguage} onChange={setCodeLanguage} />
      </Paper>

      {/* Endpoints */}
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          API Endpoints
        </Typography>

        <Tabs
          value={tabValue}
          onChange={(_, v) => setTabValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
        >
          {tabLabels.map((label, index) => (
            <Tab
              key={index}
              label={label}
              sx={{ textTransform: "none", fontWeight: 500 }}
            />
          ))}
        </Tabs>

        {endpoints.map((endpoint, index) => (
          <TabPanel key={endpoint.path} value={tabValue} index={index}>
            <EndpointCard
              endpoint={endpoint}
              baseUrl={baseUrl}
              codeLanguage={codeLanguage}
              generateCodeExample={handleGenerateCode}
            />
          </TabPanel>
        ))}
      </Paper>
    </Box>
  );
};

export default ApiDocsViewer;
export { CodeViewer, EndpointCard, LanguageSelector };
// eslint-disable-next-line react-refresh/only-export-components
export * from "./types";
// eslint-disable-next-line react-refresh/only-export-components
export { generateCodeExample } from "./codeGenerators";
