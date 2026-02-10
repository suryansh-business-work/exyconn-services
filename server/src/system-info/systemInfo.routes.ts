import { Router } from "express";
import * as systemInfoController from "./systemInfo.controllers";

const router = Router({ mergeParams: true });

// System Info routes
router.get("/", systemInfoController.getSystemInfo);

// Docker routes
router.get("/docker", systemInfoController.getDockerInfo);
router.get("/docker/containers", systemInfoController.getDockerContainers);
router.get(
  "/docker/containers/:containerId",
  systemInfoController.getDockerContainerDetail,
);
router.get("/docker/images", systemInfoController.getDockerImages);
router.get("/docker/volumes", systemInfoController.getDockerVolumes);
router.get("/docker/networks", systemInfoController.getDockerNetworks);

export default router;
