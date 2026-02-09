import mongoose from "mongoose";
import { CronJob, CronJobHistory, ICronJob } from "./cronJob.models";

// Store SSE clients per org for real-time events
const sseClients: Map<string, Set<(data: string) => void>> = new Map();

export const cronJobSSE = {
  addClient: (orgId: string, sendFn: (data: string) => void) => {
    if (!sseClients.has(orgId)) {
      sseClients.set(orgId, new Set());
    }
    sseClients.get(orgId)!.add(sendFn);
  },

  removeClient: (orgId: string, sendFn: (data: string) => void) => {
    sseClients.get(orgId)?.delete(sendFn);
    if (sseClients.get(orgId)?.size === 0) {
      sseClients.delete(orgId);
    }
  },

  broadcast: (orgId: string, event: string, data: unknown) => {
    const clients = sseClients.get(orgId);
    if (clients) {
      const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      clients.forEach((sendFn) => sendFn(payload));
    }
  },
};

interface ListParams {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  tags?: string;
}

interface CreateInput {
  name: string;
  description?: string;
  cronExpression: string;
  timezone?: string;
  webhookUrl: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  maxRetries?: number;
  timeout?: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

// Parse cron expression to get next execution time (basic implementation)
const getNextExecution = (cronExpression: string): Date => {
  // Simple next-minute calculation for demo purposes
  const now = new Date();
  const parts = cronExpression.split(" ");
  const minute = parts[0];

  if (minute === "*") {
    return new Date(now.getTime() + 60000);
  }

  const nextMin = parseInt(minute, 10);
  const next = new Date(now);
  next.setMinutes(nextMin);
  next.setSeconds(0);
  next.setMilliseconds(0);

  if (next <= now) {
    next.setHours(next.getHours() + 1);
  }

  return next;
};

export const cronJobService = {
  list: async (orgId: string, params: ListParams) => {
    const { page, limit, status, search, tags } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(orgId),
    };

    if (status) query.status = status;
    if (tags) query.tags = { $in: tags.split(",") };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const [data, total] = await Promise.all([
      CronJob.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      CronJob.countDocuments(query),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  get: async (orgId: string, jobId: string): Promise<ICronJob | null> => {
    return CronJob.findOne({
      _id: new mongoose.Types.ObjectId(jobId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
  },

  create: async (orgId: string, data: CreateInput): Promise<ICronJob> => {
    const nextExecutionAt = getNextExecution(data.cronExpression);

    const job = new CronJob({
      organizationId: new mongoose.Types.ObjectId(orgId),
      ...data,
      nextExecutionAt,
    });

    const savedJob = await job.save();

    // Broadcast SSE event
    cronJobSSE.broadcast(orgId, "job:created", {
      jobId: savedJob.id,
      name: savedJob.name,
      status: savedJob.status,
      timestamp: new Date().toISOString(),
    });

    return savedJob;
  },

  update: async (
    orgId: string,
    jobId: string,
    data: Partial<CreateInput> & { status?: string },
  ): Promise<ICronJob | null> => {
    const updateData: Record<string, unknown> = { ...data };

    if (data.cronExpression) {
      updateData.nextExecutionAt = getNextExecution(data.cronExpression);
    }

    const job = await CronJob.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(jobId),
        organizationId: new mongoose.Types.ObjectId(orgId),
      },
      { $set: updateData },
      { new: true },
    );

    if (job) {
      cronJobSSE.broadcast(orgId, "job:updated", {
        jobId: job.id,
        name: job.name,
        status: job.status,
        timestamp: new Date().toISOString(),
      });
    }

    return job;
  },

  delete: async (orgId: string, jobId: string): Promise<boolean> => {
    const result = await CronJob.deleteOne({
      _id: new mongoose.Types.ObjectId(jobId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });

    if (result.deletedCount > 0) {
      // Also delete history
      await CronJobHistory.deleteMany({
        cronJobId: new mongoose.Types.ObjectId(jobId),
        organizationId: new mongoose.Types.ObjectId(orgId),
      });

      cronJobSSE.broadcast(orgId, "job:deleted", {
        jobId,
        timestamp: new Date().toISOString(),
      });
    }

    return result.deletedCount > 0;
  },

  togglePause: async (
    orgId: string,
    jobId: string,
  ): Promise<ICronJob | null> => {
    const job = await CronJob.findOne({
      _id: new mongoose.Types.ObjectId(jobId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });

    if (!job) return null;

    job.status = job.status === "active" ? "paused" : "active";
    if (job.status === "active") {
      job.nextExecutionAt = getNextExecution(job.cronExpression);
    }

    await job.save();

    cronJobSSE.broadcast(orgId, "job:toggled", {
      jobId: job.id,
      name: job.name,
      status: job.status,
      timestamp: new Date().toISOString(),
    });

    return job;
  },

  execute: async (
    orgId: string,
    jobId: string,
  ): Promise<{ success: boolean; execution: Record<string, unknown> }> => {
    const job = await CronJob.findOne({
      _id: new mongoose.Types.ObjectId(jobId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });

    if (!job) throw new Error("Cron job not found");

    const startTime = Date.now();
    let responseStatus: number | undefined;
    let responseBody: string | undefined;
    let error: string | undefined;
    let status: "success" | "failure" = "success";

    // Broadcast execution start
    cronJobSSE.broadcast(orgId, "job:execution:start", {
      jobId: job.id,
      name: job.name,
      webhookUrl: job.webhookUrl,
      method: job.method,
      timestamp: new Date().toISOString(),
    });

    try {
      const fetchOptions: RequestInit = {
        method: job.method,
        headers: {
          "Content-Type": "application/json",
          ...job.headers,
        },
        signal: AbortSignal.timeout(job.timeout),
      };

      if (
        job.body &&
        ["POST", "PUT", "PATCH"].includes(job.method)
      ) {
        fetchOptions.body = job.body;
      }

      const response = await fetch(job.webhookUrl, fetchOptions);
      responseStatus = response.status;
      responseBody = await response.text().catch(() => "");

      if (!response.ok) {
        status = "failure";
        error = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (err) {
      status = "failure";
      error = err instanceof Error ? err.message : "Request failed";
    }

    const duration = Date.now() - startTime;

    // Save execution history
    const historyEntry = await CronJobHistory.create({
      organizationId: new mongoose.Types.ObjectId(orgId),
      cronJobId: job._id,
      jobName: job.name,
      executedAt: new Date(),
      status,
      responseStatus,
      responseTime: duration,
      responseBody: responseBody?.substring(0, 5000),
      requestUrl: job.webhookUrl,
      requestMethod: job.method,
      error,
      duration,
      retryAttempt: 0,
    });

    // Update job stats
    job.lastExecutedAt = new Date();
    job.executionCount += 1;
    job.nextExecutionAt = getNextExecution(job.cronExpression);

    if (status === "success") {
      job.successCount += 1;
      job.retryCount = 0;
    } else {
      job.failureCount += 1;
      job.retryCount += 1;
      if (job.retryCount >= job.maxRetries) {
        job.status = "failed";
      }
    }

    await job.save();

    const executionResult = {
      id: historyEntry.id,
      jobId: job.id,
      jobName: job.name,
      status,
      responseStatus,
      duration,
      error,
      executedAt: historyEntry.executedAt,
    };

    // Broadcast execution complete
    cronJobSSE.broadcast(orgId, "job:execution:complete", executionResult);

    return { success: status === "success", execution: executionResult };
  },

  getHistory: async (
    orgId: string,
    params: {
      page: number;
      limit: number;
      cronJobId?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
  ) => {
    const { page, limit, cronJobId, status, startDate, endDate } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(orgId),
    };

    if (cronJobId) query.cronJobId = new mongoose.Types.ObjectId(cronJobId);
    if (status) query.status = status;
    if (startDate || endDate) {
      query.executedAt = {};
      if (startDate)
        (query.executedAt as Record<string, unknown>).$gte = new Date(
          startDate,
        );
      if (endDate)
        (query.executedAt as Record<string, unknown>).$lte = new Date(endDate);
    }

    const [data, total] = await Promise.all([
      CronJobHistory.find(query)
        .sort({ executedAt: -1 })
        .skip(skip)
        .limit(limit),
      CronJobHistory.countDocuments(query),
    ]);

    return {
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  getStats: async (orgId: string) => {
    const orgObjectId = new mongoose.Types.ObjectId(orgId);

    const [jobStats, executionStats] = await Promise.all([
      CronJob.aggregate([
        { $match: { organizationId: orgObjectId } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: {
              $sum: { $cond: [{ $eq: ["$status", "active"] }, 1, 0] },
            },
            paused: {
              $sum: { $cond: [{ $eq: ["$status", "paused"] }, 1, 0] },
            },
            failed: {
              $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
            },
            totalExecutions: { $sum: "$executionCount" },
            totalSuccess: { $sum: "$successCount" },
            totalFailures: { $sum: "$failureCount" },
          },
        },
      ]),
      CronJobHistory.aggregate([
        { $match: { organizationId: orgObjectId } },
        {
          $group: {
            _id: null,
            avgDuration: { $avg: "$duration" },
            maxDuration: { $max: "$duration" },
            recentCount: { $sum: 1 },
          },
        },
      ]),
    ]);

    const stats = jobStats[0] || {
      total: 0,
      active: 0,
      paused: 0,
      failed: 0,
      totalExecutions: 0,
      totalSuccess: 0,
      totalFailures: 0,
    };

    const execStats = executionStats[0] || {
      avgDuration: 0,
      maxDuration: 0,
      recentCount: 0,
    };

    return {
      ...stats,
      avgDuration: Math.round(execStats.avgDuration || 0),
      maxDuration: execStats.maxDuration || 0,
      historyCount: execStats.recentCount,
    };
  },
};
