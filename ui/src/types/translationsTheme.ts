// ==================== Common Types ====================

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ==================== Translation Project Types ====================

export interface TranslationProject {
  _id: string;
  organizationId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TranslationProjectListResponse {
  data: TranslationProject[];
  pagination: Pagination;
}

export interface TranslationProjectFormValues {
  name: string;
  description: string;
}

// ==================== Locale Types ====================

export interface Locale {
  _id: string;
  organizationId: string;
  projectId: string;
  code: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocaleListResponse {
  data: Locale[];
  pagination: Pagination;
}

export interface LocaleFormValues {
  code: string;
  name: string;
  isDefault: boolean;
}

export interface PredefinedLocale {
  code: string;
  name: string;
}

// ==================== Translation Types ====================

export interface TranslationEntry {
  _id: string;
  organizationId: string;
  projectId: string;
  section: string;
  key: string;
  values: Record<string, string>;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TranslationListResponse {
  data: TranslationEntry[];
  pagination: Pagination;
}

export interface TranslationListParams {
  page?: number;
  limit?: number;
  section?: string;
  search?: string;
}

export interface TranslationUpsertInput {
  section: string;
  key: string;
  values: Record<string, string>;
  description?: string;
}

export interface TranslationBulkInput {
  section: string;
  entries: Array<{
    key: string;
    values: Record<string, string>;
    description?: string;
  }>;
}

export interface TranslationSectionsResponse {
  sections: string[];
}

// ==================== Theme Project Types ====================

export interface ThemeProject {
  _id: string;
  organizationId: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeProjectListResponse {
  data: ThemeProject[];
  pagination: Pagination;
}

export interface ThemeProjectFormValues {
  name: string;
  description: string;
}

// ==================== Theme Types ====================

export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  [key: string]: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: number;
  fontWeightLight: number;
  fontWeightRegular: number;
  fontWeightMedium: number;
  fontWeightBold: number;
  h1Size: string;
  h2Size: string;
  h3Size: string;
  bodySize: string;
  captionSize: string;
}

export interface ThemeSpacing {
  unit: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface ThemeBorderRadius {
  none: number;
  sm: number;
  md: number;
  lg: number;
  full: number;
}

export interface ThemeData {
  _id: string;
  organizationId: string;
  projectId: string;
  name: string;
  description?: string;
  isDefault: boolean;
  isActive: boolean;
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  components: Record<string, Record<string, string>>;
  createdAt: string;
  updatedAt: string;
}

export interface ThemeListResponse {
  data: ThemeData[];
  pagination: Pagination;
}

export interface ThemeListParams {
  page?: number;
  limit?: number;
  search?: string;
}
