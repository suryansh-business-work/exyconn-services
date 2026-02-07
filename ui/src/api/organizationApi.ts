import axios from "axios";
import {
  Organization,
  OrganizationListResponse,
  OrganizationFormValues,
} from "../types/organization";
import { API_BASE } from "./config";

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  orgType?: "Service" | "Product";
}

export const organizationApi = {
  list: async (params: ListParams = {}): Promise<OrganizationListResponse> => {
    const response = await axios.get(`${API_BASE}/organizations`, { params });
    return response.data;
  },

  getById: async (id: string): Promise<Organization> => {
    const response = await axios.get(`${API_BASE}/organizations/${id}`);
    return response.data.data;
  },

  getBySlug: async (slug: string): Promise<Organization> => {
    const response = await axios.get(`${API_BASE}/organizations/slug/${slug}`);
    return response.data.data;
  },

  create: async (
    data: Omit<OrganizationFormValues, "orgApiKeys">,
  ): Promise<Organization> => {
    const response = await axios.post(`${API_BASE}/organizations`, data);
    return response.data.data;
  },

  update: async (
    id: string,
    data: Partial<OrganizationFormValues>,
  ): Promise<Organization> => {
    const response = await axios.put(`${API_BASE}/organizations/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE}/organizations/${id}`);
  },

  addApiKey: async (
    orgId: string,
    keyName: string,
  ): Promise<{ keyName: string; apiKey: string }> => {
    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/api-keys`,
      { keyName },
    );
    return response.data.data;
  },

  removeApiKey: async (orgId: string, apiKey: string): Promise<void> => {
    await axios.delete(
      `${API_BASE}/organizations/${orgId}/api-keys/${encodeURIComponent(apiKey)}`,
    );
  },
};
