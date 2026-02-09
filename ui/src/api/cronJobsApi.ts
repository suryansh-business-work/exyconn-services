import axios from "axios";
import {
  CronJob,
  CronJobListResponse,
  CronJobHistoryListResponse,
  CronJobFormValues,
  CronJobStats,
  CronJobListParams,
  CronJobHistoryListParams,
} from "../types/cronJobs";
import { API_BASE } from "./config";

export const cronJobsApi = {
  list: async (
    orgId: string,
    params: CronJobListParams = {},
  ): Promise<CronJobListResponse> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/cron-jobs`,
      { params },
    );
    return response.data;
  },

  getById: async (orgId: string, jobId: string): Promise<CronJob> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/cron-jobs/${jobId}`,
    );
    return response.data;
  },

  create: async (
    orgId: string,
    data: Partial<CronJobFormValues>,
  ): Promise<CronJob> => {
    const payload: Record<string, unknown> = { ...data };
    if (typeof data.headers === "string" && data.headers) {
      try {
        payload.headers = JSON.parse(data.headers);
      } catch {
        payload.headers = {};
      }
    }
    if (typeof data.tags === "string") {
      payload.tags = (data.tags as unknown as string)
        .split(",")
        .map((t: string) => t.trim())
        .filter(Boolean);
    }
    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/cron-jobs`,
      payload,
    );
    return response.data;
  },

  update: async (
    orgId: string,
    jobId: string,
    data: Partial<CronJobFormValues>,
  ): Promise<CronJob> => {
    const payload: Record<string, unknown> = { ...data };
    if (typeof data.headers === "string" && data.headers) {
      try {
        payload.headers = JSON.parse(data.headers);
      } catch {
        payload.headers = {};
      }
    }
    const response = await axios.put(
      `${API_BASE}/organizations/${orgId}/cron-jobs/${jobId}`,
      payload,
    );
    return response.data;
  },

  togglePause: async (orgId: string, jobId: string): Promise<CronJob> => {
    const response = await axios.patch(
      `${API_BASE}/organizations/${orgId}/cron-jobs/${jobId}/toggle`,
    );
    return response.data;
  },

  execute: async (
    orgId: string,
    jobId: string,
  ): Promise<{ success: boolean; execution: Record<string, unknown> }> => {
    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/cron-jobs/${jobId}/execute`,
    );
    return response.data;
  },

  delete: async (orgId: string, jobId: string): Promise<void> => {
    await axios.delete(
      `${API_BASE}/organizations/${orgId}/cron-jobs/${jobId}`,
    );
  },

  getHistory: async (
    orgId: string,
    params: CronJobHistoryListParams = {},
  ): Promise<CronJobHistoryListResponse> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/cron-jobs/history`,
      { params },
    );
    return response.data;
  },

  getStats: async (orgId: string): Promise<CronJobStats> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/cron-jobs/stats`,
    );
    return response.data;
  },

  getEventsUrl: (orgId: string): string =>
    `${API_BASE}/organizations/${orgId}/cron-jobs/events`,
};
