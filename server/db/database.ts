import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_DIR = path.resolve(__dirname, '../../data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'khatacopilot.db');

export const db = new Database(DB_PATH, { verbose: process.env.NODE_ENV === 'test' ? console.log : undefined });

// Performance Pragmas
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
export function initDatabase() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schemaSql);

  // Non-destructive migrations for inventory intelligence columns
  const migrations = [
    "ALTER TABLE inventory_items ADD COLUMN sales_7d REAL DEFAULT 0",
    "ALTER TABLE inventory_items ADD COLUMN sales_14d REAL DEFAULT 0",
    "ALTER TABLE inventory_items ADD COLUMN sales_30d REAL DEFAULT 0",
    "ALTER TABLE inventory_items ADD COLUMN sales_trend_pct REAL DEFAULT 0",
    "ALTER TABLE inventory_items ADD COLUMN lead_time_days INTEGER DEFAULT 4",
    "ALTER TABLE inventory_items ADD COLUMN safety_stock REAL DEFAULT 15",
    "ALTER TABLE inventory_items ADD COLUMN min_order_qty REAL DEFAULT 12",
    "ALTER TABLE purchase_orders ADD COLUMN recommendation_id TEXT"
  ];

  for (const sql of migrations) {
    try {
      db.exec(sql);
    } catch {
      // Column already exists
    }
  }

  console.log(`[Database] Initialized and verified at: ${DB_PATH}`);
}

export default db;
