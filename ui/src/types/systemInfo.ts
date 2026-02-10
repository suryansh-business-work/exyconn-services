export type OSPlatform = "linux" | "darwin" | "win32" | "unknown";

export interface SystemInfoResponse {
  os: OSInfo;
  hardware: HardwareInfo;
  runtime: RuntimeInfo;
  network: NetworkInfo;
  uptime: UptimeInfo;
}

export interface OSInfo {
  platform: OSPlatform;
  platformName: string;
  type: string;
  release: string;
  version: string;
  arch: string;
  hostname: string;
  homeDir: string;
  tmpDir: string;
  endianness: string;
}

export interface HardwareInfo {
  cpuModel: string;
  cpuCores: number;
  cpuSpeed: number;
  totalMemory: number;
  freeMemory: number;
  usedMemory: number;
  memoryUsagePercent: number;
  cpus: Array<{
    model: string;
    speed: number;
    times: { user: number; nice: number; sys: number; idle: number; irq: number };
  }>;
}

export interface RuntimeInfo {
  nodeVersion: string;
  npmVersion: string;
  v8Version: string;
  pid: number;
  execPath: string;
  cwd: string;
  env: string;
  memoryUsage: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
    arrayBuffers: number;
  };
}

export interface NetworkInfo {
  interfaces: Array<{
    name: string;
    addresses: Array<{
      address: string;
      netmask: string;
      family: string;
      mac: string;
      internal: boolean;
    }>;
  }>;
}

export interface UptimeInfo {
  systemUptime: number;
  systemUptimeFormatted: string;
  processUptime: number;
  processUptimeFormatted: string;
}

// Docker types
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
