import React, { useState, useMemo } from 'react';
import { Shop, DailySales, UdhaarRecord, InventoryItem } from '../types';
import { computeGSTConsolidation } from '../services/analyticsEngine';
import { 
  exportShopsSummary, 
  exportUdhaarAging, 
  exportInventoryReport, 
  exportGSTReport, 
  exportSalesReport 
} from '../services/exportService';
import { 
  FileSpreadsheet, 
  Download, 
  Filter, 
  Calendar, 
  Store, 
  IndianRupee, 
  CreditCard, 
  Package, 
  Check, 
  Layers
} from 'lucide-react';

interface ReportsViewProps {
  shops: Shop[];
  dailySales: DailySales[];
  udhaarRecords: UdhaarRecord[];
  inventoryItems: InventoryItem[];
}

type ReportType = 'gst' | 'sales' | 'udhaar' | 'inventory' | 'performance';

export const ReportsView: React.FC<ReportsViewProps> = ({
  shops,
  dailySales,
  udhaarRecords,
  inventoryItems
}) => {
  const [selectedReport, setSelectedReport] = useState<ReportType>('gst');
  const [selectedShopId, setSelectedShopId] = useState<string>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');

  const filteredShops = useMemo(() => {
    return shops.filter((s) => {
      const matchShop = selectedShopId === 'all' || s.id === selectedShopId;
      const matchRegion = selectedRegion === 'all' || s.region === selectedRegion;
      return matchShop && matchRegion;
    });
  }, [shops, selectedShopId, selectedRegion]);

  const filteredSales = useMemo(() => {
    const ids = new Set(filteredShops.map((s) => s.id));
    return dailySales.filter((s) => ids.has(s.shop_id));
  }, [dailySales, filteredShops]);

  const gstData = useMemo(() => {
    return computeGSTConsolidation(filteredShops, filteredSales);
  }, [filteredShops, filteredSales]);

  const handleExport = (format: 'csv' | 'excel') => {
    switch (selectedReport) {
      case 'gst':
        exportGSTReport(gstData.items, format);
        break;
      case 'sales':
        exportSalesReport(filteredSales, filteredShops, format);
        break;
      case 'udhaar':
        exportUdhaarAging(udhaarRecords, 'Filtered_Report', format);
        break;
      case 'inventory':
        exportInventoryReport(inventoryItems, format);
        break;
      case 'performance':
        exportShopsSummary(filteredShops, format);
        break;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Controls */}
      <div className="apple-glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
              CRM Financial & Compliance Reports
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Consolidated enterprise exports for taxation, credit ledgers, and branch performance.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => handleExport('csv')}
              className="apple-btn apple-btn-primary"
              style={{ fontSize: '12.5px', padding: '6px 14px' }}
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="apple-btn apple-btn-secondary"
              style={{ fontSize: '12.5px', padding: '6px 14px' }}
            >
              <Download size={13} />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Report Category Selector & Filters */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginTop: '18px',
          padding: '12px',
          background: 'rgba(118, 118, 128, 0.04)',
          borderRadius: 'var(--radius-md)'
        }}>
          {/* Report Pills */}
          <div className="apple-segmented-control">
            <button className={`apple-segment-item ${selectedReport === 'gst' ? 'active' : ''}`} onClick={() => setSelectedReport('gst')}>
              Consolidated GST (GSTR-1/3B)
            </button>
            <button className={`apple-segment-item ${selectedReport === 'sales' ? 'active' : ''}`} onClick={() => setSelectedReport('sales')}>
              Sales & Profits
            </button>
            <button className={`apple-segment-item ${selectedReport === 'udhaar' ? 'active' : ''}`} onClick={() => setSelectedReport('udhaar')}>
              Udhaar Credit Aging
            </button>
            <button className={`apple-segment-item ${selectedReport === 'inventory' ? 'active' : ''}`} onClick={() => setSelectedReport('inventory')}>
              Inventory Velocity
            </button>
            <button className={`apple-segment-item ${selectedReport === 'performance' ? 'active' : ''}`} onClick={() => setSelectedReport('performance')}>
              Shop Performance
            </button>
          </div>

          {/* Filter Dropdowns */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '12.5px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-card-solid)',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Region: All</option>
              <option value="West">West (MH)</option>
              <option value="South">South (KA)</option>
              <option value="North">North (NCR)</option>
            </select>

            <select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              style={{
                padding: '6px 12px',
                fontSize: '12.5px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-card-solid)',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">Branch: All ({filteredShops.length})</option>
              {shops.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* REPORT CONTENT BODY */}

      {/* REPORT 1: CONSOLIDATED GST DRAFT */}
      {selectedReport === 'gst' && (
        <div className="apple-glass-panel" style={{ padding: '22px' }}>
          
          <div style={{
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 149, 0, 0.08)',
            border: '1px solid rgba(255, 149, 0, 0.25)',
            marginBottom: '20px',
            fontSize: '12.5px',
            color: 'var(--text-primary)'
          }}>
            <strong>Legal Notice:</strong> DRAFT / DEMO — Automated GST return compilation requires chartered accountant verification before filing on the GSTN portal.
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(118, 118, 128, 0.04)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Gross Turnover</span>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                ₹{gstData.totalTurnover.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(118, 118, 128, 0.04)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Taxable Turnover</span>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                ₹{gstData.totalTaxable.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'rgba(118, 118, 128, 0.04)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Exempt Turnover</span>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--apple-green)', marginTop: '2px' }}>
                ₹{gstData.totalExempt.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--apple-blue-tint)' }}>
              <span style={{ fontSize: '11px', color: 'var(--apple-blue)', textTransform: 'uppercase', fontWeight: '600' }}>Net Tax Liability</span>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--apple-blue)', marginTop: '2px' }}>
                ₹{gstData.totalTax.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          <div className="apple-table-container">
            <table className="apple-table">
              <thead>
                <tr>
                  <th>Branch Name</th>
                  <th>GSTIN</th>
                  <th style={{ textAlign: 'right' }}>Taxable Turnover</th>
                  <th style={{ textAlign: 'right' }}>Exempt Turnover</th>
                  <th style={{ textAlign: 'right' }}>CGST</th>
                  <th style={{ textAlign: 'right' }}>SGST</th>
                  <th style={{ textAlign: 'right' }}>Total Tax</th>
                  <th style={{ textAlign: 'center' }}>Invoices</th>
                </tr>
              </thead>
              <tbody>
                {gstData.items.map((i) => (
                  <tr key={i.shop_id}>
                    <td style={{ fontWeight: '600' }}>{i.shop_name}</td>
                    <td><code>{i.gstin}</code></td>
                    <td style={{ textAlign: 'right' }}>₹{i.taxable_turnover.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', color: 'var(--apple-green)' }}>₹{i.exempt_turnover.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>₹{i.cgst.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>₹{i.sgst.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--apple-blue)' }}>₹{i.total_tax.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)' }}>{i.b2c_invoices_count} B2C</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* REPORT 2: SALES & PROFIT REPORT */}
      {selectedReport === 'sales' && (
        <div className="apple-glass-panel" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-primary)' }}>
            Daily Sales & Profit Ledger (Last 10 Days Sample)
          </h3>
          <table className="apple-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Branch</th>
                <th style={{ textAlign: 'right' }}>Gross Revenue</th>
                <th style={{ textAlign: 'right' }}>Net Profit</th>
                <th style={{ textAlign: 'right' }}>Margin %</th>
                <th style={{ textAlign: 'right' }}>Cash Billed</th>
                <th style={{ textAlign: 'right' }}>UPI / Digital</th>
                <th style={{ textAlign: 'right' }}>Variance</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.slice(0, 15).map((s, idx) => {
                const sh = shops.find((shop) => shop.id === s.shop_id);
                return (
                  <tr key={idx}>
                    <td>{s.date}</td>
                    <td style={{ fontWeight: '600' }}>{sh?.name}</td>
                    <td style={{ textAlign: 'right', fontWeight: '600' }}>₹{s.revenue.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', color: 'var(--apple-green)', fontWeight: '600' }}>₹{s.profit.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>{((s.profit / s.revenue) * 100).toFixed(1)}%</td>
                    <td style={{ textAlign: 'right' }}>₹{s.cash_sales.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>₹{s.digital_sales.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', color: s.cash_variance < 0 ? 'var(--apple-red)' : 'var(--text-secondary)' }}>
                      {s.cash_variance < 0 ? `-₹${Math.abs(s.cash_variance)}` : `+₹${s.cash_variance}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 3: UDHAAR REPORT */}
      {selectedReport === 'udhaar' && (
        <div className="apple-glass-panel" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-primary)' }}>
            Consolidated Udhaar Credit Aging Ledger
          </h3>
          <table className="apple-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th style={{ textAlign: 'right' }}>Balance Owed</th>
                <th style={{ textAlign: 'center' }}>Days Overdue</th>
                <th>Aging Category</th>
                <th>Risk Classification</th>
              </tr>
            </thead>
            <tbody>
              {udhaarRecords.slice(0, 14).map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: '600' }}>{u.customer_name}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.phone}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: u.days_outstanding > 30 ? 'var(--apple-red)' : 'var(--text-primary)' }}>
                    ₹{u.amount.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'center' }}>{u.days_outstanding} days</td>
                  <td><span className="apple-badge apple-badge-watch">{u.risk_category}</span></td>
                  <td><strong style={{ color: u.risk_level === 'Critical' ? 'var(--apple-red)' : 'var(--text-secondary)' }}>{u.risk_level}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 4: INVENTORY REPORT */}
      {selectedReport === 'inventory' && (
        <div className="apple-glass-panel" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-primary)' }}>
            Stockout Runway & Replenishment Schedule
          </h3>
          <table className="apple-table">
            <thead>
              <tr>
                <th>Product SKU</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Current Stock</th>
                <th style={{ textAlign: 'right' }}>Daily Burn Rate</th>
                <th style={{ textAlign: 'center' }}>Runway Left</th>
                <th style={{ textAlign: 'right' }}>Suggested PO Qty</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((i) => (
                <tr key={i.id}>
                  <td style={{ fontWeight: '600' }}>{i.item_name}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{i.category}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700' }}>{i.current_stock} {i.unit}</td>
                  <td style={{ textAlign: 'right' }}>{i.sales_velocity} {i.unit}/day</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', background: (i.current_stock / i.sales_velocity) < 2 ? 'var(--apple-red-tint)' : 'var(--apple-green-tint)', color: (i.current_stock / i.sales_velocity) < 2 ? 'var(--apple-red)' : 'var(--apple-green)' }}>
                      {(i.current_stock / i.sales_velocity).toFixed(1)} days
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--apple-blue)' }}>{i.suggested_reorder_qty} {i.unit}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{i.supplier}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* REPORT 5: SHOP PERFORMANCE */}
      {selectedReport === 'performance' && (
        <div className="apple-glass-panel" style={{ padding: '22px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-primary)' }}>
            Shop Network Performance Summary
          </h3>
          <table className="apple-table">
            <thead>
              <tr>
                <th>Store</th>
                <th>City</th>
                <th style={{ textAlign: 'right' }}>Monthly Revenue</th>
                <th style={{ textAlign: 'right' }}>Monthly Profit</th>
                <th style={{ textAlign: 'right' }}>Margin</th>
                <th style={{ textAlign: 'right' }}>Udhaar</th>
                <th style={{ textAlign: 'center' }}>Health</th>
              </tr>
            </thead>
            <tbody>
              {filteredShops.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: '600' }}>{s.name}</td>
                  <td>{s.city}</td>
                  <td style={{ textAlign: 'right' }}>₹{s.monthly_revenue.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', color: 'var(--apple-green)', fontWeight: '600' }}>₹{s.monthly_profit.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>{s.profit_margin_pct}%</td>
                  <td style={{ textAlign: 'right' }}>₹{s.udhaar_outstanding.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`apple-badge apple-badge-${s.status.toLowerCase().replace('-', '')}`}>
                      {s.health_score}/100
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
