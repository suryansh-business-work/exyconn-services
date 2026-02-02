// Environment Application
export interface EnvApp {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  environment: 'development' | 'staging' | 'production';
  isActive: boolean;
  variableCount?: number;
  createdAt: string;
  updatedAt: string;
}

// Environment Variable
export interface EnvVariable {
  id: string;
  organizationId: string;
  appId: string;
  key: string;
  value: string;
  isSecret: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// Input types
export interface CreateEnvAppInput {
  name: string;
  description?: string;
  environment?: 'development' | 'staging' | 'production';
}

export interface UpdateEnvAppInput {
  name?: string;
  description?: string;
  environment?: 'development' | 'staging' | 'production';
  isActive?: boolean;
}

export interface CreateEnvVariableInput {
  key: string;
  value: string;
  isSecret?: boolean;
  description?: string;
}

export interface UpdateEnvVariableInput {
  key?: string;
  value?: string;
  isSecret?: boolean;
  description?: string;
}

// Stats
export interface EnvKeysStats {
  totalApps: number;
  totalVariables: number;
  byEnvironment: Record<string, number>;
}

// List params
export interface EnvAppListParams {
  page?: number;
  limit?: number;
  search?: string;
  environment?: 'development' | 'staging' | 'production';
}

export interface EnvVariableListParams {
  page?: number;
  limit?: number;
  search?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
