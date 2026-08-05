import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'zaara_travels_jwt_secret_2026_super_secure';

export interface AdminPayload {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: 'Admin' | 'Staff';
}

export interface AuthenticatedAdminRequest extends Request {
  admin?: AdminPayload;
}

/**
 * JWT Authentication Middleware
 * Protects all restricted admin routes
 */
export function authenticateAdminJWT(
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers['x-admin-token']) {
      token = req.headers['x-admin-token'] as string;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication Required',
        message: 'No admin access token provided. Please log in to continue.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload;
    req.admin = decoded;
    next();
  } catch (error: any) {
    console.warn('[Admin Auth Middleware] Invalid or expired JWT token:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Invalid or Expired Token',
      message: 'Your admin session has expired or is invalid. Please log in again.',
    });
  }
}

/**
 * Role authorization middleware
 * Ensures user has 'Admin' role for restricted operations like adding staff, changing settings
 */
export function requireSuperAdminRole(
  req: AuthenticatedAdminRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.admin || req.admin.role !== 'Admin') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Access denied. Super Admin privileges required for this action.',
    });
  }
  next();
}

export function generateAdminJWTToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
