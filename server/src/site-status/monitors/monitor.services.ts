import mongoose from "mongoose";
import { SiteMonitor, ISiteMonitor, ISiteCheckOptions } from "./monitor.models";
import { SiteCheckResult } from "../history/history.models";
import { siteCheckService } from "../checks/check.services";

interface ListParams {
  page: number;
  limit: number;
  search?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
  isActive?: boolean;
}

interface CreateInput {
  url: string;
  name: string;
  checks: ISiteCheckOptions;
}

interface UpdateInput {
  url?: string;
  name?: string;
  isActive?: boolean;
  checks?: Partial<ISiteCheckOptions>;
}

interface ListResult {
  data: Array<Record<string, unknown>>;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const monitorService = {
  list: async (orgId: string, params: ListParams): Promise<ListResult> => {
    const { page, limit, search, sortBy, sortOrder, isActive } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(orgId),
    };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { url: { $regex: search, $options: "i" } },
      ];
    }
    if (isActive !== undefined) {
      query.isActive = isActive;
    }

    const [data, total] = await Promise.all([
      SiteMonitor.find(query)
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SiteMonitor.countDocuments(query),
    ]);

    return {
      data: data.map((d) => ({ ...d, id: d._id.toString() })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  get: async (
    orgId: string,
    monitorId: string,
  ): Promise<ISiteMonitor | null> => {
    return SiteMonitor.findOne({
      _id: new mongoose.Types.ObjectId(monitorId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
  },

  create: async (orgId: string, data: CreateInput): Promise<ISiteMonitor> => {
    const monitor = new SiteMonitor({
      organizationId: new mongoose.Types.ObjectId(orgId),
      ...data,
    });
    return monitor.save();
  },

  update: async (
    orgId: string,
    monitorId: string,
    data: UpdateInput,
  ): Promise<ISiteMonitor | null> => {
    const updateData: Record<string, unknown> = {};
    if (data.url) updateData.url = data.url;
    if (data.name) updateData.name = data.name;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.checks) {
      Object.entries(data.checks).forEach(([key, value]) => {
        updateData[`checks.${key}`] = value;
      });
    }

    return SiteMonitor.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(monitorId),
        organizationId: new mongoose.Types.ObjectId(orgId),
      },
      { $set: updateData },
      { new: true },
    );
  },

  delete: async (orgId: string, monitorId: string): Promise<boolean> => {
    const result = await SiteMonitor.deleteOne({
      _id: new mongoose.Types.ObjectId(monitorId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
    // Also delete history
    await SiteCheckResult.deleteMany({
      monitorId: new mongoose.Types.ObjectId(monitorId),
    });
    return result.deletedCount > 0;
  },

  checkNow: async (orgId: string, monitorId: string) => {
    const monitor = await SiteMonitor.findOne({
      _id: new mongoose.Types.ObjectId(monitorId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });

    if (!monitor) {
      throw new Error("Monitor not found");
    }

    const result = await siteCheckService.runCheck(monitor);

    // Update monitor with last check info and screenshot URL if available
    const updateFields: Record<string, unknown> = {
      lastCheckedAt: new Date(),
      lastStatus: result.overallStatus,
    };
    if (result.screenshot?.url) {
      updateFields.lastScreenshotUrl = result.screenshot.url;
    }

    await SiteMonitor.updateOne({ _id: monitor._id }, { $set: updateFields });

    return result;
  },
};
