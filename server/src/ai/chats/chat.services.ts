import mongoose from "mongoose";
import { AIChat, IAIChat, IChatMessage } from "./chat.models";
import { aiCompanyService } from "../companies/company.services";
import { aiProviderClient } from "../providers";

interface ListParams {
  page: number;
  limit: number;
  companyId?: string;
}

interface CreateInput {
  companyId: string;
  title: string;
  model: string;
  maxHistoryMessages?: number;
  systemPrompt?: string;
}

interface UpdateInput {
  title?: string;
  maxHistoryMessages?: number;
}

// Rough token estimation (4 chars ≈ 1 token)
const estimateTokens = (text: string): number => Math.ceil(text.length / 4);

export const aiChatService = {
  list: async (orgId: string, params: ListParams) => {
    const { page, limit, companyId } = params;
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      organizationId: new mongoose.Types.ObjectId(orgId),
    };
    if (companyId) query.companyId = new mongoose.Types.ObjectId(companyId);

    const [data, total] = await Promise.all([
      AIChat.aggregate([
        { $match: query },
        { $sort: { updatedAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
          $lookup: {
            from: "aicompanies",
            localField: "companyId",
            foreignField: "_id",
            as: "companyInfo",
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            aiModel: 1,
            totalTokens: 1,
            maxHistoryMessages: 1,
            createdAt: 1,
            updatedAt: 1,
            messageCount: { $size: "$messages" },
            company: { $arrayElemAt: ["$companyInfo", 0] },
          },
        },
      ]),
      AIChat.countDocuments(query),
    ]);

    return {
      data: data.map((d) => ({
        id: d._id.toString(),
        title: d.title,
        model: d.aiModel,
        totalTokens: d.totalTokens,
        maxHistoryMessages: d.maxHistoryMessages,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
        messageCount: d.messageCount,
        company: d.company
          ? { name: d.company.name, provider: d.company.provider }
          : null,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  },

  get: async (orgId: string, chatId: string): Promise<IAIChat | null> => {
    return AIChat.findOne({
      _id: new mongoose.Types.ObjectId(chatId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    }).populate("companyId", "name provider");
  },

  create: async (orgId: string, data: CreateInput): Promise<IAIChat> => {
    const messages: IChatMessage[] = [];
    let totalTokens = 0;

    if (data.systemPrompt) {
      const tokenCount = estimateTokens(data.systemPrompt);
      messages.push({
        role: "system",
        content: data.systemPrompt,
        timestamp: new Date(),
        tokenCount,
      });
      totalTokens += tokenCount;
    }

    const chat = new AIChat({
      organizationId: new mongoose.Types.ObjectId(orgId),
      companyId: new mongoose.Types.ObjectId(data.companyId),
      title: data.title,
      aiModel: data.model,
      maxHistoryMessages: data.maxHistoryMessages || 50,
      messages,
      totalTokens,
    });
    return chat.save();
  },

  update: async (
    orgId: string,
    chatId: string,
    data: UpdateInput,
  ): Promise<IAIChat | null> => {
    return AIChat.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(chatId),
        organizationId: new mongoose.Types.ObjectId(orgId),
      },
      { $set: data },
      { new: true },
    );
  },

  delete: async (orgId: string, chatId: string): Promise<boolean> => {
    const result = await AIChat.deleteOne({
      _id: new mongoose.Types.ObjectId(chatId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });
    return result.deletedCount > 0;
  },

  addMessage: async (
    orgId: string,
    chatId: string,
    role: IChatMessage["role"],
    content: string,
  ) => {
    const chat = await AIChat.findOne({
      _id: new mongoose.Types.ObjectId(chatId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });

    if (!chat) throw new Error("Chat not found");

    const tokenCount = estimateTokens(content);
    const newMessage: IChatMessage = {
      role,
      content,
      timestamp: new Date(),
      tokenCount,
    };

    chat.messages.push(newMessage);
    chat.totalTokens += tokenCount;

    // Trim history if exceeds max (keep system message if exists)
    const systemMessages = chat.messages.filter((m) => m.role === "system");
    const otherMessages = chat.messages.filter((m) => m.role !== "system");

    if (otherMessages.length > chat.maxHistoryMessages) {
      const trimmedTokens = otherMessages
        .slice(0, -chat.maxHistoryMessages)
        .reduce((sum, m) => sum + (m.tokenCount || 0), 0);
      chat.messages = [
        ...systemMessages,
        ...otherMessages.slice(-chat.maxHistoryMessages),
      ];
      chat.totalTokens -= trimmedTokens;
    }

    await chat.save();
    return newMessage;
  },

  sendMessage: async (
    orgId: string,
    chatId: string,
    userMessage: string,
  ): Promise<{ userMessage: IChatMessage; assistantMessage: IChatMessage }> => {
    const chat = await AIChat.findOne({
      _id: new mongoose.Types.ObjectId(chatId),
      organizationId: new mongoose.Types.ObjectId(orgId),
    });

    if (!chat) throw new Error("Chat not found");

    // Get company credentials
    const company = await aiCompanyService.getWithCredentials(
      orgId,
      chat.companyId.toString(),
    );
    if (!company) throw new Error("AI Company not found");

    // Add user message first
    const userMsg = await aiChatService.addMessage(
      orgId,
      chatId,
      "user",
      userMessage,
    );

    // Reload chat with updated messages
    const updatedChat = await AIChat.findById(chatId);
    if (!updatedChat) throw new Error("Chat not found");

    // Call actual AI provider API
    try {
      const response = await aiProviderClient.sendMessage(
        {
          provider: company.provider,
          apiKey: company.apiKey,
          apiSecret: company.apiSecret,
          baseUrl: company.baseUrl,
        },
        updatedChat.aiModel,
        updatedChat.messages,
      );

      const assistantMsg = await aiChatService.addMessage(
        orgId,
        chatId,
        "assistant",
        response.content,
      );

      return { userMessage: userMsg, assistantMessage: assistantMsg };
    } catch (error) {
      // On AI error, still return user message but with error as assistant
      const errorMessage =
        error instanceof Error ? error.message : "AI request failed";
      console.error("AI Provider Error:", error);

      const assistantMsg = await aiChatService.addMessage(
        orgId,
        chatId,
        "assistant",
        `⚠️ AI Error: ${errorMessage}`,
      );

      return { userMessage: userMsg, assistantMessage: assistantMsg };
    }
  },

  getStats: async (orgId: string) => {
    const orgObjectId = new mongoose.Types.ObjectId(orgId);

    const [totalChats, totalMessages, totalTokens] = await Promise.all([
      AIChat.countDocuments({ organizationId: orgObjectId }),
      AIChat.aggregate([
        { $match: { organizationId: orgObjectId } },
        { $project: { messageCount: { $size: "$messages" } } },
        { $group: { _id: null, total: { $sum: "$messageCount" } } },
      ]),
      AIChat.aggregate([
        { $match: { organizationId: orgObjectId } },
        { $group: { _id: null, total: { $sum: "$totalTokens" } } },
      ]),
    ]);

    return {
      totalChats,
      totalMessages: totalMessages[0]?.total || 0,
      totalTokens: totalTokens[0]?.total || 0,
    };
  },
};
