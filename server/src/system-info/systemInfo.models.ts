import os from "os";
import { execSync } from "child_process";

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
  cpus: CpuCoreInfo[];
}

export interface CpuCoreInfo {
  model: string;
  speed: number;
  times: {
    user: number;
    nice: number;
    sys: number;
    idle: number;
    irq: number;
  };
}

export interface RuntimeInfo {
  nodeVersion: string;
  npmVersion: string;
  v8Version: string;
  pid: number;
  execPath: string;
  cwd: string;
  env: string;
  memoryUsage: NodeJS.MemoryUsage;
}

export interface NetworkInfo {
  interfaces: NetworkInterfaceInfo[];
}

export interface NetworkInterfaceInfo {
  name: string;
  addresses: Array<{
    address: string;
    netmask: string;
    family: string;
    mac: string;
    internal: boolean;
  }>;
}

export interface UptimeInfo {
  systemUptime: number;
  systemUptimeFormatted: string;
  processUptime: number;
  processUptimeFormatted: string;
}

export function getPlatformName(platform: string): string {
  switch (platform) {
    case "linux":
      return "Linux";
    case "darwin":
      return "macOS";
    case "win32":
      return "Windows";
    case "freebsd":
      return "FreeBSD";
    default:
      return platform;
  }
}

export function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(" ");
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function getNpmVersion(): string {
  try {
    return execSync("npm --version", { encoding: "utf-8" }).trim();
  } catch {
    return "unknown";
  }
}

export function getV8Version(): string {
  return process.versions.v8 || "unknown";
}

export function getNetworkInterfaces(): NetworkInterfaceInfo[] {
  const interfaces = os.networkInterfaces();
  const result: NetworkInterfaceInfo[] = [];
  for (const [name, addrs] of Object.entries(interfaces)) {
    if (!addrs) continue;
    result.push({
      name,
      addresses: addrs.map((a) => ({
        address: a.address,
        netmask: a.netmask,
        family: String(a.family),
        mac: a.mac,
        internal: a.internal,
      })),
    });
  }
  return result;
}
