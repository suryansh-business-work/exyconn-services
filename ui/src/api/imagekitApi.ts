import axios from "axios";
import {
  ImageKitConfig,
  ImageKitConfigFormValues,
  ImageKitConfigListResponse,
  UploadResult,
  BulkUploadResult,
  UploadedFile,
  UploadHistoryListResponse,
  UploadStats,
  UploadHistoryFilters,
} from "../types/imagekit";
import { API_BASE } from "./config";

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

// ImageKit Configuration API
export const imageKitConfigApi = {
  list: async (
    orgId: string,
    params: ListParams = {},
  ): Promise<ImageKitConfigListResponse> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/imagekit/config`,
      {
        params,
      },
    );
    return response.data;
  },

  getById: async (orgId: string, configId: string): Promise<ImageKitConfig> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/imagekit/config/${configId}`,
    );
    return response.data;
  },

  getDefault: async (orgId: string): Promise<ImageKitConfig> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/imagekit/config/default`,
    );
    return response.data;
  },

  create: async (
    orgId: string,
    data: ImageKitConfigFormValues,
  ): Promise<ImageKitConfig> => {
    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/imagekit/config`,
      data,
    );
    return response.data;
  },

  update: async (
    orgId: string,
    configId: string,
    data: Partial<ImageKitConfigFormValues>,
  ): Promise<ImageKitConfig> => {
    const response = await axios.put(
      `${API_BASE}/organizations/${orgId}/imagekit/config/${configId}`,
      data,
    );
    return response.data;
  },

  delete: async (orgId: string, configId: string): Promise<void> => {
    await axios.delete(
      `${API_BASE}/organizations/${orgId}/imagekit/config/${configId}`,
    );
  },

  testConnection: async (
    orgId: string,
    configId: string,
  ): Promise<{ success: boolean; error?: string }> => {
    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/imagekit/test/${configId}`,
    );
    return response.data;
  },
};

// File Upload API
export const fileUploadApi = {
  uploadSingle: async (
    orgId: string,
    configId: string,
    file: File,
    options?: {
      folder?: string;
      tags?: string[];
      useUniqueFileName?: boolean;
      apiKey?: string;
    },
  ): Promise<UploadResult> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("configId", configId);
    if (options?.folder) formData.append("folder", options.folder);
    if (options?.tags) formData.append("tags", JSON.stringify(options.tags));
    if (options?.useUniqueFileName !== undefined)
      formData.append("useUniqueFileName", String(options.useUniqueFileName));
    if (options?.apiKey) formData.append("apiKey", options.apiKey);

    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/imagekit/upload`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  uploadMultiple: async (
    orgId: string,
    configId: string,
    files: File[],
    options?: {
      folder?: string;
      tags?: string[];
      useUniqueFileName?: boolean;
      apiKey?: string;
    },
  ): Promise<BulkUploadResult> => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("configId", configId);
    if (options?.folder) formData.append("folder", options.folder);
    if (options?.tags) formData.append("tags", JSON.stringify(options.tags));
    if (options?.useUniqueFileName !== undefined)
      formData.append("useUniqueFileName", String(options.useUniqueFileName));
    if (options?.apiKey) formData.append("apiKey", options.apiKey);

    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/imagekit/upload/bulk`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  delete: async (orgId: string, fileId: string): Promise<void> => {
    await axios.delete(
      `${API_BASE}/organizations/${orgId}/imagekit/files/${fileId}`,
    );
  },
};

// Upload History API
export const uploadHistoryApi = {
  list: async (
    orgId: string,
    params: ListParams & UploadHistoryFilters = {},
  ): Promise<UploadHistoryListResponse> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/imagekit/history`,
      {
        params,
      },
    );
    return response.data;
  },

  getById: async (orgId: string, fileId: string): Promise<UploadedFile> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/imagekit/history/${fileId}`,
    );
    return response.data;
  },

  getStats: async (orgId: string): Promise<UploadStats> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/imagekit/stats`,
    );
    return response.data;
  },
};
