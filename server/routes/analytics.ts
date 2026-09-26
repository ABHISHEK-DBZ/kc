import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthRequest, resolveUserScope } from '../middleware/auth.js';

const router = Router();

// GET /api/analytics/overview - Network overview metrics strictly scoped by role
router.get('/overview', authenticateToken, (req: AuthRequest, res) => {
  try {
    const scope = resolveUserScope(req.user!);
    let shopWhere = '1=1';
    let params: any[] = [];

    if (!scope.isGlobal) {
      if (!scope.allowedShopIds || scope.allowedShopIds.length === 0) {
        res.json({
          totalRevenue: 0,
          totalProfit: 0,
          profitMargin: 0,
          totalUdhaar: 0,
          netCashVariance: 0,
          totalShops: 0,
          atRiskShops: 0,
          watchShops: 0,
          healthyShops: 0,
          stockAlertCount: 0,
          avgHealthScore: 0
        });
        return;
      }
      const placeholders = scope.allowedShopIds.map(() => '?').join(',');
      shopWhere = `id IN (${placeholders})`;
      params = scope.allowedShopIds;
    }

    // Aggregates directly from authorized shops
    const agg = db.prepare(`
      SELECT 
        COUNT(*) as totalShops,
        COALESCE(SUM(daily_revenue), 0) as totalRevenue,
        COALESCE(SUM(daily_profit), 0) as totalProfit,
        COALESCE(SUM(udhaar_outstanding), 0) as totalUdhaar,
        COALESCE(SUM(cash_variance_today), 0) as netCashVariance,
        COALESCE(SUM(stock_alert_count), 0) as stockAlertCount,
        COALESCE(AVG(health_score), 0) as avgHealthScore,
        SUM(CASE WHEN status = 'At-Risk' THEN 1 ELSE 0 END) as atRiskShops,
        SUM(CASE WHEN status = 'Watch' THEN 1 ELSE 0 END) as watchShops,
        SUM(CASE WHEN status = 'Healthy' THEN 1 ELSE 0 END) as healthyShops
      FROM shops
      WHERE ${shopWhere}
    `).get(...params) as any;

    const profitMargin = agg.totalRevenue > 0 ? (agg.totalProfit / agg.totalRevenue) * 100 : 0;

    res.json({
      totalRevenue: agg.totalRevenue,
      totalProfit: agg.totalProfit,
      profitMargin: Number(profitMargin.toFixed(1)),
      totalUdhaar: agg.totalUdhaar,
      netCashVariance: agg.netCashVariance,
      totalShops: agg.totalShops,
      atRiskShops: agg.atRiskShops,
      watchShops: agg.watchShops,
      healthyShops: agg.healthyShops,
      stockAlertCount: agg.stockAlertCount,
      avgHealthScore: Math.round(agg.avgHealthScore)
    });
  } catch (err: any) {
    console.error('[Analytics Overview Error]', err);
    res.status(500).json({ error: 'Failed to compute network overview analytics' });
  }
});

// GET /api/analytics/sales-history - Scoped 30-day historical trend
router.get('/sales-history', authenticateToken, (req: AuthRequest, res) => {
  try {
    const scope = resolveUserScope(req.user!);
    let shopWhere = '1=1';
    let params: any[] = [];

    if (!scope.isGlobal) {
      if (!scope.allowedShopIds || scope.allowedShopIds.length === 0) {
        res.json([]);
        return;
      }
      const placeholders = scope.allowedShopIds.map(() => '?').join(',');
      shopWhere = `shop_id IN (${placeholders})`;
      params = scope.allowedShopIds;
    }

    const history = db.prepare(`
      SELECT 
        date,
        SUM(revenue) as revenue,
        SUM(profit) as profit,
        SUM(transaction_count) as transaction_count,
        SUM(cash_sales) as cash_sales,
        SUM(digital_sales) as digital_sales,
        SUM(cash_variance) as cash_variance
      FROM daily_sales
      WHERE ${shopWhere}
      GROUP BY date
      ORDER BY date ASC
    `).all(...params);

    res.json(history);
  } catch (err: any) {
    console.error('[Sales History Error]', err);
    res.status(500).json({ error: 'Failed to fetch sales history' });
  }
});

export default router;
