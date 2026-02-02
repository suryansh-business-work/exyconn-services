import { z } from 'zod';

export const siteCheckOptionsSchema = z.object({
  httpStatus: z.boolean().default(true),
  sslCertificate: z.boolean().default(true),
  dnsRecords: z.boolean().default(false),
  mxRecords: z.boolean().default(false),
  screenshot: z.boolean().default(true),
  pageInfo: z.boolean().default(true),
  responseTime: z.boolean().default(true),
});

export const createSiteMonitorSchema = z.object({
  body: z.object({
    url: z.string().url('Invalid URL format'),
    name: z.string().min(2).max(100),
    checks: siteCheckOptionsSchema,
  }),
  params: z.object({
    orgId: z.string().min(1),
  }),
});

export const updateSiteMonitorSchema = z.object({
  body: z.object({
    url: z.string().url('Invalid URL format').optional(),
    name: z.string().min(2).max(100).optional(),
    isActive: z.boolean().optional(),
    checks: siteCheckOptionsSchema.partial().optional(),
  }),
  params: z.object({
    orgId: z.string().min(1),
    monitorId: z.string().min(1),
  }),
});

export const listSiteMonitorsSchema = z.object({
  params: z.object({
    orgId: z.string().min(1),
  }),
  query: z.object({
    page: z.string().default('1').transform(Number),
    limit: z.string().default('10').transform(Number),
    search: z.string().optional(),
    sortBy: z.enum(['name', 'url', 'createdAt', 'lastCheckedAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    isActive: z
      .string()
      .transform((v) => v === 'true')
      .optional(),
  }),
});

export const getSiteMonitorSchema = z.object({
  params: z.object({
    orgId: z.string().min(1),
    monitorId: z.string().min(1),
  }),
});

export const deleteSiteMonitorSchema = z.object({
  params: z.object({
    orgId: z.string().min(1),
    monitorId: z.string().min(1),
  }),
});

export const checkNowSchema = z.object({
  params: z.object({
    orgId: z.string().min(1),
    monitorId: z.string().min(1),
  }),
});
