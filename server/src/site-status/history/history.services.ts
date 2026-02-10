import mongoose from "mongoose";
import { SiteCheckResult, ISiteCheckResult } from "./history.models";
import { SiteMonitor } from "../monitors/monitor.models";

interface ListParams {
  page: number;
  limit: number;
  monitorId?: string;
  status?: "healthy" | "warning" | "error";
  startDate?: string;
  endDate?: string;
}

interface ListResult {
  data: Array<Record<string, unknown>>;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export const historyService = {
  list: async (orgId: string, params: ListParams): Promise<ListResult> => {
    const { page, limit, monitorId, status, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(orgId),
    };
    if (monitorId) query.monitorId = new mongoose.Types.ObjectId(monitorId);
    if (status) query.overallStatus = status;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate)
        (query.timestamp as Record<string, Date>).$gte = new Date(startDate);
      if (endDate)
        (query.timestamp as Record<string, Date>).$lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      SiteCheckResult.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      SiteCheckResult.countDocuments(query),
    ]);

    return {
      data: data.map((d) => ({ ...d, id: d._id.toString() })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  get: async (
    orgId: string,
    checkId: string,
  ): Promise<ISiteCheckResult | null> => {
    return SiteCheckResult.findOne({
      _id: new mongoose.Types.ObjectId(checkId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
  },

  getStats: async (orgId: string) => {
    const orgObjectId = new mongoose.Types.ObjectId(orgId);

    const [
      totalMonitors,
      activeMonitors,
      statusCounts,
      avgResponseTime,
      last24hChecks,
    ] = await Promise.all([
      SiteMonitor.countDocuments({ organizationId: orgObjectId }),
      SiteMonitor.countDocuments({
        organizationId: orgObjectId,
        isActive: true,
      }),
      SiteMonitor.aggregate([
        { $match: { organizationId: orgObjectId } },
        { $group: { _id: "$lastStatus", count: { $sum: 1 } } },
      ]),
      SiteCheckResult.aggregate([
        {
          $match: {
            organizationId: orgObjectId,
            timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          },
        },
        { $group: { _id: null, avgResponseTime: { $avg: "$responseTime" } } },
      ]),
      SiteCheckResult.countDocuments({
        organizationId: orgObjectId,
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        overallStatus: "healthy",
      }),
    ]);

    const statusMap = statusCounts.reduce(
      (acc, curr) => {
        acc[curr._id as string] = curr.count;
        return acc;
      },
      {} as Record<string, number>,
    );

    const totalChecks24h = await SiteCheckResult.countDocuments({
      organizationId: orgObjectId,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    return {
      totalMonitors,
      activeMonitors,
      healthyCount: statusMap.healthy || 0,
      warningCount: statusMap.warning || 0,
      errorCount: statusMap.error || 0,
      averageResponseTime: Math.round(avgResponseTime[0]?.avgResponseTime || 0),
      uptimePercentage:
        totalChecks24h > 0
          ? Math.round((last24hChecks / totalChecks24h) * 100)
          : 100,
    };
  },
};
