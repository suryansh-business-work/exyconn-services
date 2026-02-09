import axios from "axios";
import {
  ApiLog,
  ApiLogListResponse,
  ApiLogStats,
  ApiLogAnalytics,
  ApiLogSettings,
  ApiLogListParams,
  CreateApiLogInput,
  ApiLogSettingsFormValues,
} from "../types/apiLogs";
import { API_BASE } from "./config";

export const apiLogsApi = {
  list: async (
    orgId: string,
    params: ApiLogListParams = {},
  ): Promise<ApiLogListResponse> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/logs`,
      { params },
    );
    return response.data;
  },

  getById: async (orgId: string, logId: string): Promise<ApiLog> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/logs/${logId}`,
    );
    return response.data;
  },

  create: async (
    orgId: string,
    data: CreateApiLogInput,
  ): Promise<ApiLog> => {
    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/logs`,
      data,
    );
    return response.data;
  },

  createBatch: async (
    orgId: string,
    logs: CreateApiLogInput[],
  ): Promise<{ inserted: number }> => {
    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/logs/batch`,
      { logs },
    );
    return response.data;
  },

  delete: async (
    orgId: string,
    params: { level?: string; before?: string; source?: string },
  ): Promise<{ deleted: number }> => {
    const response = await axios.delete(
      `${API_BASE}/organizations/${orgId}/logs`,
      { params },
    );
    return response.data;
  },

  getStats: async (orgId: string): Promise<ApiLogStats> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/logs/stats`,
    );
    return response.data;
  },

  getAnalytics: async (
    orgId: string,
    days?: number,
  ): Promise<ApiLogAnalytics> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/logs/analytics`,
      { params: { days } },
    );
    return response.data;
  },

  getSettings: async (orgId: string): Promise<ApiLogSettings> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/logs/settings`,
    );
    return response.data;
  },

  updateSettings: async (
    orgId: string,
    data: Partial<ApiLogSettingsFormValues>,
  ): Promise<ApiLogSettings> => {
    const response = await axios.put(
      `${API_BASE}/organizations/${orgId}/logs/settings`,
      data,
    );
    return response.data;
  },
};
