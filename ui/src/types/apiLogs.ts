// API Log types
export type ApiLogLevel = "info" | "warn" | "error" | "debug";
export type ApiLogMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";

export interface ApiLog {
  id: string;
  organizationId: string;
  method: ApiLogMethod;
  url: string;
  statusCode: number;
  level: ApiLogLevel;
  message: string;
  requestHeaders: Record<string, string>;
  requestBody: unknown;
  responseBody: unknown;
  responseTime: number;
  ip: string;
  userAgent: string;
  apiKeyUsed: string;
  tags: string[];
  source: string;
  metadata: Record<string, unknown>;
  error: string;
  stack: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiLogListResponse {
  data: ApiLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiLogStats {
  total: number;
  avgResponseTime: number;
  maxResponseTime: number;
  errorCount: number;
  byLevel: {
    info: number;
    warn: number;
    error: number;
    debug: number;
  };
  byMethod: Record<string, number>;
  recentErrors: ApiLog[];
}

export interface ApiLogAnalytics {
  dailyStats: Array<{
    date: string;
    total: number;
    errors: number;
    avgResponseTime: number;
  }>;
  sourceStats: Array<{
    source: string;
    count: number;
    errors: number;
  }>;
  statusCodeStats: Array<{
    statusCode: number;
    count: number;
  }>;
}

export interface ApiLogSettings {
  id: string;
  organizationId: string;
  retentionDays: number;
  maxLogsPerDay: number;
  enabledLevels: ApiLogLevel[];
  enableRequestBodyCapture: boolean;
  enableResponseBodyCapture: boolean;
  excludedPaths: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiLogSettingsFormValues {
  retentionDays: number;
  maxLogsPerDay: number;
  enabledLevels: ApiLogLevel[];
  enableRequestBodyCapture: boolean;
  enableResponseBodyCapture: boolean;
  excludedPaths: string[];
}

export interface ApiLogListParams {
  page?: number;
  limit?: number;
  level?: string;
  method?: string;
  statusCode?: number;
  search?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  tags?: string;
  minResponseTime?: number;
  maxResponseTime?: number;
}

export interface CreateApiLogInput {
  method?: ApiLogMethod;
  url?: string;
  statusCode?: number;
  level?: ApiLogLevel;
  message: string;
  requestHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseBody?: unknown;
  responseTime?: number;
  ip?: string;
  userAgent?: string;
  tags?: string[];
  source?: string;
  metadata?: Record<string, unknown>;
  error?: string;
  stack?: string;
}
