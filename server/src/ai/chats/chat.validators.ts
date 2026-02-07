import { z } from "zod";

export const createAIChatSchema = z.object({
  body: z.object({
    companyId: z.string().min(1),
    title: z.string().min(1).max(200),
    model: z.string().min(1).max(100),
    maxHistoryMessages: z.number().min(1).max(200).default(50),
    systemPrompt: z.string().max(5000).optional(),
  }),
  params: z.object({
    orgId: z.string().min(1),
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    message: z.string().min(1).max(50000),
  }),
  params: z.object({
    orgId: z.string().min(1),
    chatId: z.string().min(1),
  }),
});

export const updateChatSettingsSchema = z.object({
  body: z.object({
    title: z.string().min(1).max(200).optional(),
    maxHistoryMessages: z.number().min(1).max(200).optional(),
  }),
  params: z.object({
    orgId: z.string().min(1),
    chatId: z.string().min(1),
  }),
});

export const listChatsSchema = z.object({
  params: z.object({
    orgId: z.string().min(1),
  }),
  query: z.object({
    page: z.string().default("1").transform(Number),
    limit: z.string().default("20").transform(Number),
    companyId: z.string().optional(),
  }),
});
