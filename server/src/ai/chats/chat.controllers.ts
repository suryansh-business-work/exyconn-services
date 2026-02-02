import { Request, Response } from 'express';
import { aiChatService } from './chat.services';

export const aiChatController = {
  list: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const { page = '1', limit = '20', companyId } = req.query;
      const result = await aiChatService.list(orgId, {
        page: Number(page),
        limit: Number(limit),
        companyId: companyId as string,
      });
      res.json(result);
    } catch (err) {
      res.status(500).json({ error: 'Failed to list chats' });
    }
  },

  get: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const chatId = req.params.chatId as string;
      const chat = await aiChatService.get(orgId, chatId);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });
      res.json(chat);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get chat' });
    }
  },

  create: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const chat = await aiChatService.create(orgId, req.body);
      res.status(201).json(chat);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create chat' });
    }
  },

  update: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const chatId = req.params.chatId as string;
      const chat = await aiChatService.update(orgId, chatId, req.body);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });
      res.json(chat);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update chat' });
    }
  },

  delete: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const chatId = req.params.chatId as string;
      const deleted = await aiChatService.delete(orgId, chatId);
      if (!deleted) return res.status(404).json({ error: 'Chat not found' });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete chat' });
    }
  },

  sendMessage: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const chatId = req.params.chatId as string;
      const { message } = req.body;
      const result = await aiChatService.sendMessage(orgId, chatId, message);
      res.json(result);
    } catch (err) {
      const error = err as Error;
      if (error.message === 'Chat not found' || error.message === 'AI Company not found') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to send message' });
    }
  },

  getStats: async (req: Request, res: Response) => {
    try {
      const orgId = req.params.orgId as string;
      const stats = await aiChatService.getStats(orgId);
      res.json(stats);
    } catch (err) {
      res.status(500).json({ error: 'Failed to get stats' });
    }
  },
};
