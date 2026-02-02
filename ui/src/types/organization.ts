export interface ApiKey {
  keyName: string;
  apiKey: string;
  createdAt?: string;
}

export interface Organization {
  id: string;
  orgName: string;
  orgDescription?: string;
  orgSlug: string;
  orgType: 'Service' | 'Product';
  orgApiKeys: ApiKey[];
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationListResponse {
  success: boolean;
  data: Organization[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrganizationFormValues {
  orgName: string;
  orgDescription: string;
  orgSlug: string;
  orgType: 'Service' | 'Product';
  orgApiKeys: { keyName: string }[];
}
