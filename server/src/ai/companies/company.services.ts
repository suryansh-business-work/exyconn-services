import mongoose from "mongoose";
import {
  AICompany,
  IAICompany,
  AIProvider,
  PROVIDER_MODELS,
} from "./company.models";

interface ListParams {
  page: number;
  limit: number;
  provider?: AIProvider;
}

interface CreateInput {
  name: string;
  provider: AIProvider;
  apiKey: string;
  apiSecret?: string;
  baseUrl?: string;
  defaultModel?: string;
  availableModels?: string[];
}

interface UpdateInput {
  name?: string;
  provider?: AIProvider;
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  defaultModel?: string;
  availableModels?: string[];
  isActive?: boolean;
}

export const aiCompanyService = {
  list: async (orgId: string, params: ListParams) => {
    const { page, limit, provider } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(orgId),
    };
    if (provider) query.provider = provider;

    const [data, total] = await Promise.all([
      AICompany.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AICompany.countDocuments(query),
    ]);

    return {
      data: data.map((d) => ({
        ...d,
        id: d._id.toString(),
        apiKey: "••••••••" + d.apiKey.slice(-4),
        apiSecret: d.apiSecret ? "••••••••" : undefined,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  get: async (orgId: string, companyId: string): Promise<IAICompany | null> => {
    return AICompany.findOne({
      _id: new mongoose.Types.ObjectId(companyId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
  },

  getWithCredentials: async (orgId: string, companyId: string) => {
    return AICompany.findOne({
      _id: new mongoose.Types.ObjectId(companyId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    }).lean();
  },

  create: async (orgId: string, data: CreateInput): Promise<IAICompany> => {
    // Set default models from provider if not provided
    const availableModels = data.availableModels?.length
      ? data.availableModels
      : PROVIDER_MODELS[data.provider] || [];

    const company = new AICompany({
      organizationId: new mongoose.Types.ObjectId(orgId),
      ...data,
      availableModels,
    });
    return company.save();
  },

  update: async (
    orgId: string,
    companyId: string,
    data: UpdateInput,
  ): Promise<IAICompany | null> => {
    return AICompany.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(companyId),
        organizationId: new mongoose.Types.ObjectId(orgId),
      },
      { $set: data },
      { new: true },
    );
  },

  delete: async (orgId: string, companyId: string): Promise<boolean> => {
    const result = await AICompany.deleteOne({
      _id: new mongoose.Types.ObjectId(companyId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
    return result.deletedCount > 0;
  },

  getStats: async (orgId: string) => {
    const orgObjectId = new mongoose.Types.ObjectId(orgId);

    const [total, byProvider, activeCount] = await Promise.all([
      AICompany.countDocuments({ organizationId: orgObjectId }),
      AICompany.aggregate([
        { $match: { organizationId: orgObjectId } },
        { $group: { _id: "$provider", count: { $sum: 1 } } },
      ]),
      AICompany.countDocuments({ organizationId: orgObjectId, isActive: true }),
    ]);

    const providerCounts: Record<string, number> = {};
    byProvider.forEach((p) => {
      providerCounts[p._id] = p.count;
    });

    return {
      totalCompanies: total,
      activeCompanies: activeCount,
      byProvider: providerCounts,
    };
  },
};
