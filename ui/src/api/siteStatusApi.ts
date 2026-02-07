import {
  SiteMonitorConfig,
  SiteCheckResult,
  SiteMonitorStats,
  CreateSiteMonitorInput,
  UpdateSiteMonitorInput,
  SiteMonitorListParams,
  SiteCheckHistoryParams,
  PaginatedResponse,
} from "../types/siteStatus";
import { API_BASE, getHeaders } from "./config";

// Site Monitor Config API
export const siteMonitorApi = {
  list: async (
    orgId: string,
    params?: SiteMonitorListParams,
    apiKey?: string,
  ): Promise<PaginatedResponse<SiteMonitorConfig>> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.search) query.set("search", params.search);
    if (params?.sortBy) query.set("sortBy", params.sortBy);
    if (params?.sortOrder) query.set("sortOrder", params.sortOrder);
    if (params?.isActive !== undefined)
      query.set("isActive", String(params.isActive));

    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/site-status/monitors?${query}`,
      {
        headers: getHeaders(apiKey),
      },
    );
    if (!res.ok) throw new Error("Failed to fetch monitors");
    return res.json();
  },

  get: async (
    orgId: string,
    monitorId: string,
    apiKey?: string,
  ): Promise<SiteMonitorConfig> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/site-status/monitors/${monitorId}`,
      {
        headers: getHeaders(apiKey),
      },
    );
    if (!res.ok) throw new Error("Failed to fetch monitor");
    return res.json();
  },

  create: async (
    orgId: string,
    data: CreateSiteMonitorInput,
    apiKey?: string,
  ): Promise<SiteMonitorConfig> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/site-status/monitors`,
      {
        method: "POST",
        headers: getHeaders(apiKey),
        body: JSON.stringify(data),
      },
    );
    if (!res.ok) throw new Error("Failed to create monitor");
    return res.json();
  },

  update: async (
    orgId: string,
    monitorId: string,
    data: UpdateSiteMonitorInput,
    apiKey?: string,
  ): Promise<SiteMonitorConfig> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/site-status/monitors/${monitorId}`,
      {
        method: "PUT",
        headers: getHeaders(apiKey),
        body: JSON.stringify(data),
      },
    );
    if (!res.ok) throw new Error("Failed to update monitor");
    return res.json();
  },

  delete: async (
    orgId: string,
    monitorId: string,
    apiKey?: string,
  ): Promise<void> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/site-status/monitors/${monitorId}`,
      {
        method: "DELETE",
        headers: getHeaders(apiKey),
      },
    );
    if (!res.ok) throw new Error("Failed to delete monitor");
  },

  checkNow: async (
    orgId: string,
    monitorId: string,
    apiKey?: string,
  ): Promise<SiteCheckResult> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/site-status/monitors/${monitorId}/check`,
      {
        method: "POST",
        headers: getHeaders(apiKey),
      },
    );
    if (!res.ok) throw new Error("Failed to run check");
    return res.json();
  },
};

// Site Check History API
export const siteCheckHistoryApi = {
  list: async (
    orgId: string,
    params?: SiteCheckHistoryParams,
    apiKey?: string,
  ): Promise<PaginatedResponse<SiteCheckResult>> => {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.monitorId) query.set("monitorId", params.monitorId);
    if (params?.status) query.set("status", params.status);
    if (params?.startDate) query.set("startDate", params.startDate);
    if (params?.endDate) query.set("endDate", params.endDate);

    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/site-status/history?${query}`,
      {
        headers: getHeaders(apiKey),
      },
    );
    if (!res.ok) throw new Error("Failed to fetch history");
    return res.json();
  },

  get: async (
    orgId: string,
    checkId: string,
    apiKey?: string,
  ): Promise<SiteCheckResult> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/site-status/history/${checkId}`,
      {
        headers: getHeaders(apiKey),
      },
    );
    if (!res.ok) throw new Error("Failed to fetch check result");
    return res.json();
  },

  getStats: async (
    orgId: string,
    apiKey?: string,
  ): Promise<SiteMonitorStats> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/site-status/stats`,
      {
        headers: getHeaders(apiKey),
      },
    );
    if (!res.ok) throw new Error("Failed to fetch stats");
    return res.json();
  },
};
