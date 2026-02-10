import axios from "axios";
import {
  Locale,
  LocaleListResponse,
  LocaleFormValues,
  TranslationListResponse,
  TranslationListParams,
  TranslationUpsertInput,
  TranslationBulkInput,
  TranslationSectionsResponse,
  ThemeData,
  ThemeListResponse,
  ThemeListParams,
} from "../types/translationsTheme";
import { API_BASE } from "./config";

const base = (orgId: string) => `${API_BASE}/organizations/${orgId}/translations-theme`;

export const localeApi = {
  list: async (orgId: string, page = 1, limit = 50): Promise<LocaleListResponse> => {
    const res = await axios.get(`${base(orgId)}/locales`, { params: { page, limit } });
    return res.data;
  },

  create: async (orgId: string, data: LocaleFormValues): Promise<Locale> => {
    const res = await axios.post(`${base(orgId)}/locales`, data);
    return res.data;
  },

  update: async (
    orgId: string,
    localeId: string,
    data: Partial<LocaleFormValues & { isActive: boolean }>,
  ): Promise<Locale> => {
    const res = await axios.put(`${base(orgId)}/locales/${localeId}`, data);
    return res.data;
  },

  delete: async (orgId: string, localeId: string): Promise<void> => {
    await axios.delete(`${base(orgId)}/locales/${localeId}`);
  },
};

export const translationApi = {
  list: async (orgId: string, params: TranslationListParams = {}): Promise<TranslationListResponse> => {
    const res = await axios.get(`${base(orgId)}/translations`, { params });
    return res.data;
  },

  getSections: async (orgId: string): Promise<TranslationSectionsResponse> => {
    const res = await axios.get(`${base(orgId)}/translations/sections`);
    return res.data;
  },

  upsert: async (orgId: string, data: TranslationUpsertInput): Promise<void> => {
    await axios.post(`${base(orgId)}/translations`, data);
  },

  bulkUpsert: async (
    orgId: string,
    data: TranslationBulkInput,
  ): Promise<{ upserted: number; modified: number }> => {
    const res = await axios.post(`${base(orgId)}/translations/bulk`, data);
    return res.data;
  },

  delete: async (orgId: string, entryId: string): Promise<void> => {
    await axios.delete(`${base(orgId)}/translations/${entryId}`);
  },
};

export const themeApi = {
  list: async (orgId: string, params: ThemeListParams = {}): Promise<ThemeListResponse> => {
    const res = await axios.get(`${base(orgId)}/themes`, { params });
    return res.data;
  },

  get: async (orgId: string, themeId: string): Promise<ThemeData> => {
    const res = await axios.get(`${base(orgId)}/themes/${themeId}`);
    return res.data;
  },

  create: async (orgId: string, data: Omit<ThemeData, "_id" | "organizationId" | "createdAt" | "updatedAt">): Promise<ThemeData> => {
    const res = await axios.post(`${base(orgId)}/themes`, data);
    return res.data;
  },

  update: async (orgId: string, themeId: string, data: Partial<ThemeData>): Promise<ThemeData> => {
    const res = await axios.put(`${base(orgId)}/themes/${themeId}`, data);
    return res.data;
  },

  duplicate: async (orgId: string, themeId: string): Promise<ThemeData> => {
    const res = await axios.post(`${base(orgId)}/themes/${themeId}/duplicate`);
    return res.data;
  },

  delete: async (orgId: string, themeId: string): Promise<void> => {
    await axios.delete(`${base(orgId)}/themes/${themeId}`);
  },
};
