import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import { generateToken, authenticateToken, AuthRequest, resolveUserScope } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE lower(email) = ?').get(normalizedEmail) as any;

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials. User does not exist.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials. Password incorrect.' });
      return;
    }

    const authenticatedUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      region_id: user.region_id,
      franchise_id: user.franchise_id,
      shop_id: user.shop_id,
      phone: user.phone,
      avatar_initials: user.avatar_initials
    };

    const token = generateToken(authenticatedUser);
    const scope = resolveUserScope(authenticatedUser);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, role, action, resource, metadata)
      VALUES (?, ?, ?, ?, 'user.login', 'auth', ?)
    `).run('aud-' + Date.now(), user.id, user.name, user.role, JSON.stringify({ ip: req.ip, userAgent: req.headers['user-agent'] }));

    res.json({
      token,
      user: authenticatedUser,
      scope: {
        isGlobal: scope.isGlobal,
        allowedShopCount: scope.allowedShopIds ? scope.allowedShopIds.length : 'All'
      }
    });
  } catch (err: any) {
    console.error('[Auth Error]', err);
    res.status(500).json({ error: 'Internal authentication server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, (req: AuthRequest, res) => {
  if (req.user) {
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, role, action, resource, metadata)
      VALUES (?, ?, ?, ?, 'user.logout', 'auth', ?)
    `).run('aud-' + Date.now(), req.user.id, req.user.name, req.user.role, JSON.stringify({ ip: req.ip }));
  }
  res.json({ success: true, message: 'Logged out successfully' });
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthenticated' });
    return;
  }

  const user = db.prepare('SELECT id, email, name, role, region_id, franchise_id, shop_id, phone, avatar_initials FROM users WHERE id = ?').get(req.user.id);
  const scope = resolveUserScope(req.user);

  res.json({
    user,
    scope: {
      isGlobal: scope.isGlobal,
      allowedShopIds: scope.allowedShopIds
    }
  });
});

// POST /api/auth/reset-password
router.post('/reset-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ error: 'Email required' });
    return;
  }

  // Temporary password reset token or notification simulated safely
  res.json({
    success: true,
    message: 'If the provided email belongs to a registered enterprise account, a secure recovery link has been dispatched.'
  });
});

export default router;
