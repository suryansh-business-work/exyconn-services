import mongoose from "mongoose";
import { ApiLogModel, ApiLogSettingsModel, IApiLog, IApiLogSettings } from "./log.models";
import { CreateApiLogInput, ListApiLogsQuery } from "./log.validators";

function transformApiLog(log: IApiLog) {
  return {
    id: log._id?.toString(),
    organizationId: log.organizationId?.toString(),
    method: log.method,
    url: log.url,
    statusCode: log.statusCode,
    level: log.level,
    message: log.message,
    requestHeaders: log.requestHeaders,
    requestBody: log.requestBody,
    responseBody: log.responseBody,
    responseTime: log.responseTime,
    ip: log.ip,
    userAgent: log.userAgent,
    apiKeyUsed: log.apiKeyUsed,
    tags: log.tags,
    source: log.source,
    metadata: log.metadata,
    error: log.error,
    stack: log.stack,
    createdAt: log.createdAt,
    updatedAt: log.updatedAt,
  };
}

function transformSettings(settings: IApiLogSettings) {
  return {
    id: settings._id?.toString(),
    organizationId: settings.organizationId?.toString(),
    retentionDays: settings.retentionDays,
    maxLogsPerDay: settings.maxLogsPerDay,
    enabledLevels: settings.enabledLevels,
    enableRequestBodyCapture: settings.enableRequestBodyCapture,
    enableResponseBodyCapture: settings.enableResponseBodyCapture,
    excludedPaths: settings.excludedPaths,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  };
}

// Create a single log entry
export async function createApiLog(orgId: string, data: CreateApiLogInput) {
  const log = await ApiLogModel.create({
    ...data,
    organizationId: new mongoose.Types.ObjectId(orgId),
  });
  return transformApiLog(log);
}

// Create batch log entries (for heavy data ingestion)
export async function createBatchApiLogs(orgId: string, logs: CreateApiLogInput[]) {
  const orgObjectId = new mongoose.Types.ObjectId(orgId);
  const docs = logs.map((log) => ({
    ...log,
    organizationId: orgObjectId,
  }));
  const result = await ApiLogModel.insertMany(docs, { ordered: false });
  return { inserted: result.length };
}

// Search/list logs with filtering and pagination
export async function getApiLogs(orgId: string, query: ListApiLogsQuery) {
  const {
    page = 1,
    limit = 20,
    level,
    method,
    statusCode,
    search,
    source,
    startDate,
    endDate,
    tags,
    minResponseTime,
    maxResponseTime,
  } = query;

  const filter: Record<string, unknown> = {
    organizationId: new mongoose.Types.ObjectId(orgId),
  };

  if (level) filter.level = level;
  if (method) filter.method = method;
  if (statusCode) filter.statusCode = statusCode;
  if (source) filter.source = source;

  if (tags) {
    const tagArray = tags.split(",").map((t) => t.trim());
    filter.tags = { $in: tagArray };
  }

  if (startDate || endDate) {
    const dateFilter: Record<string, Date> = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);
    filter.createdAt = dateFilter;
  }

  if (minResponseTime || maxResponseTime) {
    const rtFilter: Record<string, number> = {};
    if (minResponseTime) rtFilter.$gte = minResponseTime;
    if (maxResponseTime) rtFilter.$lte = maxResponseTime;
    filter.responseTime = rtFilter;
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    ApiLogModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean<IApiLog[]>(),
    ApiLogModel.countDocuments(filter),
  ]);

  return {
    data: logs.map(transformApiLog),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

// Get single log by id
export async function getApiLog(orgId: string, logId: string) {
  const log = await ApiLogModel.findOne({
    _id: new mongoose.Types.ObjectId(logId),
    organizationId: new mongoose.Types.ObjectId(orgId),
  }).lean<IApiLog>();

  return log ? transformApiLog(log) : null;
}

// Delete logs by filter (bulk cleanup)
export async function deleteApiLogs(
  orgId: string,
  filter: { level?: string; before?: string; source?: string },
) {
  const mongoFilter: Record<string, unknown> = {
    organizationId: new mongoose.Types.ObjectId(orgId),
  };
  if (filter.level) mongoFilter.level = filter.level;
  if (filter.source) mongoFilter.source = filter.source;
  if (filter.before) mongoFilter.createdAt = { $lt: new Date(filter.before) };

  const result = await ApiLogModel.deleteMany(mongoFilter);
  return { deleted: result.deletedCount };
}

// Get log stats (aggregation pipeline for heavy data)
export async function getApiLogStats(orgId: string) {
  const orgObjectId = new mongoose.Types.ObjectId(orgId);

  const [levelStats, methodStats, overview, recentErrors] = await Promise.all([
    ApiLogModel.aggregate([
      { $match: { organizationId: orgObjectId } },
      { $group: { _id: "$level", count: { $sum: 1 } } },
    ]),
    ApiLogModel.aggregate([
      { $match: { organizationId: orgObjectId } },
      { $group: { _id: "$method", count: { $sum: 1 } } },
    ]),
    ApiLogModel.aggregate([
      { $match: { organizationId: orgObjectId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          avgResponseTime: { $avg: "$responseTime" },
          maxResponseTime: { $max: "$responseTime" },
          errorCount: {
            $sum: { $cond: [{ $eq: ["$level", "error"] }, 1, 0] },
          },
        },
      },
    ]),
    ApiLogModel.find({ organizationId: orgObjectId, level: "error" })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean<IApiLog[]>(),
  ]);

  const levelMap: Record<string, number> = {};
  for (const s of levelStats) {
    levelMap[s._id] = s.count;
  }

  const methodMap: Record<string, number> = {};
  for (const s of methodStats) {
    methodMap[s._id] = s.count;
  }

  const ov = overview[0] || { total: 0, avgResponseTime: 0, maxResponseTime: 0, errorCount: 0 };

  return {
    total: ov.total,
    avgResponseTime: Math.round(ov.avgResponseTime || 0),
    maxResponseTime: ov.maxResponseTime || 0,
    errorCount: ov.errorCount,
    byLevel: {
      info: levelMap["info"] || 0,
      warn: levelMap["warn"] || 0,
      error: levelMap["error"] || 0,
      debug: levelMap["debug"] || 0,
    },
    byMethod: methodMap,
    recentErrors: recentErrors.map(transformApiLog),
  };
}

// Get analytics (time-series for charts)
export async function getApiLogAnalytics(orgId: string, days: number = 30) {
  const orgObjectId = new mongoose.Types.ObjectId(orgId);
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const [dailyStats, sourceStats, statusCodeStats] = await Promise.all([
    ApiLogModel.aggregate([
      {
        $match: {
          organizationId: orgObjectId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          total: { $sum: 1 },
          errors: {
            $sum: { $cond: [{ $eq: ["$level", "error"] }, 1, 0] },
          },
          avgResponseTime: { $avg: "$responseTime" },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    ApiLogModel.aggregate([
      {
        $match: {
          organizationId: orgObjectId,
          createdAt: { $gte: startDate },
          source: { $ne: "" },
        },
      },
      {
        $group: {
          _id: "$source",
          count: { $sum: 1 },
          errors: {
            $sum: { $cond: [{ $eq: ["$level", "error"] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    ApiLogModel.aggregate([
      {
        $match: {
          organizationId: orgObjectId,
          createdAt: { $gte: startDate },
          statusCode: { $gt: 0 },
        },
      },
      {
        $group: {
          _id: "$statusCode",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
  ]);

  return {
    dailyStats: dailyStats.map((d) => ({
      date: d._id,
      total: d.total,
      errors: d.errors,
      avgResponseTime: Math.round(d.avgResponseTime || 0),
    })),
    sourceStats: sourceStats.map((s) => ({
      source: s._id,
      count: s.count,
      errors: s.errors,
    })),
    statusCodeStats: statusCodeStats.map((s) => ({
      statusCode: s._id,
      count: s.count,
    })),
  };
}

// Get or create settings
export async function getApiLogSettings(orgId: string) {
  let settings = await ApiLogSettingsModel.findOne({
    organizationId: new mongoose.Types.ObjectId(orgId),
  }).lean<IApiLogSettings>();

  if (!settings) {
    settings = await ApiLogSettingsModel.create({
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
  }

  return transformSettings(settings as IApiLogSettings);
}

// Update settings
export async function updateApiLogSettings(
  orgId: string,
  data: Partial<{
    retentionDays: number;
    maxLogsPerDay: number;
    enabledLevels: string[];
    enableRequestBodyCapture: boolean;
    enableResponseBodyCapture: boolean;
    excludedPaths: string[];
  }>,
) {
  const settings = await ApiLogSettingsModel.findOneAndUpdate(
    { organizationId: new mongoose.Types.ObjectId(orgId) },
    { $set: data },
    { new: true, upsert: true },
  ).lean<IApiLogSettings>();

  return transformSettings(settings as IApiLogSettings);
}
