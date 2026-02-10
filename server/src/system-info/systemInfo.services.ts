import os from "os";
import {
  SystemInfoResponse,
  getPlatformName,
  formatUptime,
  getNpmVersion,
  getV8Version,
  getNetworkInterfaces,
  OSPlatform,
} from "./systemInfo.models";

export const systemInfoService = {
  getSystemInfo: (): SystemInfoResponse => {
    const platform = os.platform() as OSPlatform;
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const cpus = os.cpus();

    return {
      os: {
        platform,
        platformName: getPlatformName(platform),
        type: os.type(),
        release: os.release(),
        version: os.version(),
        arch: os.arch(),
        hostname: os.hostname(),
        homeDir: os.homedir(),
        tmpDir: os.tmpdir(),
        endianness: os.endianness(),
      },
      hardware: {
        cpuModel: cpus[0]?.model || "unknown",
        cpuCores: cpus.length,
        cpuSpeed: cpus[0]?.speed || 0,
        totalMemory: totalMem,
        freeMemory: freeMem,
        usedMemory: usedMem,
        memoryUsagePercent: Math.round((usedMem / totalMem) * 100),
        cpus: cpus.map((cpu) => ({
          model: cpu.model,
          speed: cpu.speed,
          times: cpu.times,
        })),
      },
      runtime: {
        nodeVersion: process.version,
        npmVersion: getNpmVersion(),
        v8Version: getV8Version(),
        pid: process.pid,
        execPath: process.execPath,
        cwd: process.cwd(),
        env: process.env.NODE_ENV || "development",
        memoryUsage: process.memoryUsage(),
      },
      network: {
        interfaces: getNetworkInterfaces(),
      },
      uptime: {
        systemUptime: os.uptime(),
        systemUptimeFormatted: formatUptime(os.uptime()),
        processUptime: process.uptime(),
        processUptimeFormatted: formatUptime(process.uptime()),
      },
    };
  },
};
