import { Request, Response } from "express";
import { envVariableService } from "./variable.services";

export const envVariableController = {
  list: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const appId = req.params.appId as string;
      const { page = "1", limit = "50", search } = req.query;
      const result = await envVariableService.list(orgId, appId, {
        page: Number(page),
        limit: Number(limit),
        search: search as string,
      });
      res.json(result);
    } catch {
      res.status(500).json({ error: "Failed to list variables" });
    }
  },

  get: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const appId = req.params.appId as string;
      const variableId = req.params.variableId as string;
      const variable = await envVariableService.get(orgId, appId, variableId);
      if (!variable)
        return res.status(404).json({ error: "Variable not found" });
      res.json(variable);
    } catch {
      res.status(500).json({ error: "Failed to get variable" });
    }
  },

  getActualValue: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const appId = req.params.appId as string;
      const variableId = req.params.variableId as string;
      const value = await envVariableService.getActualValue(
        orgId,
        appId,
        variableId,
      );
      if (value === null)
        return res.status(404).json({ error: "Variable not found" });
      res.json({ value });
    } catch {
      res.status(500).json({ error: "Failed to get value" });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const appId = req.params.appId as string;
      const variable = await envVariableService.create(orgId, appId, req.body);
      res.status(201).json(variable);
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        return res
          .status(400)
          .json({ error: "Variable with this key already exists in this app" });
      }
      res.status(500).json({ error: "Failed to create variable" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const appId = req.params.appId as string;
      const variableId = req.params.variableId as string;
      const variable = await envVariableService.update(
        orgId,
        appId,
        variableId,
        req.body,
      );
      if (!variable)
        return res.status(404).json({ error: "Variable not found" });
      res.json(variable);
    } catch {
      res.status(500).json({ error: "Failed to update variable" });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const appId = req.params.appId as string;
      const variableId = req.params.variableId as string;
      const deleted = await envVariableService.delete(orgId, appId, variableId);
      if (!deleted)
        return res.status(404).json({ error: "Variable not found" });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to delete variable" });
    }
  },

  bulkCreate: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const appId = req.params.appId as string;
      const { variables } = req.body;
      const created = await envVariableService.bulkCreate(
        orgId,
        appId,
        variables,
      );
      res.status(201).json({ created: created.length });
    } catch {
      res.status(500).json({ error: "Failed to bulk create variables" });
    }
  },

  getAllForApp: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const appId = req.params.appId as string;
      const variables = await envVariableService.getAllForApp(orgId, appId);
      res.json(variables);
    } catch {
      res.status(500).json({ error: "Failed to get variables" });
    }
  },
};
