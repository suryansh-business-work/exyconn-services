// Site Monitor Configuration
export interface SiteMonitorConfig {
  id: string;
  organizationId: string;
  url: string;
  name: string;
  isActive: boolean;
  checks: SiteCheckOptions;
  lastCheckedAt?: string;
  lastStatus?: 'healthy' | 'warning' | 'error';
  lastScreenshotUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteCheckOptions {
  httpStatus: boolean;
  sslCertificate: boolean;
  dnsRecords: boolean;
  mxRecords: boolean;
  screenshot: boolean;
  pageInfo: boolean;
  responseTime: boolean;
}

// Site Check Result
export interface SiteCheckResult {
  id: string;
  monitorId: string;
  url: string;
  timestamp: string;
  httpStatus?: HttpStatusResult;
  sslCertificate?: SslCertificateResult;
  dnsRecords?: DnsRecordsResult;
  mxRecords?: MxRecordsResult;
  screenshot?: ScreenshotResult;
  pageInfo?: PageInfoResult;
  responseTime?: number; // in ms
  overallStatus: 'healthy' | 'warning' | 'error';
}

export interface HttpStatusResult {
  statusCode: number;
  statusText: string;
  isOk: boolean;
}

export interface SslCertificateResult {
  valid: boolean;
  issuer: string;
  subject: string;
  validFrom: string;
  validTo: string;
  daysUntilExpiry: number;
  protocol: string;
}

export interface DnsRecordsResult {
  aRecords: string[];
  aaaaRecords: string[];
  nsRecords: string[];
  txtRecords: string[];
  cnameRecords: string[];
}

export interface MxRecordsResult {
  records: Array<{
    exchange: string;
    priority: number;
  }>;
}

export interface ScreenshotResult {
  url: string;
  thumbnailUrl: string;
  capturedAt: string;
  width: number;
  height: number;
}

export interface PageInfoResult {
  title: string;
  description: string;
  favicon: string;
  ogImage: string;
  keywords: string[];
  language: string;
  charset: string;
  generator: string;
  loadTime: number;
}

// Input types
export interface CreateSiteMonitorInput {
  url: string;
  name: string;
  checks: SiteCheckOptions;
}

export interface UpdateSiteMonitorInput {
  url?: string;
  name?: string;
  isActive?: boolean;
  checks?: Partial<SiteCheckOptions>;
}

// List/Query types
export interface SiteMonitorListParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'url' | 'createdAt' | 'lastCheckedAt';
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
}

export interface SiteCheckHistoryParams {
  page?: number;
  limit?: number;
  monitorId?: string;
  status?: 'healthy' | 'warning' | 'error';
  startDate?: string;
  endDate?: string;
}

// Stats
export interface SiteMonitorStats {
  totalMonitors: number;
  activeMonitors: number;
  healthyCount: number;
  warningCount: number;
  errorCount: number;
  averageResponseTime: number;
  uptimePercentage: number;
}

// Pagination response
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
