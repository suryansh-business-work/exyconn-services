import { Request, Response, NextFunction } from "express";
import { monitorService } from "./monitor.services";

export const monitorController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.orgId as string;
      const { page, limit, search, sortBy, sortOrder, isActive } = req.query;

      const result = await monitorService.list(orgId, {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        search: search as string,
        sortBy: (sortBy as string) || "createdAt",
        sortOrder: (sortOrder as "asc" | "desc") || "desc",
        isActive:
          isActive === "true" ? true : isActive === "false" ? false : undefined,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.orgId as string;
      const monitorId = req.params.monitorId as string;
      const monitor = await monitorService.get(orgId, monitorId);

      if (!monitor) {
        return res.status(404).json({ error: "Monitor not found" });
      }

      res.json(monitor);
    } catch (err) {
      next(err);
    }
  },

  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.orgId as string;
      const monitor = await monitorService.create(orgId, req.body);
      res.status(201).json(monitor);
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.orgId as string;
      const monitorId = req.params.monitorId as string;
      const monitor = await monitorService.update(orgId, monitorId, req.body);

      if (!monitor) {
        return res.status(404).json({ error: "Monitor not found" });
      }

      res.json(monitor);
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.orgId as string;
      const monitorId = req.params.monitorId as string;
      const deleted = await monitorService.delete(orgId, monitorId);

      if (!deleted) {
        return res.status(404).json({ error: "Monitor not found" });
      }

      res.json({ success: true, message: "Monitor deleted" });
    } catch (err) {
      next(err);
    }
  },

  checkNow: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.orgId as string;
      const monitorId = req.params.monitorId as string;
      const result = await monitorService.checkNow(orgId, monitorId);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },
};
