export interface JWTPayload {
  userId: string;
  workspaceId: string;
  email: string;
}

export interface AuthRequest extends Express.Request {
  user?: JWTPayload;
}
