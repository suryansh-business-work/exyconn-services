import mongoose, { Document, Schema } from "mongoose";

export type FeatureFlagStatus = "active" | "inactive" | "archived";
export type RolloutType = "boolean" | "percentage" | "user-list";

export interface ITargetingRule {
  attribute: string;
  operator: "equals" | "not-equals" | "contains" | "in" | "not-in";
  value: string;
}

export interface IFeatureFlag extends Document {
  organizationId: mongoose.Types.ObjectId;
  key: string;
  name: string;
  description: string;
  status: FeatureFlagStatus;
  enabled: boolean;
  rolloutType: RolloutType;
  rolloutPercentage: number;
  targetUsers: string[];
  targetingRules: ITargetingRule[];
  tags: string[];
  defaultValue: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const TargetingRuleSchema = new Schema<ITargetingRule>(
  {
    attribute: { type: String, required: true },
    operator: {
      type: String,
      enum: ["equals", "not-equals", "contains", "in", "not-in"],
      required: true,
    },
    value: { type: String, required: true },
  },
  { _id: false },
);

const FeatureFlagSchema = new Schema<IFeatureFlag>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    key: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type: String,
      enum: ["active", "inactive", "archived"],
      default: "active",
    },
    enabled: { type: Boolean, default: false },
    rolloutType: {
      type: String,
      enum: ["boolean", "percentage", "user-list"],
      default: "boolean",
    },
    rolloutPercentage: { type: Number, default: 100, min: 0, max: 100 },
    targetUsers: [{ type: String }],
    targetingRules: [TargetingRuleSchema],
    tags: [{ type: String }],
    defaultValue: { type: Boolean, default: false },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  },
);

FeatureFlagSchema.index({ organizationId: 1, key: 1 }, { unique: true });
FeatureFlagSchema.index({ organizationId: 1, status: 1 });
FeatureFlagSchema.index({ organizationId: 1, tags: 1 });
FeatureFlagSchema.index({ key: "text", name: "text", description: "text" });

export const FeatureFlagModel = mongoose.model<IFeatureFlag>(
  "FeatureFlag",
  FeatureFlagSchema,
);
