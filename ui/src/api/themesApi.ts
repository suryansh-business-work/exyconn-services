import axios from "axios";
import {
  ThemeProject,
  ThemeProjectListResponse,
  ThemeData,
  ThemeListResponse,
  ThemeListParams,
} from "../types/translationsTheme";
import { API_BASE } from "./config";

const base = (orgId: string) => `${API_BASE}/organizations/${orgId}/themes`;

// ==================== Theme Project API ====================

export const themeProjectApi = {
  list: async (orgId: string, page = 1, limit = 20, search?: string): Promise<ThemeProjectListResponse> => {
    const res = await axios.get(`${base(orgId)}/projects`, { params: { page, limit, search } });
    return res.data;
  },
  create: async (orgId: string, data: { name: string; description?: string }): Promise<ThemeProject> => {
    const res = await axios.post(`${base(orgId)}/projects`, data);
    return res.data;
  },
  update: async (orgId: string, projectId: string, data: { name?: string; description?: string }): Promise<ThemeProject> => {
    const res = await axios.put(`${base(orgId)}/projects/${projectId}`, data);
    return res.data;
  },
  delete: async (orgId: string, projectId: string): Promise<void> => {
    await axios.delete(`${base(orgId)}/projects/${projectId}`);
  },
};

// ==================== Theme API ====================

export const themeApi = {
  list: async (orgId: string, projectId: string, params: ThemeListParams = {}): Promise<ThemeListResponse> => {
    const res = await axios.get(`${base(orgId)}/projects/${projectId}/themes`, { params });
    return res.data;
  },
  get: async (orgId: string, projectId: string, themeId: string): Promise<ThemeData> => {
    const res = await axios.get(`${base(orgId)}/projects/${projectId}/themes/${themeId}`);
    return res.data;
  },
  create: async (orgId: string, projectId: string, data: Omit<ThemeData, "_id" | "organizationId" | "projectId" | "createdAt" | "updatedAt">): Promise<ThemeData> => {
    const res = await axios.post(`${base(orgId)}/projects/${projectId}/themes`, data);
    return res.data;
  },
  update: async (orgId: string, projectId: string, themeId: string, data: Partial<ThemeData>): Promise<ThemeData> => {
    const res = await axios.put(`${base(orgId)}/projects/${projectId}/themes/${themeId}`, data);
    return res.data;
  },
  duplicate: async (orgId: string, projectId: string, themeId: string): Promise<ThemeData> => {
    const res = await axios.post(`${base(orgId)}/projects/${projectId}/themes/${themeId}/duplicate`);
    return res.data;
  },
  delete: async (orgId: string, projectId: string, themeId: string): Promise<void> => {
    await axios.delete(`${base(orgId)}/projects/${projectId}/themes/${themeId}`);
  },
};
