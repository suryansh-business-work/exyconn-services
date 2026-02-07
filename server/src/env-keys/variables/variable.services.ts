import mongoose from "mongoose";
import { EnvVariable, IEnvVariable } from "./variable.models";

interface ListParams {
  page: number;
  limit: number;
  search?: string;
}

interface CreateInput {
  key: string;
  value: string;
  isSecret?: boolean;
  description?: string;
}

interface UpdateInput {
  key?: string;
  value?: string;
  isSecret?: boolean;
  description?: string;
}

// Helper to safely create ObjectId
const toObjectId = (id: string): mongoose.Types.ObjectId | null => {
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
};

export const envVariableService = {
  list: async (orgId: string, appId: string, params: ListParams) => {
    const { page, limit, search } = params;
    const skip = (page - 1) * limit;

    const orgObjectId = toObjectId(orgId);
    const appObjectId = toObjectId(appId);
    if (!orgObjectId || !appObjectId) {
      return { data: [], pagination: { page, limit, total: 0, totalPages: 0 } };
    }

    const query: Record<string, unknown> = {
      organizationId: orgObjectId,
      appId: appObjectId,
    };
    if (search) {
      query.$or = [
        { key: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      EnvVariable.find(query).sort({ key: 1 }).skip(skip).limit(limit).lean(),
      EnvVariable.countDocuments(query),
    ]);

    return {
      data: data.map((d) => ({
        ...d,
        id: d._id.toString(),
        value: d.isSecret ? "••••••••" : d.value,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  get: async (
    orgId: string,
    appId: string,
    variableId: string,
  ): Promise<IEnvVariable | null> => {
    const orgObjectId = toObjectId(orgId);
    const appObjectId = toObjectId(appId);
    const varObjectId = toObjectId(variableId);
    if (!orgObjectId || !appObjectId || !varObjectId) return null;

    return EnvVariable.findOne({
      _id: varObjectId,
      organizationId: orgObjectId,
      appId: appObjectId,
    });
  },

  getActualValue: async (
    orgId: string,
    appId: string,
    variableId: string,
  ): Promise<string | null> => {
    const orgObjectId = toObjectId(orgId);
    const appObjectId = toObjectId(appId);
    const varObjectId = toObjectId(variableId);
    if (!orgObjectId || !appObjectId || !varObjectId) return null;

    const variable = await EnvVariable.findOne({
      _id: varObjectId,
      organizationId: orgObjectId,
      appId: appObjectId,
    });
    return variable?.value || null;
  },

  create: async (
    orgId: string,
    appId: string,
    data: CreateInput,
  ): Promise<IEnvVariable> => {
    const orgObjectId = toObjectId(orgId);
    const appObjectId = toObjectId(appId);
    if (!orgObjectId || !appObjectId) throw new Error("Invalid IDs");

    const variable = new EnvVariable({
      organizationId: orgObjectId,
      appId: appObjectId,
      ...data,
    });
    return variable.save();
  },

  update: async (
    orgId: string,
    appId: string,
    variableId: string,
    data: UpdateInput,
  ): Promise<IEnvVariable | null> => {
    const orgObjectId = toObjectId(orgId);
    const appObjectId = toObjectId(appId);
    const varObjectId = toObjectId(variableId);
    if (!orgObjectId || !appObjectId || !varObjectId) return null;

    return EnvVariable.findOneAndUpdate(
      {
        _id: varObjectId,
        organizationId: orgObjectId,
        appId: appObjectId,
      },
      { $set: data },
      { new: true },
    );
  },

  delete: async (
    orgId: string,
    appId: string,
    variableId: string,
  ): Promise<boolean> => {
    const orgObjectId = toObjectId(orgId);
    const appObjectId = toObjectId(appId);
    const varObjectId = toObjectId(variableId);
    if (!orgObjectId || !appObjectId || !varObjectId) return false;

    const result = await EnvVariable.deleteOne({
      _id: varObjectId,
      organizationId: orgObjectId,
      appId: appObjectId,
    });
    return result.deletedCount > 0;
  },

  bulkCreate: async (
    orgId: string,
    appId: string,
    variables: CreateInput[],
  ): Promise<IEnvVariable[]> => {
    const orgObjectId = toObjectId(orgId);
    const appObjectId = toObjectId(appId);
    if (!orgObjectId || !appObjectId) throw new Error("Invalid IDs");

    const docs = variables.map((v) => ({
      organizationId: orgObjectId,
      appId: appObjectId,
      ...v,
    }));
    return EnvVariable.insertMany(docs, { ordered: false });
  },

  getAllForApp: async (
    orgId: string,
    appId: string,
  ): Promise<Record<string, string>> => {
    const orgObjectId = toObjectId(orgId);
    const appObjectId = toObjectId(appId);
    if (!orgObjectId || !appObjectId) return {};

    const variables = await EnvVariable.find({
      organizationId: orgObjectId,
      appId: appObjectId,
    }).lean();

    const result: Record<string, string> = {};
    variables.forEach((v) => {
      result[v.key] = v.value;
    });
    return result;
  },
};
