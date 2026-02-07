import axios from "axios";
import {
  SmtpConfig,
  SmtpConfigFormValues,
  SmtpConfigListResponse,
  EmailTemplate,
  EmailTemplateFormValues,
  EmailTemplateListResponse,
  TemplatePreviewResult,
  SendEmailInput,
  SendEmailResult,
  TestSmtpResult,
  EmailLog,
  EmailLogListResponse,
  EmailStats,
} from "../types/email";
import { API_BASE } from "./config";

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// SMTP Configuration API
export const smtpConfigApi = {
  list: async (
    orgId: string,
    params: ListParams = {},
  ): Promise<SmtpConfigListResponse> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/email/smtp`,
      { params },
    );
    return response.data;
  },

  getById: async (orgId: string, configId: string): Promise<SmtpConfig> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/email/smtp/${configId}`,
    );
    return response.data;
  },

  getDefault: async (orgId: string): Promise<SmtpConfig> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/email/smtp/default`,
    );
    return response.data;
  },

  create: async (
    orgId: string,
    data: SmtpConfigFormValues,
  ): Promise<SmtpConfig> => {
    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/email/smtp`,
      data,
    );
    return response.data;
  },

  update: async (
    orgId: string,
    configId: string,
    data: Partial<SmtpConfigFormValues>,
  ): Promise<SmtpConfig> => {
    const response = await axios.put(
      `${API_BASE}/organizations/${orgId}/email/smtp/${configId}`,
      data,
    );
    return response.data;
  },

  delete: async (orgId: string, configId: string): Promise<void> => {
    await axios.delete(
      `${API_BASE}/organizations/${orgId}/email/smtp/${configId}`,
    );
  },

  testConnection: async (
    orgId: string,
    configId: string,
  ): Promise<TestSmtpResult> => {
    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/email/test-smtp/${configId}`,
    );
    return response.data;
  },
};

// Email Template API
export const emailTemplateApi = {
  list: async (
    orgId: string,
    params: ListParams = {},
  ): Promise<EmailTemplateListResponse> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/email/templates`,
      {
        params,
      },
    );
    return response.data;
  },

  getById: async (
    orgId: string,
    templateId: string,
  ): Promise<EmailTemplate> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/email/templates/${templateId}`,
    );
    return response.data;
  },

  create: async (
    orgId: string,
    data: EmailTemplateFormValues,
  ): Promise<EmailTemplate> => {
    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/email/templates`,
      data,
    );
    return response.data;
  },

  update: async (
    orgId: string,
    templateId: string,
    data: Partial<EmailTemplateFormValues>,
  ): Promise<EmailTemplate> => {
    const response = await axios.put(
      `${API_BASE}/organizations/${orgId}/email/templates/${templateId}`,
      data,
    );
    return response.data;
  },

  delete: async (orgId: string, templateId: string): Promise<void> => {
    await axios.delete(
      `${API_BASE}/organizations/${orgId}/email/templates/${templateId}`,
    );
  },

  preview: async (
    orgId: string,
    mjmlContent: string,
    variables?: Record<string, string>,
  ): Promise<TemplatePreviewResult> => {
    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/email/templates/preview`,
      {
        mjmlContent,
        variables,
      },
    );
    return response.data;
  },
};

// Email Send API
export const emailSendApi = {
  send: async (
    orgId: string,
    data: SendEmailInput,
  ): Promise<SendEmailResult> => {
    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/email/send`,
      data,
    );
    return response.data;
  },
};

// Email Log API
export interface LogListParams {
  page?: number;
  limit?: number;
  status?: "sent" | "failed" | "pending";
  recipient?: string;
  startDate?: string;
  endDate?: string;
  apiKeyUsed?: string;
}

export interface EmailAnalytics {
  summary: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    successRate: string;
  };
  dailyStats: Array<{
    date: string;
    sent: number;
    failed: number;
    pending: number;
  }>;
  templateStats: Array<{
    templateId: string;
    templateName: string;
    count: number;
    sent: number;
    failed: number;
  }>;
}

export const emailLogApi = {
  list: async (
    orgId: string,
    params: LogListParams = {},
  ): Promise<EmailLogListResponse> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/email/logs`,
      { params },
    );
    return response.data;
  },

  getById: async (orgId: string, logId: string): Promise<EmailLog> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/email/logs/${logId}`,
    );
    return response.data;
  },

  getStats: async (orgId: string, apiKeyUsed?: string): Promise<EmailStats> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/email/logs/stats`,
      {
        params: { apiKeyUsed },
      },
    );
    return response.data;
  },

  getAnalytics: async (
    orgId: string,
    apiKeyUsed?: string,
  ): Promise<EmailAnalytics> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/email/logs/analytics`,
      {
        params: { apiKeyUsed },
      },
    );
    return response.data;
  },
};
