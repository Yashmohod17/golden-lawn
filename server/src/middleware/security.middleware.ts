import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

// 1. Custom Security Headers Middleware (Helmet implementation)
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-XSS-Protection', '0');
  next();
}

// 2. In-Memory Rate Limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // max 100 requests per minute per IP

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  const now = Date.now();
  const limitInfo = rateLimitMap.get(ip);

  if (!limitInfo || now > limitInfo.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return next();
  }

  limitInfo.count++;
  if (limitInfo.count > MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests from this IP. Please try again after 1 minute.' });
  }
  next();
}

// 3. Database-driven Permission Check (RBAC Middleware)
export function requirePermission(permissionName: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Session token is required.' });
    }

    try {
      // If client is a standard Customer, reject access to admin console APIs
      if (user.role === 'CUSTOMER') {
        return res.status(403).json({ error: 'Forbidden: Customer accounts do not have admin privileges.' });
      }

      // Check administrative User in DB
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          role: {
            include: {
              permissions: true,
            },
          },
        },
      });

      if (!dbUser || !dbUser.role) {
        return res.status(403).json({ error: 'Forbidden: No administrative role assigned.' });
      }

      // Owner role has absolute clearance bypassing individual permissions check
      if (dbUser.role.name === 'OWNER') {
        return next();
      }

      const hasPermission = dbUser.role.permissions.some(p => p.name === permissionName);
      if (!hasPermission) {
        return res.status(403).json({ error: `Forbidden: Requires permission "${permissionName}".` });
      }

      next();
    } catch (err: any) {
      console.error('RBAC Middleware Error:', err.message);
      return res.status(500).json({ error: 'RBAC Authorization Check failed.' });
    }
  };
}

// 4. Audit Logging Helper
export async function logAuditAction(
  userId: string | null,
  action: string,
  details?: any,
  ipAddress?: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: details ? JSON.stringify(details) : null,
        ipAddress,
      },
    });
  } catch (err: any) {
    console.error('Failed to write audit log entry:', err.message);
  }
}
