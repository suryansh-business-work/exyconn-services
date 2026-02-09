import { Request, Response } from "express";
import {
  listApiLogsQuerySchema,
  createApiLogSchema,
  createBatchApiLogsSchema,
  updateApiLogSettingsSchema,
} from "./log.validators";
import * as logService from "./log.services";

export const getApiLogs = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const query = listApiLogsQuerySchema.parse(req.query);
    const result = await logService.getApiLogs(orgId, query);
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Invalid query parameters", details: error });
      return;
    }
    console.error("Error fetching API logs:", error);
    res.status(500).json({ error: "Failed to fetch API logs" });
  }
};

export const getApiLog = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const logId = req.params.logId as string;
    const log = await logService.getApiLog(orgId, logId);
    if (!log) {
      res.status(404).json({ error: "Log not found" });
      return;
    }
    res.json(log);
  } catch (error) {
    console.error("Error fetching API log:", error);
    res.status(500).json({ error: "Failed to fetch API log" });
  }
};

export const createApiLog = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const data = createApiLogSchema.parse(req.body);
    const log = await logService.createApiLog(orgId, data);
    res.status(201).json(log);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Invalid log data", details: error });
      return;
    }
    console.error("Error creating API log:", error);
    res.status(500).json({ error: "Failed to create API log" });
  }
};

export const createBatchApiLogs = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const data = createBatchApiLogsSchema.parse(req.body);
    const result = await logService.createBatchApiLogs(orgId, data.logs);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Invalid batch data", details: error });
      return;
    }
    console.error("Error creating batch API logs:", error);
    res.status(500).json({ error: "Failed to create batch API logs" });
  }
};

export const deleteApiLogs = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const { level, before, source } = req.query as {
      level?: string;
      before?: string;
      source?: string;
    };
    const result = await logService.deleteApiLogs(orgId, { level, before, source });
    res.json(result);
  } catch (error) {
    console.error("Error deleting API logs:", error);
    res.status(500).json({ error: "Failed to delete API logs" });
  }
};

export const getApiLogStats = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const stats = await logService.getApiLogStats(orgId);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching API log stats:", error);
    res.status(500).json({ error: "Failed to fetch API log stats" });
  }
};

export const getApiLogAnalytics = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const days = req.query.days ? parseInt(req.query.days as string, 10) : 30;
    const analytics = await logService.getApiLogAnalytics(orgId, days);
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching API log analytics:", error);
    res.status(500).json({ error: "Failed to fetch API log analytics" });
  }
};

export const getApiLogSettings = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const settings = await logService.getApiLogSettings(orgId);
    res.json(settings);
  } catch (error) {
    console.error("Error fetching API log settings:", error);
    res.status(500).json({ error: "Failed to fetch API log settings" });
  }
};

export const updateApiLogSettings = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const data = updateApiLogSettingsSchema.parse(req.body);
    const settings = await logService.updateApiLogSettings(orgId, data);
    res.json(settings);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Invalid settings data", details: error });
      return;
    }
    console.error("Error updating API log settings:", error);
    res.status(500).json({ error: "Failed to update API log settings" });
  }
};
