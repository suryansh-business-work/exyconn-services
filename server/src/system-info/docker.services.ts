import { execSync } from "child_process";

export interface DockerInfoResponse {
  installed: boolean;
  version?: string;
  info?: DockerDaemonInfo;
  error?: string;
}

export interface DockerDaemonInfo {
  serverVersion: string;
  storageDriver: string;
  operatingSystem: string;
  osType: string;
  architecture: string;
  cpus: number;
  totalMemory: string;
  containers: number;
  containersRunning: number;
  containersPaused: number;
  containersStopped: number;
  images: number;
}

export interface DockerContainer {
  id: string;
  names: string;
  image: string;
  command: string;
  created: string;
  status: string;
  ports: string;
  size: string;
  state: string;
}

export interface DockerContainerDetail {
  id: string;
  name: string;
  image: string;
  state: Record<string, unknown>;
  config: Record<string, unknown>;
  networkSettings: Record<string, unknown>;
  mounts: Array<Record<string, unknown>>;
  created: string;
  logs: string;
}

export interface DockerImage {
  id: string;
  repository: string;
  tag: string;
  size: string;
  created: string;
}

export interface DockerVolume {
  name: string;
  driver: string;
  mountpoint: string;
  scope: string;
}

export interface DockerNetwork {
  id: string;
  name: string;
  driver: string;
  scope: string;
}

function execCommand(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf-8", timeout: 10000 }).trim();
  } catch {
    return "";
  }
}

function isDockerInstalled(): boolean {
  const result = execCommand("docker --version");
  return result.length > 0;
}

export const dockerService = {
  getDockerInfo: async (): Promise<DockerInfoResponse> => {
    if (!isDockerInstalled()) {
      return { installed: false, error: "Docker is not installed" };
    }

    try {
      const version = execCommand("docker --version");
      const infoJson = execCommand("docker info --format '{{json .}}'");

      let info: DockerDaemonInfo | undefined;
      if (infoJson) {
        try {
          const parsed = JSON.parse(infoJson);
          info = {
            serverVersion: parsed.ServerVersion || "unknown",
            storageDriver: parsed.Driver || "unknown",
            operatingSystem: parsed.OperatingSystem || "unknown",
            osType: parsed.OSType || "unknown",
            architecture: parsed.Architecture || "unknown",
            cpus: parsed.NCPU || 0,
            totalMemory: `${Math.round((parsed.MemTotal || 0) / 1073741824)} GB`,
            containers: parsed.Containers || 0,
            containersRunning: parsed.ContainersRunning || 0,
            containersPaused: parsed.ContainersPaused || 0,
            containersStopped: parsed.ContainersStopped || 0,
            images: parsed.Images || 0,
          };
        } catch {
          // JSON parse failed, try line-by-line
        }
      }

      return { installed: true, version, info };
    } catch {
      return { installed: true, error: "Docker daemon may not be running" };
    }
  },

  listContainers: async (showAll = true): Promise<DockerContainer[]> => {
    if (!isDockerInstalled()) return [];

    const flag = showAll ? "-a" : "";
    const output = execCommand(
      `docker ps ${flag} --format "{{.ID}}|||{{.Names}}|||{{.Image}}|||{{.Command}}|||{{.CreatedAt}}|||{{.Status}}|||{{.Ports}}|||{{.Size}}|||{{.State}}"`,
    );

    if (!output) return [];

    return output
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|||");
        return {
          id: parts[0] || "",
          names: parts[1] || "",
          image: parts[2] || "",
          command: parts[3] || "",
          created: parts[4] || "",
          status: parts[5] || "",
          ports: parts[6] || "",
          size: parts[7] || "",
          state: parts[8] || "",
        };
      });
  },

  getContainerDetail: async (
    containerId: string,
  ): Promise<DockerContainerDetail | null> => {
    if (!isDockerInstalled()) return null;

    const inspectJson = execCommand(
      `docker inspect ${containerId} --format "{{json .}}"`,
    );
    if (!inspectJson) return null;

    try {
      const parsed = JSON.parse(inspectJson);
      const logs = execCommand(
        `docker logs ${containerId} --tail 50 2>&1`,
      );

      return {
        id: parsed.Id || containerId,
        name: (parsed.Name || "").replace(/^\//, ""),
        image: parsed.Config?.Image || "",
        state: parsed.State || {},
        config: {
          env: parsed.Config?.Env || [],
          cmd: parsed.Config?.Cmd || [],
          exposedPorts: parsed.Config?.ExposedPorts || {},
          workingDir: parsed.Config?.WorkingDir || "",
        },
        networkSettings: parsed.NetworkSettings?.Networks || {},
        mounts: parsed.Mounts || [],
        created: parsed.Created || "",
        logs,
      };
    } catch {
      return null;
    }
  },

  listImages: async (): Promise<DockerImage[]> => {
    if (!isDockerInstalled()) return [];

    const output = execCommand(
      'docker images --format "{{.ID}}|||{{.Repository}}|||{{.Tag}}|||{{.Size}}|||{{.CreatedAt}}"',
    );
    if (!output) return [];

    return output
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|||");
        return {
          id: parts[0] || "",
          repository: parts[1] || "",
          tag: parts[2] || "",
          size: parts[3] || "",
          created: parts[4] || "",
        };
      });
  },

  listVolumes: async (): Promise<DockerVolume[]> => {
    if (!isDockerInstalled()) return [];

    const output = execCommand(
      'docker volume ls --format "{{.Name}}|||{{.Driver}}|||{{.Mountpoint}}|||{{.Scope}}"',
    );
    if (!output) return [];

    return output
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|||");
        return {
          name: parts[0] || "",
          driver: parts[1] || "",
          mountpoint: parts[2] || "",
          scope: parts[3] || "",
        };
      });
  },

  listNetworks: async (): Promise<DockerNetwork[]> => {
    if (!isDockerInstalled()) return [];

    const output = execCommand(
      'docker network ls --format "{{.ID}}|||{{.Name}}|||{{.Driver}}|||{{.Scope}}"',
    );
    if (!output) return [];

    return output
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|||");
        return {
          id: parts[0] || "",
          name: parts[1] || "",
          driver: parts[2] || "",
          scope: parts[3] || "",
        };
      });
  },
};
