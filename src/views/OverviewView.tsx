import React, { useMemo } from 'react';
import { Shop, DailySales, UdhaarRecord, InventoryItem, Anomaly } from '../types';
import { 
  TrendingUp, 
  IndianRupee, 
  CreditCard, 
  Store, 
  AlertOctagon, 
  Percent, 
  ShoppingCart, 
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface OverviewViewProps {
  shops: Shop[];
  dailySales: DailySales[];
  udhaarRecords: UdhaarRecord[];
  inventoryItems: InventoryItem[];
  anomalies: Anomaly[];
  onSelectShop: (shop: Shop) => void;
  onNavigateToTab: (tab: any) => void;
  onFilterAtRisk: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  shops,
  dailySales,
  udhaarRecords,
  inventoryItems,
  anomalies,
  onSelectShop,
  onNavigateToTab,
  onFilterAtRisk
}) => {
  // Aggregate KPIs
  const totalRevenue = useMemo(() => shops.reduce((sum, s) => sum + s.monthly_revenue, 0), [shops]);
  const totalProfit = useMemo(() => shops.reduce((sum, s) => sum + s.monthly_profit, 0), [shops]);
  const avgMargin = useMemo(() => totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0, [totalRevenue, totalProfit]);
  const totalUdhaar = useMemo(() => shops.reduce((sum, s) => sum + s.udhaar_outstanding, 0), [shops]);
  const totalStockAlerts = useMemo(() => shops.reduce((sum, s) => sum + s.stock_alert_count, 0), [shops]);
  const atRiskShops = useMemo(() => shops.filter((s) => s.status === 'At-Risk'), [shops]);
  const totalTransactions = useMemo(() => dailySales.slice(-shops.length).reduce((sum, s) => sum + s.transaction_count, 0) * 28, [dailySales, shops]);

  // Top 3 at-risk stores
  const priorityAtRisk = atRiskShops.slice(0, 3);
  // Top 3 performing stores
  const topPerformers = [...shops].sort((a, b) => b.monthly_revenue - a.monthly_revenue).slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      
      {/* 1. Anomaly & Risk Banner if detected */}
      {anomalies.length > 0 && (
        <div style={{
          padding: '14px 20px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(255, 59, 48, 0.08)',
          border: '1px solid rgba(255, 59, 48, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--apple-red)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldAlert size={18} />
            </div>
            <div>
              <span style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--apple-red)' }}>
                {anomalies.length} Operational Anomalies Flagged Across Chain Branches
              </span>
              <p style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '2px' }}>
                Unusual cash drawer variances (-₹2,450 at Patel Mart), severe revenue drop (-18.2% at Sharma General Store), and 3 critical stockouts.
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('alerts')}
            className="apple-btn apple-btn-danger"
            style={{ padding: '6px 14px', fontSize: '12.5px', whiteSpace: 'nowrap' }}
          >
            <span>Review Alerts</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* 2. Top 8 CRM KPI Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px'
      }}>
        {/* KPI 1: Total Revenue */}
        <div className="apple-glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Total Revenue
            </span>
            <IndianRupee size={16} color="var(--apple-blue)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
            ₹{(totalRevenue / 100000).toFixed(1)}L
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--apple-green)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={11} /> ↑ 12.4%
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>vs previous 30 days</span>
          </div>
        </div>

        {/* KPI 2: Total Net Profit */}
        <div className="apple-glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Total Net Profit
            </span>
            <Percent size={16} color="var(--apple-green)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
            ₹{(totalProfit / 100000).toFixed(1)}L
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--apple-green)' }}>
              {avgMargin.toFixed(1)}% margin
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Target 14%</span>
          </div>
        </div>

        {/* KPI 3: Outstanding Udhaar */}
        <div className="apple-glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Outstanding Udhaar
            </span>
            <CreditCard size={16} color="var(--apple-orange)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
            ₹{(totalUdhaar / 100000).toFixed(1)}L
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--apple-orange)' }}>
              {atRiskShops.length} stores flagged
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>CEI: 91.2%</span>
          </div>
        </div>

        {/* KPI 4: Active Shops */}
        <div className="apple-glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Active Shops
            </span>
            <Store size={16} color="var(--apple-indigo)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
            {shops.length} <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-tertiary)' }}>Branches</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--apple-green)' }}>
              100% Khata Sync
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>0 offline nodes</span>
          </div>
        </div>

        {/* KPI 5: Total Transactions */}
        <div className="apple-glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Monthly Transactions
            </span>
            <ShoppingCart size={16} color="var(--apple-blue)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
            {totalTransactions.toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Avg Ticket: ₹268 / order
            </span>
          </div>
        </div>

        {/* KPI 6: Low Stock Items */}
        <div 
          className="apple-glass-panel" 
          style={{ padding: '18px', cursor: 'pointer' }}
          onClick={() => onNavigateToTab('inventory')}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Low-Stock SKUs
            </span>
            <AlertOctagon size={16} color="var(--apple-orange)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.4px', color: 'var(--apple-orange)' }}>
            {totalStockAlerts} <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-tertiary)' }}>SKUs</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--apple-orange)' }}>
              Velocity &lt; 2d runway
            </span>
          </div>
        </div>

        {/* KPI 7: At-Risk Shops (CLICKABLE per Demo Scenario) */}
        <div 
          className="apple-glass-panel" 
          style={{ 
            padding: '18px', 
            cursor: 'pointer',
            border: '1px solid rgba(255, 59, 48, 0.3)',
            background: 'rgba(255, 59, 48, 0.03)'
          }}
          onClick={onFilterAtRisk}
          title="Click to filter 3 At-Risk Shops"
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--apple-red)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              At-Risk Shops
            </span>
            <AlertTriangle size={16} color="var(--apple-red)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '700', letterSpacing: '-0.4px', color: 'var(--apple-red)' }}>
            {atRiskShops.length} <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-tertiary)' }}>Branches</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--apple-red)' }}>
              Click to view At-Risk stores →
            </span>
          </div>
        </div>
      </div>

      {/* 3. Demo Spotlight: 3 At-Risk Stores Requiring Attention */}
      <div className="apple-glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
              Priority Branches Requiring Intervention
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
              Click any store to open its full CRM drill-down profile, 30-day sales charts, and customer credit ledger.
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('shops')}
            className="apple-btn apple-btn-secondary"
            style={{ fontSize: '12.5px', padding: '5px 12px' }}
          >
            <span>View All {shops.length} Shops</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {priorityAtRisk.map((shop) => (
            <div
              key={shop.id}
              onClick={() => onSelectShop(shop)}
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-card-solid)',
                border: '1px solid rgba(255, 59, 48, 0.25)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--apple-red)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 59, 48, 0.25)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {shop.name}
                  </span>
                  <span className="apple-badge apple-badge-atrisk" style={{ fontSize: '11px' }}>
                    Health: {shop.health_score}/100
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  {shop.location} • Manager: {shop.manager_name}
                </div>
              </div>

              <div style={{ fontSize: '12px', color: 'var(--apple-red)', fontWeight: '500', background: 'rgba(255, 59, 48, 0.06)', padding: '6px 10px', borderRadius: 'var(--radius-xs)' }}>
                {shop.status_reason}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)', fontSize: '12px' }}>
                <span>Rev: <strong>₹{shop.daily_revenue.toLocaleString('en-IN')}/d</strong></span>
                <span>Margin: <strong style={{ color: 'var(--apple-red)' }}>{shop.profit_margin_pct}%</strong></span>
                <span>Udhaar: <strong>₹{shop.udhaar_outstanding.toLocaleString('en-IN')}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Quick AI Intelligence Prompt Bar */}
      <div style={{
        padding: '18px 22px',
        borderRadius: 'var(--radius-lg)',
        background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.05) 0%, rgba(88, 86, 214, 0.08) 100%)',
        border: '1px solid rgba(0, 113, 227, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            background: 'linear-gradient(135deg, #0071e3 0%, #5856d6 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Ask KhataCopilot Operations AI
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              Deterministic reasoning over 15 retail stores, 30 days of sales logs, and customer khata ledgers.
            </div>
          </div>
        </div>

        <button
          onClick={() => onNavigateToTab('ai-insights')}
          className="apple-btn apple-btn-primary"
          style={{ fontSize: '13px', padding: '7px 16px' }}
        >
          <span>Open AI Copilot</span>
          <ArrowRight size={14} />
        </button>
      </div>

    </div>
  );
};
