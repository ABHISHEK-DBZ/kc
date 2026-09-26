import React, { useMemo, useState } from 'react';
import { Shop, UdhaarRecord, Customer } from '../types';
import { 
  CreditCard, 
  AlertTriangle, 
  Send, 
  Check, 
  Download, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { exportUdhaarAging } from '../services/exportService';

interface UdhaarViewProps {
  shops: Shop[];
  udhaarRecords: UdhaarRecord[];
  customers: Customer[];
  onSelectShop: (shop: Shop) => void;
}

export const UdhaarView: React.FC<UdhaarViewProps> = ({
  shops,
  udhaarRecords,
  customers,
  onSelectShop
}) => {
  const [reminderSent, setReminderSent] = useState<{ [id: string]: boolean }>({});

  // Calculate network-wide aging buckets
  const agingStats = useMemo(() => {
    const b0_7 = udhaarRecords.filter((u) => u.risk_category === '0-7d').reduce((sum, u) => sum + u.amount, 0);
    const b8_30 = udhaarRecords.filter((u) => u.risk_category === '8-30d').reduce((sum, u) => sum + u.amount, 0);
    const b31_60 = udhaarRecords.filter((u) => u.risk_category === '31-60d').reduce((sum, u) => sum + u.amount, 0);
    const b60plus = udhaarRecords.filter((u) => u.risk_category === '60d+').reduce((sum, u) => sum + u.amount, 0);
    const total = b0_7 + b8_30 + b31_60 + b60plus;

    return { b0_7, b8_30, b31_60, b60plus, total };
  }, [udhaarRecords]);

  // Top Risky Customers
  const riskyCustomers = useMemo(() => {
    return [...customers]
      .filter((c) => c.risk_level === 'Critical' || c.risk_level === 'High')
      .sort((a, b) => b.total_udhaar - a.total_udhaar);
  }, [customers]);

  // Shops with highest outstanding udhaar
  const highestUdhaarShops = useMemo(() => {
    return [...shops].sort((a, b) => b.udhaar_outstanding - a.udhaar_outstanding).slice(0, 5);
  }, [shops]);

  const handleSendReminder = (id: string, name: string, amount: number) => {
    setReminderSent((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      alert(`WhatsApp payment reminder link sent to ${name} for ₹${amount.toLocaleString('en-IN')}.`);
    }, 100);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Export */}
      <div className="apple-glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
              Udhaar Credit Risk & Aging Engine
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Real-time aging analysis across all branches, credit limit exposure, and collection effectiveness.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => exportUdhaarAging(udhaarRecords, 'All_Branches', 'csv')}
              className="apple-btn apple-btn-secondary"
              style={{ fontSize: '12.5px', padding: '6px 12px' }}
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => exportUdhaarAging(udhaarRecords, 'All_Branches', 'excel')}
              className="apple-btn apple-btn-secondary"
              style={{ fontSize: '12.5px', padding: '6px 12px' }}
            >
              <Download size={13} />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* 4 Aging Bucket Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '20px' }}>
          
          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--apple-green-tint)', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--apple-green)' }}>0–7 Days (Current)</span>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-green)', marginTop: '4px' }}>
              ₹{agingStats.b0_7.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {((agingStats.b0_7 / agingStats.total) * 100).toFixed(0)}% of total credit book
            </span>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--apple-blue-tint)', border: '1px solid rgba(0, 113, 227, 0.2)' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--apple-blue)' }}>8–30 Days (Due)</span>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-blue)', marginTop: '4px' }}>
              ₹{agingStats.b8_30.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {((agingStats.b8_30 / agingStats.total) * 100).toFixed(0)}% of total credit book
            </span>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--apple-orange-tint)', border: '1px solid rgba(255, 149, 0, 0.2)' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--apple-orange)' }}>31–60 Days (Warning)</span>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-orange)', marginTop: '4px' }}>
              ₹{agingStats.b31_60.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--apple-orange)' }}>
              {((agingStats.b31_60 / agingStats.total) * 100).toFixed(0)}% requiring collection nudge
            </span>
          </div>

          <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--apple-red-tint)', border: '1px solid rgba(255, 59, 48, 0.2)' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--apple-red)' }}>60+ Days (Critical Default)</span>
            <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-red)', marginTop: '4px' }}>
              ₹{agingStats.b60plus.toLocaleString('en-IN')}
            </div>
            <span style={{ fontSize: '11px', color: 'var(--apple-red)' }}>
              Freeze credit & initiate recovery
            </span>
          </div>

        </div>
      </div>

      {/* Two Column Layout: Top Risky Customers + Branch Exposure */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* Column 1: Top High-Risk Customers */}
        <div className="apple-glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Top Chronic Credit Defaulters
            </h3>
            <span style={{ fontSize: '11.5px', color: 'var(--apple-red)', fontWeight: '600' }}>
              {riskyCustomers.length} Accounts Overdue
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {riskyCustomers.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{c.name}</strong>
                    <span className="apple-badge apple-badge-atrisk" style={{ fontSize: '10px' }}>
                      {c.days_outstanding}d overdue
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    {c.phone} • {c.shop_name}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--apple-red)' }}>
                      ₹{c.total_udhaar.toLocaleString('en-IN')}
                    </div>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
                      Limit: ₹{c.credit_limit.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button
                    onClick={() => handleSendReminder(c.id, c.name, c.total_udhaar)}
                    disabled={reminderSent[c.id]}
                    className={`apple-btn ${reminderSent[c.id] ? 'apple-btn-secondary' : 'apple-btn-primary'}`}
                    style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  >
                    {reminderSent[c.id] ? <Check size={12} /> : <Send size={12} />}
                    <span>{reminderSent[c.id] ? 'Sent' : 'Ping'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Branches with Highest Udhaar Exposure */}
        <div className="apple-glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Branches with Highest Credit Exposure
            </h3>
            <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
              Ranked by Outstanding Volume
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {highestUdhaarShops.map((s) => (
              <div
                key={s.id}
                onClick={() => onSelectShop(s)}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(118, 118, 128, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card-solid)'}
              >
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {s.name}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                    {s.location} • Mgr: {s.manager_name}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: s.udhaar_outstanding > 120000 ? 'var(--apple-red)' : 'var(--text-primary)' }}>
                    ₹{s.udhaar_outstanding.toLocaleString('en-IN')}
                  </div>
                  <span className={`apple-badge apple-badge-${s.status.toLowerCase().replace('-', '')}`} style={{ fontSize: '10px' }}>
                    {s.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
