import React, { useState, useMemo } from 'react';
import { 
  Shop, 
  DailySales, 
  UdhaarRecord, 
  InventoryItem, 
  StaffActivity 
} from '../types';
import { 
  ArrowLeft, 
  TrendingUp, 
  Clock, 
  Package, 
  UserCheck, 
  Download, 
  Send, 
  Check, 
  ShieldAlert, 
  FileSpreadsheet, 
  AlertTriangle,
  Calendar,
  Layers
} from 'lucide-react';
import { exportUdhaarAging } from '../services/exportService';

interface ShopCRMViewProps {
  shop: Shop;
  dailySales: DailySales[];
  udhaarRecords: UdhaarRecord[];
  inventoryItems: InventoryItem[];
  staffActivities: StaffActivity[];
  onBack: () => void;
}

export const ShopCRMView: React.FC<ShopCRMViewProps> = ({
  shop,
  dailySales,
  udhaarRecords,
  inventoryItems,
  staffActivities,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'udhaar' | 'inventory' | 'staff'>('trends');
  const [hoveredDay, setHoveredDay] = useState<DailySales | null>(null);
  const [reminderSent, setReminderSent] = useState<{ [id: string]: boolean }>({});
  const [poCreated, setPoCreated] = useState<{ [id: string]: boolean }>({});

  const shopSales = useMemo(() => dailySales.filter((s) => s.shop_id === shop.id), [dailySales, shop.id]);
  const shopUdhaar = useMemo(() => udhaarRecords.filter((u) => u.shop_id === shop.id), [udhaarRecords, shop.id]);
  const shopInventory = useMemo(() => inventoryItems.filter((i) => i.shop_id === shop.id), [inventoryItems, shop.id]);
  const shopStaff = useMemo(() => staffActivities.filter((a) => a.shop_id === shop.id), [staffActivities, shop.id]);

  // Udhaar Aging Buckets calculation: 0-7d, 8-30d, 31-60d, 60d+
  const agingBuckets = useMemo(() => {
    const b0_7 = shopUdhaar.filter((u) => u.risk_category === '0-7d').reduce((sum, u) => sum + u.amount, 0);
    const b8_30 = shopUdhaar.filter((u) => u.risk_category === '8-30d').reduce((sum, u) => sum + u.amount, 0);
    const b31_60 = shopUdhaar.filter((u) => u.risk_category === '31-60d').reduce((sum, u) => sum + u.amount, 0);
    const b60plus = shopUdhaar.filter((u) => u.risk_category === '60d+').reduce((sum, u) => sum + u.amount, 0);
    const total = b0_7 + b8_30 + b31_60 + b60plus;
    return { b0_7, b8_30, b31_60, b60plus, total };
  }, [shopUdhaar]);

  // Max revenue for chart scale
  const maxRevenue = useMemo(() => {
    return Math.max(...shopSales.map((s) => s.revenue), 1000);
  }, [shopSales]);

  // Previous 7d vs last 7d calculation
  const periodComparison = useMemo(() => {
    if (shopSales.length < 14) return { revDelta: '+0.0%', isDown: false };
    const last7 = shopSales.slice(-7).reduce((acc, s) => acc + s.revenue, 0);
    const prev7 = shopSales.slice(-14, -7).reduce((acc, s) => acc + s.revenue, 0);
    const diff = ((last7 - prev7) / prev7) * 100;
    return {
      revDelta: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`,
      isDown: diff < 0
    };
  }, [shopSales]);

  const handleSendReminder = (recordId: string, customer: string, amount: number) => {
    setReminderSent((prev) => ({ ...prev, [recordId]: true }));
    setTimeout(() => {
      alert(`WhatsApp collection reminder with UPI instant-pay link sent to ${customer} for ₹${amount.toLocaleString('en-IN')}.`);
    }, 100);
  };

  const handleCreatePO = (itemId: string, itemName: string, suggestedQty: number) => {
    setPoCreated((prev) => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      alert(`Purchase Order #${Math.floor(1000 + Math.random() * 9000)} created for ${suggestedQty} units of ${itemName}. Transmitted to distributor.`);
    }, 100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button
          onClick={onBack}
          className="apple-btn apple-btn-secondary"
          style={{ padding: '6px 12px', fontSize: '12.5px' }}
        >
          <ArrowLeft size={14} />
          <span>Back to All Shops</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => exportUdhaarAging(shopUdhaar, shop.name, 'csv')}
            className="apple-btn apple-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '12.5px' }}
          >
            <FileSpreadsheet size={13} />
            <span>Export Shop Ledger</span>
          </button>
        </div>
      </div>

      {/* Shop Profile Header Banner */}
      <div className="apple-glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
                {shop.name}
              </h1>
              <span className={`apple-badge apple-badge-${shop.status.toLowerCase().replace('-', '')}`}>
                <span className="apple-status-dot"></span>
                {shop.status}
              </span>
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: 'var(--radius-pill)',
                background: shop.health_score >= 80 ? 'var(--apple-green-tint)' : (shop.health_score >= 60 ? 'var(--apple-orange-tint)' : 'var(--apple-red-tint)'),
                color: shop.health_score >= 80 ? 'var(--apple-green)' : (shop.health_score >= 60 ? 'var(--apple-orange)' : 'var(--apple-red)')
              }}>
                Health Score: {shop.health_score}/100
              </span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              {shop.location} • Manager: <strong style={{ color: 'var(--text-primary)' }}>{shop.manager_name}</strong> • Contact: {shop.owner_contact} • {shop.store_size_sqft} sq.ft
            </p>

            {/* Health Score Explanations */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {shop.health_reasons.map((r, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: '11.5px',
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-xs)',
                    background: shop.status === 'At-Risk' ? 'rgba(255, 59, 48, 0.08)' : 'rgba(118, 118, 128, 0.06)',
                    color: shop.status === 'At-Risk' ? 'var(--apple-red)' : 'var(--text-secondary)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Quick Metrics Tile */}
          <div style={{
            display: 'flex',
            gap: '16px',
            padding: '12px 18px',
            background: 'rgba(118, 118, 128, 0.04)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Daily Rev</span>
              <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
                ₹{shop.daily_revenue.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Profit Margin</span>
              <div style={{ fontSize: '16px', fontWeight: '700', color: shop.profit_margin_pct < 11 ? 'var(--apple-red)' : 'var(--apple-green)' }}>
                {shop.profit_margin_pct}%
              </div>
            </div>
            <div style={{ borderLeft: '1px solid var(--border-subtle)', paddingLeft: '16px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Udhaar</span>
              <div style={{ fontSize: '16px', fontWeight: '700', color: shop.udhaar_outstanding > 100000 ? 'var(--apple-red)' : 'var(--text-primary)' }}>
                ₹{(shop.udhaar_outstanding / 1000).toFixed(0)}k
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Module Tabs (Apple Segmented Control) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div className="apple-segmented-control">
          <button
            className={`apple-segment-item ${activeTab === 'trends' ? 'active' : ''}`}
            onClick={() => setActiveTab('trends')}
          >
            <TrendingUp size={14} />
            <span>Revenue & Profit</span>
          </button>
          <button
            className={`apple-segment-item ${activeTab === 'udhaar' ? 'active' : ''}`}
            onClick={() => setActiveTab('udhaar')}
          >
            <Clock size={14} />
            <span>Udhaar Ledger ({shopUdhaar.length})</span>
          </button>
          <button
            className={`apple-segment-item ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            <Package size={14} />
            <span>Inventory ({shopInventory.length})</span>
          </button>
          <button
            className={`apple-segment-item ${activeTab === 'staff' ? 'active' : ''}`}
            onClick={() => setActiveTab('staff')}
          >
            <UserCheck size={14} />
            <span>Staff Activity ({shopStaff.length})</span>
          </button>
        </div>

        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
          POS Sync: <strong style={{ color: 'var(--apple-green)' }}>Online (Sync 0.2s)</strong>
        </span>
      </div>

      {/* TAB 1: REVENUE & PROFIT 30-DAY TRENDS */}
      {activeTab === 'trends' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div className="apple-glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  30-Day Revenue & Net Profit Trend
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Recent 7-Day Performance vs Previous Baseline: <strong style={{ color: periodComparison.isDown ? 'var(--apple-red)' : 'var(--apple-green)' }}>{periodComparison.revDelta}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--apple-blue)' }}></span>
                  Daily Revenue
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--apple-green)' }}></span>
                  Net Profit
                </span>
              </div>
            </div>

            {/* SVG Bars & Line Visualization */}
            <div style={{ position: 'relative', height: '220px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingTop: '24px' }}>
              {shopSales.map((day) => {
                const revHeight = Math.max((day.revenue / maxRevenue) * 160, 10);
                const profitHeight = Math.max((day.profit / maxRevenue) * 160, 4);

                return (
                  <div
                    key={day.date}
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    style={{
                      flex: 1,
                      height: '100%',
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: '100%',
                      maxWidth: '18px',
                      height: `${revHeight}px`,
                      backgroundColor: 'rgba(0, 113, 227, 0.45)',
                      borderRadius: '3px 3px 0 0',
                      position: 'relative'
                    }}>
                      <div style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${profitHeight}px`,
                        backgroundColor: 'var(--apple-green)',
                        borderRadius: '0 0 0 0'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hover details display */}
            <div style={{
              marginTop: '12px',
              padding: '8px 14px',
              background: 'rgba(118, 118, 128, 0.05)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              {hoveredDay ? (
                <>
                  <span><strong>Date:</strong> {hoveredDay.date}</span>
                  <span><strong>Revenue:</strong> ₹{hoveredDay.revenue.toLocaleString('en-IN')}</span>
                  <span><strong>Profit:</strong> ₹{hoveredDay.profit.toLocaleString('en-IN')} ({((hoveredDay.profit / hoveredDay.revenue) * 100).toFixed(1)}%)</span>
                  <span><strong>Transactions:</strong> {hoveredDay.transaction_count} orders</span>
                  <span><strong>UPI / Cash:</strong> ₹{hoveredDay.digital_sales.toLocaleString('en-IN')} / ₹{hoveredDay.cash_sales.toLocaleString('en-IN')}</span>
                </>
              ) : (
                <span style={{ color: 'var(--text-tertiary)' }}>
                  Hover over any date column to view precise revenue, profit, and UPI breakdown
                </span>
              )}
            </div>
          </div>

          {/* Top Selling Products in this Branch */}
          <div className="apple-glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Top Selling Products in {shop.name}
            </h3>
            <table className="apple-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Daily Velocity</th>
                  <th style={{ textAlign: 'right' }}>Stock on Hand</th>
                  <th style={{ textAlign: 'right' }}>Runway Left</th>
                </tr>
              </thead>
              <tbody>
                {shopInventory.map((item) => {
                  const runway = item.sales_velocity > 0 ? (item.current_stock / item.sales_velocity).toFixed(1) : '99';
                  const isLow = Number(runway) < 2.5;
                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '600' }}>{item.item_name}</td>
                      <td style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{item.category}</td>
                      <td style={{ textAlign: 'right' }}>₹{item.unit_price}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>{item.sales_velocity} {item.unit}/day</td>
                      <td style={{ textAlign: 'right', fontWeight: '600', color: isLow ? 'var(--apple-red)' : 'var(--text-primary)' }}>
                        {item.current_stock} {item.unit}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span style={{
                          fontSize: '11.5px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          background: isLow ? 'var(--apple-red-tint)' : 'var(--apple-green-tint)',
                          color: isLow ? 'var(--apple-red)' : 'var(--apple-green)'
                        }}>
                          {runway} days
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 2: UDHAAR AGING REPORT */}
      {activeTab === 'udhaar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Aging Buckets Summary: 0-7d, 8-30d, 31-60d, 60d+ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--apple-green-tint)', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--apple-green)' }}>0–7 Days (Current)</span>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--apple-green)', marginTop: '4px' }}>
                ₹{agingBuckets.b0_7.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Safe collection window</span>
            </div>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--apple-blue-tint)', border: '1px solid rgba(0, 113, 227, 0.2)' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--apple-blue)' }}>8–30 Days (Due)</span>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--apple-blue)', marginTop: '4px' }}>
                ₹{agingBuckets.b8_30.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Payment reminder due</span>
            </div>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--apple-orange-tint)', border: '1px solid rgba(255, 149, 0, 0.2)' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--apple-orange)' }}>31–60 Days (Warning)</span>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--apple-orange)', marginTop: '4px' }}>
                ₹{agingBuckets.b31_60.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Elevated credit risk</span>
            </div>

            <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--apple-red-tint)', border: '1px solid rgba(255, 59, 48, 0.2)' }}>
              <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--apple-red)' }}>60+ Days (Critical)</span>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--apple-red)', marginTop: '4px' }}>
                ₹{agingBuckets.b60plus.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--apple-red)' }}>Freeze further credit</span>
            </div>
          </div>

          {/* Customers Credit Ledger */}
          <div className="apple-glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Customer Khata Records ({shopUdhaar.length} Accounts)
            </h3>
            <table className="apple-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th style={{ textAlign: 'right' }}>Credit Limit</th>
                  <th style={{ textAlign: 'right' }}>Amount Owed</th>
                  <th style={{ textAlign: 'center' }}>Days Overdue</th>
                  <th>Aging Bucket</th>
                  <th>Risk Level</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {shopUdhaar.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: '600' }}>{u.customer_name}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{u.phone}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-tertiary)' }}>₹{u.credit_limit.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: u.days_outstanding > 30 ? 'var(--apple-red)' : 'var(--text-primary)' }}>
                      ₹{u.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11.5px',
                        fontWeight: '600',
                        background: u.days_outstanding > 30 ? 'var(--apple-red-tint)' : 'rgba(118, 118, 128, 0.08)',
                        color: u.days_outstanding > 30 ? 'var(--apple-red)' : 'var(--text-primary)'
                      }}>
                        {u.days_outstanding} days
                      </span>
                    </td>
                    <td>
                      <span className={`apple-badge apple-badge-${u.risk_category === '60d+' ? 'atrisk' : (u.risk_category === '31-60d' ? 'watch' : 'healthy')}`}>
                        {u.risk_category}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: '700',
                        color: u.risk_level === 'Critical' ? 'var(--apple-red)' : (u.risk_level === 'High' ? 'var(--apple-orange)' : 'var(--apple-green)')
                      }}>
                        {u.risk_level}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => handleSendReminder(u.id, u.customer_name, u.amount)}
                        disabled={reminderSent[u.id]}
                        className={`apple-btn ${reminderSent[u.id] ? 'apple-btn-secondary' : 'apple-btn-primary'}`}
                        style={{ padding: '4px 10px', fontSize: '11.5px' }}
                      >
                        {reminderSent[u.id] ? <Check size={12} /> : <Send size={12} />}
                        <span>{reminderSent[u.id] ? 'Sent' : 'WhatsApp Ping'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 3: INVENTORY & STOCK-OUT PREDICTIONS */}
      {activeTab === 'inventory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div style={{
            padding: '14px 18px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(255, 149, 0, 0.08)',
            border: '1px solid rgba(255, 149, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <AlertTriangle size={18} color="var(--apple-orange)" />
            <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
              <strong>Predictive Stock-Out Velocity Engine:</strong> Evaluates burn rate (sales velocity) against current on-hand stock. SKUs with runway under 2.5 days are automatically flagged with suggested reorder quantities.
            </div>
          </div>

          <div className="apple-glass-panel" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '12px' }}>
              Inventory SKU Status & Velocity Forecast
            </h3>
            <table className="apple-table">
              <thead>
                <tr>
                  <th>Product SKU</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Current Stock</th>
                  <th style={{ textAlign: 'right' }}>Threshold</th>
                  <th style={{ textAlign: 'right' }}>Sales Velocity</th>
                  <th style={{ textAlign: 'center' }}>Days Runway</th>
                  <th>Estimated Stockout Date</th>
                  <th style={{ textAlign: 'right' }}>Suggested PO</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {shopInventory.map((item) => {
                  const runway = item.sales_velocity > 0 ? (item.current_stock / item.sales_velocity).toFixed(1) : '99';
                  const isCritical = Number(runway) < 2.0;

                  return (
                    <tr key={item.id}>
                      <td style={{ fontWeight: '600' }}>{item.item_name}</td>
                      <td style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{item.category}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700', color: isCritical ? 'var(--apple-red)' : 'var(--text-primary)' }}>
                        {item.current_stock} {item.unit}
                      </td>
                      <td style={{ textAlign: 'right', color: 'var(--text-tertiary)' }}>{item.reorder_threshold} {item.unit}</td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>{item.sales_velocity} {item.unit}/day</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          fontSize: '11.5px',
                          fontWeight: '700',
                          background: isCritical ? 'var(--apple-red-tint)' : (Number(runway) < 3.5 ? 'var(--apple-orange-tint)' : 'var(--apple-green-tint)'),
                          color: isCritical ? 'var(--apple-red)' : (Number(runway) < 3.5 ? 'var(--apple-orange)' : 'var(--apple-green)')
                        }}>
                          {runway} days
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: isCritical ? 'var(--apple-red)' : 'var(--text-secondary)', fontWeight: isCritical ? '600' : 'normal' }}>
                        {item.estimated_stockout_date}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '600' }}>
                        {item.suggested_reorder_qty > 0 ? `${item.suggested_reorder_qty} ${item.unit}` : '—'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => handleCreatePO(item.id, item.item_name, item.suggested_reorder_qty)}
                          disabled={poCreated[item.id]}
                          className="apple-btn apple-btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '11.5px' }}
                        >
                          {poCreated[item.id] ? <Check size={12} /> : <Package size={12} />}
                          <span>{poCreated[item.id] ? 'PO Sent' : 'Reorder PO'}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 4: STAFF ACTIVITY & CASH DRAWER AUDIT */}
      {activeTab === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          <div className="apple-glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  Live Store Cashier & POS Audit Feed
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Real-time synchronization with KhataCopilot offline-first mobile POS
                </p>
              </div>
              <span className="apple-badge apple-badge-healthy">
                <span className="apple-status-dot"></span> 2 Active Cashiers
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {shopStaff.length === 0 ? (
                <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', padding: '16px 0' }}>
                  No recent cashier events recorded in the last 24 hours.
                </p>
              ) : (
                shopStaff.map((act) => (
                  <div
                    key={act.id}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'rgba(118, 118, 128, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: act.category === 'cash_reconciliation' ? 'var(--apple-red-tint)' : (act.category === 'voice_order' ? 'var(--apple-purple-tint)' : 'var(--apple-blue-tint)'),
                        color: act.category === 'cash_reconciliation' ? 'var(--apple-red)' : (act.category === 'voice_order' ? 'var(--apple-purple)' : 'var(--apple-blue)'),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Clock size={15} />
                      </div>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {act.action}
                        </div>
                        <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                          Staff: <strong>{act.staff_name}</strong> ({act.role}) • {act.metadata}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {act.amount !== undefined && (
                        <div style={{
                          fontSize: '13px',
                          fontWeight: '700',
                          color: act.amount < 0 ? 'var(--apple-red)' : 'var(--apple-green)'
                        }}>
                          {act.amount < 0 ? `-₹${Math.abs(act.amount).toLocaleString('en-IN')}` : `₹${act.amount.toLocaleString('en-IN')}`}
                        </div>
                      )}
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{act.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
