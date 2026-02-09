export type CronJobStatus = "active" | "paused" | "completed" | "failed";
export type CronJobMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface CronJob {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  cronExpression: string;
  timezone: string;
  webhookUrl: string;
  method: CronJobMethod;
  headers: Record<string, string>;
  body: string;
  status: CronJobStatus;
  retryCount: number;
  maxRetries: number;
  timeout: number;
  lastExecutedAt?: string;
  nextExecutionAt?: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface CronJobHistory {
  id: string;
  organizationId: string;
  cronJobId: string;
  jobName: string;
  executedAt: string;
  status: "success" | "failure";
  responseStatus?: number;
  responseTime?: number;
  responseBody?: string;
  requestUrl: string;
  requestMethod: CronJobMethod;
  error?: string;
  duration: number;
  retryAttempt: number;
  createdAt: string;
}

export interface CronJobListResponse {
  data: CronJob[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CronJobHistoryListResponse {
  data: CronJobHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CronJobFormValues {
  name: string;
  description: string;
  cronExpression: string;
  timezone: string;
  webhookUrl: string;
  method: CronJobMethod;
  headers: string;
  body: string;
  maxRetries: number;
  timeout: number;
  tags: string[];
}

export interface CronJobStats {
  total: number;
  active: number;
  paused: number;
  failed: number;
  totalExecutions: number;
  totalSuccess: number;
  totalFailures: number;
  avgDuration: number;
  maxDuration: number;
  historyCount: number;
}

export interface CronJobListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  tags?: string;
}

export interface CronJobHistoryListParams {
  page?: number;
  limit?: number;
  cronJobId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface CronJobSSEEvent {
  event: string;
  data: {
    jobId?: string;
    name?: string;
    status?: string;
    timestamp: string;
    message?: string;
    [key: string]: unknown;
  };
}
