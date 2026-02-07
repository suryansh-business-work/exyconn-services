import mongoose from "mongoose";
import { EmailLogModel, IEmailLog, EmailLogStatus } from "./log.models";
import { ListEmailLogsQuery } from "./log.validators";

// Transform Mongoose document to plain object
const transformEmailLog = (doc: IEmailLog) => {
  // Handle variables - could be Map (from Mongoose) or Record (already plain)
  let variables: Record<string, string> = {};
  if (doc.variables instanceof Map) {
    variables = Object.fromEntries(doc.variables);
  } else if (doc.variables && typeof doc.variables === "object") {
    variables = doc.variables as Record<string, string>;
  }

  return {
    id: doc._id.toString(),
    organizationId: doc.organizationId.toString(),
    smtpConfigId: doc.smtpConfigId.toString(),
    templateId: doc.templateId.toString(),
    apiKeyUsed: doc.apiKeyUsed,
    recipient: doc.recipient,
    cc: doc.cc,
    bcc: doc.bcc,
    subject: doc.subject,
    status: doc.status,
    messageId: doc.messageId,
    error: doc.error,
    variables,
    sentAt: doc.sentAt.toISOString(),
    createdAt: doc.createdAt.toISOString(),
  };
};

// Create email log
export const createEmailLog = async (data: {
  organizationId: string;
  smtpConfigId: string;
  templateId: string;
  apiKeyUsed?: string;
  recipient: string;
  cc?: string;
  bcc?: string;
  subject: string;
  status: EmailLogStatus;
  messageId?: string;
  error?: string;
  variables: Record<string, string>;
}) => {
  const log = new EmailLogModel({
    organizationId: new mongoose.Types.ObjectId(data.organizationId),
    smtpConfigId: new mongoose.Types.ObjectId(data.smtpConfigId),
    templateId: new mongoose.Types.ObjectId(data.templateId),
    apiKeyUsed: data.apiKeyUsed,
    recipient: data.recipient,
    cc: data.cc,
    bcc: data.bcc,
    subject: data.subject,
    status: data.status,
    messageId: data.messageId,
    error: data.error,
    variables: data.variables,
  });

  await log.save();
  return transformEmailLog(log);
};

// Get email logs for an organization
export const getEmailLogs = async (
  organizationId: string,
  query: ListEmailLogsQuery,
) => {
  const { page, limit, status, recipient, startDate, endDate, apiKeyUsed } =
    query;
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {
    organizationId: new mongoose.Types.ObjectId(organizationId),
  };

  if (status) {
    filter.status = status;
  }

  if (recipient) {
    filter.recipient = { $regex: recipient, $options: "i" };
  }

  if (apiKeyUsed) {
    filter.apiKeyUsed = apiKeyUsed;
  }

  if (startDate || endDate) {
    filter.sentAt = {};
    if (startDate) {
      (filter.sentAt as Record<string, Date>).$gte = new Date(startDate);
    }
    if (endDate) {
      (filter.sentAt as Record<string, Date>).$lte = new Date(endDate);
    }
  }

  const [logs, total] = await Promise.all([
    EmailLogModel.find(filter)
      .sort({ sentAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("smtpConfigId", "name")
      .populate("templateId", "name"),
    EmailLogModel.countDocuments(filter),
  ]);

  return {
    data: logs.map(transformEmailLog),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Get single email log
export const getEmailLog = async (organizationId: string, logId: string) => {
  const log = await EmailLogModel.findOne({
    _id: new mongoose.Types.ObjectId(logId),
    organizationId: new mongoose.Types.ObjectId(organizationId),
  });

  if (!log) {
    throw new Error("Email log not found");
  }

  return transformEmailLog(log);
};

// Get email stats for an organization (optionally filtered by API key)
export const getEmailStats = async (
  organizationId: string,
  apiKeyUsed?: string,
) => {
  const matchFilter: Record<string, unknown> = {
    organizationId: new mongoose.Types.ObjectId(organizationId),
  };

  if (apiKeyUsed) {
    matchFilter.apiKeyUsed = apiKeyUsed;
  }

  const stats = await EmailLogModel.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
  };

  stats.forEach((stat) => {
    result[stat._id as keyof typeof result] = stat.count;
    result.total += stat.count;
  });

  return result;
};

// Get analytics data for dashboard
export const getEmailAnalytics = async (
  organizationId: string,
  apiKeyUsed?: string,
) => {
  const matchFilter: Record<string, unknown> = {
    organizationId: new mongoose.Types.ObjectId(organizationId),
  };

  if (apiKeyUsed) {
    matchFilter.apiKeyUsed = apiKeyUsed;
  }

  // Get daily stats for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [dailyStats, templateStats, statusStats] = await Promise.all([
    // Daily email counts
    EmailLogModel.aggregate([
      {
        $match: {
          ...matchFilter,
          sentAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$sentAt" } },
            status: "$status",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]),
    // Template usage stats
    EmailLogModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$templateId",
          count: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ["$status", "sent"] }, 1, 0] } },
          failed: { $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] } },
        },
      },
      {
        $lookup: {
          from: "emailtemplates",
          localField: "_id",
          foreignField: "_id",
          as: "template",
        },
      },
      { $unwind: { path: "$template", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          templateId: "$_id",
          templateName: { $ifNull: ["$template.name", "Unknown Template"] },
          count: 1,
          sent: 1,
          failed: 1,
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]),
    // Overall status stats
    EmailLogModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  // Transform daily stats into chart-friendly format
  const dailyChartData: Record<
    string,
    { date: string; sent: number; failed: number; pending: number }
  > = {};

  dailyStats.forEach((stat) => {
    const date = stat._id.date;
    if (!dailyChartData[date]) {
      dailyChartData[date] = { date, sent: 0, failed: 0, pending: 0 };
    }
    dailyChartData[date][stat._id.status as "sent" | "failed" | "pending"] =
      stat.count;
  });

  const chartData = Object.values(dailyChartData).sort((a, b) =>
    a.date.localeCompare(b.date),
  );

  // Calculate totals
  let total = 0,
    sent = 0,
    failed = 0,
    pending = 0;
  statusStats.forEach((stat) => {
    const count = stat.count;
    total += count;
    if (stat._id === "sent") sent = count;
    else if (stat._id === "failed") failed = count;
    else if (stat._id === "pending") pending = count;
  });

  return {
    summary: {
      total,
      sent,
      failed,
      pending,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(1) : "0",
    },
    dailyStats: chartData,
    templateStats,
  };
};
