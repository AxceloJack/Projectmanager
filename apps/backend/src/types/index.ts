import { Request } from 'express';

export interface JWTPayload {
  userId: string;
  workspaceId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: JWTPayload;
}
