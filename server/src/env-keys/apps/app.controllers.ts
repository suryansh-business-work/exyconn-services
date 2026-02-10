import { Request, Response } from "express";
import { envAppService } from "./app.services";

export const envAppController = {
  list: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const { page = "1", limit = "10", search, environment } = req.query;
      const result = await envAppService.list(orgId, {
        page: Number(page),
        limit: Number(limit),
        search: search as string,
        environment: environment as "development" | "staging" | "production",
      });
      res.json(result);
    } catch (err) {
      console.error("EnvApp list error:", err);
      res.status(500).json({ error: "Failed to list apps" });
    }
  },

  get: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const appId = req.params.appId as string;
      const app = await envAppService.get(orgId, appId);
      if (!app) return res.status(404).json({ error: "App not found" });
      res.json(app);
    } catch {
      res.status(500).json({ error: "Failed to get app" });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const app = await envAppService.create(orgId, req.body);
      res.status(201).json(app);
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        return res
          .status(400)
          .json({ error: "App with this name and environment already exists" });
      }
      res.status(500).json({ error: "Failed to create app" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const appId = req.params.appId as string;
      const app = await envAppService.update(orgId, appId, req.body);
      if (!app) return res.status(404).json({ error: "App not found" });
      res.json(app);
    } catch {
      res.status(500).json({ error: "Failed to update app" });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const appId = req.params.appId as string;
      const deleted = await envAppService.delete(orgId, appId);
      if (!deleted) return res.status(404).json({ error: "App not found" });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to delete app" });
    }
  },

  getStats: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const stats = await envAppService.getStats(orgId);
      res.json(stats);
    } catch {
      res.status(500).json({ error: "Failed to get stats" });
    }
  },
};
