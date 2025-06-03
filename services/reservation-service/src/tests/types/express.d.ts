// Type definitions to extend Express Request
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}
