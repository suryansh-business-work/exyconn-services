import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIProvider } from "../companies/company.models";
import { IChatMessage } from "../chats/chat.models";

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  apiSecret?: string;
  baseUrl?: string;
}

export interface AIMessageInput {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}

// Convert internal messages to provider format
const formatMessages = (messages: IChatMessage[]): AIMessageInput[] => {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
};

// OpenAI provider
const callOpenAI = async (
  config: AIProviderConfig,
  model: string,
  messages: AIMessageInput[],
): Promise<AIResponse> => {
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl || undefined,
  });

  const response = await client.chat.completions.create({
    model,
    messages: messages.map((m) => ({
      role: m.role as "system" | "user" | "assistant",
      content: m.content,
    })),
  });

  const choice = response.choices[0];
  return {
    content: choice?.message?.content || "",
    model: response.model,
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
    totalTokens: response.usage?.total_tokens,
  };
};

// Anthropic provider
const callAnthropic = async (
  config: AIProviderConfig,
  model: string,
  messages: AIMessageInput[],
): Promise<AIResponse> => {
  const client = new Anthropic({
    apiKey: config.apiKey,
  });

  // Anthropic requires system message separately
  const systemMessage = messages.find((m) => m.role === "system");
  const otherMessages = messages.filter((m) => m.role !== "system");

  const response = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemMessage?.content || undefined,
    messages: otherMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  });

  const textContent = response.content.find((c) => c.type === "text");
  return {
    content: textContent?.type === "text" ? textContent.text : "",
    model: response.model,
    promptTokens: response.usage?.input_tokens,
    completionTokens: response.usage?.output_tokens,
    totalTokens:
      (response.usage?.input_tokens || 0) +
      (response.usage?.output_tokens || 0),
  };
};

// Google Gemini provider
const callGemini = async (
  config: AIProviderConfig,
  model: string,
  messages: AIMessageInput[],
): Promise<AIResponse> => {
  const genAI = new GoogleGenerativeAI(config.apiKey);
  const genModel = genAI.getGenerativeModel({ model });

  // Gemini uses a chat format - convert messages
  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages.filter((m) => m.role !== "system");

  // Start a chat with history
  const history = chatMessages.slice(0, -1).map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const chat = genModel.startChat({
    history: history as { role: "user" | "model"; parts: { text: string }[] }[],
    systemInstruction: systemMessage?.content,
  });

  const lastMessage = chatMessages[chatMessages.length - 1];
  const result = await chat.sendMessage(lastMessage?.content || "");
  const response = await result.response;

  return {
    content: response.text(),
    model,
    totalTokens: response.usageMetadata?.totalTokenCount,
    promptTokens: response.usageMetadata?.promptTokenCount,
    completionTokens: response.usageMetadata?.candidatesTokenCount,
  };
};

// Custom provider (uses OpenAI-compatible API)
const callCustom = async (
  config: AIProviderConfig,
  model: string,
  messages: AIMessageInput[],
): Promise<AIResponse> => {
  if (!config.baseUrl) {
    throw new Error("Custom provider requires baseUrl");
  }

  // Use OpenAI client with custom base URL
  const client = new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseUrl,
  });

  const response = await client.chat.completions.create({
    model,
    messages: messages.map((m) => ({
      role: m.role as "system" | "user" | "assistant",
      content: m.content,
    })),
  });

  const choice = response.choices[0];
  return {
    content: choice?.message?.content || "",
    model: response.model,
    promptTokens: response.usage?.prompt_tokens,
    completionTokens: response.usage?.completion_tokens,
    totalTokens: response.usage?.total_tokens,
  };
};

// Main AI provider client
export const aiProviderClient = {
  sendMessage: async (
    config: AIProviderConfig,
    model: string,
    messages: IChatMessage[],
  ): Promise<AIResponse> => {
    const formattedMessages = formatMessages(messages);

    switch (config.provider) {
      case "openai":
        return callOpenAI(config, model, formattedMessages);
      case "anthropic":
        return callAnthropic(config, model, formattedMessages);
      case "gemini":
        return callGemini(config, model, formattedMessages);
      case "custom":
        return callCustom(config, model, formattedMessages);
      default:
        throw new Error(`Unsupported AI provider: ${config.provider}`);
    }
  },
};
