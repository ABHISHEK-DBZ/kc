import React, { useMemo, useState } from 'react';
import { Shop, DailySales } from '../types';
import { 
  TrendingUp, 
  IndianRupee, 
  CreditCard, 
  Download, 
  Calendar,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { exportSalesReport } from '../services/exportService';

interface SalesViewProps {
  shops: Shop[];
  dailySales: DailySales[];
}

export const SalesView: React.FC<SalesViewProps> = ({ shops, dailySales }) => {
  const [selectedCity, setSelectedCity] = useState('All');
  const [hoveredDay, setHoveredDay] = useState<DailySales | null>(null);

  const cities = useMemo(() => ['All', ...Array.from(new Set(shops.map((s) => s.city)))], [shops]);

  const filteredSales = useMemo(() => {
    if (selectedCity === 'All') return dailySales;
    const shopIds = new Set(shops.filter((s) => s.city === selectedCity).map((s) => s.id));
    return dailySales.filter((s) => shopIds.has(s.shop_id));
  }, [dailySales, shops, selectedCity]);

  // Daily totals aggregated across filtered shops
  const dailyTotals = useMemo(() => {
    const map = new Map<string, { date: string; revenue: number; profit: number; transactions: number; cash: number; digital: number }>();
    
    filteredSales.forEach((s) => {
      const existing = map.get(s.date) || { date: s.date, revenue: 0, profit: 0, transactions: 0, cash: 0, digital: 0 };
      existing.revenue += s.revenue;
      existing.profit += s.profit;
      existing.transactions += s.transaction_count;
      existing.cash += s.cash_sales;
      existing.digital += s.digital_sales;
      map.set(s.date, existing);
    });

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredSales]);

  const totalRev = useMemo(() => dailyTotals.reduce((sum, d) => sum + d.revenue, 0), [dailyTotals]);
  const totalProfit = useMemo(() => dailyTotals.reduce((sum, d) => sum + d.profit, 0), [dailyTotals]);
  const totalDigital = useMemo(() => dailyTotals.reduce((sum, d) => sum + d.digital, 0), [dailyTotals]);
  const totalCash = useMemo(() => dailyTotals.reduce((sum, d) => sum + d.cash, 0), [dailyTotals]);
  const digitalSharePct = totalRev > 0 ? ((totalDigital / totalRev) * 100).toFixed(1) : '72.0';

  const maxDailyRev = useMemo(() => Math.max(...dailyTotals.map((d) => d.revenue), 1000), [dailyTotals]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div className="apple-glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
              Chain Sales & Profit Analytics
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Consolidated 30-day billing trends, UPI digital adoption ratios, and margin distribution.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
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
              {cities.map((c) => (
                <option key={c} value={c}>City: {c}</option>
              ))}
            </select>

            <button
              onClick={() => exportSalesReport(dailySales, shops, 'csv')}
              className="apple-btn apple-btn-secondary"
              style={{ fontSize: '12.5px', padding: '6px 12px' }}
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Sales KPI Metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '20px' }}>
          
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(118, 118, 128, 0.05)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>30-Day Turnover</span>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
              ₹{(totalRev / 100000).toFixed(2)} Lakhs
            </div>
            <span style={{ fontSize: '11px', color: 'var(--apple-green)', fontWeight: '600' }}>↑ 12.4% vs prev period</span>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(118, 118, 128, 0.05)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Net Profit</span>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--apple-green)', marginTop: '4px' }}>
              ₹{(totalProfit / 100000).toFixed(2)} Lakhs
            </div>
            <span style={{ fontSize: '11px', color: 'var(--apple-green)', fontWeight: '600' }}>
              {((totalProfit / totalRev) * 100).toFixed(1)}% blended margin
            </span>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--apple-blue-tint)', border: '1px solid rgba(0, 113, 227, 0.2)' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--apple-blue)', fontWeight: '600', textTransform: 'uppercase' }}>UPI / Digital Share</span>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--apple-blue)', marginTop: '4px' }}>
              {digitalSharePct}%
            </div>
            <span style={{ fontSize: '11px', color: 'var(--apple-blue)' }}>
              ₹{(totalDigital / 100000).toFixed(1)}L UPI vs ₹{(totalCash / 100000).toFixed(1)}L Cash
            </span>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(118, 118, 128, 0.05)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Avg Ticket Size</span>
            <div style={{ fontSize: '22px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
              ₹268
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Across all POS terminals</span>
          </div>

        </div>
      </div>

      {/* Network 30-Day SVG Sales Chart */}
      <div className="apple-glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Consolidated 30-Day Network Daily Revenue Trend
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              Aggregated daily sales across selected branch scope
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--apple-blue)' }}></span>
              Daily Sales
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--apple-green)' }}></span>
              Net Profit
            </span>
          </div>
        </div>

        <div style={{ position: 'relative', height: '220px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingTop: '20px' }}>
          {dailyTotals.map((day) => {
            const revHeight = Math.max((day.revenue / maxDailyRev) * 160, 10);
            const profitHeight = Math.max((day.profit / maxDailyRev) * 160, 4);

            return (
              <div
                key={day.date}
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
                    backgroundColor: 'var(--apple-green)'
                  }}></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
