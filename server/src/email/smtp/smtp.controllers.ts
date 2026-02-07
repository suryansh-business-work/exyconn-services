import { Request, Response } from "express";
import * as smtpService from "./smtp.services";
import {
  createSmtpConfigSchema,
  updateSmtpConfigSchema,
  listSmtpConfigsQuerySchema,
} from "./smtp.validators";

// Create SMTP config
export const createSmtpConfig = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const validatedData = createSmtpConfigSchema.parse(req.body);
    const smtpConfig = await smtpService.createSmtpConfig(orgId, validatedData);
    res.status(201).json(smtpConfig);
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      res.status(409).json({ error: error.message });
    } else if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Validation failed", details: error });
    } else {
      console.error("Error creating SMTP config:", error);
      res.status(500).json({ error: "Failed to create SMTP configuration" });
    }
  }
};

// Get all SMTP configs for organization
export const getSmtpConfigs = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const query = listSmtpConfigsQuerySchema.parse(req.query);
    const result = await smtpService.getSmtpConfigs(orgId, query);
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Validation failed", details: error });
    } else {
      console.error("Error fetching SMTP configs:", error);
      res.status(500).json({ error: "Failed to fetch SMTP configurations" });
    }
  }
};

// Get single SMTP config
export const getSmtpConfig = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const configId = req.params.configId as string;
    const config = await smtpService.getSmtpConfig(orgId, configId);
    res.json(config);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      console.error("Error fetching SMTP config:", error);
      res.status(500).json({ error: "Failed to fetch SMTP configuration" });
    }
  }
};

// Update SMTP config
export const updateSmtpConfig = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const configId = req.params.configId as string;
    const validatedData = updateSmtpConfigSchema.parse(req.body);
    const config = await smtpService.updateSmtpConfig(
      orgId,
      configId,
      validatedData,
    );
    res.json(config);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else if (
      error instanceof Error &&
      error.message.includes("already exists")
    ) {
      res.status(409).json({ error: error.message });
    } else if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Validation failed", details: error });
    } else {
      console.error("Error updating SMTP config:", error);
      res.status(500).json({ error: "Failed to update SMTP configuration" });
    }
  }
};

// Delete SMTP config
export const deleteSmtpConfig = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const configId = req.params.configId as string;
    const result = await smtpService.deleteSmtpConfig(orgId, configId);
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      console.error("Error deleting SMTP config:", error);
      res.status(500).json({ error: "Failed to delete SMTP configuration" });
    }
  }
};

// Get default SMTP config
export const getDefaultSmtpConfig = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const config = await smtpService.getDefaultSmtpConfig(orgId);
    res.json(config);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      console.error("Error fetching default SMTP config:", error);
      res
        .status(500)
        .json({ error: "Failed to fetch default SMTP configuration" });
    }
  }
};
