import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'golden_celebrations_secret_key_123_abc_xyz';

export interface UserPayload {
  id: string;
  email: string;
  role: string;
}

// Support ambient Request extension
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Access token is required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    req.user = decoded;
    (req as AuthenticatedRequest).user = decoded;
    next();
  } catch (err: any) {
    return res.status(403).json({ error: 'Invalid or expired access token' });
  }
}

export function requireRole(roles: string | string[]) {
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!rolesArray.includes(user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
}
