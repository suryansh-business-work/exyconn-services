import mongoose from "mongoose";
import { EnvApp, IEnvApp } from "./app.models";
import { EnvVariable } from "../variables/variable.models";

interface ListParams {
  page: number;
  limit: number;
  search?: string;
  environment?: "development" | "staging" | "production";
}

interface CreateInput {
  name: string;
  description?: string;
  environment?: "development" | "staging" | "production";
}

interface UpdateInput {
  name?: string;
  description?: string;
  environment?: "development" | "staging" | "production";
  isActive?: boolean;
}

// Helper to safely create ObjectId
const toObjectId = (id: string): mongoose.Types.ObjectId | null => {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
};

export const envAppService = {
  list: async (orgId: string, params: ListParams) => {
    const { page, limit, search, environment } = params;
    const skip = (page - 1) * limit;

    const orgObjectId = toObjectId(orgId);
    if (!orgObjectId) {
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }

    const query: Record<string, unknown> = { organizationId: orgObjectId };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (environment) {
      query.environment = environment;
    }

    const [data, total] = await Promise.all([
      EnvApp.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      EnvApp.countDocuments(query),
    ]);

    // Get variable count per app
    const appIds = data.map((d) => d._id);
    const variableCounts = await EnvVariable.aggregate([
      { $match: { appId: { $in: appIds } } },
      { $group: { _id: "$appId", count: { $sum: 1 } } },
    ]);
    const countMap = new Map(
      variableCounts.map((v) => [v._id.toString(), v.count]),
    );

    return {
      data: data.map((d) => ({
        ...d,
        id: d._id.toString(),
        variableCount: countMap.get(d._id.toString()) || 0,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  get: async (orgId: string, appId: string): Promise<IEnvApp | null> => {
    const orgObjectId = toObjectId(orgId);
    const appObjectId = toObjectId(appId);
    if (!orgObjectId || !appObjectId) return null;

    return EnvApp.findOne({
      _id: appObjectId,
      organizationId: orgObjectId,
    });
  },

  create: async (orgId: string, data: CreateInput): Promise<IEnvApp> => {
    const orgObjectId = toObjectId(orgId);
    if (!orgObjectId) throw new Error("Invalid organization ID");

    const app = new EnvApp({
      organizationId: orgObjectId,
      ...data,
    });
    return app.save();
  },

  update: async (
    orgId: string,
    appId: string,
    data: UpdateInput,
  ): Promise<IEnvApp | null> => {
    const orgObjectId = toObjectId(orgId);
    const appObjectId = toObjectId(appId);
    if (!orgObjectId || !appObjectId) return null;

    return EnvApp.findOneAndUpdate(
      { _id: appObjectId, organizationId: orgObjectId },
      { $set: data },
      { new: true },
    );
  },

  delete: async (orgId: string, appId: string): Promise<boolean> => {
    const orgObjectId = toObjectId(orgId);
    const appObjectId = toObjectId(appId);
    if (!orgObjectId || !appObjectId) return false;

    const result = await EnvApp.deleteOne({
      _id: appObjectId,
      organizationId: orgObjectId,
    });
    // Delete associated variables
    await EnvVariable.deleteMany({ appId: appObjectId });
    return result.deletedCount > 0;
  },

  getStats: async (orgId: string) => {
    const orgObjectId = toObjectId(orgId);
    if (!orgObjectId) {
      return { totalApps: 0, byEnvironment: {}, totalVariables: 0 };
    }

    const [totalApps, byEnvironment, totalVariables] = await Promise.all([
      EnvApp.countDocuments({ organizationId: orgObjectId }),
      EnvApp.aggregate([
        { $match: { organizationId: orgObjectId } },
        { $group: { _id: "$environment", count: { $sum: 1 } } },
      ]),
      EnvVariable.countDocuments({ organizationId: orgObjectId }),
    ]);

    const envCounts: Record<string, number> = {
      development: 0,
      staging: 0,
      production: 0,
    };
    byEnvironment.forEach((e) => {
      envCounts[e._id] = e.count;
    });

    return { totalApps, totalVariables, byEnvironment: envCounts };
  },
};
