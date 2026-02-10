import { execSync } from "child_process";
import os from "os";

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

// Cross-platform quoting helper
const isWindows = os.platform() === "win32";

function formatQuote(formatStr: string): string {
  // Use double quotes on all platforms for Docker --format
  // On Linux: double quotes work fine for {{.Field}} patterns (no shell expansion)
  // On Windows: double quotes are the native quoting mechanism
  return `"${formatStr}"`;
}

interface ExecResult {
  output: string;
  error?: string;
}

function execCommand(cmd: string, timeout = 15000): ExecResult {
  try {
    const output = execSync(cmd, {
      encoding: "utf-8",
      timeout,
      // Explicit shell selection for cross-platform compatibility
      shell: isWindows ? "cmd.exe" : "/bin/sh",
      // Capture stderr separately for better error reporting
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
    return { output };
  } catch (err: unknown) {
    const error = err as { stderr?: string; message?: string; code?: string };
    const stderr = typeof error.stderr === "string" ? error.stderr.trim() : "";
    const message = error.message || "Unknown error";

    // Classify the error for better reporting
    if (stderr.includes("permission denied") || stderr.includes("Permission denied")) {
      return { output: "", error: `Permission denied. On Linux, add your user to the docker group: sudo usermod -aG docker $USER` };
    }
    if (stderr.includes("Cannot connect to the Docker daemon") || stderr.includes("Is the docker daemon running")) {
      return { output: "", error: "Docker daemon is not running. Start it with: sudo systemctl start docker" };
    }
    if (stderr.includes("command not found") || stderr.includes("not recognized") || error.code === "ENOENT") {
      return { output: "", error: "Docker is not installed or not in PATH" };
    }
    if (message.includes("ETIMEDOUT") || message.includes("timed out")) {
      return { output: "", error: "Docker command timed out. The daemon may be unresponsive." };
    }
    return { output: "", error: stderr || message };
  }
}

function isDockerInstalled(): { installed: boolean; error?: string } {
  const result = execCommand("docker --version");
  if (result.output.length > 0) return { installed: true };
  return { installed: false, error: result.error };
}

export const dockerService = {
  getDockerInfo: async (): Promise<DockerInfoResponse> => {
    const check = isDockerInstalled();
    if (!check.installed) {
      return { installed: false, error: check.error || "Docker is not installed" };
    }

    try {
      const versionResult = execCommand("docker --version");
      const version = versionResult.output || undefined;

      // Use double quotes for --format on all platforms
      const infoResult = execCommand(`docker info --format ${formatQuote("{{json .}}")}`);

      if (infoResult.error) {
        return { installed: true, version, error: infoResult.error };
      }

      let info: DockerDaemonInfo | undefined;
      if (infoResult.output) {
        try {
          // Strip any leading/trailing quotes that some shells may add
          const jsonStr = infoResult.output.replace(/^['"]|['"]$/g, "");
          const parsed = JSON.parse(jsonStr);
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
          return { installed: true, version, error: "Failed to parse Docker info output" };
        }
      }

      return { installed: true, version, info };
    } catch {
      return { installed: true, error: "Docker daemon may not be running" };
    }
  },

  listContainers: async (showAll = true): Promise<{ data: DockerContainer[]; error?: string }> => {
    const check = isDockerInstalled();
    if (!check.installed) return { data: [], error: check.error };

    const flag = showAll ? "-a" : "";
    const fmt = formatQuote("{{.ID}}|||{{.Names}}|||{{.Image}}|||{{.Command}}|||{{.CreatedAt}}|||{{.Status}}|||{{.Ports}}|||{{.Size}}|||{{.State}}");
    const result = execCommand(`docker ps ${flag} --format ${fmt}`);

    if (result.error) return { data: [], error: result.error };
    if (!result.output) return { data: [] };

    const data = result.output
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const p = line.split("|||");
        return {
          id: p[0] || "", names: p[1] || "", image: p[2] || "",
          command: p[3] || "", created: p[4] || "", status: p[5] || "",
          ports: p[6] || "", size: p[7] || "", state: p[8] || "",
        };
      });
    return { data };
  },

  getContainerDetail: async (containerId: string): Promise<DockerContainerDetail | null> => {
    const check = isDockerInstalled();
    if (!check.installed) return null;

    // Sanitize container ID to prevent command injection
    const safeId = containerId.replace(/[^a-zA-Z0-9_.-]/g, "");
    const inspectResult = execCommand(`docker inspect ${safeId} --format ${formatQuote("{{json .}}")}`);
    if (!inspectResult.output) return null;

    try {
      const jsonStr = inspectResult.output.replace(/^['"]|['"]$/g, "");
      const parsed = JSON.parse(jsonStr);
      const logsResult = execCommand(`docker logs ${safeId} --tail 50 2>&1`);

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
        logs: logsResult.output,
      };
    } catch {
      return null;
    }
  },

  listImages: async (): Promise<{ data: DockerImage[]; error?: string }> => {
    const check = isDockerInstalled();
    if (!check.installed) return { data: [], error: check.error };

    const fmt = formatQuote("{{.ID}}|||{{.Repository}}|||{{.Tag}}|||{{.Size}}|||{{.CreatedAt}}");
    const result = execCommand(`docker images --format ${fmt}`);

    if (result.error) return { data: [], error: result.error };
    if (!result.output) return { data: [] };

    const data = result.output
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const p = line.split("|||");
        return {
          id: p[0] || "", repository: p[1] || "", tag: p[2] || "",
          size: p[3] || "", created: p[4] || "",
        };
      });
    return { data };
  },

  listVolumes: async (): Promise<{ data: DockerVolume[]; error?: string }> => {
    const check = isDockerInstalled();
    if (!check.installed) return { data: [], error: check.error };

    const fmt = formatQuote("{{.Name}}|||{{.Driver}}|||{{.Mountpoint}}|||{{.Scope}}");
    const result = execCommand(`docker volume ls --format ${fmt}`);

    if (result.error) return { data: [], error: result.error };
    if (!result.output) return { data: [] };

    const data = result.output
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const p = line.split("|||");
        return {
          name: p[0] || "", driver: p[1] || "",
          mountpoint: p[2] || "", scope: p[3] || "",
        };
      });
    return { data };
  },

  listNetworks: async (): Promise<{ data: DockerNetwork[]; error?: string }> => {
    const check = isDockerInstalled();
    if (!check.installed) return { data: [], error: check.error };

    const fmt = formatQuote("{{.ID}}|||{{.Name}}|||{{.Driver}}|||{{.Scope}}");
    const result = execCommand(`docker network ls --format ${fmt}`);

    if (result.error) return { data: [], error: result.error };
    if (!result.output) return { data: [] };

    const data = result.output
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const p = line.split("|||");
        return {
          id: p[0] || "", name: p[1] || "",
          driver: p[2] || "", scope: p[3] || "",
        };
      });
    return { data };
  },
};
