import https from 'https';
import http from 'http';
import dns from 'dns';
import { promisify } from 'util';
import { URL } from 'url';
import mongoose from 'mongoose';
import { ISiteMonitor } from '../monitors/monitor.models';
import { SiteCheckResult, ISiteCheckResult } from '../history/history.models';

const resolveMx = promisify(dns.resolveMx);
const resolve4 = promisify(dns.resolve4);
const resolve6 = promisify(dns.resolve6);
const resolveNs = promisify(dns.resolveNs);
const resolveTxt = promisify(dns.resolveTxt);
const resolveCname = promisify(dns.resolveCname);

interface CheckResult {
  httpStatus?: { statusCode: number; statusText: string; isOk: boolean };
  sslCertificate?: {
    valid: boolean;
    issuer: string;
    subject: string;
    validFrom: Date;
    validTo: Date;
    daysUntilExpiry: number;
    protocol: string;
  };
  dnsRecords?: {
    aRecords: string[];
    aaaaRecords: string[];
    nsRecords: string[];
    txtRecords: string[];
    cnameRecords: string[];
  };
  mxRecords?: { records: Array<{ exchange: string; priority: number }> };
  screenshot?: {
    url: string;
    thumbnailUrl: string;
    capturedAt: Date;
    width: number;
    height: number;
  };
  pageInfo?: {
    title: string;
    description: string;
    favicon: string;
    ogImage: string;
    keywords: string[];
    language: string;
    charset: string;
    generator: string;
    loadTime: number;
  };
  responseTime?: number;
  overallStatus: 'healthy' | 'warning' | 'error';
}

export const siteCheckService = {
  runCheck: async (monitor: ISiteMonitor): Promise<ISiteCheckResult> => {
    const result: CheckResult = { overallStatus: 'healthy' };
    const url = new URL(monitor.url);
    const hostname = url.hostname;
    const startTime = Date.now();

    try {
      // HTTP Status Check
      if (monitor.checks.httpStatus) {
        result.httpStatus = await checkHttpStatus(monitor.url);
        if (!result.httpStatus.isOk) result.overallStatus = 'error';
      }

      // Response Time
      if (monitor.checks.responseTime) {
        result.responseTime = Date.now() - startTime;
      }

      // SSL Certificate Check
      if (monitor.checks.sslCertificate && url.protocol === 'https:') {
        result.sslCertificate = await checkSslCertificate(hostname);
        if (result.sslCertificate && !result.sslCertificate.valid) result.overallStatus = 'error';
        else if (
          result.sslCertificate &&
          result.sslCertificate.daysUntilExpiry < 30 &&
          result.overallStatus !== 'error'
        )
          result.overallStatus = 'warning';
      }

      // DNS Records Check
      if (monitor.checks.dnsRecords) {
        result.dnsRecords = await checkDnsRecords(hostname);
      }

      // MX Records Check
      if (monitor.checks.mxRecords) {
        result.mxRecords = await checkMxRecords(hostname);
      }

      // Page Info Check
      if (monitor.checks.pageInfo) {
        result.pageInfo = await checkPageInfo(monitor.url);
      }

      // Screenshot (placeholder - would need puppeteer or similar)
      if (monitor.checks.screenshot) {
        result.screenshot = {
          url: '',
          thumbnailUrl: '',
          capturedAt: new Date(),
          width: 1280,
          height: 720,
        };
      }
    } catch {
      result.overallStatus = 'error';
    }

    // Save result to database
    const checkResult = new SiteCheckResult({
      organizationId: monitor.organizationId,
      monitorId: monitor._id,
      url: monitor.url,
      timestamp: new Date(),
      ...result,
    });

    return checkResult.save();
  },
};

async function checkHttpStatus(
  url: string
): Promise<{ statusCode: number; statusText: string; isOk: boolean }> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout: 10000 }, (res) => {
      resolve({
        statusCode: res.statusCode || 0,
        statusText: res.statusMessage || '',
        isOk: (res.statusCode || 0) >= 200 && (res.statusCode || 0) < 400,
      });
    });
    req.on('error', () => resolve({ statusCode: 0, statusText: 'Connection failed', isOk: false }));
    req.on('timeout', () => {
      req.destroy();
      resolve({ statusCode: 0, statusText: 'Timeout', isOk: false });
    });
  });
}

async function checkSslCertificate(hostname: string): Promise<CheckResult['sslCertificate']> {
  return new Promise((resolve) => {
    const req = https.request(
      { hostname, port: 443, method: 'HEAD', rejectUnauthorized: false },
      (res) => {
        const socket = res.socket as import('tls').TLSSocket;
        const cert = socket.getPeerCertificate();
        if (cert && Object.keys(cert).length > 0) {
          const validTo = new Date(cert.valid_to);
          const daysUntilExpiry = Math.floor(
            (validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
          );
          resolve({
            valid: socket.authorized ?? false,
            issuer: typeof cert.issuer === 'object' ? cert.issuer.O || '' : '',
            subject: typeof cert.subject === 'object' ? cert.subject.CN || '' : '',
            validFrom: new Date(cert.valid_from),
            validTo,
            daysUntilExpiry,
            protocol: socket.getProtocol() || 'unknown',
          });
        } else {
          resolve({
            valid: false,
            issuer: '',
            subject: '',
            validFrom: new Date(),
            validTo: new Date(),
            daysUntilExpiry: 0,
            protocol: '',
          });
        }
      }
    );
    req.on('error', () =>
      resolve({
        valid: false,
        issuer: '',
        subject: '',
        validFrom: new Date(),
        validTo: new Date(),
        daysUntilExpiry: 0,
        protocol: '',
      })
    );
    req.end();
  });
}

async function checkDnsRecords(hostname: string): Promise<CheckResult['dnsRecords']> {
  const [aRecords, aaaaRecords, nsRecords, txtRecords, cnameRecords] = await Promise.all([
    resolve4(hostname).catch(() => []),
    resolve6(hostname).catch(() => []),
    resolveNs(hostname).catch(() => []),
    resolveTxt(hostname)
      .catch(() => [])
      .then((r) => r.map((t) => t.join(''))),
    resolveCname(hostname).catch(() => []),
  ]);
  return { aRecords, aaaaRecords, nsRecords, txtRecords, cnameRecords };
}

async function checkMxRecords(hostname: string): Promise<CheckResult['mxRecords']> {
  try {
    const records = await resolveMx(hostname);
    return { records: records.map((r) => ({ exchange: r.exchange, priority: r.priority })) };
  } catch {
    return { records: [] };
  }
}

async function checkPageInfo(url: string): Promise<CheckResult['pageInfo']> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;
    const req = protocol.get(url, { timeout: 15000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        const loadTime = Date.now() - startTime;
        const titleMatch = data.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch = data.match(
          /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i
        );
        const ogImageMatch = data.match(
          /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i
        );
        const keywordsMatch = data.match(
          /<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i
        );
        const charsetMatch = data.match(/<meta[^>]*charset=["']([^"']+)["']/i);
        const langMatch = data.match(/<html[^>]*lang=["']([^"']+)["']/i);
        const generatorMatch = data.match(
          /<meta[^>]*name=["']generator["'][^>]*content=["']([^"']+)["']/i
        );
        const faviconMatch = data.match(
          /<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i
        );

        resolve({
          title: titleMatch?.[1] || '',
          description: descMatch?.[1] || '',
          favicon: faviconMatch?.[1] || '',
          ogImage: ogImageMatch?.[1] || '',
          keywords: keywordsMatch?.[1]?.split(',').map((k) => k.trim()) || [],
          language: langMatch?.[1] || '',
          charset: charsetMatch?.[1] || 'UTF-8',
          generator: generatorMatch?.[1] || '',
          loadTime,
        });
      });
    });
    req.on('error', () =>
      resolve({
        title: '',
        description: '',
        favicon: '',
        ogImage: '',
        keywords: [],
        language: '',
        charset: '',
        generator: '',
        loadTime: 0,
      })
    );
    req.on('timeout', () => {
      req.destroy();
      resolve({
        title: '',
        description: '',
        favicon: '',
        ogImage: '',
        keywords: [],
        language: '',
        charset: '',
        generator: '',
        loadTime: 0,
      });
    });
  });
}
