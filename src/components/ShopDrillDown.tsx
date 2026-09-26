import React, { useState, useMemo } from 'react';
import { 
  Shop, 
  DailySales, 
  UdhaarRecord, 
  InventoryItem, 
  StaffActivity 
} from '../types';
import { 
  X, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  Phone, 
  Send, 
  Package, 
  Clock, 
  UserCheck, 
  FileSpreadsheet, 
  Check, 
  ArrowRight,
  ShieldAlert,
  ArrowUpRight,
  Layers
} from 'lucide-react';
import { exportUdhaarAgingCSV } from '../services/exportService';

interface ShopDrillDownProps {
  shop: Shop;
  dailySales: DailySales[];
  udhaarRecords: UdhaarRecord[];
  inventoryItems: InventoryItem[];
  staffActivities: StaffActivity[];
  onClose: () => void;
}

export const ShopDrillDown: React.FC<ShopDrillDownProps> = ({
  shop,
  dailySales,
  udhaarRecords,
  inventoryItems,
  staffActivities,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'udhaar' | 'inventory' | 'staff'>('trends');
  const [hoveredDay, setHoveredDay] = useState<DailySales | null>(null);
  const [reminderSent, setReminderSent] = useState<{ [id: string]: boolean }>({});
  const [poCreated, setPoCreated] = useState<{ [id: string]: boolean }>({});

  // Filter records specifically for this shop
  const shopDailySales = useMemo(() => {
    return dailySales.filter((s) => s.shop_id === shop.id);
  }, [dailySales, shop.id]);

  const shopUdhaar = useMemo(() => {
    return udhaarRecords.filter((u) => u.shop_id === shop.id);
  }, [udhaarRecords, shop.id]);

  const shopInventory = useMemo(() => {
    return inventoryItems.filter((i) => i.shop_id === shop.id);
  }, [inventoryItems, shop.id]);

  const shopStaff = useMemo(() => {
    return staffActivities.filter((a) => a.shop_id === shop.id);
  }, [staffActivities, shop.id]);

  // Udhaar Aging Buckets calculation
  const agingBuckets = useMemo(() => {
    const b0_7 = shopUdhaar.filter((u) => u.risk_category === '0-7d').reduce((sum, u) => sum + u.amount, 0);
    const b8_30 = shopUdhaar.filter((u) => u.risk_category === '8-30d').reduce((sum, u) => sum + u.amount, 0);
    const b31_60 = shopUdhaar.filter((u) => u.risk_category === '31-60d').reduce((sum, u) => sum + u.amount, 0);
    const b60plus = shopUdhaar.filter((u) => u.risk_category === '60d+').reduce((sum, u) => sum + u.amount, 0);
    const total = b0_7 + b8_30 + b31_60 + b60plus;

    return { b0_7, b8_30, b31_60, b60plus, total };
  }, [shopUdhaar]);

  // Chart max value calculation
  const maxRevenue = useMemo(() => {
    return Math.max(...shopDailySales.map((s) => s.revenue), 1000);
  }, [shopDailySales]);

  // Trigger WhatsApp reminder action
  const handleSendReminder = (recordId: string, customer: string, amount: number) => {
    setReminderSent((prev) => ({ ...prev, [recordId]: true }));
    setTimeout(() => {
      alert(`WhatsApp payment reminder link dispatched to ${customer} for ₹${amount.toLocaleString('en-IN')} with UPI instant-pay link.`);
    }, 100);
  };

  // Trigger PO creation action
  const handleCreatePO = (itemId: string, itemName: string) => {
    setPoCreated((prev) => ({ ...prev, [itemId]: true }));
    setTimeout(() => {
      alert(`Purchase Order created for ${itemName}. Sent to primary distributor for dispatch.`);
    }, 100);
  };

  return (
    <div className="apple-modal-overlay" onClick={onClose}>
      <div 
        className="apple-modal-container" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '1050px', maxHeight: '92vh' }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-glass-header)',
          backdropFilter: 'var(--backdrop-blur)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                {shop.name}
              </h2>
              <span className={`apple-badge apple-badge-${shop.status.toLowerCase().replace('-', '')}`}>
                <span className="apple-status-dot"></span>
                {shop.status}
              </span>
              {shop.cash_variance_today < -1000 && (
                <span className="apple-badge apple-badge-atrisk" style={{ fontSize: '11px' }}>
                  <ShieldAlert size={12} /> Cash Short: -₹{Math.abs(shop.cash_variance_today)}
                </span>
              )}
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              {shop.location} • Manager: <strong style={{ color: 'var(--text-secondary)' }}>{shop.manager_name}</strong> ({shop.owner_contact}) • {shop.store_size_sqft} sq.ft
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => exportUdhaarAgingCSV(shopUdhaar, shop.name)}
              className="apple-btn apple-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '12.5px' }}
              title="Download Shop Udhaar Ledger CSV"
            >
              <FileSpreadsheet size={14} />
              <span>Export Udhaar</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(118, 118, 128, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Navigation - Apple Segmented Control */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(118, 118, 128, 0.03)'
        }}>
          <div className="apple-segmented-control">
            <button
              className={`apple-segment-item ${activeTab === 'trends' ? 'active' : ''}`}
              onClick={() => setActiveTab('trends')}
            >
              <TrendingUp size={14} />
              <span>30-Day Trends</span>
            </button>
            <button
              className={`apple-segment-item ${activeTab === 'udhaar' ? 'active' : ''}`}
              onClick={() => setActiveTab('udhaar')}
            >
              <Clock size={14} />
              <span>Udhaar Aging ({shopUdhaar.length})</span>
            </button>
            <button
              className={`apple-segment-item ${activeTab === 'inventory' ? 'active' : ''}`}
              onClick={() => setActiveTab('inventory')}
            >
              <Package size={14} />
              <span>Low-Stock Alerts ({shopInventory.filter((i) => i.current_stock <= i.reorder_threshold).length})</span>
            </button>
            <button
              className={`apple-segment-item ${activeTab === 'staff' ? 'active' : ''}`}
              onClick={() => setActiveTab('staff')}
            >
              <UserCheck size={14} />
              <span>Staff Activity ({shopStaff.length})</span>
            </button>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
            Sync Status: <span style={{ color: 'var(--apple-green)', fontWeight: '600' }}>Live POS Active</span>
          </div>
        </div>

        {/* Tab Content Body */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          
          {/* TAB 1: 30-DAY TRENDS & TOP SELLING ITEMS */}
          {activeTab === 'trends' && (
            <div>
              {/* Metric Highlights Banner */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '14px',
                marginBottom: '22px'
              }}>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(118, 118, 128, 0.06)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Daily Sales Today</span>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                    ₹{shop.daily_revenue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(118, 118, 128, 0.06)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Monthly Sales Run-Rate</span>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                    ₹{shop.monthly_revenue.toLocaleString('en-IN')}
                  </div>
                </div>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(118, 118, 128, 0.06)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Profit Margin</span>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-green)', marginTop: '4px' }}>
                    {shop.profit_margin_pct.toFixed(1)}%
                  </div>
                </div>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'rgba(118, 118, 128, 0.06)' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Udhaar Outstanding</span>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: shop.udhaar_outstanding > 100000 ? 'var(--apple-red)' : 'var(--text-primary)', marginTop: '4px' }}>
                    ₹{shop.udhaar_outstanding.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* 30-Day SVG Line & Bar Chart */}
              <div style={{
                background: 'rgba(118, 118, 128, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      Revenue & Net Profit Trend (Last 30 Days)
                    </h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      Hover over any day to inspect revenue, profit margin, and transaction volume
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

                {/* SVG Chart visualization */}
                <div style={{ position: 'relative', height: '220px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingTop: '30px' }}>
                  {shopDailySales.map((day, idx) => {
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
                        {/* Revenue Bar */}
                        <div style={{
                          width: '100%',
                          maxWidth: '20px',
                          height: `${revHeight}px`,
                          backgroundColor: 'rgba(0, 113, 227, 0.45)',
                          borderRadius: '3px 3px 0 0',
                          position: 'relative',
                          transition: 'all 0.15s ease'
                        }}>
                          {/* Inner profit bar overlay */}
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

                {/* Hover Details Card */}
                <div style={{
                  minHeight: '34px',
                  marginTop: '12px',
                  padding: '8px 14px',
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '12.5px'
                }}>
                  {hoveredDay ? (
                    <>
                      <span><strong>Date:</strong> {hoveredDay.date}</span>
                      <span><strong>Revenue:</strong> ₹{hoveredDay.revenue.toLocaleString('en-IN')}</span>
                      <span><strong>Profit:</strong> ₹{hoveredDay.profit.toLocaleString('en-IN')} ({((hoveredDay.profit / hoveredDay.revenue) * 100).toFixed(1)}%)</span>
                      <span><strong>Transactions:</strong> {hoveredDay.transaction_count} bills (UPI: {Math.round((hoveredDay.digital_sales / hoveredDay.revenue) * 100)}%)</span>
                    </>
                  ) : (
                    <span style={{ color: 'var(--text-tertiary)' }}>
                      💡 Hover over bars to view daily transaction metrics
                    </span>
                  )}
                </div>
              </div>

              {/* Top-Selling Items Table */}
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Top-Selling Items in this Branch
                </h3>
                <table className="apple-table" style={{ background: 'var(--bg-card-solid)', borderRadius: 'var(--radius-md)' }}>
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'right' }}>Selling Price</th>
                      <th style={{ textAlign: 'right' }}>Daily Sales Velocity</th>
                      <th style={{ textAlign: 'right' }}>Stock on Hand</th>
                      <th style={{ textAlign: 'right' }}>Estimated Runway</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopInventory.map((item) => {
                      const runway = item.sales_velocity > 0 ? (item.current_stock / item.sales_velocity).toFixed(1) : '99';
                      const isLow = Number(runway) < 3.0 || item.current_stock <= item.reorder_threshold;
                      return (
                        <tr key={item.id}>
                          <td style={{ fontWeight: '500' }}>{item.item_name}</td>
                          <td>
                            <span style={{
                              fontSize: '11.5px',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              background: 'rgba(118, 118, 128, 0.08)',
                              color: 'var(--text-secondary)'
                            }}>
                              {item.category}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>₹{item.unit_price} / {item.unit}</td>
                          <td style={{ textAlign: 'right', fontWeight: '600' }}>{item.sales_velocity} {item.unit}/day</td>
                          <td style={{ textAlign: 'right' }}>
                            <span style={{ color: isLow ? 'var(--apple-red)' : 'var(--text-primary)', fontWeight: isLow ? '600' : 'normal' }}>
                              {item.current_stock} {item.unit}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <span style={{
                              fontSize: '11.5px',
                              fontWeight: '600',
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
            <div>
              {/* Aging Brackets Summary */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--apple-green-tint)', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--apple-green)', fontWeight: '600' }}>0–7 Days (Current)</span>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--apple-green)', marginTop: '4px' }}>
                    ₹{agingBuckets.b0_7.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Safe recovery cycle</span>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--apple-blue-tint)', border: '1px solid rgba(0, 113, 227, 0.2)' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--apple-blue)', fontWeight: '600' }}>8–30 Days (Due)</span>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--apple-blue)', marginTop: '4px' }}>
                    ₹{agingBuckets.b8_30.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Courtesy reminder due</span>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--apple-orange-tint)', border: '1px solid rgba(255, 149, 0, 0.2)' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--apple-orange)', fontWeight: '600' }}>31-60 Days (Warning)</span>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--apple-orange)', marginTop: '4px' }}>
                    ₹{agingBuckets.b31_60.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Requires urgent nudge</span>
                </div>

                <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--apple-red-tint)', border: '1px solid rgba(255, 59, 48, 0.2)' }}>
                  <span style={{ fontSize: '11.5px', color: 'var(--apple-red)', fontWeight: '600' }}>60+ Days (Critical Default)</span>
                  <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--apple-red)', marginTop: '4px' }}>
                    ₹{agingBuckets.b60plus.toLocaleString('en-IN')}
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--apple-red)' }}>Freeze further credit</span>
                </div>
              </div>

              {/* Customer Udhaar Table */}
              <div className="apple-table-container">
                <table className="apple-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Phone</th>
                      <th style={{ textAlign: 'right' }}>Credit Limit</th>
                      <th style={{ textAlign: 'right' }}>Amount Owed</th>
                      <th style={{ textAlign: 'center' }}>Days Outstanding</th>
                      <th>Risk Level</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shopUdhaar.map((record) => (
                      <tr key={record.id}>
                        <td style={{ fontWeight: '600' }}>{record.customer_name}</td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '12.5px' }}>{record.phone}</td>
                        <td style={{ textAlign: 'right', color: 'var(--text-tertiary)' }}>₹{record.credit_limit.toLocaleString('en-IN')}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: record.days_outstanding > 30 ? 'var(--apple-red)' : 'var(--text-primary)' }}>
                          ₹{record.amount.toLocaleString('en-IN')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '9999px',
                            fontSize: '11.5px',
                            fontWeight: '600',
                            background: record.days_outstanding > 45 ? 'var(--apple-red-tint)' : 'rgba(118, 118, 128, 0.08)',
                            color: record.days_outstanding > 45 ? 'var(--apple-red)' : 'var(--text-primary)'
                          }}>
                            {record.days_outstanding} days
                          </span>
                        </td>
                        <td>
                          <span className={`apple-badge apple-badge-${record.risk_category === '60d+' ? 'atrisk' : (record.risk_category === '31-60d' ? 'watch' : 'healthy')}`}>
                            {record.risk_category}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            onClick={() => handleSendReminder(record.id, record.customer_name, record.amount)}
                            disabled={reminderSent[record.id]}
                            className={`apple-btn ${reminderSent[record.id] ? 'apple-btn-secondary' : 'apple-btn-primary'}`}
                            style={{ padding: '5px 12px', fontSize: '12px' }}
                          >
                            {reminderSent[record.id] ? (
                              <>
                                <Check size={12} />
                                <span>Sent</span>
                              </>
                            ) : (
                              <>
                                <Send size={12} />
                                <span>WhatsApp Ping</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LOW-STOCK ALERTS & RUNWAY PREDICTIONS */}
          {activeTab === 'inventory' && (
            <div>
              <div style={{
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 149, 0, 0.08)',
                border: '1px solid rgba(255, 149, 0, 0.2)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <AlertTriangle size={20} color="var(--apple-orange)" />
                <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                  <strong>Sales-Velocity Aware Stockout Predictor:</strong> Calculates exact days of runway based on real billing velocity. SKUs with runway under 2.5 days are automatically flagged before stockouts occur.
                </div>
              </div>

              <div className="apple-table-container">
                <table className="apple-table">
                  <thead>
                    <tr>
                      <th>Product SKU</th>
                      <th>Category</th>
                      <th style={{ textAlign: 'right' }}>Current Stock</th>
                      <th style={{ textAlign: 'right' }}>Reorder Threshold</th>
                      <th style={{ textAlign: 'right' }}>Sales Velocity</th>
                      <th style={{ textAlign: 'center' }}>Runway Left</th>
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
                          <td style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{item.category}</td>
                          <td style={{ textAlign: 'right', fontWeight: '700', color: isCritical ? 'var(--apple-red)' : 'var(--text-primary)' }}>
                            {item.current_stock} {item.unit}
                          </td>
                          <td style={{ textAlign: 'right', color: 'var(--text-tertiary)' }}>
                            {item.reorder_threshold} {item.unit}
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: '500' }}>
                            {item.sales_velocity} {item.unit}/day
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              padding: '3px 10px',
                              borderRadius: '9999px',
                              fontSize: '12px',
                              fontWeight: '700',
                              background: isCritical ? 'var(--apple-red-tint)' : (Number(runway) < 4 ? 'var(--apple-orange-tint)' : 'var(--apple-green-tint)'),
                              color: isCritical ? 'var(--apple-red)' : (Number(runway) < 4 ? 'var(--apple-orange)' : 'var(--apple-green)')
                            }}>
                              {runway} days
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleCreatePO(item.id, item.item_name)}
                              disabled={poCreated[item.id]}
                              className="apple-btn apple-btn-secondary"
                              style={{ padding: '5px 12px', fontSize: '12px' }}
                            >
                              {poCreated[item.id] ? <Check size={12} /> : <Package size={12} />}
                              <span>{poCreated[item.id] ? 'PO Dispatched' : 'Reorder PO'}</span>
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

          {/* TAB 4: STAFF & CASHIER ACTIVITY LOG */}
          {activeTab === 'staff' && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  Live Store Cashier & POS Audit Feed
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--apple-green)', fontWeight: '600' }}>
                  ● POS Synced with KhataCopilot Offline DB
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {shopStaff.length === 0 ? (
                  <p style={{ color: 'var(--text-tertiary)', fontSize: '13px', padding: '20px 0' }}>
                    No recent cashier events recorded in the last 24 hours.
                  </p>
                ) : (
                  shopStaff.map((act) => (
                    <div
                      key={act.id}
                      style={{
                        padding: '14px 18px',
                        borderRadius: 'var(--radius-md)',
                        background: 'rgba(118, 118, 128, 0.05)',
                        border: '1px solid var(--border-subtle)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '14px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '50%',
                          background: act.category === 'cash_reconciliation' ? 'var(--apple-orange-tint)' : (act.category === 'voice_order' ? 'var(--apple-purple-tint)' : 'var(--apple-blue-tint)'),
                          color: act.category === 'cash_reconciliation' ? 'var(--apple-orange)' : (act.category === 'voice_order' ? 'var(--apple-purple)' : 'var(--apple-blue)'),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Clock size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                            {act.action}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                            Staff: <strong>{act.staff_name}</strong> • Category: {act.category.replace('_', ' ')}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        {act.amount !== undefined && (
                          <div style={{
                            fontSize: '13.5px',
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
          )}

        </div>
      </div>
    </div>
  );
};
