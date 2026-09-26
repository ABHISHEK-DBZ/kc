export type HealthStatus = 'Healthy' | 'Watch' | 'At-Risk';

export type UserRole = 
  | 'HQ_OWNER' 
  | 'AREA_MANAGER'
  | 'REGIONAL_MANAGER' 
  | 'STORE_MANAGER' 
  | 'HQ_IT' 
  | 'FRANCHISE_OWNER';

export type Region = 'All' | 'West' | 'North' | 'South';

export type DateRange = '7d' | '30d' | 'this_month' | 'custom';

export type AgentId = 
  | 'sales' 
  | 'inventory' 
  | 'udhaar-risk' 
  | 'revenue-anomaly' 
  | 'cash-risk' 
  | 'shop-health' 
  | 'retention'
  | 'support';

export type NavigationTab = 
  | 'overview' 
  | 'shops' 
  | 'customers' 
  | 'sales' 
  | 'udhaar' 
  | 'inventory' 
  | 'purchase-orders'
  | 'staff' 
  | 'reports' 
  | 'ai-insights' 
  | 'community'
  | 'agent-sales'
  | 'agent-inventory'
  | 'agent-udhaar-risk'
  | 'agent-revenue-anomaly'
  | 'agent-cash-risk'
  | 'agent-shop-health'
  | 'agent-retention'
  | 'agent-support'
  | 'alerts' 
  | 'settings';

export interface PurchaseOrder {
  id: string; // e.g. 'PO-2026-081'
  taskId?: string; // associated AgentTask id
  shop_id: string;
  shop_name: string;
  product_name: string;
  sku_id: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_amount: number;
  supplier: string;
  reason: string;
  current_stock: number;
  sales_velocity: number;
  days_remaining: number;
  created_by: string;
  status: 'Draft' | 'Awaiting Approval' | 'Approved' | 'Rejected' | 'Completed';
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
}

export * from './community';

export interface AgentTask {
  id: string;
  agentId: AgentId;
  shop_id: string;
  shop_name: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Awaiting Approval' | 'In Progress' | 'Completed';
  finding: string;
  recommended_action: string;
  created_at: string;
  type?: string;
}

export interface AgentRun {
  id: string;
  agentId: AgentId;
  started_at: string;
  completed_at: string;
  duration_ms: number;
  shops_scanned: number;
  records_scanned: number;
  critical_findings: number;
  warnings: number;
  tasks_generated: number;
  status: 'Completed' | 'Running' | 'Failed';
  inputs: string[];
  rules_applied: string[];
  calculations_summary: string;
}

export interface AgentFinding {
  id: string;
  agentId: AgentId;
  shop_id: string;
  shop_name: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  metric_label: string;
  metric_value: string;
  baseline: string;
  deviation: string;
  calculation: string;
  evidence_records?: (string | number)[][];
  evidence_headers?: string[];
  recommended_action: string;
  status: 'active' | 'investigating' | 'resolved';
}

export interface AgentSettings {
  [key: string]: any;
}

export interface Shop {
  id: string;
  name: string;
  location: string;
  city: string;
  region: 'West' | 'North' | 'South';
  owner_contact: string;
  manager_name: string;
  status: HealthStatus;
  status_reason: string;
  health_score: number; // 0 - 100 calculated from real operational metrics
  health_reasons: string[];
  store_size_sqft: number;
  daily_revenue: number;
  monthly_revenue: number;
  daily_profit: number;
  monthly_profit: number;
  profit_margin_pct: number;
  udhaar_outstanding: number;
  stock_alert_count: number;
  cash_variance_today: number; // Discrepancy between POS cash recorded & register deposit
  cash_expected_today: number;
  cash_actual_today: number;
  active_cashiers_count: number;
  last_active: string;
}

export interface DailySales {
  shop_id: string;
  date: string; // YYYY-MM-DD
  revenue: number;
  profit: number;
  transaction_count: number;
  cash_sales: number;
  digital_sales: number;
  cash_expected: number;
  cash_actual: number;
  cash_variance: number;
}

export interface UdhaarRecord {
  id: string;
  shop_id: string;
  customer_id: string;
  customer_name: string;
  amount: number;
  date_given: string;
  days_outstanding: number;
  phone: string;
  credit_limit: number;
  last_payment_date?: string;
  risk_category: '0-7d' | '8-30d' | '31-60d' | '60d+';
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface Customer {
  id: string;
  shop_id: string;
  shop_name: string;
  name: string;
  phone: string;
  total_udhaar: number;
  credit_limit: number;
  days_outstanding: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'active' | 'overdue' | 'blocked';
  last_transaction_date: string;
  repayment_score: number; // 0-100
}

export interface InventoryItem {
  id: string;
  shop_id: string;
  item_name: string;
  category: 'Staples & Grains' | 'Dairy & Fresh' | 'Edible Oils' | 'Snacks & Beverages' | 'Personal Care' | 'Spices & Condiments';
  current_stock: number;
  reorder_threshold: number;
  sales_velocity: number; // units sold per day
  unit_price: number;
  cost_price: number;
  unit: string;
  supplier: string;
  last_restock_date: string;
  estimated_stockout_days: number;
  estimated_stockout_date: string;
  suggested_reorder_qty: number;
}

export type RecommendationType = 
  | 'BUY_NOW' 
  | 'BUY_MORE' 
  | 'BUY_NORMAL' 
  | 'WAIT' 
  | 'DO_NOT_BUY' 
  | 'URGENT_REORDER' 
  | 'SLOW_MOVING' 
  | 'OVERSTOCK_RISK';

export type ProfitOpportunityLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'NEUTRAL';

export interface SmartRecommendation {
  id: string;
  product_id: string;
  product_name: string;
  shop_id: string;
  shop_name: string;
  category: string;
  sku_id: string;
  current_stock: number;
  sales_velocity: number;
  sales_7d: number;
  sales_14d: number;
  sales_30d: number;
  sales_trend_pct: number;
  stock_coverage_days: number;
  unit_price: number;
  cost_price: number;
  unit_profit: number;
  margin_pct: number;
  unit: string;
  supplier: string;
  recommendation_type: RecommendationType;
  suggested_order_qty: number;
  profit_opportunity: ProfitOpportunityLevel;
  lead_time_days: number;
  safety_stock: number;
  min_order_qty?: number;
  projected_demand: number;
  formula_breakdown?: {
    formula: string;
    leadTimeDays: number;
    cycleDays: number;
    dailySales: number;
    safetyStock: number;
    currentStock: number;
    projectedDemand: number;
    grossNeeded: number;
    multiplier: number;
    finalSuggestedQty: number;
  } | null;
  reason: string;
  confidence: number;
  signals?: {
    currentStock: number;
    sales7d: number;
    sales14d: number;
    sales30d: number;
    salesVelocity: number;
    salesTrendPct: number;
    stockCoverageDays: number;
    unitPrice: number;
    costPrice: number;
    unitProfit: number;
    marginPct: number;
    reorderThreshold?: number;
    leadTimeDays: number;
    safetyStock: number;
    minOrderQty: number;
    supplier: string;
    category: string;
  } | null;
  status: 'ACTIVE' | 'DISMISSED' | 'ORDERED';
  po_draft_id?: string | null;
  agent_run_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StaffActivity {
  id: string;
  shop_id: string;
  staff_name: string;
  role: string;
  action: string;
  timestamp: string; // e.g. "10 mins ago", "Today, 11:15 AM"
  category: 'billing' | 'voice_order' | 'udhaar' | 'inventory' | 'cash_reconciliation';
  amount?: number;
  metadata?: string;
}

export type AnomalyType = 'CASH_VARIANCE' | 'REVENUE_DROP' | 'UDHAAR_DEFAULT_RISK' | 'STOCKOUT_IMMINENT' | 'PROFIT_DROP';

export interface Anomaly {
  id: string;
  shop_id: string;
  shop_name: string;
  city: string;
  type: AnomalyType;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  reasoning: string;
  metric_value: string;
  baseline_value: string;
  metric_delta: string;
  timestamp: string;
  action_label: string;
}

export interface AlertItem {
  id: string;
  shop_id: string;
  shop_name: string;
  category: 'revenue' | 'profit' | 'udhaar' | 'inventory' | 'cash' | 'staff' | 'system';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  reason: string;
  supporting_data: string;
  recommended_action: string;
  status: 'active' | 'acknowledged' | 'resolved';
}

export interface AIQueryResponse {
  query: string;
  summary: string;
  reasoning: string;
  formula: string;
  agent_name: string;
  data_points: {
    label: string;
    value: string | number;
    subtext?: string;
    highlight?: boolean;
    status?: HealthStatus;
  }[];
  affected_shops: {
    shop_id: string;
    shop_name: string;
    metric_label: string;
    metric_value: string;
    action?: string;
    evidence?: string;
  }[];
  recommended_actions: string[];
  supporting_records?: {
    title: string;
    headers: string[];
    rows: (string | number)[][];
  };
}

export interface GSTReportItem {
  shop_id: string;
  shop_name: string;
  gstin: string;
  taxable_turnover: number;
  exempt_turnover: number;
  cgst: number;
  sgst: number;
  igst: number;
  total_tax: number;
  b2b_invoices_count: number;
  b2c_invoices_count: number;
}
