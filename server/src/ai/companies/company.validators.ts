import { z } from "zod";

export const createAICompanySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    provider: z.enum(["openai", "gemini", "anthropic", "custom"]),
    apiKey: z.string().min(1).max(500),
    apiSecret: z.string().max(500).optional(),
    baseUrl: z.string().url().optional(),
    defaultModel: z.string().max(100).optional(),
  }),
  params: z.object({
    orgId: z.string().min(1),
  }),
});

export const updateAICompanySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    provider: z.enum(["openai", "gemini", "anthropic", "custom"]).optional(),
    apiKey: z.string().min(1).max(500).optional(),
    apiSecret: z.string().max(500).optional(),
    baseUrl: z.string().url().optional(),
    defaultModel: z.string().max(100).optional(),
    isActive: z.boolean().optional(),
  }),
  params: z.object({
    orgId: z.string().min(1),
    companyId: z.string().min(1),
  }),
});

export const listAICompaniesSchema = z.object({
  params: z.object({
    orgId: z.string().min(1),
  }),
  query: z.object({
    page: z.string().default("1").transform(Number),
    limit: z.string().default("10").transform(Number),
    provider: z.enum(["openai", "gemini", "anthropic", "custom"]).optional(),
  }),
});
