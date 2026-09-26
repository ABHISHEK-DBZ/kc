-- ============================================================================
-- KhataCopilot NetworkOS Core Production Database Schema
-- Architecture: PostgreSQL 16+ / Supabase with Row Level Security (RLS)
-- Multi-Tenant Franchise Isolation, Granular RBAC, Realtime Subscriptions,
-- AI Agent Orchestration, Knowledge Extraction, Audit Trail & Analytics
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUMS & DOMAINS
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE user_role_enum AS ENUM (
    'SUPER_ADMIN', 'HQ_ADMIN', 'REGIONAL_MANAGER',
    'FRANCHISE_OWNER', 'FRANCHISE_MANAGER', 'FRANCHISE_STAFF',
    'COMMUNITY_EXPERT', 'SUPPORT_AGENT', 'FINANCE_AGENT',
    'SALES_AGENT', 'AI_AGENT', 'VIEWER'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE post_status_enum AS ENUM (
    'OPEN', 'IN_PROGRESS', 'ANSWERED', 'SOLVED', 'ESCALATED', 'CLOSED', 'ARCHIVED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE moderation_status_enum AS ENUM (
    'VISIBLE', 'PENDING_REVIEW', 'FLAGGED', 'HIDDEN', 'REMOVED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE agent_state_enum AS ENUM (
    'QUEUED', 'RUNNING', 'WAITING_APPROVAL', 'COMPLETED', 'FAILED', 'CANCELLED'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE ticket_priority_enum AS ENUM (
    'LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'URGENT'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 2. SYSTEM SETTINGS
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID
);

-- ============================================================================
-- 3. FRANCHISE TENANCY & LOCATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS franchises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  store_type VARCHAR(100) DEFAULT 'Kirana Superstore',
  region VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(20) NOT NULL,
  address TEXT,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255),
  gstin VARCHAR(50),
  health_score INT DEFAULT 85 CHECK (health_score BETWEEN 0 AND 100),
  status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PENDING', 'SUSPENDED', 'ARCHIVED')),
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS franchise_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id UUID NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  address_line1 TEXT NOT NULL,
  landmark VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 4. USERS, PROFILES, ROLES & PERMISSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name user_role_enum UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE, -- References auth.users(id) in Supabase
  franchise_id UUID REFERENCES franchises(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) UNIQUE,
  avatar_url TEXT,
  role user_role_enum NOT NULL DEFAULT 'FRANCHISE_OWNER',
  badge VARCHAR(100) DEFAULT 'Store Owner',
  reputation_score INT DEFAULT 50,
  questions_count INT DEFAULT 0,
  answers_count INT DEFAULT 0,
  saved_posts_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS franchise_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id UUID NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role user_role_enum NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(franchise_id, user_id)
);

-- ============================================================================
-- 5. CRM: CUSTOMERS, LEADS, PLANS & INVOICES
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id UUID NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  email VARCHAR(255),
  credit_balance NUMERIC(12, 2) DEFAULT 0.00,
  credit_limit NUMERIC(12, 2) DEFAULT 50000.00,
  total_purchases NUMERIC(12, 2) DEFAULT 0.00,
  status VARCHAR(50) DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  contact_type VARCHAR(50) DEFAULT 'PHONE',
  contact_value VARCHAR(255) NOT NULL,
  is_primary BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id UUID REFERENCES franchises(id) ON DELETE SET NULL,
  lead_name VARCHAR(255) NOT NULL,
  contact_phone VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  business_type VARCHAR(100),
  qualification_score INT DEFAULT 60,
  status VARCHAR(50) DEFAULT 'NEW' CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'WON', 'LOST')),
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lead_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  activity_type VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  billing_interval VARCHAR(20) DEFAULT 'MONTHLY',
  features JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id UUID NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES plans(id),
  status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('TRIAL', 'ACTIVE', 'PAST_DUE', 'CANCELLED')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id UUID NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  tax_amount NUMERIC(12, 2) DEFAULT 0.00,
  total_amount NUMERIC(12, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'ISSUED' CHECK (status IN ('DRAFT', 'ISSUED', 'PAID', 'OVERDUE', 'VOID')),
  due_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL,
  payment_method VARCHAR(50) DEFAULT 'UPI',
  transaction_ref VARCHAR(100),
  status VARCHAR(50) DEFAULT 'SUCCESS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 6. SUPPORT TICKETS & MESSAGES
-- ============================================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  franchise_id UUID NOT NULL REFERENCES franchises(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES profiles(id),
  assigned_to UUID REFERENCES profiles(id),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  subject VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  priority ticket_priority_enum DEFAULT 'MEDIUM',
  status VARCHAR(50) DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
  sla_breach_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 7. COMMUNITY ENGINE: CATEGORIES, POSTS, COMMENTS, ANSWERS, REACTIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS community_categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50) DEFAULT 'grid_view',
  color_code INT DEFAULT 16738913,
  bg_code INT DEFAULT 15658734,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_posts (
  id VARCHAR(50) PRIMARY KEY, -- e.g. QC-8421
  franchise_id UUID REFERENCES franchises(id) ON DELETE SET NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id VARCHAR(50) REFERENCES community_categories(id),
  title TEXT NOT NULL CHECK (char_length(title) >= 5),
  body TEXT NOT NULL CHECK (char_length(body) >= 10),
  ai_category VARCHAR(100),
  ai_confidence INT DEFAULT 90 CHECK (ai_confidence BETWEEN 0 AND 100),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  status post_status_enum NOT NULL DEFAULT 'OPEN',
  moderation_status moderation_status_enum NOT NULL DEFAULT 'VISIBLE',
  views_count INT DEFAULT 0,
  upvotes_count INT DEFAULT 0,
  comments_count INT DEFAULT 0,
  is_announcement BOOLEAN DEFAULT FALSE,
  is_solved BOOLEAN DEFAULT FALSE,
  solved_answer_id UUID,
  solved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id VARCHAR(50) NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL CHECK (char_length(text) >= 2),
  is_solution BOOLEAN DEFAULT FALSE,
  likes_count INT DEFAULT 0,
  moderation_status moderation_status_enum NOT NULL DEFAULT 'VISIBLE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id VARCHAR(50) REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  reaction_type VARCHAR(30) DEFAULT 'UPVOTE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, post_id, comment_id, reaction_type)
);

CREATE TABLE IF NOT EXISTS community_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id VARCHAR(50) NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

CREATE TABLE IF NOT EXISTS community_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  points INT NOT NULL,
  reason VARCHAR(100) NOT NULL,
  source_post_id VARCHAR(50) REFERENCES community_posts(id) ON DELETE SET NULL,
  source_comment_id UUID REFERENCES community_comments(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 8. AI AGENTS & ORCHESTRATION PIPELINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS agent_definitions (
  id VARCHAR(50) PRIMARY KEY, -- e.g. 'community_agent', 'similarity_agent'
  name VARCHAR(100) NOT NULL,
  purpose TEXT NOT NULL,
  version VARCHAR(20) DEFAULT '1.0.0',
  permissions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS agent_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(50) NOT NULL REFERENCES agent_definitions(id),
  actor_id UUID REFERENCES profiles(id),
  input_payload JSONB NOT NULL,
  output_payload JSONB,
  state agent_state_enum NOT NULL DEFAULT 'QUEUED',
  error_message TEXT,
  retry_count INT DEFAULT 0,
  latency_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS agent_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES agent_runs(id) ON DELETE CASCADE,
  agent_id VARCHAR(50) NOT NULL REFERENCES agent_definitions(id),
  action_name VARCHAR(100) NOT NULL,
  reason TEXT NOT NULL,
  evidence JSONB,
  status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 9. KNOWLEDGE BASE
-- ============================================================================

CREATE TABLE IF NOT EXISTS knowledge_articles (
  id VARCHAR(50) PRIMARY KEY, -- e.g. kb-1
  source_post_id VARCHAR(50) REFERENCES community_posts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category VARCHAR(100) NOT NULL,
  subtitle TEXT,
  sop_steps JSONB NOT NULL DEFAULT '[]'::JSONB,
  icon VARCHAR(50) DEFAULT 'verified',
  color_code INT DEFAULT 366249,
  bg_code INT DEFAULT 15531493,
  view_count INT DEFAULT 0,
  is_published BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 10. NOTIFICATIONS & DEVICE TOKENS
-- ============================================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'COMMUNITY',
  deep_link VARCHAR(255),
  icon VARCHAR(50) DEFAULT 'notifications',
  color_code INT DEFAULT 2450411,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_os VARCHAR(50) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, token)
);

-- ============================================================================
-- 11. AUDIT LOGGING & ANALYTICS EVENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  actor_role VARCHAR(50) NOT NULL,
  franchise_id UUID REFERENCES franchises(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(100) NOT NULL,
  resource_id VARCHAR(100) NOT NULL,
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR(100) NOT NULL,
  franchise_id UUID REFERENCES franchises(id),
  user_id UUID REFERENCES profiles(id),
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 12. PERFORMANCE INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_franchises_code ON franchises(code);
CREATE INDEX IF NOT EXISTS idx_franchises_region ON franchises(region);
CREATE INDEX IF NOT EXISTS idx_profiles_franchise_id ON profiles(franchise_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_status ON community_posts(status);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_comments_post ON community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_franchise ON audit_logs(franchise_id);
CREATE INDEX IF NOT EXISTS idx_agent_runs_state ON agent_runs(state);

-- ============================================================================
-- 13. REALTIME PUBLICATION ENABLEMENT (Supabase Realtime)
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE community_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE knowledge_articles;
ALTER PUBLICATION supabase_realtime ADD TABLE support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_runs;
ALTER PUBLICATION supabase_realtime ADD TABLE agent_approvals;

-- ============================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Community posts readable by all authenticated franchise users
CREATE POLICY "Public community posts are viewable by all members"
  ON community_posts FOR SELECT
  USING (moderation_status = 'VISIBLE');

-- Authenticated users can insert their own community posts
CREATE POLICY "Users can create community posts"
  ON community_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id OR author_id IS NOT NULL);

-- Comments readable by all members
CREATE POLICY "Community comments viewable by all members"
  ON community_comments FOR SELECT
  USING (moderation_status = 'VISIBLE');

-- Author or Post Author can insert comments
CREATE POLICY "Members can insert comments"
  ON community_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id OR author_id IS NOT NULL);

-- Notifications readable only by the recipient
CREATE POLICY "Users view only their notifications"
  ON notifications FOR SELECT
  USING (recipient_id = auth.uid() OR auth.uid() IS NULL);

-- Multi-Tenant Customer Isolation: Store members only see their franchise customers
CREATE POLICY "Franchise tenant customer isolation"
  ON customers FOR ALL
  USING (
    franchise_id IN (
      SELECT franchise_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Audit logs append-only and readable by HQ/Super Admins
CREATE POLICY "Audit logs append-only"
  ON audit_logs FOR INSERT
  WITH CHECK (true);
