// Feature Flag types
export type FeatureFlagStatus = "active" | "inactive" | "archived";
export type RolloutType = "boolean" | "percentage" | "user-list";

export interface TargetingRule {
  attribute: string;
  operator: "equals" | "not-equals" | "contains" | "in" | "not-in";
  value: string;
}

export interface FeatureFlag {
  id: string;
  organizationId: string;
  key: string;
  name: string;
  description: string;
  status: FeatureFlagStatus;
  enabled: boolean;
  rolloutType: RolloutType;
  rolloutPercentage: number;
  targetUsers: string[];
  targetingRules: TargetingRule[];
  tags: string[];
  defaultValue: boolean;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureFlagListResponse {
  data: FeatureFlag[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface FeatureFlagFormValues {
  key: string;
  name: string;
  description: string;
  status: FeatureFlagStatus;
  enabled: boolean;
  rolloutType: RolloutType;
  rolloutPercentage: number;
  targetUsers: string[];
  targetingRules: TargetingRule[];
  tags: string[];
  defaultValue: boolean;
}

export interface FeatureFlagStats {
  total: number;
  active: number;
  inactive: number;
  archived: number;
  enabled: number;
  disabled: number;
}

export interface FeatureFlagEvaluation {
  key: string;
  enabled: boolean;
  reason: string;
  percentage?: number;
}

export interface FeatureFlagListParams {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  tags?: string;
  enabled?: string;
}
