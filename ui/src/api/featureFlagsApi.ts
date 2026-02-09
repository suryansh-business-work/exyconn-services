import axios from "axios";
import {
  FeatureFlag,
  FeatureFlagListResponse,
  FeatureFlagFormValues,
  FeatureFlagStats,
  FeatureFlagEvaluation,
  FeatureFlagListParams,
} from "../types/featureFlags";
import { API_BASE } from "./config";

export const featureFlagsApi = {
  list: async (
    orgId: string,
    params: FeatureFlagListParams = {},
  ): Promise<FeatureFlagListResponse> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/feature-flags`,
      { params },
    );
    return response.data;
  },

  getById: async (orgId: string, flagId: string): Promise<FeatureFlag> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/feature-flags/${flagId}`,
    );
    return response.data;
  },

  create: async (
    orgId: string,
    data: FeatureFlagFormValues,
  ): Promise<FeatureFlag> => {
    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/feature-flags`,
      data,
    );
    return response.data;
  },

  update: async (
    orgId: string,
    flagId: string,
    data: Partial<FeatureFlagFormValues>,
  ): Promise<FeatureFlag> => {
    const response = await axios.put(
      `${API_BASE}/organizations/${orgId}/feature-flags/${flagId}`,
      data,
    );
    return response.data;
  },

  toggle: async (orgId: string, flagId: string): Promise<FeatureFlag> => {
    const response = await axios.patch(
      `${API_BASE}/organizations/${orgId}/feature-flags/${flagId}/toggle`,
    );
    return response.data;
  },

  delete: async (orgId: string, flagId: string): Promise<void> => {
    await axios.delete(
      `${API_BASE}/organizations/${orgId}/feature-flags/${flagId}`,
    );
  },

  evaluate: async (
    orgId: string,
    data: { key: string; userId?: string; attributes?: Record<string, string> },
  ): Promise<FeatureFlagEvaluation> => {
    const response = await axios.post(
      `${API_BASE}/organizations/${orgId}/feature-flags/evaluate`,
      data,
    );
    return response.data;
  },

  getStats: async (orgId: string): Promise<FeatureFlagStats> => {
    const response = await axios.get(
      `${API_BASE}/organizations/${orgId}/feature-flags/stats`,
    );
    return response.data;
  },
};
