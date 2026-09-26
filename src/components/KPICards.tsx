import React from 'react';
import { 
  TrendingUp, 
  IndianRupee, 
  CreditCard, 
  Store, 
  AlertOctagon, 
  Percent,
  Wallet
} from 'lucide-react';

interface KPICardsProps {
  totalRevenue: number;
  totalProfit: number;
  avgMarginPct: number;
  totalUdhaar: number;
  activeShopsCount: number;
  criticalStockAlerts: number;
  cashVarianceTotal: number;
  atRiskCount: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  totalRevenue,
  totalProfit,
  avgMarginPct,
  totalUdhaar,
  activeShopsCount,
  criticalStockAlerts,
  cashVarianceTotal,
  atRiskCount
}) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
      gap: '16px',
      marginBottom: '24px'
    }}>
      {/* 1. Total Daily Revenue */}
      <div className="apple-glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
            Network Daily Revenue
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--apple-blue-tint)',
            color: 'var(--apple-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IndianRupee size={17} />
          </div>
        </div>
        <div style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
          ₹{totalRevenue.toLocaleString('en-IN')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <span style={{
            fontSize: '11.5px',
            fontWeight: '600',
            color: 'var(--apple-green)',
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <TrendingUp size={12} /> +6.4%
          </span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>vs last week avg</span>
        </div>
      </div>

      {/* 2. Total Net Daily Profit & Margin */}
      <div className="apple-glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
            Total Net Profit (Daily)
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--apple-green-tint)',
            color: 'var(--apple-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Percent size={17} />
          </div>
        </div>
        <div style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
          ₹{totalProfit.toLocaleString('en-IN')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <span style={{
            fontSize: '11.5px',
            fontWeight: '600',
            color: 'var(--apple-green)',
            padding: '2px 7px',
            background: 'var(--apple-green-tint)',
            borderRadius: '9999px'
          }}>
            {avgMarginPct.toFixed(1)}% blended margin
          </span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>Target 14%</span>
        </div>
      </div>

      {/* 3. Total Outstanding Udhaar (Credit) */}
      <div className="apple-glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
            Total Udhaar (Credit)
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'var(--apple-orange-tint)',
            color: 'var(--apple-orange)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CreditCard size={17} />
          </div>
        </div>
        <div style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
          ₹{totalUdhaar.toLocaleString('en-IN')}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <span style={{
            fontSize: '11.5px',
            fontWeight: '600',
            color: 'var(--apple-orange)',
            padding: '2px 7px',
            background: 'var(--apple-orange-tint)',
            borderRadius: '9999px'
          }}>
            {atRiskCount} branches flagged
          </span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>CEI: 91.2%</span>
        </div>
      </div>

      {/* 4. Active Shops & Health */}
      <div className="apple-glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
            Active Shops Online
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(88, 86, 214, 0.12)',
            color: 'var(--apple-indigo)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Store size={17} />
          </div>
        </div>
        <div style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
          {activeShopsCount} <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-tertiary)' }}>Branches</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <span style={{
            fontSize: '11.5px',
            fontWeight: '600',
            color: 'var(--apple-green)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--apple-green)' }}></span>
            100% Khata Sync
          </span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>0 offline POS</span>
        </div>
      </div>

      {/* 5. Inventory Stock Alerts & Cash Variance */}
      <div className="apple-glass-panel" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-secondary)' }}>
            Critical Stock & Cash Flags
          </span>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: criticalStockAlerts > 0 ? 'var(--apple-red-tint)' : 'var(--apple-green-tint)',
            color: criticalStockAlerts > 0 ? 'var(--apple-red)' : 'var(--apple-green)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <AlertOctagon size={17} />
          </div>
        </div>
        <div style={{ fontSize: '26px', fontWeight: '700', letterSpacing: '-0.5px', color: 'var(--text-primary)' }}>
          {criticalStockAlerts} <span style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-tertiary)' }}>SKUs Low</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
          <span style={{
            fontSize: '11.5px',
            fontWeight: '600',
            color: cashVarianceTotal < -1000 ? 'var(--apple-red)' : 'var(--text-secondary)'
          }}>
            {cashVarianceTotal < 0 ? `-₹${Math.abs(cashVarianceTotal).toLocaleString('en-IN')}` : `+₹${cashVarianceTotal}`} Net Variance
          </span>
          <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>daily register</span>
        </div>
      </div>
    </div>
  );
};
