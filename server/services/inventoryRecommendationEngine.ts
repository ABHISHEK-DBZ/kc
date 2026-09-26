import { db } from '../db/database.js';
import { groqService } from './groqService.js';
import { realtimeHub } from './realtimeHub.js';

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
  recommendation_type: 'BUY_NOW' | 'BUY_MORE' | 'BUY_NORMAL' | 'WAIT' | 'DO_NOT_BUY' | 'URGENT_REORDER' | 'SLOW_MOVING' | 'OVERSTOCK_RISK';
  suggested_order_qty: number;
  profit_opportunity: 'HIGH' | 'MEDIUM' | 'LOW' | 'NEUTRAL';
  lead_time_days: number;
  safety_stock: number;
  projected_demand: number;
  formula_breakdown: string;
  reason: string;
  confidence: number;
  signals: string;
  status: 'ACTIVE' | 'DISMISSED' | 'ORDERED';
  po_draft_id?: string | null;
  agent_run_id?: string | null;
  created_at: string;
  updated_at: string;
}

export class InventoryRecommendationEngine {
  /**
   * Deterministic calculation of recommendation, suggested quantity, and profit opportunity.
   */
  public calculateRecommendation(item: any, shopName: string): Omit<SmartRecommendation, 'id' | 'created_at' | 'updated_at' | 'reason'> {
    const currentStock = Number(item.current_stock) || 0;
    const salesVelocity = Number(item.sales_velocity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    const costPrice = Number(item.cost_price) || 0;
    const unitProfit = Math.max(0, unitPrice - costPrice);
    const marginPct = unitPrice > 0 ? Number((((unitPrice - costPrice) / unitPrice) * 100).toFixed(1)) : 0;

    // Real or derived sales history signals
    const salesTrendPct = item.sales_trend_pct !== undefined && item.sales_trend_pct !== null
      ? Number(item.sales_trend_pct)
      : (salesVelocity > 6 ? 18.0 : (salesVelocity < 1.0 ? -32.0 : 4.0));

    const sales7d = item.sales_7d ? Number(item.sales_7d) : Math.round(salesVelocity * 7);
    const sales14d = item.sales_14d ? Number(item.sales_14d) : Math.round(salesVelocity * 14);
    const sales30d = item.sales_30d ? Number(item.sales_30d) : Math.round(salesVelocity * 30 * (1 - salesTrendPct / 100));

    const stockCoverageDays = salesVelocity > 0 ? Number((currentStock / salesVelocity).toFixed(2)) : 999;
    const leadTimeDays = Number(item.lead_time_days) || 4;
    const safetyStock = Number(item.safety_stock) || Math.max(10, Math.round(salesVelocity * 2.5));
    const minOrderQty = Number(item.min_order_qty) || 12;
    const cycleDays = 14; // Standard 2-week cycle

    // =========================================================================
    // Deterministic Recommendation Classification
    // =========================================================================
    let recommendationType: SmartRecommendation['recommendation_type'];

    if (stockCoverageDays <= leadTimeDays && salesVelocity >= 1.0) {
      // Stockout expected before or at standard lead time delivery
      recommendationType = 'URGENT_REORDER';
    } else if (stockCoverageDays < 7.0 && salesTrendPct >= 14.0 && marginPct >= 8.0) {
      // Rapid acceleration with under 1 week of stock
      recommendationType = 'BUY_MORE';
    } else if (salesTrendPct <= -25.0 || (stockCoverageDays >= 90.0 && salesTrendPct < 0)) {
      // Severe drop in demand or dead stock
      recommendationType = 'DO_NOT_BUY';
    } else if (salesVelocity < 0.6 || (stockCoverageDays >= 35.0 && salesTrendPct < 0)) {
      // Low movement with substantial inventory
      recommendationType = 'SLOW_MOVING';
    } else if (stockCoverageDays >= 50.0) {
      // Excessive stock with weak demand
      recommendationType = 'OVERSTOCK_RISK';
    } else if (currentStock <= (Number(item.reorder_threshold) || 20) && stockCoverageDays <= 8.0) {
      // Breached reorder threshold
      recommendationType = 'BUY_NOW';
    } else if (currentStock <= (Number(item.reorder_threshold) || 20) * 1.25 && stockCoverageDays <= 14.0) {
      // Approaching replenishment point
      recommendationType = 'BUY_NORMAL';
    } else {
      // Comfortable inventory coverage
      recommendationType = 'WAIT';
    }

    // =========================================================================
    // Transparent Suggested Order Quantity Calculation
    // Formula: max(min_order_qty, (Lead Time + Target Cycle) * Daily Sales + Safety Stock - Current Stock)
    // =========================================================================
    const projectedDemand = Math.round(salesVelocity * (leadTimeDays + cycleDays));
    const grossNeeded = projectedDemand + safetyStock - currentStock;

    let suggestedOrderQty = 0;
    if (['DO_NOT_BUY', 'OVERSTOCK_RISK', 'WAIT', 'SLOW_MOVING'].includes(recommendationType)) {
      suggestedOrderQty = 0;
    } else if (recommendationType === 'BUY_MORE') {
      // Accelerating demand gets a 20% demand growth buffer
      suggestedOrderQty = Math.max(minOrderQty, Math.round(grossNeeded * 1.2));
    } else {
      suggestedOrderQty = Math.max(minOrderQty, Math.max(0, Math.round(grossNeeded)));
    }

    // =========================================================================
    // Profit Opportunity Estimation (Non-guaranteed, trend-based)
    // =========================================================================
    let profitOpportunity: SmartRecommendation['profit_opportunity'];

    if ((marginPct >= 14.0 || unitProfit >= 15) && salesTrendPct >= 10.0 && stockCoverageDays <= 8.0) {
      profitOpportunity = 'HIGH';
    } else if (marginPct >= 10.0 && salesTrendPct >= -5.0 && stockCoverageDays <= 22.0) {
      profitOpportunity = 'MEDIUM';
    } else if (salesTrendPct < -15.0 || marginPct < 8.0 || stockCoverageDays >= 45.0) {
      profitOpportunity = 'LOW';
    } else {
      profitOpportunity = 'NEUTRAL';
    }

    const formulaBreakdown = JSON.stringify({
      formula: 'Suggested Order = max(Min Order, (Lead Time + Target Cycle) * Daily Sales + Safety Stock - Current Stock)',
      leadTimeDays,
      cycleDays,
      dailySales: salesVelocity,
      safetyStock,
      currentStock,
      projectedDemand,
      grossNeeded,
      multiplier: recommendationType === 'BUY_MORE' ? 1.2 : 1.0,
      finalSuggestedQty: suggestedOrderQty
    });

    const signals = JSON.stringify({
      currentStock,
      sales7d,
      sales14d,
      sales30d,
      salesVelocity,
      salesTrendPct,
      stockCoverageDays,
      unitPrice,
      costPrice,
      unitProfit,
      marginPct,
      reorderThreshold: item.reorder_threshold,
      leadTimeDays,
      safetyStock,
      minOrderQty,
      supplier: item.supplier,
      category: item.category
    });

    return {
      product_id: item.id,
      product_name: item.item_name,
      shop_id: item.shop_id,
      shop_name: shopName,
      category: item.category,
      sku_id: item.id,
      current_stock: currentStock,
      sales_velocity: salesVelocity,
      sales_7d: sales7d,
      sales_14d: sales14d,
      sales_30d: sales30d,
      sales_trend_pct: salesTrendPct,
      stock_coverage_days: stockCoverageDays,
      unit_price: unitPrice,
      cost_price: costPrice,
      unit_profit: unitProfit,
      margin_pct: marginPct,
      unit: item.unit || 'units',
      supplier: item.supplier || 'Standard Distributor',
      recommendation_type: recommendationType,
      suggested_order_qty: suggestedOrderQty,
      profit_opportunity: profitOpportunity,
      lead_time_days: leadTimeDays,
      safety_stock: safetyStock,
      projected_demand: projectedDemand,
      formula_breakdown: formulaBreakdown,
      confidence: 0.93,
      signals,
      status: 'ACTIVE',
      po_draft_id: null,
      agent_run_id: null
    };
  }

  /**
   * Evaluates all items in the inventory database, applies AI reasoning,
   * persists recommendations into SQLite, and broadcasts real-time SSE updates.
   */
  public async generateAndPersistRecommendations(agentRunId?: string, shopIdFilter?: string): Promise<SmartRecommendation[]> {
    let query = 'SELECT i.*, s.name as shop_name FROM inventory_items i JOIN shops s ON i.shop_id = s.id';
    const params: any[] = [];

    if (shopIdFilter) {
      query += ' WHERE i.shop_id = ?';
      params.push(shopIdFilter);
    }

    const items = db.prepare(query).all(...params) as any[];
    const recommendations: SmartRecommendation[] = [];

    // Verify agentRunId exists in agent_runs if provided, otherwise nullify
    let verifiedRunId: string | null = null;
    if (agentRunId) {
      try {
        const runExists = db.prepare('SELECT id FROM agent_runs WHERE id = ?').get(agentRunId);
        if (runExists) verifiedRunId = agentRunId;
      } catch {
        verifiedRunId = null;
      }
    }

    const upsertStmt = db.prepare(`
      INSERT INTO inventory_recommendations (
        id, product_id, product_name, shop_id, shop_name, category, sku_id,
        current_stock, sales_velocity, sales_7d, sales_14d, sales_30d, sales_trend_pct,
        stock_coverage_days, unit_price, cost_price, unit_profit, margin_pct, unit, supplier,
        recommendation_type, suggested_order_qty, profit_opportunity, lead_time_days,
        safety_stock, projected_demand, formula_breakdown, reason, confidence, signals,
        status, po_draft_id, agent_run_id, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, datetime('now'), datetime('now')
      )
      ON CONFLICT(shop_id, product_id) DO UPDATE SET
        product_name = excluded.product_name,
        shop_name = excluded.shop_name,
        category = excluded.category,
        current_stock = excluded.current_stock,
        sales_velocity = excluded.sales_velocity,
        sales_7d = excluded.sales_7d,
        sales_14d = excluded.sales_14d,
        sales_30d = excluded.sales_30d,
        sales_trend_pct = excluded.sales_trend_pct,
        stock_coverage_days = excluded.stock_coverage_days,
        unit_price = excluded.unit_price,
        cost_price = excluded.cost_price,
        unit_profit = excluded.unit_profit,
        margin_pct = excluded.margin_pct,
        recommendation_type = excluded.recommendation_type,
        suggested_order_qty = excluded.suggested_order_qty,
        profit_opportunity = excluded.profit_opportunity,
        formula_breakdown = excluded.formula_breakdown,
        reason = excluded.reason,
        confidence = excluded.confidence,
        signals = excluded.signals,
        agent_run_id = excluded.agent_run_id,
        updated_at = datetime('now')
      WHERE inventory_recommendations.status != 'ORDERED'
    `);

    for (const item of items) {
      const calc = this.calculateRecommendation(item, item.shop_name);

      // AI Explanation Layer (Natural language synthesis with deterministic fallback)
      const aiExplanation = await groqService.explainPurchaseRecommendation({
        productName: calc.product_name,
        shopName: calc.shop_name,
        currentStock: calc.current_stock,
        salesVelocity: calc.sales_velocity,
        salesTrendPct: calc.sales_trend_pct,
        stockCoverageDays: calc.stock_coverage_days,
        unitPrice: calc.unit_price,
        costPrice: calc.cost_price,
        unitProfit: calc.unit_profit,
        marginPct: calc.margin_pct,
        recommendationType: calc.recommendation_type,
        suggestedOrderQty: calc.suggested_order_qty,
        profitOpportunity: calc.profit_opportunity
      });

      const recId = `rec-${calc.shop_id}-${calc.product_id}`;

      upsertStmt.run(
        recId, calc.product_id, calc.product_name, calc.shop_id, calc.shop_name, calc.category, calc.sku_id,
        calc.current_stock, calc.sales_velocity, calc.sales_7d, calc.sales_14d, calc.sales_30d, calc.sales_trend_pct,
        calc.stock_coverage_days, calc.unit_price, calc.cost_price, calc.unit_profit, calc.margin_pct, calc.unit, calc.supplier,
        calc.recommendation_type, calc.suggested_order_qty, calc.profit_opportunity, calc.lead_time_days,
        calc.safety_stock, calc.projected_demand, calc.formula_breakdown, aiExplanation.reason, calc.confidence, calc.signals,
        'ACTIVE', null, verifiedRunId
      );

      const saved = db.prepare('SELECT * FROM inventory_recommendations WHERE id = ?').get(recId) as SmartRecommendation;
      recommendations.push(saved);
    }

    // Broadcast SSE update event
    realtimeHub.broadcast('INVENTORY_RECOMMENDATIONS_UPDATED', {
      count: recommendations.length,
      timestamp: new Date().toISOString()
    });

    return recommendations;
  }
}

export const inventoryRecommendationEngine = new InventoryRecommendationEngine();
