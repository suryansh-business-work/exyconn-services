import { Request, Response } from "express";
import { aiCompanyService } from "./company.services";
import { AIProvider } from "./company.models";

export const aiCompanyController = {
  list: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const { page = "1", limit = "10", provider } = req.query;
      const result = await aiCompanyService.list(orgId, {
        page: Number(page),
        limit: Number(limit),
        provider: provider as AIProvider,
      });
      res.json(result);
    } catch {
      res.status(500).json({ error: "Failed to list companies" });
    }
  },

  get: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const companyId = req.params.companyId as string;
      const company = await aiCompanyService.get(orgId, companyId);
      if (!company) return res.status(404).json({ error: "Company not found" });
      res.json(company);
    } catch {
      res.status(500).json({ error: "Failed to get company" });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const company = await aiCompanyService.create(orgId, req.body);
      res.status(201).json(company);
    } catch (err) {
      if ((err as { code?: number }).code === 11000) {
        return res
          .status(400)
          .json({ error: "Company with this name already exists" });
      }
      res.status(500).json({ error: "Failed to create company" });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const companyId = req.params.companyId as string;
      const company = await aiCompanyService.update(orgId, companyId, req.body);
      if (!company) return res.status(404).json({ error: "Company not found" });
      res.json(company);
    } catch {
      res.status(500).json({ error: "Failed to update company" });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const companyId = req.params.companyId as string;
      const deleted = await aiCompanyService.delete(orgId, companyId);
      if (!deleted) return res.status(404).json({ error: "Company not found" });
      res.json({ success: true });
    } catch {
      res.status(500).json({ error: "Failed to delete company" });
    }
  },

  getStats: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const stats = await aiCompanyService.getStats(orgId);
      res.json(stats);
    } catch {
      res.status(500).json({ error: "Failed to get stats" });
    }
  },
};
