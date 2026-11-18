import { type Request } from 'express';
import { type AccessTokenClaims } from '../domain/access-token-claims';

export interface AuthenticatedRequest extends Request {
  auth?: AccessTokenClaims;
}
