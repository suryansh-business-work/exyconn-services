import axios from "axios";
import {
  TranslationProject,
  TranslationProjectListResponse,
  Locale,
  LocaleListResponse,
  LocaleFormValues,
  TranslationListResponse,
  TranslationListParams,
  TranslationUpsertInput,
  TranslationBulkInput,
  TranslationSectionsResponse,
  ThemeProject,
  ThemeProjectListResponse,
  ThemeData,
  ThemeListResponse,
  ThemeListParams,
} from "../types/translationsTheme";
import { API_BASE } from "./config";

const base = (orgId: string) => `${API_BASE}/organizations/${orgId}/translations-theme`;

// ==================== Translation Project API ====================

export const translationProjectApi = {
  list: async (orgId: string, page = 1, limit = 20, search?: string): Promise<TranslationProjectListResponse> => {
    const res = await axios.get(`${base(orgId)}/projects`, { params: { page, limit, search } });
    return res.data;
  },
  create: async (orgId: string, data: { name: string; description?: string }): Promise<TranslationProject> => {
    const res = await axios.post(`${base(orgId)}/projects`, data);
    return res.data;
  },
  update: async (orgId: string, projectId: string, data: { name?: string; description?: string }): Promise<TranslationProject> => {
    const res = await axios.put(`${base(orgId)}/projects/${projectId}`, data);
    return res.data;
  },
  delete: async (orgId: string, projectId: string): Promise<void> => {
    await axios.delete(`${base(orgId)}/projects/${projectId}`);
  },
};

// ==================== Locale API ====================

export const localeApi = {
  list: async (orgId: string, projectId: string, page = 1, limit = 50): Promise<LocaleListResponse> => {
    const res = await axios.get(`${base(orgId)}/projects/${projectId}/locales`, { params: { page, limit } });
    return res.data;
  },
  create: async (orgId: string, projectId: string, data: LocaleFormValues): Promise<Locale> => {
    const res = await axios.post(`${base(orgId)}/projects/${projectId}/locales`, data);
    return res.data;
  },
  bulkCreate: async (orgId: string, projectId: string, locales: LocaleFormValues[]): Promise<{ created: number; data: Locale[] }> => {
    const res = await axios.post(`${base(orgId)}/projects/${projectId}/locales/bulk`, { locales });
    return res.data;
  },
  update: async (orgId: string, projectId: string, localeId: string, data: Partial<LocaleFormValues & { isActive: boolean }>): Promise<Locale> => {
    const res = await axios.put(`${base(orgId)}/projects/${projectId}/locales/${localeId}`, data);
    return res.data;
  },
  delete: async (orgId: string, projectId: string, localeId: string): Promise<void> => {
    await axios.delete(`${base(orgId)}/projects/${projectId}/locales/${localeId}`);
  },
};

// ==================== Translation API ====================

export const translationApi = {
  list: async (orgId: string, projectId: string, params: TranslationListParams = {}): Promise<TranslationListResponse> => {
    const res = await axios.get(`${base(orgId)}/projects/${projectId}/translations`, { params });
    return res.data;
  },
  getSections: async (orgId: string, projectId: string): Promise<TranslationSectionsResponse> => {
    const res = await axios.get(`${base(orgId)}/projects/${projectId}/translations/sections`);
    return res.data;
  },
  upsert: async (orgId: string, projectId: string, data: TranslationUpsertInput): Promise<void> => {
    await axios.post(`${base(orgId)}/projects/${projectId}/translations`, data);
  },
  bulkUpsert: async (orgId: string, projectId: string, data: TranslationBulkInput): Promise<{ upserted: number; modified: number }> => {
    const res = await axios.post(`${base(orgId)}/projects/${projectId}/translations/bulk`, data);
    return res.data;
  },
  delete: async (orgId: string, projectId: string, entryId: string): Promise<void> => {
    await axios.delete(`${base(orgId)}/projects/${projectId}/translations/${entryId}`);
  },
};

// ==================== Theme Project API ====================

export const themeProjectApi = {
  list: async (orgId: string, page = 1, limit = 20, search?: string): Promise<ThemeProjectListResponse> => {
    const res = await axios.get(`${base(orgId)}/theme-projects`, { params: { page, limit, search } });
    return res.data;
  },
  create: async (orgId: string, data: { name: string; description?: string }): Promise<ThemeProject> => {
    const res = await axios.post(`${base(orgId)}/theme-projects`, data);
    return res.data;
  },
  update: async (orgId: string, projectId: string, data: { name?: string; description?: string }): Promise<ThemeProject> => {
    const res = await axios.put(`${base(orgId)}/theme-projects/${projectId}`, data);
    return res.data;
  },
  delete: async (orgId: string, projectId: string): Promise<void> => {
    await axios.delete(`${base(orgId)}/theme-projects/${projectId}`);
  },
};

// ==================== Theme API ====================

export const themeApi = {
  list: async (orgId: string, projectId: string, params: ThemeListParams = {}): Promise<ThemeListResponse> => {
    const res = await axios.get(`${base(orgId)}/theme-projects/${projectId}/themes`, { params });
    return res.data;
  },
  get: async (orgId: string, projectId: string, themeId: string): Promise<ThemeData> => {
    const res = await axios.get(`${base(orgId)}/theme-projects/${projectId}/themes/${themeId}`);
    return res.data;
  },
  create: async (orgId: string, projectId: string, data: Omit<ThemeData, "_id" | "organizationId" | "projectId" | "createdAt" | "updatedAt">): Promise<ThemeData> => {
    const res = await axios.post(`${base(orgId)}/theme-projects/${projectId}/themes`, data);
    return res.data;
  },
  update: async (orgId: string, projectId: string, themeId: string, data: Partial<ThemeData>): Promise<ThemeData> => {
    const res = await axios.put(`${base(orgId)}/theme-projects/${projectId}/themes/${themeId}`, data);
    return res.data;
  },
  duplicate: async (orgId: string, projectId: string, themeId: string): Promise<ThemeData> => {
    const res = await axios.post(`${base(orgId)}/theme-projects/${projectId}/themes/${themeId}/duplicate`);
    return res.data;
  },
  delete: async (orgId: string, projectId: string, themeId: string): Promise<void> => {
    await axios.delete(`${base(orgId)}/theme-projects/${projectId}/themes/${themeId}`);
  },
};
