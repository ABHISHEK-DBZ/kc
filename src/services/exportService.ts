import { Shop, UdhaarRecord, GSTReportItem, InventoryItem, DailySales } from '../types';

export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportShopsSummary(shops: Shop[], format: 'csv' | 'excel' = 'csv') {
  const headers = ['Shop ID', 'Shop Name', 'Location', 'City', 'Region', 'Status', 'Health Score', 'Daily Revenue (INR)', 'Monthly Revenue (INR)', 'Daily Profit (INR)', 'Margin (%)', 'Udhaar Outstanding (INR)', 'Stock Alerts', 'Cash Variance (INR)', 'Manager', 'Contact'];

  const rows = shops.map((s) => [
    s.id,
    `"${s.name.replace(/"/g, '""')}"`,
    `"${s.location.replace(/"/g, '""')}"`,
    s.city,
    s.region,
    s.status,
    s.health_score,
    s.daily_revenue,
    s.monthly_revenue,
    s.daily_profit,
    s.profit_margin_pct,
    s.udhaar_outstanding,
    s.stock_alert_count,
    s.cash_variance_today,
    `"${s.manager_name}"`,
    `"${s.owner_contact}"`
  ]);

  const delimiter = format === 'excel' ? '\t' : ',';
  const fileExt = format === 'excel' ? 'xls' : 'csv';
  const mimeType = format === 'excel' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;';

  const content = [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`KhataCopilot_HQ_Shops_${dateStr}.${fileExt}`, content, mimeType);
}

export function exportUdhaarAging(udhaarRecords: UdhaarRecord[], shopName?: string, format: 'csv' | 'excel' = 'csv') {
  const headers = ['Record ID', 'Shop ID', 'Customer Name', 'Outstanding (INR)', 'Days Overdue', 'Aging Bracket', 'Risk Level', 'Phone', 'Credit Limit (INR)', 'Date Given'];

  const rows = udhaarRecords.map((u) => [
    u.id,
    u.shop_id,
    `"${u.customer_name.replace(/"/g, '""')}"`,
    u.amount,
    u.days_outstanding,
    u.risk_category,
    u.risk_level,
    `"${u.phone}"`,
    u.credit_limit,
    u.date_given
  ]);

  const delimiter = format === 'excel' ? '\t' : ',';
  const fileExt = format === 'excel' ? 'xls' : 'csv';
  const mimeType = format === 'excel' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;';

  const content = [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join('\n');
  const prefix = shopName ? shopName.replace(/\s+/g, '_') : 'All_Branches';
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`KhataCopilot_Udhaar_Aging_${prefix}_${dateStr}.${fileExt}`, content, mimeType);
}

export function exportInventoryReport(inventoryItems: InventoryItem[], format: 'csv' | 'excel' = 'csv') {
  const headers = ['SKU ID', 'Shop ID', 'Item Name', 'Category', 'Current Stock', 'Threshold', 'Daily Sales Velocity', 'Runway (Days)', 'Estimated Stockout', 'Suggested PO Qty', 'Unit Price (INR)', 'Supplier'];

  const rows = inventoryItems.map((i) => [
    i.id,
    i.shop_id,
    `"${i.item_name.replace(/"/g, '""')}"`,
    i.category,
    `${i.current_stock} ${i.unit}`,
    `${i.reorder_threshold} ${i.unit}`,
    `${i.sales_velocity} ${i.unit}/day`,
    (i.current_stock / i.sales_velocity).toFixed(1),
    `"${i.estimated_stockout_date}"`,
    `${i.suggested_reorder_qty} ${i.unit}`,
    i.unit_price,
    `"${i.supplier}"`
  ]);

  const delimiter = format === 'excel' ? '\t' : ',';
  const fileExt = format === 'excel' ? 'xls' : 'csv';
  const mimeType = format === 'excel' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;';

  const content = [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`KhataCopilot_Inventory_Forecast_${dateStr}.${fileExt}`, content, mimeType);
}

export function exportGSTReport(gstItems: GSTReportItem[], format: 'csv' | 'excel' = 'csv') {
  const headers = ['Shop ID', 'Shop Name', 'GSTIN', 'Taxable Turnover (INR)', 'Exempt Turnover (INR)', 'CGST (INR)', 'SGST (INR)', 'IGST (INR)', 'Total Tax (INR)', 'B2B Count', 'B2C Count'];

  const rows = gstItems.map((g) => [
    g.shop_id,
    `"${g.shop_name.replace(/"/g, '""')}"`,
    g.gstin,
    g.taxable_turnover,
    g.exempt_turnover,
    g.cgst,
    g.sgst,
    g.igst,
    g.total_tax,
    g.b2b_invoices_count,
    g.b2c_invoices_count
  ]);

  const delimiter = format === 'excel' ? '\t' : ',';
  const fileExt = format === 'excel' ? 'xls' : 'csv';
  const mimeType = format === 'excel' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;';

  const content = [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`KhataCopilot_GSTR_Consolidated_${dateStr}.${fileExt}`, content, mimeType);
}

export function exportSalesReport(dailySales: DailySales[], shops: Shop[], format: 'csv' | 'excel' = 'csv') {
  const headers = ['Date', 'Shop Name', 'City', 'Revenue (INR)', 'Profit (INR)', 'Transactions', 'Cash Sales (INR)', 'UPI / Digital Sales (INR)', 'Cash Variance (INR)'];

  const rows = dailySales.map((s) => {
    const sh = shops.find((shop) => shop.id === s.shop_id);
    return [
      s.date,
      `"${sh?.name || s.shop_id}"`,
      sh?.city || '',
      s.revenue,
      s.profit,
      s.transaction_count,
      s.cash_sales,
      s.digital_sales,
      s.cash_variance
    ];
  });

  const delimiter = format === 'excel' ? '\t' : ',';
  const fileExt = format === 'excel' ? 'xls' : 'csv';
  const mimeType = format === 'excel' ? 'application/vnd.ms-excel;charset=utf-8;' : 'text/csv;charset=utf-8;';

  const content = [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join('\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(`KhataCopilot_Daily_Sales_${dateStr}.${fileExt}`, content, mimeType);
}

// Aliases for backwards compatibility
export const exportShopsSummaryCSV = (shops: Shop[]) => exportShopsSummary(shops, 'csv');
export const exportUdhaarAgingCSV = (udhaarRecords: UdhaarRecord[], shopName?: string) => exportUdhaarAging(udhaarRecords, shopName, 'csv');
export const exportGSTReportCSV = (gstItems: GSTReportItem[]) => exportGSTReport(gstItems, 'csv');
