import { Request, Response } from "express";
import * as logService from "./log.services";
import { listEmailLogsQuerySchema } from "./log.validators";

// Get all email logs for organization
export const getEmailLogs = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const query = listEmailLogsQuerySchema.parse(req.query);
    const result = await logService.getEmailLogs(orgId, query);
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Validation failed", details: error });
    } else {
      console.error("Error fetching email logs:", error);
      res.status(500).json({ error: "Failed to fetch email logs" });
    }
  }
};

// Get single email log
export const getEmailLog = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const logId = req.params.logId as string;
    const log = await logService.getEmailLog(orgId, logId);
    res.json(log);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      console.error("Error fetching email log:", error);
      res.status(500).json({ error: "Failed to fetch email log" });
    }
  }
};

// Get email stats
export const getEmailStats = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const { apiKeyUsed } = req.query;
    const stats = await logService.getEmailStats(
      orgId,
      apiKeyUsed as string | undefined,
    );
    res.json(stats);
  } catch (error) {
    console.error("Error fetching email stats:", error);
    res.status(500).json({ error: "Failed to fetch email stats" });
  }
};

// Get email analytics for dashboard
export const getEmailAnalytics = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const { apiKeyUsed } = req.query;
    const analytics = await logService.getEmailAnalytics(
      orgId,
      apiKeyUsed as string | undefined,
    );
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching email analytics:", error);
    res.status(500).json({ error: "Failed to fetch email analytics" });
  }
};
