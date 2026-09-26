const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = process.env.PORT || 4000;
const DB_FILE = path.join(__dirname, '..', 'data', 'networkos_store.json');
const GROQ_API_KEY = process.env.AI_API_KEY || '';
const GROQ_MODEL = 'openai/gpt-oss-20b';

async function callGroqAI(prompt, systemPrompt = 'You are a precise JSON classification AI.') {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 800
    });

    const req = https.request({
      hostname: 'api.groq.com',
      path: '/openai/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          const content = parsed.choices[0].message.content;
          resolve(JSON.parse(content));
        } catch (e) {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
    req.write(payload);
    req.end();
  });
}

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// -------------------------------------------------------------
// SEED & PERSISTENT STORAGE ENGINE
// -------------------------------------------------------------
function hashPassword(password, salt) {
  return crypto.createHash('sha256').update(`${salt}:${password}:khata_copilot_secure_salt_2026`).digest('hex');
}

function getInitialData() {
  const defaultSalt = 'salt_franchise_99';
  return {
    meta: {
      version: 2,
      createdAt: new Date().toISOString(),
      appName: 'KhataCopilot NetworkOS Authoritative Store'
    },
    users: [
      {
        id: 'usr-1',
        name: 'Rajesh Sharma',
        email: 'rajesh@store.khatacopilot.in',
        phone: '9876543210',
        passwordHash: hashPassword('rajesh123', defaultSalt),
        salt: defaultSalt,
        franchiseCode: 'FR-2041',
        city: 'Mumbai Central',
        role: 'Store Owner',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        questionsCount: 2,
        answersCount: 42,
        savedPostsCount: 8,
        createdAt: '2026-09-01T10:00:00Z'
      },
      {
        id: 'usr-2',
        name: 'Priya Gupta',
        email: 'priya@store.khatacopilot.in',
        phone: '9811223344',
        passwordHash: hashPassword('priya123', defaultSalt),
        salt: defaultSalt,
        franchiseCode: 'FR-1185',
        city: 'Delhi Connaught',
        role: 'Store Manager',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
        questionsCount: 4,
        answersCount: 128,
        savedPostsCount: 15,
        createdAt: '2026-08-15T09:00:00Z'
      },
      {
        id: 'usr-3',
        name: 'Ankit Verma',
        email: 'ankit@hq.khatacopilot.in',
        phone: '9988776655',
        passwordHash: hashPassword('ankit123', defaultSalt),
        salt: defaultSalt,
        franchiseCode: 'HQ-SUPPORT',
        city: 'Bengaluru HQ',
        role: 'Certified Tax Specialist',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
        questionsCount: 1,
        answersCount: 195,
        savedPostsCount: 24,
        createdAt: '2026-07-01T08:00:00Z'
      }
    ],
    active_session: {
      userId: 'usr-1',
      token: 'tok_rajesh_sharma_session_secure_2026',
      loginTime: new Date().toISOString()
    },
    business_health: {
      score: 92,
      status: 'Great',
      transactionsToday: 142,
      totalSalesToday: 48500,
      customersCount: 89,
      creditGiven: 12400,
      inventoryAlertsCount: 3,
      gstStatus: 'Sync Ready',
      lastSync: new Date().toISOString()
    },
    questions: [
      {
        id: 'QC-8421',
        title: 'I entered all sales but my GSTR-1 report is showing wrong total. How can I fix this?',
        body: 'I entered all sales entries yesterday, but when generating GSTR-1 for filing, the total is short by ₹14,200. Is there an invoice reconciliation setting I missed?',
        authorId: 'usr-1',
        authorName: 'Rajesh Sharma',
        authorFranchise: 'FR-2041',
        authorLocation: 'Mumbai Central',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        authorBadge: 'Owner',
        timeAgo: '2 hours ago',
        status: 'In Progress',
        tags: ['GST & Tax', 'GSTR-1', 'Report Issue'],
        commentsCount: 1,
        upvotesCount: 14,
        aiCategory: 'GST & Tax',
        aiConfidence: 94,
        createdAt: '2026-09-26T12:00:00Z'
      }
    ],
    comments: [
      {
        id: 'cmt-1',
        questionId: 'QC-8421',
        authorId: 'usr-2',
        author: 'Priya Gupta',
        authorName: 'Priya Gupta',
        franchise: 'FR-1185',
        authorFranchise: 'FR-1185',
        authorLocation: 'Delhi',
        authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
        authorBadge: 'Top Helper',
        text: "I had the exact same issue last month. The problem was that purchase entries were not marked as 'Include in GSTR-1'. Check this toggle under Settings → Tax Preferences → GSTR Options.",
        likes: 8,
        likedBy: ['usr-1', 'usr-3'],
        timeAgo: '1 hour ago',
        timestamp: '2026-09-26T13:00:00Z'
      }
    ],
    knowledge_articles: [
      {
        id: 'kb-1',
        title: 'How to sync offline sales data with GST Portal',
        category: 'GST & Tax',
        subtitle: 'Resolve missing offline transactions during quarterly filing',
        sopSteps: [
          'Verify internet connection on POS terminal.',
          'Navigate to Settings → Cloud Sync → Force Push.',
          'Verify ledger reconciliation counter matches receipt count.',
          'Export signed JSON and upload to GST Portal.'
        ],
        iconCode: 61858,
        colorCode: 366249,
        bgCode: 15531493,
        viewCount: 1420,
        createdAt: '2026-09-20T10:00:00Z'
      }
    ],
    notifications: [
      {
        id: 'notif-1',
        title: 'AI Solution Recommended',
        message: 'KhataCopilot AI matched 94% confidence solution for GSTR-1 issue.',
        timeAgo: '2m ago',
        iconCode: 57520,
        colorCode: 2450411,
        isRead: false,
        timestamp: new Date().toISOString()
      }
    ],
    audit_logs: [
      {
        id: 'audit-1',
        actorId: 'usr-1',
        actorRole: 'Store Owner',
        franchiseId: 'FR-2041',
        action: 'USER_LOGIN',
        resourceType: 'AUTH_SESSION',
        resourceId: 'usr-1',
        details: 'User logged in via verified password hash',
        timestamp: new Date().toISOString()
      }
    ]
  };
}

let db = null;

function loadDb() {
  if (db) return db;
  if (fs.existsSync(DB_FILE)) {
    try {
      db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
      console.warn('DB file corrupt, reseeding:', e);
      db = getInitialData();
      saveDb();
    }
  } else {
    db = getInitialData();
    saveDb();
  }
  return db;
}

function saveDb() {
  if (!db) return;
  const tmp = `${DB_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(tmp, DB_FILE);
}

// In-memory connected SSE/long-poll/websocket clients for live updates
const sseClients = new Set();

function broadcastEvent(channel, data) {
  const payload = `data: ${JSON.stringify({ channel, data, timestamp: new Date().toISOString() })}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch (e) {
      sseClients.delete(res);
    }
  }
}

// -------------------------------------------------------------
// HTTP SERVER WITH REST & REALTIME SSE (Server-Sent Events)
// -------------------------------------------------------------
const server = http.createServer((req, res) => {
  // CORS Headers for both Flutter Web, React Web, and Localhost
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Franchise-Id');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;

  // Realtime SSE endpoint for instant Mobile <-> Web synchronization
  if (pathname === '/api/realtime' || pathname === '/realtime') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write(`data: ${JSON.stringify({ channel: 'connected', time: new Date().toISOString() })}\n\n`);
    sseClients.add(res);
    req.on('close', () => sseClients.delete(res));
    return;
  }

  // Parse JSON Body
  let bodyStr = '';
  req.on('data', chunk => { bodyStr += chunk; });
  req.on('end', async () => {
    let body = {};
    if (bodyStr) {
      try {
        body = JSON.parse(bodyStr);
      } catch (e) {
        // ignore parse error for empty/plain bodies
      }
    }

    const currentDb = loadDb();

    function jsonResponse(data, status = 200) {
      res.writeHead(status, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    }

    function recordAudit(action, resourceType, resourceId, details, actor) {
      const log = {
        id: `audit-${Date.now()}`,
        actorId: actor?.id || 'usr-1',
        actorRole: actor?.role || 'Store Owner',
        franchiseId: actor?.franchiseCode || 'FR-2041',
        action,
        resourceType,
        resourceId,
        details,
        timestamp: new Date().toISOString()
      };
      currentDb.audit_logs.unshift(log);
      saveDb();
      broadcastEvent('audit', log);
    }

    // 1. HEALTH CHECK
    if (pathname === '/api/health' || pathname === '/') {
      return jsonResponse({
        status: 'UP',
        service: 'KhataCopilot NetworkOS Unified Server',
        timestamp: new Date().toISOString(),
        clientsConnected: sseClients.size
      });
    }

    // 2. AUTHENTICATION
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const { identifier, password } = body;
      const cleanId = (identifier || '').trim().toLowerCase();
      const user = currentDb.users.find(u => 
        u.email.toLowerCase() === cleanId || u.phone === cleanId
      );

      if (!user) {
        return jsonResponse({ error: 'User not found with provided credentials' }, 401);
      }

      const hash = hashPassword(password, user.salt);
      if (user.passwordHash !== hash) {
        return jsonResponse({ error: 'Invalid password' }, 401);
      }

      const sessionToken = `tok_${user.id}_${Date.now()}`;
      currentDb.active_session = {
        userId: user.id,
        token: sessionToken,
        loginTime: new Date().toISOString()
      };
      saveDb();
      recordAudit('USER_LOGIN', 'AUTH_SESSION', user.id, 'User logged in with verified credentials', user);
      return jsonResponse({ success: true, user, token: sessionToken });
    }

    if (pathname === '/api/auth/session') {
      const activeUser = currentDb.users.find(u => u.id === currentDb.active_session?.userId) || currentDb.users[0];
      return jsonResponse({ session: currentDb.active_session, user: activeUser });
    }

    if (pathname === '/api/auth/switch-account' && req.method === 'POST') {
      const { userId } = body;
      const targetUser = currentDb.users.find(u => u.id === userId) || currentDb.users[0];
      currentDb.active_session = {
        userId: targetUser.id,
        token: `tok_${targetUser.id}_switched`,
        loginTime: new Date().toISOString()
      };
      saveDb();
      recordAudit('ACCOUNT_SWITCH', 'AUTH_SESSION', targetUser.id, `Switched active role to ${targetUser.role}`, targetUser);
      broadcastEvent('auth', { activeUser: targetUser });
      return jsonResponse({ success: true, user: targetUser });
    }

    // 3. COMMUNITY QUESTIONS
    if (pathname === '/api/community/posts' && req.method === 'GET') {
      return jsonResponse(currentDb.questions);
    }

    if (pathname === '/api/community/posts' && req.method === 'POST') {
      const { title, body: qBody, tags } = body;
      const activeUser = currentDb.users.find(u => u.id === currentDb.active_session?.userId) || currentDb.users[0];
      const nextNum = 8420 + currentDb.questions.length + 1;
      const newId = `QC-${nextNum}`;

      // AI Intake Agent Classification via Groq LPU
      let aiCategory = 'GST & Tax';
      let aiConfidence = 94;
      let assignedTags = tags || ['GST & Tax', 'Report Issue'];

      const combinedText = `${title} ${qBody}`.toLowerCase();
      if (combinedText.includes('voice') || combinedText.includes('mic') || combinedText.includes('dictat')) {
        aiCategory = 'Voice Entry';
        aiConfidence = 96;
        assignedTags = ['Voice Entry', 'Microphone', 'Speech AI'];
      } else if (combinedText.includes('printer') || combinedText.includes('bluetooth') || combinedText.includes('hardware')) {
        aiCategory = 'Device Setup';
        aiConfidence = 92;
        assignedTags = ['Device Setup', 'Printer', 'Hardware'];
      } else if (combinedText.includes('inventory') || combinedText.includes('stock') || combinedText.includes('barcode')) {
        aiCategory = 'Inventory';
        aiConfidence = 95;
        assignedTags = ['Inventory', 'Stock', 'Barcode'];
      }

      // Try Groq AI classification if available
      try {
        const groqPrompt = `Analyze this merchant support question:
Title: "${title}"
Body: "${qBody}"
Classify into: "GST & Tax", "Voice Entry", "Device Setup", "Inventory", "Payments", "Cloud Sync".
Return JSON: {"category": "...", "confidence": 95, "tags": ["Tag1", "Tag2"]}`;
        const groqRes = await callGroqAI(groqPrompt);
        if (groqRes && groqRes.category) {
          aiCategory = groqRes.category;
          aiConfidence = Number(groqRes.confidence) || 95;
          if (Array.isArray(groqRes.tags) && groqRes.tags.length > 0) {
            assignedTags = groqRes.tags;
          }
        }
      } catch (e) {
        // Fallback maintained
      }

      const newQ = {
        id: newId,
        title,
        body: qBody,
        authorId: activeUser.id,
        authorName: activeUser.name,
        authorFranchise: activeUser.franchiseCode,
        authorLocation: activeUser.city,
        authorAvatar: activeUser.avatarUrl,
        authorBadge: activeUser.role === 'Store Owner' ? 'Owner' : 'Franchisee',
        timeAgo: 'Just now',
        status: 'In Progress',
        tags: assignedTags,
        commentsCount: 0,
        upvotesCount: 1,
        aiCategory,
        aiConfidence,
        createdAt: new Date().toISOString()
      };

      currentDb.questions.unshift(newQ);
      activeUser.questionsCount = (activeUser.questionsCount || 0) + 1;

      // Add notification
      currentDb.notifications.unshift({
        id: `notif-${Date.now()}`,
        title: `Question Posted (${newId})`,
        message: `Intake Agent classified "${title}" as ${aiCategory} (${aiConfidence}%).`,
        timeAgo: 'Just now',
        iconCode: 57520,
        colorCode: 2450411,
        isRead: false,
        timestamp: new Date().toISOString()
      });

      saveDb();
      recordAudit('CREATE_QUESTION', 'COMMUNITY_POST', newId, `Question created: ${title}`, activeUser);
      broadcastEvent('community_post_created', newQ);
      return jsonResponse(newQ, 201);
    }

    // Single Question
    const postMatch = pathname.match(/^\/api\/community\/posts\/([a-zA-Z0-9_-]+)$/);
    if (postMatch && req.method === 'GET') {
      const qId = postMatch[1];
      const q = currentDb.questions.find(item => item.id === qId);
      if (!q) return jsonResponse({ error: 'Question not found' }, 404);
      const comments = currentDb.comments.filter(c => c.questionId === qId);
      return jsonResponse({ question: q, comments });
    }

    // 4. COMMENTS & DISCUSSION (MOBILE <-> WEB REALTIME BRIDGE)
    const commentsMatch = pathname.match(/^\/api\/community\/posts\/([a-zA-Z0-9_-]+)\/comments$/);
    if (commentsMatch) {
      const qId = commentsMatch[1];
      if (req.method === 'GET') {
        const replies = currentDb.comments.filter(c => c.questionId === qId);
        return jsonResponse(replies);
      }
      if (req.method === 'POST') {
        const { text } = body;
        const activeUser = currentDb.users.find(u => u.id === currentDb.active_session?.userId) || currentDb.users[0];
        const newComment = {
          id: `cmt-${Date.now()}`,
          questionId: qId,
          authorId: activeUser.id,
          author: activeUser.name,
          authorName: activeUser.name,
          franchise: activeUser.franchiseCode,
          authorFranchise: activeUser.franchiseCode,
          authorLocation: activeUser.city,
          authorAvatar: activeUser.avatarUrl,
          authorBadge: activeUser.role === 'Store Owner' ? 'Owner' : 'Top Helper',
          text: (text || '').trim(),
          likes: 0,
          likedBy: [],
          timeAgo: 'Just now',
          timestamp: new Date().toISOString()
        };

        currentDb.comments.push(newComment);
        const targetQ = currentDb.questions.find(q => q.id === qId);
        if (targetQ) {
          targetQ.commentsCount = (targetQ.commentsCount || 0) + 1;
        }
        activeUser.answersCount = (activeUser.answersCount || 0) + 1;

        saveDb();
        recordAudit('ADD_COMMENT', 'COMMUNITY_COMMENT', newComment.id, `Comment on ${qId}: ${text}`, activeUser);
        
        // Instant Realtime Broadcast to both Mobile App and Web App!
        broadcastEvent('comment_added', newComment);
        return jsonResponse(newComment, 201);
      }
    }

    // 5. ACCEPT ANSWER / PROMOTE TO KNOWLEDGE BASE
    const acceptMatch = pathname.match(/^\/api\/community\/posts\/([a-zA-Z0-9_-]+)\/accept-answer$/);
    if (acceptMatch && req.method === 'POST') {
      const qId = acceptMatch[1];
      const { title, sopSteps } = body;
      const targetQ = currentDb.questions.find(q => q.id === qId);
      if (targetQ) {
        targetQ.status = 'Solved';
      }

      const nextKbId = `kb-${currentDb.knowledge_articles.length + 1}`;
      const newArticle = {
        id: nextKbId,
        sourceQuestionId: qId,
        title: title || (targetQ ? targetQ.title : 'Verified SOP'),
        category: targetQ?.aiCategory || 'GST & Tax',
        subtitle: `Verified solution extracted from #${qId} by Community Intake Agent`,
        sopSteps: sopSteps || [
          'Open KhataCopilot Settings → Preferences.',
          'Verify toggle settings and re-sync offline cache.',
          'Confirm resolution on pos register.'
        ],
        iconCode: 61858,
        colorCode: 366249,
        bgCode: 15531493,
        viewCount: 1,
        createdAt: new Date().toISOString()
      };

      currentDb.knowledge_articles.unshift(newArticle);
      saveDb();

      const activeUser = currentDb.users.find(u => u.id === currentDb.active_session?.userId) || currentDb.users[0];
      recordAudit('ACCEPT_ANSWER_PROMOTE_KNOWLEDGE', 'KNOWLEDGE_ARTICLE', nextKbId, `Promoted resolution of #${qId} to Knowledge Base`, activeUser);

      // Broadcast update to all platforms
      broadcastEvent('question_solved', { questionId: qId, article: newArticle });
      return jsonResponse({ success: true, article: newArticle });
    }

    // 6. KNOWLEDGE ARTICLES
    if (pathname === '/api/knowledge' && req.method === 'GET') {
      return jsonResponse(currentDb.knowledge_articles);
    }

    // 7. BUSINESS HEALTH
    if (pathname === '/api/health-stats' && req.method === 'GET') {
      return jsonResponse(currentDb.business_health);
    }

    // 8. AUDIT LOGS
    if (pathname === '/api/audit-logs' && req.method === 'GET') {
      return jsonResponse(currentDb.audit_logs);
    }

    // 9. NOTIFICATIONS
    if (pathname === '/api/notifications' && req.method === 'GET') {
      return jsonResponse(currentDb.notifications);
    }

    // 404 Fallback
    return jsonResponse({ error: 'Endpoint not found', path: pathname }, 404);
  });
});

server.listen(PORT, () => {
  console.log(`[KhataCopilot NetworkOS] Unified Server running on http://localhost:${PORT}`);
  console.log(`[KhataCopilot NetworkOS] Realtime SSE stream available at http://localhost:${PORT}/realtime`);
});
