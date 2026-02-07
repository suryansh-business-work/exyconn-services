import { Request, Response } from "express";
import * as templateService from "./template.services";
import {
  createEmailTemplateSchema,
  updateEmailTemplateSchema,
  listEmailTemplatesQuerySchema,
  previewTemplateSchema,
} from "./template.validators";

// Create Email Template
export const createEmailTemplate = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const validatedData = createEmailTemplateSchema.parse(req.body);
    const template = await templateService.createEmailTemplate(
      orgId,
      validatedData,
    );
    res.status(201).json(template);
  } catch (error) {
    if (error instanceof Error && error.message.includes("already exists")) {
      res.status(409).json({ error: error.message });
    } else if (
      error instanceof Error &&
      error.message.includes("MJML compilation")
    ) {
      res.status(400).json({ error: error.message });
    } else if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Validation failed", details: error });
    } else {
      console.error("Error creating email template:", error);
      res.status(500).json({ error: "Failed to create email template" });
    }
  }
};

// Get all Email Templates for organization
export const getEmailTemplates = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const query = listEmailTemplatesQuerySchema.parse(req.query);
    const result = await templateService.getEmailTemplates(orgId, query);
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Validation failed", details: error });
    } else {
      console.error("Error fetching email templates:", error);
      res.status(500).json({ error: "Failed to fetch email templates" });
    }
  }
};

// Get single Email Template
export const getEmailTemplate = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const templateId = req.params.templateId as string;
    const template = await templateService.getEmailTemplate(orgId, templateId);
    res.json(template);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      console.error("Error fetching email template:", error);
      res.status(500).json({ error: "Failed to fetch email template" });
    }
  }
};

// Update Email Template
export const updateEmailTemplate = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const templateId = req.params.templateId as string;
    const validatedData = updateEmailTemplateSchema.parse(req.body);
    const template = await templateService.updateEmailTemplate(
      orgId,
      templateId,
      validatedData,
    );
    res.json(template);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else if (
      error instanceof Error &&
      error.message.includes("already exists")
    ) {
      res.status(409).json({ error: error.message });
    } else if (
      error instanceof Error &&
      error.message.includes("MJML compilation")
    ) {
      res.status(400).json({ error: error.message });
    } else if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Validation failed", details: error });
    } else {
      console.error("Error updating email template:", error);
      res.status(500).json({ error: "Failed to update email template" });
    }
  }
};

// Delete Email Template
export const deleteEmailTemplate = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const templateId = req.params.templateId as string;
    const result = await templateService.deleteEmailTemplate(orgId, templateId);
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.message.includes("not found")) {
      res.status(404).json({ error: error.message });
    } else {
      console.error("Error deleting email template:", error);
      res.status(500).json({ error: "Failed to delete email template" });
    }
  }
};

// Preview MJML template (real-time compilation)
export const previewTemplate = async (req: Request, res: Response) => {
  try {
    const validatedData = previewTemplateSchema.parse(req.body);
    const result = await templateService.previewTemplate(validatedData);
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Validation failed", details: error });
    } else {
      console.error("Error previewing template:", error);
      res.status(500).json({ error: "Failed to preview template" });
    }
  }
};
