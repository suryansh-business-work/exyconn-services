import {
  AICompany,
  AIChat,
  CreateAICompanyInput,
  UpdateAICompanyInput,
  CreateAIChatInput,
  UpdateAIChatInput,
  AICompanyStats,
  AIChatStats,
  AICompanyListParams,
  AIChatListParams,
  PaginatedResponse,
  ChatMessage,
} from "../types/ai";
import { API_BASE, getHeaders } from "./config";

// AI Companies API
export const aiCompanyApi = {
  list: async (
    orgId: string,
    params: AICompanyListParams = {},
    apiKey?: string,
  ): Promise<PaginatedResponse<AICompany>> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.provider) query.set("provider", params.provider);

    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/ai/companies?${query}`,
      {
        headers: getHeaders(apiKey),
      },
    );
    if (!res.ok) throw new Error("Failed to list companies");
    return res.json();
  },

  get: async (
    orgId: string,
    companyId: string,
    apiKey?: string,
  ): Promise<AICompany> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/ai/companies/${companyId}`,
      {
        headers: getHeaders(apiKey),
      },
    );
    if (!res.ok) throw new Error("Failed to get company");
    return res.json();
  },

  create: async (
    orgId: string,
    data: CreateAICompanyInput,
    apiKey?: string,
  ): Promise<AICompany> => {
    const res = await fetch(`${API_BASE}/organizations/${orgId}/ai/companies`, {
      method: "POST",
      headers: getHeaders(apiKey),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create company");
    return res.json();
  },

  update: async (
    orgId: string,
    companyId: string,
    data: UpdateAICompanyInput,
    apiKey?: string,
  ): Promise<AICompany> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/ai/companies/${companyId}`,
      {
        method: "PATCH",
        headers: getHeaders(apiKey),
        body: JSON.stringify(data),
      },
    );
    if (!res.ok) throw new Error("Failed to update company");
    return res.json();
  },

  delete: async (
    orgId: string,
    companyId: string,
    apiKey?: string,
  ): Promise<void> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/ai/companies/${companyId}`,
      {
        method: "DELETE",
        headers: getHeaders(apiKey),
      },
    );
    if (!res.ok) throw new Error("Failed to delete company");
  },

  getStats: async (orgId: string, apiKey?: string): Promise<AICompanyStats> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/ai/companies/stats`,
      {
        headers: getHeaders(apiKey),
      },
    );
    if (!res.ok) throw new Error("Failed to get stats");
    return res.json();
  },
};

// AI Chats API
export const aiChatApi = {
  list: async (
    orgId: string,
    params: AIChatListParams = {},
    apiKey?: string,
  ): Promise<PaginatedResponse<AIChat>> => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));
    if (params.companyId) query.set("companyId", params.companyId);

    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/ai/chats?${query}`,
      {
        headers: getHeaders(apiKey),
      },
    );
    if (!res.ok) throw new Error("Failed to list chats");
    return res.json();
  },

  get: async (
    orgId: string,
    chatId: string,
    apiKey?: string,
  ): Promise<AIChat> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/ai/chats/${chatId}`,
      {
        headers: getHeaders(apiKey),
      },
    );
    if (!res.ok) throw new Error("Failed to get chat");
    return res.json();
  },

  create: async (
    orgId: string,
    data: CreateAIChatInput,
    apiKey?: string,
  ): Promise<AIChat> => {
    const res = await fetch(`${API_BASE}/organizations/${orgId}/ai/chats`, {
      method: "POST",
      headers: getHeaders(apiKey),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create chat");
    return res.json();
  },

  update: async (
    orgId: string,
    chatId: string,
    data: UpdateAIChatInput,
    apiKey?: string,
  ): Promise<AIChat> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/ai/chats/${chatId}`,
      {
        method: "PATCH",
        headers: getHeaders(apiKey),
        body: JSON.stringify(data),
      },
    );
    if (!res.ok) throw new Error("Failed to update chat");
    return res.json();
  },

  delete: async (
    orgId: string,
    chatId: string,
    apiKey?: string,
  ): Promise<void> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/ai/chats/${chatId}`,
      {
        method: "DELETE",
        headers: getHeaders(apiKey),
      },
    );
    if (!res.ok) throw new Error("Failed to delete chat");
  },

  sendMessage: async (
    orgId: string,
    chatId: string,
    message: string,
    apiKey?: string,
  ): Promise<{ userMessage: ChatMessage; assistantMessage: ChatMessage }> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/ai/chats/${chatId}/message`,
      {
        method: "POST",
        headers: getHeaders(apiKey),
        body: JSON.stringify({ message }),
      },
    );
    if (!res.ok) throw new Error("Failed to send message");
    return res.json();
  },

  getStats: async (orgId: string, apiKey?: string): Promise<AIChatStats> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/ai/chats/stats`,
      {
        headers: getHeaders(apiKey),
      },
    );
    if (!res.ok) throw new Error("Failed to get stats");
    return res.json();
  },
};
