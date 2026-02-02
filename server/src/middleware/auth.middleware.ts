import { Request, Response, NextFunction } from 'express';
import { organizationsService } from '../organizations/organizations.services';

export interface AuthenticatedRequest extends Request {
  orgId?: string;
  apiKey?: string;
  orgSlug?: string;
}

/**
 * Middleware to validate API key from header
 * Expects header: X-API-Key
 */
export const validateApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      res.status(401).json({ error: 'API key is required', code: 'MISSING_API_KEY' });
      return;
    }

    // Find organization by API key
    const org = await organizationsService.findByApiKey(apiKey);

    if (!org) {
      res.status(401).json({ error: 'Invalid API key', code: 'INVALID_API_KEY' });
      return;
    }

    // Attach org info to request for downstream use
    req.orgId = org.id;
    req.orgSlug = org.orgSlug;
    req.apiKey = apiKey;

    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error', code: 'AUTH_ERROR' });
  }
};

/**
 * Optional middleware - validates API key if present, but doesn't require it
 */
export const optionalApiKey = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (apiKey) {
      const org = await organizationsService.findByApiKey(apiKey);
      if (org) {
        req.orgId = org.id;
        req.orgSlug = org.orgSlug;
        req.apiKey = apiKey;
      }
    }

    next();
  } catch (error) {
    next();
  }
};

/**
 * Middleware to validate organization slug from URL params
 */
export const validateOrgSlug = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const orgSlug = req.params.orgSlug as string;

    if (!orgSlug) {
      res.status(400).json({ error: 'Organization slug is required', code: 'MISSING_ORG_SLUG' });
      return;
    }

    const org = await organizationsService.getOrganizationBySlug(orgSlug);

    if (!org) {
      res.status(404).json({ error: 'Organization not found', code: 'ORG_NOT_FOUND' });
      return;
    }

    req.orgId = org.id;
    req.orgSlug = org.orgSlug;

    next();
  } catch (error) {
    res.status(500).json({ error: 'Validation error', code: 'VALIDATION_ERROR' });
  }
};
