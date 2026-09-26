-- KhataCopilot HQ Normalized Enterprise Database Schema

PRAGMA foreign_keys = ON;

-- 1. Regions
CREATE TABLE IF NOT EXISTS regions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. Franchises
CREATE TABLE IF NOT EXISTS franchises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner_name TEXT NOT NULL,
    contact_phone TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('HQ_OWNER', 'HQ_IT', 'AREA_MANAGER', 'FRANCHISE_OWNER', 'STORE_MANAGER')),
    region_id TEXT REFERENCES regions(id),
    franchise_id TEXT REFERENCES franchises(id),
    shop_id TEXT, -- circular reference resolved later
    phone TEXT,
    avatar_initials TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 4. Shops
CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    city TEXT NOT NULL,
    region TEXT NOT NULL,
    region_id TEXT REFERENCES regions(id),
    franchise_id TEXT REFERENCES franchises(id),
    owner_contact TEXT,
    manager_name TEXT,
    status TEXT NOT NULL DEFAULT 'Healthy' CHECK(status IN ('Healthy', 'Watch', 'At-Risk')),
    status_reason TEXT,
    health_score REAL DEFAULT 85,
    health_reasons TEXT, -- JSON Array
    store_size_sqft REAL DEFAULT 1500,
    daily_revenue REAL DEFAULT 0,
    monthly_revenue REAL DEFAULT 0,
    daily_profit REAL DEFAULT 0,
    monthly_profit REAL DEFAULT 0,
    profit_margin_pct REAL DEFAULT 12.0,
    udhaar_outstanding REAL DEFAULT 0,
    stock_alert_count INTEGER DEFAULT 0,
    cash_variance_today REAL DEFAULT 0,
    cash_expected_today REAL DEFAULT 0,
    cash_actual_today REAL DEFAULT 0,
    active_cashiers_count INTEGER DEFAULT 2,
    last_active TEXT DEFAULT 'Just now',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 5. Daily Sales History
CREATE TABLE IF NOT EXISTS daily_sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    date TEXT NOT NULL,
    revenue REAL NOT NULL,
    profit REAL NOT NULL,
    transaction_count INTEGER NOT NULL,
    cash_sales REAL NOT NULL,
    digital_sales REAL NOT NULL,
    cash_expected REAL NOT NULL,
    cash_actual REAL NOT NULL,
    cash_variance REAL NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(shop_id, date)
);

-- 6. Customers Directory
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    total_udhaar REAL DEFAULT 0,
    credit_limit REAL DEFAULT 20000,
    days_outstanding INTEGER DEFAULT 0,
    risk_level TEXT DEFAULT 'Low' CHECK(risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'overdue', 'blocked')),
    last_transaction_date TEXT,
    repayment_score REAL DEFAULT 90,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 7. Udhaar (Credit) Records
CREATE TABLE IF NOT EXISTS udhaar_records (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    customer_id TEXT NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    amount REAL NOT NULL,
    date_given TEXT NOT NULL,
    days_outstanding INTEGER NOT NULL,
    phone TEXT,
    credit_limit REAL NOT NULL,
    last_payment_date TEXT,
    risk_category TEXT NOT NULL CHECK(risk_category IN ('0-7d', '8-30d', '31-60d', '60d+')),
    risk_level TEXT NOT NULL CHECK(risk_level IN ('Low', 'Medium', 'High', 'Critical')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 8. Inventory Items
CREATE TABLE IF NOT EXISTS inventory_items (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    current_stock REAL NOT NULL,
    reorder_threshold REAL NOT NULL,
    sales_velocity REAL NOT NULL,
    unit_price REAL NOT NULL,
    cost_price REAL NOT NULL,
    unit TEXT NOT NULL,
    supplier TEXT NOT NULL,
    last_restock_date TEXT,
    estimated_stockout_days REAL,
    estimated_stockout_date TEXT,
    suggested_reorder_qty REAL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 9. Staff Activities
CREATE TABLE IF NOT EXISTS staff_activities (
    id TEXT PRIMARY KEY,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    staff_name TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL,
    metadata TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 10. Agent Definitions
CREATE TABLE IF NOT EXISTS agent_definitions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    version TEXT NOT NULL DEFAULT '2.4',
    cadence TEXT NOT NULL,
    is_autonomous INTEGER DEFAULT 1,
    approval_required INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Active'
);

-- 11. Agent Runs
CREATE TABLE IF NOT EXISTS agent_runs (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES agent_definitions(id),
    trigger_type TEXT NOT NULL CHECK(trigger_type IN ('SCHEDULED', 'EVENT', 'MANUAL')),
    started_at TEXT NOT NULL,
    completed_at TEXT,
    duration_ms INTEGER DEFAULT 0,
    shops_scanned INTEGER DEFAULT 0,
    records_scanned INTEGER DEFAULT 0,
    critical_findings INTEGER DEFAULT 0,
    warnings INTEGER DEFAULT 0,
    tasks_generated INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Running' CHECK(status IN ('Running', 'Completed', 'Failed')),
    input_snapshot TEXT, -- JSON
    rules_applied TEXT, -- JSON
    calculations_summary TEXT,
    errors TEXT,
    scope TEXT,
    triggered_by TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 12. Agent Tasks
CREATE TABLE IF NOT EXISTS agent_tasks (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES agent_definitions(id),
    run_id TEXT REFERENCES agent_runs(id),
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    priority TEXT NOT NULL CHECK(priority IN ('High', 'Medium', 'Low')),
    status TEXT NOT NULL DEFAULT 'QUEUED' CHECK(status IN ('QUEUED', 'RUNNING', 'AWAITING_APPROVAL', 'COMPLETED', 'FAILED', 'CANCELLED')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    evidence TEXT,
    recommendation TEXT NOT NULL,
    action_type TEXT,
    action_payload TEXT,
    approval_required INTEGER DEFAULT 0,
    approved_by TEXT,
    approved_at TEXT,
    idempotency_key TEXT UNIQUE,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 13. Agent Findings
CREATE TABLE IF NOT EXISTS agent_findings (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL REFERENCES agent_definitions(id),
    run_id TEXT REFERENCES agent_runs(id),
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    title TEXT NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('critical', 'warning', 'info')),
    metric_label TEXT NOT NULL,
    metric_value TEXT NOT NULL,
    baseline TEXT NOT NULL,
    deviation TEXT NOT NULL,
    calculation TEXT NOT NULL,
    evidence_records TEXT, -- JSON array
    evidence_headers TEXT, -- JSON array
    recommended_action TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'investigating', 'resolved')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 14. Agent Actions
CREATE TABLE IF NOT EXISTS agent_actions (
    id TEXT PRIMARY KEY,
    task_id TEXT REFERENCES agent_tasks(id) ON DELETE CASCADE,
    agent_id TEXT NOT NULL,
    shop_id TEXT NOT NULL,
    action_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL' CHECK(status IN ('PENDING_APPROVAL', 'EXECUTED', 'REJECTED')),
    payload TEXT,
    executed_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 14b. Agent Events (Persistent Event Bus & Audit)
CREATE TABLE IF NOT EXISTS agent_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    shop_id TEXT REFERENCES shops(id) ON DELETE SET NULL,
    payload TEXT, -- JSON
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_agent_events_type ON agent_events(event_type);
CREATE INDEX IF NOT EXISTS idx_agent_events_created ON agent_events(created_at);

-- 14c. Agent Retry Queue (Autonomous Failure Recovery)
CREATE TABLE IF NOT EXISTS agent_retry_queue (
    id TEXT PRIMARY KEY,
    agent_id TEXT NOT NULL,
    run_id TEXT REFERENCES agent_runs(id),
    trigger_type TEXT NOT NULL,
    scope TEXT,
    triggered_by TEXT,
    attempt_count INTEGER DEFAULT 1,
    max_attempts INTEGER DEFAULT 3,
    last_error TEXT,
    next_retry_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'PROCESSING', 'RESOLVED', 'ABANDONED')),
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_retry_queue_status ON agent_retry_queue(status, next_retry_at);

-- 15. Purchase Orders
CREATE TABLE IF NOT EXISTS purchase_orders (
    id TEXT PRIMARY KEY,
    task_id TEXT,
    shop_id TEXT NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
    shop_name TEXT NOT NULL,
    product_name TEXT NOT NULL,
    sku_id TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    unit_price REAL NOT NULL,
    total_amount REAL NOT NULL,
    supplier TEXT NOT NULL,
    reason TEXT NOT NULL,
    current_stock REAL NOT NULL,
    sales_velocity REAL NOT NULL,
    days_remaining REAL NOT NULL,
    created_by TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Draft' CHECK(status IN ('Draft', 'Awaiting Approval', 'Approved', 'Rejected', 'Completed')),
    approved_by TEXT,
    approved_at TEXT,
    rejection_reason TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 16. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    target_role TEXT,
    shop_id TEXT REFERENCES shops(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('inventory', 'sales', 'udhaar', 'community', 'approval', 'health', 'system')),
    severity TEXT NOT NULL CHECK(severity IN ('critical', 'warning', 'info')),
    link TEXT,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 17. Audit Logs (Immutable enterprise audit trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    actor_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    role TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    resource_id TEXT,
    metadata TEXT, -- JSON
    ip_address TEXT DEFAULT '127.0.0.1',
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 18. Community Posts
CREATE TABLE IF NOT EXISTS community_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL,
    author_id TEXT NOT NULL REFERENCES users(id),
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    shop_id TEXT REFERENCES shops(id),
    shop_name TEXT,
    upvotes INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Open',
    is_pinned INTEGER DEFAULT 0,
    is_it_announcement INTEGER DEFAULT 0,
    tags TEXT, -- JSON array
    similar_issue_id TEXT,
    ai_classification TEXT, -- JSON
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 19. Community Replies
CREATE TABLE IF NOT EXISTS community_replies (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    author_id TEXT NOT NULL REFERENCES users(id),
    author_name TEXT NOT NULL,
    author_role TEXT NOT NULL,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    is_solution INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 20. Known Issues Directory
CREATE TABLE IF NOT EXISTS known_issues (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    affected_versions TEXT,
    fixed_version TEXT,
    status TEXT NOT NULL,
    workaround TEXT,
    root_cause TEXT,
    verified_by TEXT,
    verified_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 21. Reports and Report Jobs
CREATE TABLE IF NOT EXISTS report_jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    report_type TEXT NOT NULL,
    date_range TEXT NOT NULL,
    format TEXT NOT NULL CHECK(format IN ('csv', 'xlsx', 'json')),
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK(status IN ('PENDING', 'GENERATED', 'FAILED')),
    file_path TEXT,
    row_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT
);

-- High-performance database indexes
CREATE INDEX IF NOT EXISTS idx_shops_region ON shops(region);
CREATE INDEX IF NOT EXISTS idx_shops_franchise ON shops(franchise_id);
CREATE INDEX IF NOT EXISTS idx_sales_shop_date ON daily_sales(shop_id, date);
CREATE INDEX IF NOT EXISTS idx_customers_shop ON customers(shop_id);
CREATE INDEX IF NOT EXISTS idx_udhaar_shop ON udhaar_records(shop_id);
CREATE INDEX IF NOT EXISTS idx_udhaar_risk ON udhaar_records(risk_level);
CREATE INDEX IF NOT EXISTS idx_inventory_shop ON inventory_items(shop_id);
CREATE INDEX IF NOT EXISTS idx_inventory_stockout ON inventory_items(estimated_stockout_days);
CREATE INDEX IF NOT EXISTS idx_agent_runs_agent ON agent_runs(agent_id, status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_shop ON agent_tasks(shop_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author ON community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
