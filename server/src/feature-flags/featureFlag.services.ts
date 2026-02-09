import mongoose from "mongoose";
import { FeatureFlagModel, IFeatureFlag, ITargetingRule } from "./featureFlag.models";
import {
  CreateFeatureFlagInput,
  ListFeatureFlagsQuery,
  UpdateFeatureFlagInput,
} from "./featureFlag.validators";

function transformFlag(flag: IFeatureFlag) {
  return {
    id: flag._id?.toString(),
    organizationId: flag.organizationId?.toString(),
    key: flag.key,
    name: flag.name,
    description: flag.description,
    status: flag.status,
    enabled: flag.enabled,
    rolloutType: flag.rolloutType,
    rolloutPercentage: flag.rolloutPercentage,
    targetUsers: flag.targetUsers,
    targetingRules: flag.targetingRules,
    tags: flag.tags,
    defaultValue: flag.defaultValue,
    metadata: flag.metadata,
    createdAt: flag.createdAt,
    updatedAt: flag.updatedAt,
  };
}

export async function createFeatureFlag(orgId: string, data: CreateFeatureFlagInput) {
  const flag = await FeatureFlagModel.create({
    ...data,
    organizationId: new mongoose.Types.ObjectId(orgId),
  });
  return transformFlag(flag);
}

export async function getFeatureFlags(orgId: string, query: ListFeatureFlagsQuery) {
  const { page = 1, limit = 20, status, search, tags, enabled } = query;

  const filter: Record<string, unknown> = {
    organizationId: new mongoose.Types.ObjectId(orgId),
  };

  if (status) filter.status = status;
  if (enabled !== undefined) filter.enabled = enabled;
  if (tags) {
    const tagArray = tags.split(",").map((t) => t.trim());
    filter.tags = { $in: tagArray };
  }
  if (search) {
    filter.$or = [
      { key: { $regex: search, $options: "i" } },
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [flags, total] = await Promise.all([
    FeatureFlagModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<IFeatureFlag[]>(),
    FeatureFlagModel.countDocuments(filter),
  ]);

  return {
    data: flags.map(transformFlag),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getFeatureFlag(orgId: string, flagId: string) {
  const flag = await FeatureFlagModel.findOne({
    _id: new mongoose.Types.ObjectId(flagId),
    organizationId: new mongoose.Types.ObjectId(orgId),
  }).lean<IFeatureFlag>();

  return flag ? transformFlag(flag) : null;
}

export async function getFeatureFlagByKey(orgId: string, key: string) {
  const flag = await FeatureFlagModel.findOne({
    key,
    organizationId: new mongoose.Types.ObjectId(orgId),
  }).lean<IFeatureFlag>();

  return flag ? transformFlag(flag) : null;
}

export async function updateFeatureFlag(
  orgId: string,
  flagId: string,
  data: UpdateFeatureFlagInput,
) {
  const flag = await FeatureFlagModel.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(flagId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    },
    { $set: data },
    { new: true },
  ).lean<IFeatureFlag>();

  return flag ? transformFlag(flag) : null;
}

export async function toggleFeatureFlag(orgId: string, flagId: string) {
  const existing = await FeatureFlagModel.findOne({
    _id: new mongoose.Types.ObjectId(flagId),
    organizationId: new mongoose.Types.ObjectId(orgId),
  });

  if (!existing) return null;

  existing.enabled = !existing.enabled;
  await existing.save();
  return transformFlag(existing);
}

export async function deleteFeatureFlag(orgId: string, flagId: string) {
  const result = await FeatureFlagModel.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(flagId),
    organizationId: new mongoose.Types.ObjectId(orgId),
  });
  return result ? true : false;
}

// Evaluate a feature flag for a given user/context
export async function evaluateFeatureFlag(
  orgId: string,
  key: string,
  userId?: string,
  attributes?: Record<string, string>,
) {
  const flag = await FeatureFlagModel.findOne({
    key,
    organizationId: new mongoose.Types.ObjectId(orgId),
  }).lean<IFeatureFlag>();

  if (!flag) return { key, enabled: false, reason: "flag_not_found" };
  if (flag.status !== "active") return { key, enabled: false, reason: "flag_inactive" };
  if (!flag.enabled) return { key, enabled: flag.defaultValue, reason: "flag_disabled" };

  // Check rollout type
  switch (flag.rolloutType) {
    case "boolean":
      return { key, enabled: flag.enabled, reason: "boolean_flag" };

    case "percentage": {
      const hash = simpleHash(userId || "anonymous");
      const percentage = hash % 100;
      const isEnabled = percentage < flag.rolloutPercentage;
      return { key, enabled: isEnabled, reason: "percentage_rollout", percentage: flag.rolloutPercentage };
    }

    case "user-list": {
      if (userId && flag.targetUsers.includes(userId)) {
        return { key, enabled: true, reason: "user_targeted" };
      }
      // Check targeting rules
      if (attributes && flag.targetingRules.length > 0) {
        const matched = evaluateRules(flag.targetingRules as ITargetingRule[], attributes);
        return { key, enabled: matched, reason: matched ? "rule_matched" : "rule_not_matched" };
      }
      return { key, enabled: flag.defaultValue, reason: "no_match" };
    }

    default:
      return { key, enabled: flag.defaultValue, reason: "unknown_rollout_type" };
  }
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function evaluateRules(rules: ITargetingRule[], attributes: Record<string, string>): boolean {
  return rules.every((rule) => {
    const attrValue = attributes[rule.attribute];
    if (!attrValue) return false;

    switch (rule.operator) {
      case "equals":
        return attrValue === rule.value;
      case "not-equals":
        return attrValue !== rule.value;
      case "contains":
        return attrValue.includes(rule.value);
      case "in":
        return rule.value.split(",").map((v) => v.trim()).includes(attrValue);
      case "not-in":
        return !rule.value.split(",").map((v) => v.trim()).includes(attrValue);
      default:
        return false;
    }
  });
}

// Get stats
export async function getFeatureFlagStats(orgId: string) {
  const orgObjectId = new mongoose.Types.ObjectId(orgId);

  const [statusStats, total] = await Promise.all([
    FeatureFlagModel.aggregate([
      { $match: { organizationId: orgObjectId } },
      {
        $group: {
          _id: { status: "$status", enabled: "$enabled" },
          count: { $sum: 1 },
        },
      },
    ]),
    FeatureFlagModel.countDocuments({ organizationId: orgObjectId }),
  ]);

  let active = 0;
  let inactive = 0;
  let archived = 0;
  let enabledCount = 0;

  for (const s of statusStats) {
    if (s._id.status === "active") active += s.count;
    if (s._id.status === "inactive") inactive += s.count;
    if (s._id.status === "archived") archived += s.count;
    if (s._id.enabled) enabledCount += s.count;
  }

  return { total, active, inactive, archived, enabled: enabledCount, disabled: total - enabledCount };
}
