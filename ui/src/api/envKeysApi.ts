import {
  EnvApp,
  EnvVariable,
  CreateEnvAppInput,
  UpdateEnvAppInput,
  CreateEnvVariableInput,
  UpdateEnvVariableInput,
  EnvKeysStats,
  EnvAppListParams,
  EnvVariableListParams,
  PaginatedResponse,
} from '../types/envKeys';
import { API_BASE, getHeaders } from './config';

// Environment Apps API
export const envAppApi = {
  list: async (
    orgId: string,
    params: EnvAppListParams = {},
    apiKey?: string
  ): Promise<PaginatedResponse<EnvApp>> => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);
    if (params.environment) query.set('environment', params.environment);

    const res = await fetch(`${API_BASE}/organizations/${orgId}/env-keys/apps?${query}`, {
      headers: getHeaders(apiKey),
    });
    if (!res.ok) throw new Error('Failed to list apps');
    return res.json();
  },

  get: async (orgId: string, appId: string, apiKey?: string): Promise<EnvApp> => {
    const res = await fetch(`${API_BASE}/organizations/${orgId}/env-keys/apps/${appId}`, {
      headers: getHeaders(apiKey),
    });
    if (!res.ok) throw new Error('Failed to get app');
    return res.json();
  },

  create: async (orgId: string, data: CreateEnvAppInput, apiKey?: string): Promise<EnvApp> => {
    const res = await fetch(`${API_BASE}/organizations/${orgId}/env-keys/apps`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create app');
    return res.json();
  },

  update: async (
    orgId: string,
    appId: string,
    data: UpdateEnvAppInput,
    apiKey?: string
  ): Promise<EnvApp> => {
    const res = await fetch(`${API_BASE}/organizations/${orgId}/env-keys/apps/${appId}`, {
      method: 'PATCH',
      headers: getHeaders(apiKey),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update app');
    return res.json();
  },

  delete: async (orgId: string, appId: string, apiKey?: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/organizations/${orgId}/env-keys/apps/${appId}`, {
      method: 'DELETE',
      headers: getHeaders(apiKey),
    });
    if (!res.ok) throw new Error('Failed to delete app');
  },

  getStats: async (orgId: string, apiKey?: string): Promise<EnvKeysStats> => {
    const res = await fetch(`${API_BASE}/organizations/${orgId}/env-keys/apps/stats`, {
      headers: getHeaders(apiKey),
    });
    if (!res.ok) throw new Error('Failed to get stats');
    return res.json();
  },
};

// Environment Variables API
export const envVariableApi = {
  list: async (
    orgId: string,
    appId: string,
    params: EnvVariableListParams = {},
    apiKey?: string
  ): Promise<PaginatedResponse<EnvVariable>> => {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.search) query.set('search', params.search);

    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/env-keys/apps/${appId}/variables?${query}`,
      { headers: getHeaders(apiKey) }
    );
    if (!res.ok) throw new Error('Failed to list variables');
    return res.json();
  },

  get: async (
    orgId: string,
    appId: string,
    variableId: string,
    apiKey?: string
  ): Promise<EnvVariable> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/env-keys/apps/${appId}/variables/${variableId}`,
      { headers: getHeaders(apiKey) }
    );
    if (!res.ok) throw new Error('Failed to get variable');
    return res.json();
  },

  getActualValue: async (
    orgId: string,
    appId: string,
    variableId: string,
    apiKey?: string
  ): Promise<string> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/env-keys/apps/${appId}/variables/${variableId}/value`,
      { headers: getHeaders(apiKey) }
    );
    if (!res.ok) throw new Error('Failed to get value');
    const data = await res.json();
    return data.value;
  },

  create: async (
    orgId: string,
    appId: string,
    data: CreateEnvVariableInput,
    apiKey?: string
  ): Promise<EnvVariable> => {
    const res = await fetch(`${API_BASE}/organizations/${orgId}/env-keys/apps/${appId}/variables`, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create variable');
    return res.json();
  },

  update: async (
    orgId: string,
    appId: string,
    variableId: string,
    data: UpdateEnvVariableInput,
    apiKey?: string
  ): Promise<EnvVariable> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/env-keys/apps/${appId}/variables/${variableId}`,
      {
        method: 'PATCH',
        headers: getHeaders(apiKey),
        body: JSON.stringify(data),
      }
    );
    if (!res.ok) throw new Error('Failed to update variable');
    return res.json();
  },

  delete: async (
    orgId: string,
    appId: string,
    variableId: string,
    apiKey?: string
  ): Promise<void> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/env-keys/apps/${appId}/variables/${variableId}`,
      {
        method: 'DELETE',
        headers: getHeaders(apiKey),
      }
    );
    if (!res.ok) throw new Error('Failed to delete variable');
  },

  getAll: async (
    orgId: string,
    appId: string,
    apiKey?: string
  ): Promise<Record<string, string>> => {
    const res = await fetch(
      `${API_BASE}/organizations/${orgId}/env-keys/apps/${appId}/variables/all`,
      { headers: getHeaders(apiKey) }
    );
    if (!res.ok) throw new Error('Failed to get all variables');
    return res.json();
  },
};
