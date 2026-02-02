import { Request, Response, NextFunction } from 'express';
import { historyService } from './history.services';

export const historyController = {
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.orgId as string;
      const { page, limit, monitorId, status, startDate, endDate } = req.query;

      const result = await historyService.list(orgId, {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        monitorId: monitorId as string,
        status: status as 'healthy' | 'warning' | 'error',
        startDate: startDate as string,
        endDate: endDate as string,
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.orgId as string;
      const checkId = req.params.checkId as string;
      const check = await historyService.get(orgId, checkId);

      if (!check) {
        return res.status(404).json({ error: 'Check result not found' });
      }

      res.json(check);
    } catch (err) {
      next(err);
    }
  },

  getStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.params.orgId as string;
      const stats = await historyService.getStats(orgId);
      res.json(stats);
    } catch (err) {
      next(err);
    }
  },
};
