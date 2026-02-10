import { Request, Response } from "express";
import { systemInfoService } from "./systemInfo.services";
import { dockerService } from "./docker.services";

export const getSystemInfo = (_req: Request, res: Response) => {
  try {
    const info = systemInfoService.getSystemInfo();
    res.json(info);
  } catch {
    res.status(500).json({ error: "Failed to get system info" });
  }
};

export const getDockerInfo = async (_req: Request, res: Response) => {
  try {
    const info = await dockerService.getDockerInfo();
    res.json(info);
  } catch {
    res.status(500).json({ error: "Failed to get Docker info" });
  }
};

export const getDockerContainers = async (req: Request, res: Response) => {
  try {
    const showAll = req.query.all === "true";
    const result = await dockerService.listContainers(showAll);
    if (result.error) return res.json({ containers: [], error: result.error });
    res.json({ containers: result.data });
  } catch {
    res.status(500).json({ error: "Failed to list Docker containers" });
  }
};

export const getDockerContainerDetail = async (req: Request, res: Response) => {
  try {
    const containerId = req.params.containerId as string;
    const detail = await dockerService.getContainerDetail(containerId);
    res.json(detail);
  } catch {
    res.status(500).json({ error: "Failed to get container detail" });
  }
};

export const getDockerImages = async (_req: Request, res: Response) => {
  try {
    const result = await dockerService.listImages();
    if (result.error) return res.json({ images: [], error: result.error });
    res.json({ images: result.data });
  } catch {
    res.status(500).json({ error: "Failed to list Docker images" });
  }
};

export const getDockerVolumes = async (_req: Request, res: Response) => {
  try {
    const result = await dockerService.listVolumes();
    if (result.error) return res.json({ volumes: [], error: result.error });
    res.json({ volumes: result.data });
  } catch {
    res.status(500).json({ error: "Failed to list Docker volumes" });
  }
};

export const getDockerNetworks = async (_req: Request, res: Response) => {
  try {
    const result = await dockerService.listNetworks();
    if (result.error) return res.json({ networks: [], error: result.error });
    res.json({ networks: result.data });
  } catch {
    res.status(500).json({ error: "Failed to list Docker networks" });
  }
};
