import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'khatacopilot_enterprise_jwt_secret_key_2026_secured';

export type UserRole = 'HQ_OWNER' | 'HQ_IT' | 'AREA_MANAGER' | 'FRANCHISE_OWNER' | 'STORE_MANAGER';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  region_id?: string | null;
  franchise_id?: string | null;
  shop_id?: string | null;
  phone?: string | null;
  avatar_initials?: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function generateToken(user: AuthenticatedUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      region_id: user.region_id,
      franchise_id: user.franchise_id,
      shop_id: user.shop_id,
      avatar_initials: user.avatar_initials
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Authentication middleware
export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Session expired or invalid token' });
    return;
  }
}

// Role restriction middleware
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      // Log security violation into audit logs
      try {
        db.prepare(`
          INSERT INTO audit_logs (id, actor_id, actor_name, role, action, resource, metadata)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
          'sec-' + Date.now(),
          req.user.id,
          req.user.name,
          req.user.role,
          'role.permission_denied',
          req.originalUrl,
          JSON.stringify({ requiredRoles: allowedRoles, attemptedMethod: req.method })
        );
      } catch (e) {
        console.error('[Audit Log Error]', e);
      }

      res.status(403).json({
        error: 'Forbidden: Your role does not possess permissions for this resource',
        role: req.user.role,
        requiredRoles: allowedRoles
      });
      return;
    }

    next();
  };
}

// Scoping Engine: Resolves allowed shop IDs based on authenticated user's role and database relations
export function resolveUserScope(user: AuthenticatedUser): {
  isGlobal: boolean;
  allowedShopIds: string[] | null;
  whereShopSql: string;
  sqlParams: any[];
} {
  if (user.role === 'HQ_OWNER' || user.role === 'HQ_IT') {
    return {
      isGlobal: true,
      allowedShopIds: null,
      whereShopSql: '1=1',
      sqlParams: []
    };
  }

  if (user.role === 'AREA_MANAGER') {
    // Area Manager sees only shops in their assigned region (e.g., 'reg-west' or 'West')
    const regionId = user.region_id || 'reg-west';
    const rows = db.prepare('SELECT id FROM shops WHERE region_id = ? OR region = ?').all(regionId, 'West') as { id: string }[];
    const shopIds = rows.map(r => r.id);
    const placeholders = shopIds.map(() => '?').join(',');
    return {
      isGlobal: false,
      allowedShopIds: shopIds,
      whereShopSql: shopIds.length ? `id IN (${placeholders})` : '1=0',
      sqlParams: shopIds
    };
  }

  if (user.role === 'FRANCHISE_OWNER') {
    // Franchise Owner sees all shops belonging to their assigned franchise
    const franchiseId = user.franchise_id || 'fran-01';
    const rows = db.prepare('SELECT id FROM shops WHERE franchise_id = ?').all(franchiseId) as { id: string }[];
    const shopIds = rows.map(r => r.id);
    const placeholders = shopIds.map(() => '?').join(',');
    return {
      isGlobal: false,
      allowedShopIds: shopIds,
      whereShopSql: shopIds.length ? `id IN (${placeholders})` : '1=0',
      sqlParams: shopIds
    };
  }

  if (user.role === 'STORE_MANAGER') {
    // Store Manager sees ONLY their assigned shop
    const shopId = user.shop_id || 'shop-01';
    return {
      isGlobal: false,
      allowedShopIds: [shopId],
      whereShopSql: 'id = ?',
      sqlParams: [shopId]
    };
  }

  return {
    isGlobal: false,
    allowedShopIds: [],
    whereShopSql: '1=0',
    sqlParams: []
  };
}

// Check if user has permission to view/modify a specific shop
export function enforceShopAccess(reqUser: AuthenticatedUser, shopId: string): boolean {
  if (reqUser.role === 'HQ_OWNER' || reqUser.role === 'HQ_IT') return true;
  const scope = resolveUserScope(reqUser);
  if (scope.isGlobal) return true;
  if (!scope.allowedShopIds) return false;
  return scope.allowedShopIds.includes(shopId);
}
