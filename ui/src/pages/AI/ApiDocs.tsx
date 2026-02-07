import { Box, Typography } from "@mui/material";
import { PageBreadcrumb } from "../../components/common";
import { useOrg } from "../../context/OrgContext";
import ApiDocsViewer from "../../components/common/ApiDocsViewer";
import { EndpointDefinition } from "../../components/common/ApiDocsViewer/types";

const AIApiDocs = () => {
  const { selectedOrg, selectedApiKey } = useOrg();
  const apiKey = selectedApiKey?.apiKey || "YOUR_API_KEY";
  const orgId = selectedOrg?.id || "ORG_ID";

  if (!selectedOrg) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">No organization selected</Typography>
      </Box>
    );
  }

  const endpoints: EndpointDefinition[] = [
    // AI Companies
    {
      method: "GET",
      path: `/api/organizations/${orgId}/ai/companies`,
      description: "Get all configured AI companies.",
      body: null,
      response: JSON.stringify(
        {
          data: [
            {
              id: "comp_123",
              name: "OpenAI Production",
              provider: "openai",
              defaultModel: "gpt-4",
              availableModels: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
              isActive: true,
            },
          ],
          pagination: { page: 1, limit: 10, total: 1 },
        },
        null,
        2,
      ),
    },
    {
      method: "POST",
      path: `/api/organizations/${orgId}/ai/companies`,
      description:
        "Add a new AI provider configuration. Supported providers: openai, gemini, anthropic, custom.",
      body: JSON.stringify(
        {
          name: "OpenAI Production",
          provider: "openai",
          apiKey: "sk-...",
          defaultModel: "gpt-4",
        },
        null,
        2,
      ),
      response: JSON.stringify(
        {
          id: "comp_123",
          name: "OpenAI Production",
          provider: "openai",
          availableModels: ["gpt-4", "gpt-4-turbo"],
          isActive: true,
        },
        null,
        2,
      ),
    },
    {
      method: "PATCH",
      path: `/api/organizations/${orgId}/ai/companies/{companyId}`,
      description: "Update an AI company configuration.",
      body: JSON.stringify(
        { name: "OpenAI Updated", defaultModel: "gpt-4-turbo", isActive: true },
        null,
        2,
      ),
      response: JSON.stringify(
        {
          id: "comp_123",
          name: "OpenAI Updated",
          defaultModel: "gpt-4-turbo",
          isActive: true,
        },
        null,
        2,
      ),
    },
    {
      method: "DELETE",
      path: `/api/organizations/${orgId}/ai/companies/{companyId}`,
      description: "Delete an AI company configuration.",
      body: null,
      response: JSON.stringify({ message: "Company deleted" }, null, 2),
    },
    // AI Chats
    {
      method: "GET",
      path: `/api/organizations/${orgId}/ai/chats`,
      description: "List all chat sessions with message counts.",
      body: null,
      response: JSON.stringify(
        {
          data: [
            {
              id: "chat_123",
              title: "My Chat",
              model: "gpt-4",
              messageCount: 5,
              totalTokens: 1500,
              company: { name: "OpenAI", provider: "openai" },
            },
          ],
          pagination: { page: 1, limit: 10, total: 1 },
        },
        null,
        2,
      ),
    },
    {
      method: "POST",
      path: `/api/organizations/${orgId}/ai/chats`,
      description: "Start a new chat session with an AI company.",
      body: JSON.stringify(
        {
          companyId: "comp_123",
          title: "My Chat",
          model: "gpt-4",
          maxHistoryMessages: 50,
          systemPrompt: "You are a helpful assistant.",
        },
        null,
        2,
      ),
      response: JSON.stringify(
        {
          id: "chat_123",
          title: "My Chat",
          model: "gpt-4",
          totalTokens: 0,
          messages: [],
        },
        null,
        2,
      ),
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/ai/chats/{chatId}`,
      description: "Retrieve a chat including all messages and token counts.",
      body: null,
      response: JSON.stringify(
        {
          id: "chat_123",
          title: "My Chat",
          model: "gpt-4",
          messages: [
            {
              role: "user",
              content: "Hello",
              timestamp: "2024-01-01T12:00:00Z",
              tokenCount: 5,
            },
          ],
          totalTokens: 500,
        },
        null,
        2,
      ),
    },
    {
      method: "POST",
      path: `/api/organizations/${orgId}/ai/chats/{chatId}/message`,
      description:
        "Send a message and receive an AI response. The user message is added first, then the AI provider is called for a response.",
      body: JSON.stringify(
        { message: "Hello, how can you help me today?" },
        null,
        2,
      ),
      response: JSON.stringify(
        {
          userMessage: { role: "user", content: "Hello", tokenCount: 5 },
          assistantMessage: {
            role: "assistant",
            content: "Hi there! I can help you with various tasks...",
            tokenCount: 25,
          },
        },
        null,
        2,
      ),
    },
    {
      method: "PATCH",
      path: `/api/organizations/${orgId}/ai/chats/{chatId}`,
      description: "Update chat settings like title or max history messages.",
      body: JSON.stringify(
        { title: "Updated Chat Title", maxHistoryMessages: 100 },
        null,
        2,
      ),
      response: JSON.stringify(
        {
          id: "chat_123",
          title: "Updated Chat Title",
          maxHistoryMessages: 100,
        },
        null,
        2,
      ),
    },
    {
      method: "DELETE",
      path: `/api/organizations/${orgId}/ai/chats/{chatId}`,
      description: "Delete a chat and all its messages.",
      body: null,
      response: JSON.stringify({ message: "Chat deleted" }, null, 2),
    },
    {
      method: "GET",
      path: `/api/organizations/${orgId}/ai/chats/stats`,
      description: "Get aggregate statistics for all chats.",
      body: null,
      response: JSON.stringify(
        { totalChats: 10, totalMessages: 100, totalTokens: 5000 },
        null,
        2,
      ),
    },
  ];

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
          { label: "API Docs" },
        ]}
      />
      <Typography variant="h5" sx={{ fontWeight: 600, fontSize: 18, mb: 2 }}>
        AI Services API Documentation
      </Typography>
      <ApiDocsViewer
        title="AI Services API"
        subtitle="Integrate AI providers and manage chat conversations"
        baseUrl="http://localhost:4004"
        apiKey={apiKey}
        orgId={orgId}
        endpoints={endpoints}
        tabLabels={["Companies", "Chats"]}
      />
    </Box>
  );
};

export default AIApiDocs;
