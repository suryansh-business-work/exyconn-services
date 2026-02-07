// AI Provider types
export type AIProvider = "openai" | "gemini" | "anthropic" | "custom";

// AI Company
export interface AICompany {
  id: string;
  organizationId: string;
  name: string;
  provider: AIProvider;
  apiKey: string; // Masked
  apiSecret?: string; // Masked
  baseUrl?: string;
  defaultModel?: string;
  availableModels: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Chat Message
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  tokenCount?: number;
}

// AI Chat
export interface AIChat {
  id: string;
  organizationId: string;
  companyId: string;
  company?: { name: string; provider: AIProvider };
  title: string;
  model: string;
  messages: ChatMessage[];
  totalTokens: number;
  maxHistoryMessages: number;
  createdAt: string;
  updatedAt: string;
}

// Input types
export interface CreateAICompanyInput {
  name: string;
  provider: AIProvider;
  apiKey: string;
  apiSecret?: string;
  baseUrl?: string;
  defaultModel?: string;
}

export interface UpdateAICompanyInput {
  name?: string;
  provider?: AIProvider;
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  defaultModel?: string;
  isActive?: boolean;
}

export interface CreateAIChatInput {
  companyId: string;
  title: string;
  model: string;
  maxHistoryMessages?: number;
  systemPrompt?: string;
}

export interface UpdateAIChatInput {
  title?: string;
  maxHistoryMessages?: number;
}

// Stats
export interface AICompanyStats {
  totalCompanies: number;
  activeCompanies: number;
  byProvider: Record<string, number>;
}

export interface AIChatStats {
  totalChats: number;
  totalMessages: number;
  totalTokens: number;
}

// List params
export interface AICompanyListParams {
  page?: number;
  limit?: number;
  provider?: AIProvider;
}

export interface AIChatListParams {
  page?: number;
  limit?: number;
  companyId?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
