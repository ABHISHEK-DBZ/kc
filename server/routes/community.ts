import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthRequest, requireRole } from '../middleware/auth.js';
import { agentOrchestrator } from '../services/agentOrchestrator.js';
import { realtimeHub } from '../services/realtimeHub.js';

const router = Router();

// GET /api/community/posts - List posts
router.get('/posts', authenticateToken, (req: AuthRequest, res) => {
  try {
    const posts = db.prepare(`
      SELECT 
        p.*,
        COUNT(r.id) as replies_count
      FROM community_posts p
      LEFT JOIN community_replies r ON p.id = r.post_id
      GROUP BY p.id
      ORDER BY p.is_pinned DESC, p.created_at DESC
    `).all() as any[];

    const enriched = posts.map(p => ({
      ...p,
      tags: p.tags ? JSON.parse(p.tags) : [],
      ai_classification: p.ai_classification ? JSON.parse(p.ai_classification) : null
    }));

    res.json(enriched);
  } catch (err: any) {
    console.error('[Community Posts GET Error]', err);
    res.status(500).json({ error: 'Failed to retrieve community discussions' });
  }
});

// POST /api/community/posts - Create post & trigger autonomous Support Agent
router.post('/posts', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { title, content, category, shop_id, tags } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    const postId = `post-${Date.now()}`;
    const user = req.user!;
    const assignedShop = shop_id ? (db.prepare('SELECT name FROM shops WHERE id = ?').get(shop_id) as any)?.name : null;

    db.prepare(`
      INSERT INTO community_posts (
        id, title, content, category, author_id, author_name, author_role,
        shop_id, shop_name, tags, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Open', datetime('now'), datetime('now'))
    `).run(
      postId, title, content, category || 'Store Operations',
      user.id, user.name, user.role,
      shop_id || user.shop_id || null, assignedShop || 'All Branches',
      JSON.stringify(tags || [])
    );

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, role, action, resource, resource_id, metadata)
      VALUES (?, ?, ?, ?, 'community.post_created', 'community_posts', ?, ?)
    `).run('aud-' + Date.now(), user.id, user.name, user.role, postId, JSON.stringify({ title, category }));

    // Realtime broadcast new post
    realtimeHub.broadcast('COMMUNITY_POST_CREATED', { postId, title, author: user.name });

    // Trigger Autonomous Support Agent triage in the background
    agentOrchestrator.handleEvent('COMMUNITY_POST_CREATED', { postId, title, content }).catch(console.error);

    const post = db.prepare('SELECT * FROM community_posts WHERE id = ?').get(postId) as any;
    post.tags = post.tags ? JSON.parse(post.tags) : [];

    res.status(201).json(post);
  } catch (err: any) {
    console.error('[Community Post Create Error]', err);
    res.status(500).json({ error: 'Failed to submit discussion' });
  }
});

// GET /api/community/posts/:id/replies
router.get('/posts/:id/replies', authenticateToken, (req: AuthRequest, res) => {
  try {
    const postId = req.params.id;
    const replies = db.prepare('SELECT * FROM community_replies WHERE post_id = ? ORDER BY is_solution DESC, created_at ASC').all(postId);
    res.json(replies);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch replies' });
  }
});

// POST /api/community/posts/:id/replies
router.post('/posts/:id/replies', authenticateToken, (req: AuthRequest, res) => {
  try {
    const postId = req.params.id;
    const { content, is_solution } = req.body;

    if (!content) {
      res.status(400).json({ error: 'Reply content required' });
      return;
    }

    const replyId = `rep-${Date.now()}`;
    const user = req.user!;

    db.prepare(`
      INSERT INTO community_replies (id, post_id, author_id, author_name, author_role, content, is_solution)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(replyId, postId, user.id, user.name, user.role, content, is_solution ? 1 : 0);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, role, action, resource, resource_id, metadata)
      VALUES (?, ?, ?, ?, 'community.reply_created', 'community_replies', ?, ?)
    `).run('aud-' + Date.now(), user.id, user.name, user.role, replyId, JSON.stringify({ postId }));

    realtimeHub.broadcast('COMMUNITY_REPLY_CREATED', { postId, replyId, author: user.name });

    const reply = db.prepare('SELECT * FROM community_replies WHERE id = ?').get(replyId);
    res.status(201).json(reply);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit reply' });
  }
});

// GET /api/community/known-issues - Known Issues Catalog
router.get('/known-issues', authenticateToken, (req: AuthRequest, res) => {
  try {
    const issues = db.prepare('SELECT * FROM known_issues ORDER BY created_at DESC').all();
    res.json(issues);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load known issues' });
  }
});

// POST /api/community/known-issues - Add/Verify Known Issue (HQ_IT only)
router.post('/known-issues', authenticateToken, requireRole('HQ_IT', 'HQ_OWNER'), (req: AuthRequest, res) => {
  try {
    const { code, title, category, severity, affected_versions, fixed_version, status, workaround, root_cause } = req.body;
    const issueId = `ki-${Date.now()}`;

    db.prepare(`
      INSERT INTO known_issues (
        id, code, title, category, severity, affected_versions, fixed_version,
        status, workaround, root_cause, verified_by, verified_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      issueId, code, title, category || 'Billing & POS', severity || 'Medium',
      affected_versions || '2.8.x', fixed_version || 'Pending', status || 'Workaround Available',
      workaround || '', root_cause || '', `${req.user!.name} (${req.user!.role})`
    );

    db.prepare(`
      INSERT INTO audit_logs (id, actor_id, actor_name, role, action, resource, resource_id, metadata)
      VALUES (?, ?, ?, ?, 'known_issue.verified', 'known_issues', ?, ?)
    `).run('aud-' + Date.now(), req.user!.id, req.user!.name, req.user!.role, issueId, JSON.stringify({ code, title }));

    const created = db.prepare('SELECT * FROM known_issues WHERE id = ?').get(issueId);
    realtimeHub.broadcast('KNOWN_ISSUE_PUBLISHED', created);

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to publish known issue' });
  }
});

export default router;
