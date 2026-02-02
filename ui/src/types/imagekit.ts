// ImageKit Configuration types
export interface ImageKitConfig {
  id: string;
  organizationId: string;
  name: string;
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImageKitConfigFormValues {
  name: string;
  publicKey: string;
  privateKey: string;
  urlEndpoint: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export interface ImageKitConfigListResponse {
  data: ImageKitConfig[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Upload types
export type UploadMode = 'single' | 'multiple' | 'single-array' | 'multiple-array';

export interface UploadedFile {
  id: string;
  organizationId: string;
  configId: string;
  apiKeyUsed?: string;
  fileName: string;
  originalName: string;
  fileType: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  url: string;
  thumbnailUrl?: string;
  fileId: string; // ImageKit file ID
  filePath: string;
  tags?: string[];
  uploadMode: UploadMode;
  groupId?: string; // For grouping multiple uploads
  createdAt: string;
  updatedAt: string;
}

export interface UploadFileInput {
  file: File;
  fileName?: string;
  folder?: string;
  tags?: string[];
  useUniqueFileName?: boolean;
}

export interface UploadResult {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}

export interface BulkUploadResult {
  success: boolean;
  files: UploadedFile[];
  errors: Array<{ fileName: string; error: string }>;
  totalUploaded: number;
  totalFailed: number;
}

export interface UploadHistoryListResponse {
  data: UploadedFile[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UploadStats {
  totalFiles: number;
  totalSize: number;
  byFileType: Record<string, number>;
  byUploadMode: Record<UploadMode, number>;
  byMonth?: Array<{ month: string; count: number; size: number }>;
}

// Filter and search types
export interface UploadHistoryFilters {
  search?: string;
  fileType?: string;
  uploadMode?: UploadMode;
  startDate?: string;
  endDate?: string;
  configId?: string;
}
