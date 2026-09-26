import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticateToken, AuthRequest, resolveUserScope } from '../middleware/auth.js';

const router = Router();

// GET /api/reports/gst-draft - Real consolidated DRAFT GST calculation
router.get('/gst-draft', authenticateToken, (req: AuthRequest, res) => {
  try {
    const scope = resolveUserScope(req.user!);
    let shopWhere = '1=1';
    let params: any[] = [];

    if (!scope.isGlobal) {
      if (!scope.allowedShopIds || scope.allowedShopIds.length === 0) {
        res.json({
          disclaimer: 'DRAFT / DEMO — requires verification before filing. Never claim official filing has occurred.',
          items: [],
          totals: { totalTaxable: 0, totalCGST: 0, totalSGST: 0, totalIGST: 0, totalTax: 0 }
        });
        return;
      }
      const placeholders = scope.allowedShopIds.map(() => '?').join(',');
      shopWhere = `s.id IN (${placeholders})`;
      params = scope.allowedShopIds;
    }

    // Compute monthly taxable turnover from daily sales
    const rows = db.prepare(`
      SELECT 
        s.id as shop_id,
        s.name as shop_name,
        s.region,
        COALESCE(SUM(d.revenue), 0) as total_turnover
      FROM shops s
      LEFT JOIN daily_sales d ON s.id = d.shop_id
      WHERE ${shopWhere}
      GROUP BY s.id
    `).all(...params) as any[];

    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalTax = 0;

    const items = rows.map((r, idx) => {
      // 70% taxable, 30% exempt staples (milk, pulses)
      const taxableTurnover = Math.round(r.total_turnover * 0.70);
      const exemptTurnover = r.total_turnover - taxableTurnover;

      // Intra-state standard 9% CGST + 9% SGST (18% blended GST slab)
      const isInterState = r.region === 'North';
      const cgst = isInterState ? 0 : Math.round(taxableTurnover * 0.09);
      const sgst = isInterState ? 0 : Math.round(taxableTurnover * 0.09);
      const igst = isInterState ? Math.round(taxableTurnover * 0.18) : 0;
      const rowTax = cgst + sgst + igst;

      totalTaxable += taxableTurnover;
      totalCGST += cgst;
      totalSGST += sgst;
      totalIGST += igst;
      totalTax += rowTax;

      return {
        shop_id: r.shop_id,
        shop_name: r.shop_name,
        gstin: `27AABCU${9000 + idx}P1Z${idx % 9}`,
        taxable_turnover: taxableTurnover,
        exempt_turnover: exemptTurnover,
        cgst,
        sgst,
        igst,
        total_tax: rowTax,
        b2b_invoices_count: Math.round(r.total_turnover / 4500),
        b2c_invoices_count: Math.round(r.total_turnover / 380)
      };
    });

    res.json({
      disclaimer: 'DRAFT / DEMO — requires verification before filing. Never claim official filing has occurred.',
      items,
      totals: {
        totalTaxable,
        totalCGST,
        totalSGST,
        totalIGST,
        totalTax
      }
    });
  } catch (err: any) {
    console.error('[GST Report Error]', err);
    res.status(500).json({ error: 'Failed to generate GST report' });
  }
});

// GET /api/reports/export - Generates real CSV export
router.get('/export', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { type = 'sales' } = req.query;
    const scope = resolveUserScope(req.user!);

    let shopWhere = '1=1';
    let params: any[] = [];
    if (!scope.isGlobal) {
      if (!scope.allowedShopIds || scope.allowedShopIds.length === 0) {
        res.setHeader('Content-Type', 'text/csv');
        res.send('No records authorized');
        return;
      }
      const placeholders = scope.allowedShopIds.map(() => '?').join(',');
      shopWhere = `shop_id IN (${placeholders})`;
      params = scope.allowedShopIds;
    }

    let csvContent = '';
    let filename = `KhataCopilot_${type}_Report_${Date.now()}.csv`;

    if (type === 'sales') {
      const rows = db.prepare(`
        SELECT d.date, s.name as shop_name, d.revenue, d.profit, d.transaction_count, d.cash_sales, d.digital_sales, d.cash_variance
        FROM daily_sales d
        JOIN shops s ON d.shop_id = s.id
        WHERE ${shopWhere.replace(/shop_id/g, 'd.shop_id')}
        ORDER BY d.date DESC LIMIT 1000
      `).all(...params) as any[];

      csvContent = 'Date,Shop Name,Revenue,Profit,Transactions,Cash Sales,Digital Sales,Cash Variance\n' +
        rows.map(r => `"${r.date}","${r.shop_name}",${r.revenue},${r.profit},${r.transaction_count},${r.cash_sales},${r.digital_sales},${r.cash_variance}`).join('\n');
    } else if (type === 'inventory') {
      const rows = db.prepare(`
        SELECT s.name as shop_name, i.item_name, i.category, i.current_stock, i.reorder_threshold, i.sales_velocity, i.unit_price, i.supplier, i.estimated_stockout_days
        FROM inventory_items i
        JOIN shops s ON i.shop_id = s.id
        WHERE ${shopWhere.replace(/shop_id/g, 'i.shop_id')}
        ORDER BY i.estimated_stockout_days ASC
      `).all(...params) as any[];

      csvContent = 'Shop Name,Item Name,Category,Current Stock,Reorder Threshold,Daily Velocity,Unit Price,Supplier,Days Runway\n' +
        rows.map(r => `"${r.shop_name}","${r.item_name}","${r.category}",${r.current_stock},${r.reorder_threshold},${r.sales_velocity},${r.unit_price},"${r.supplier}",${r.estimated_stockout_days}`).join('\n');
    } else if (type === 'udhaar') {
      const rows = db.prepare(`
        SELECT s.name as shop_name, u.customer_name, u.amount, u.days_outstanding, u.risk_level, u.phone
        FROM udhaar_records u
        JOIN shops s ON u.shop_id = s.id
        WHERE ${shopWhere.replace(/shop_id/g, 'u.shop_id')}
        ORDER BY u.days_outstanding DESC
      `).all(...params) as any[];

      csvContent = 'Shop Name,Customer Name,Credit Amount,Days Overdue,Risk Level,Contact\n' +
        rows.map(r => `"${r.shop_name}","${r.customer_name}",${r.amount},${r.days_outstanding},"${r.risk_level}","${r.phone || ''}"`).join('\n');
    } else {
      csvContent = 'No data available for selected report type';
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);
  } catch (err: any) {
    console.error('[Export Error]', err);
    res.status(500).send('Export failed');
  }
});

export default router;
