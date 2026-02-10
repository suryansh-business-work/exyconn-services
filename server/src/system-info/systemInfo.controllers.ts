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
    const containers = await dockerService.listContainers(showAll);
    res.json({ containers });
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
    const images = await dockerService.listImages();
    res.json({ images });
  } catch {
    res.status(500).json({ error: "Failed to list Docker images" });
  }
};

export const getDockerVolumes = async (_req: Request, res: Response) => {
  try {
    const volumes = await dockerService.listVolumes();
    res.json({ volumes });
  } catch {
    res.status(500).json({ error: "Failed to list Docker volumes" });
  }
};

export const getDockerNetworks = async (_req: Request, res: Response) => {
  try {
    const networks = await dockerService.listNetworks();
    res.json({ networks });
  } catch {
    res.status(500).json({ error: "Failed to list Docker networks" });
  }
};
