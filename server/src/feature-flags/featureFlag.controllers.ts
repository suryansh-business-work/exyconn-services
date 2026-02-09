import { Request, Response } from "express";
import {
  listFeatureFlagsQuerySchema,
  createFeatureFlagSchema,
  updateFeatureFlagSchema,
  evaluateFeatureFlagSchema,
} from "./featureFlag.validators";
import * as flagService from "./featureFlag.services";

export const getFeatureFlags = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const query = listFeatureFlagsQuerySchema.parse(req.query);
    const result = await flagService.getFeatureFlags(orgId, query);
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Invalid query parameters", details: error });
      return;
    }
    console.error("Error fetching feature flags:", error);
    res.status(500).json({ error: "Failed to fetch feature flags" });
  }
};

export const getFeatureFlag = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const flagId = req.params.flagId as string;
    const flag = await flagService.getFeatureFlag(orgId, flagId);
    if (!flag) {
      res.status(404).json({ error: "Feature flag not found" });
      return;
    }
    res.json(flag);
  } catch (error) {
    console.error("Error fetching feature flag:", error);
    res.status(500).json({ error: "Failed to fetch feature flag" });
  }
};

export const createFeatureFlag = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const data = createFeatureFlagSchema.parse(req.body);
    const flag = await flagService.createFeatureFlag(orgId, data);
    res.status(201).json(flag);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Invalid flag data", details: error });
      return;
    }
    if ((error as { code?: number })?.code === 11000) {
      res.status(409).json({ error: "A feature flag with this key already exists" });
      return;
    }
    console.error("Error creating feature flag:", error);
    res.status(500).json({ error: "Failed to create feature flag" });
  }
};

export const updateFeatureFlag = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const flagId = req.params.flagId as string;
    const data = updateFeatureFlagSchema.parse(req.body);
    const flag = await flagService.updateFeatureFlag(orgId, flagId, data);
    if (!flag) {
      res.status(404).json({ error: "Feature flag not found" });
      return;
    }
    res.json(flag);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Invalid flag data", details: error });
      return;
    }
    console.error("Error updating feature flag:", error);
    res.status(500).json({ error: "Failed to update feature flag" });
  }
};

export const toggleFeatureFlag = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const flagId = req.params.flagId as string;
    const flag = await flagService.toggleFeatureFlag(orgId, flagId);
    if (!flag) {
      res.status(404).json({ error: "Feature flag not found" });
      return;
    }
    res.json(flag);
  } catch (error) {
    console.error("Error toggling feature flag:", error);
    res.status(500).json({ error: "Failed to toggle feature flag" });
  }
};

export const deleteFeatureFlag = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const flagId = req.params.flagId as string;
    const deleted = await flagService.deleteFeatureFlag(orgId, flagId);
    if (!deleted) {
      res.status(404).json({ error: "Feature flag not found" });
      return;
    }
    res.json({ message: "Feature flag deleted successfully" });
  } catch (error) {
    console.error("Error deleting feature flag:", error);
    res.status(500).json({ error: "Failed to delete feature flag" });
  }
};

export const evaluateFeatureFlag = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const data = evaluateFeatureFlagSchema.parse(req.body);
    const result = await flagService.evaluateFeatureFlag(
      orgId,
      data.key,
      data.userId,
      data.attributes,
    );
    res.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      res.status(400).json({ error: "Invalid evaluation data", details: error });
      return;
    }
    console.error("Error evaluating feature flag:", error);
    res.status(500).json({ error: "Failed to evaluate feature flag" });
  }
};

export const getFeatureFlagStats = async (req: Request, res: Response) => {
  try {
    const orgId = req.params.orgId as string;
    const stats = await flagService.getFeatureFlagStats(orgId);
    res.json(stats);
  } catch (error) {
    console.error("Error fetching feature flag stats:", error);
    res.status(500).json({ error: "Failed to fetch feature flag stats" });
  }
};
