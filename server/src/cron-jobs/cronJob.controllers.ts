import { Request, Response } from "express";
import { cronJobService, cronJobSSE } from "./cronJob.services";
import {
  listCronJobsQuerySchema,
  createCronJobSchema,
  updateCronJobSchema,
  listCronJobHistoryQuerySchema,
} from "./cronJob.validators";

export const getCronJobs = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const parsed = listCronJobsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid query", details: parsed.error.issues });
    }
    const result = await cronJobService.list(orgId, parsed.data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to list cron jobs" });
  }
};

export const getCronJob = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const jobId = req.params.jobId as string;
    const job = await cronJobService.get(orgId, jobId);
    if (!job) return res.status(404).json({ error: "Cron job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to get cron job" });
  }
};

export const createCronJob = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const parsed = createCronJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.issues });
    }
    const job = await cronJobService.create(orgId, parsed.data as Parameters<typeof cronJobService.create>[1]);
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to create cron job" });
  }
};

export const updateCronJob = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const jobId = req.params.jobId as string;
    const parsed = updateCronJobSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid input", details: parsed.error.issues });
    }
    const job = await cronJobService.update(orgId, jobId, parsed.data as Parameters<typeof cronJobService.update>[2]);
    if (!job) return res.status(404).json({ error: "Cron job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to update cron job" });
  }
};

export const deleteCronJob = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const jobId = req.params.jobId as string;
    const deleted = await cronJobService.delete(orgId, jobId);
    if (!deleted) return res.status(404).json({ error: "Cron job not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete cron job" });
  }
};

export const togglePauseCronJob = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const jobId = req.params.jobId as string;
    const job = await cronJobService.togglePause(orgId, jobId);
    if (!job) return res.status(404).json({ error: "Cron job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to toggle cron job" });
  }
};

export const executeCronJob = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const jobId = req.params.jobId as string;
    const result = await cronJobService.execute(orgId, jobId);
    res.json(result);
  } catch (err) {
    const error = err as Error;
    if (error.message === "Cron job not found") {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: "Failed to execute cron job" });
  }
};

export const getCronJobHistory = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const parsed = listCronJobHistoryQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: "Invalid query", details: parsed.error.issues });
    }
    const result = await cronJobService.getHistory(orgId, parsed.data);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to get cron job history" });
  }
};

export const getCronJobStats = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const stats = await cronJobService.getStats(orgId);
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to get cron job stats" });
  }
};

// SSE endpoint for real-time cron job events
export const cronJobEvents = (req: Request, res: Response) => {
  const orgId = req.params.orgId as string;

  // Set SSE headers
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // Send initial connection event
  res.write(
    `event: connected\ndata: ${JSON.stringify({ message: "Connected to cron job events", orgId })}\n\n`,
  );

  // Keep-alive heartbeat
  const heartbeat = setInterval(() => {
    res.write(
      `event: heartbeat\ndata: ${JSON.stringify({ timestamp: new Date().toISOString() })}\n\n`,
    );
  }, 30000);

  // Register SSE client
  const sendFn = (data: string) => {
    res.write(data);
  };

  cronJobSSE.addClient(orgId, sendFn);

  // Cleanup on disconnect
  req.on("close", () => {
    clearInterval(heartbeat);
    cronJobSSE.removeClient(orgId, sendFn);
  });
};
