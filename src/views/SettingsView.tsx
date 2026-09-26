import React, { useState } from 'react';
import { Settings, Save, ShieldCheck, Bell, CreditCard, Store, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [cashVarianceLimit, setCashVarianceLimit] = useState(1000);
  const [udhaarOverdueThreshold, setUdhaarOverdueThreshold] = useState(30);
  const [stockoutBufferDays, setStockoutBufferDays] = useState(2.5);
  const [targetProfitMargin, setTargetProfitMargin] = useState(14.0);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div className="apple-glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
              Enterprise Platform & Risk Settings
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Configure autonomous anomaly detection thresholds, credit scoring boundaries, and notification policies.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="apple-btn apple-btn-primary"
            style={{ fontSize: '12.5px', padding: '6px 16px' }}
          >
            {saved ? <Check size={14} /> : <Save size={14} />}
            <span>{saved ? 'Settings Saved' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Thresholds Form Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: Cash Reconciliation Rules */}
        <div className="apple-glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
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
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Cash Drawer Reconciliation
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>POS physical tally parameters</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Cash Discrepancy Alert Threshold (₹)
              </label>
              <input
                type="number"
                value={cashVarianceLimit}
                onChange={(e) => setCashVarianceLimit(Number(e.target.value))}
                className="apple-input"
                style={{ marginTop: '6px', height: '36px' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Shortages exceeding this amount trigger immediate supervisor audit.
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Credit / Udhaar Scoring Rules */}
        <div className="apple-glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
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
              <CreditCard size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Udhaar Credit Limits & Aging
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Customer credit exposure</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Overdue Warning Threshold (Days)
              </label>
              <input
                type="number"
                value={udhaarOverdueThreshold}
                onChange={(e) => setUdhaarOverdueThreshold(Number(e.target.value))}
                className="apple-input"
                style={{ marginTop: '6px', height: '36px' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                Accounts unpaid past this duration trigger WhatsApp collection alerts.
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Inventory Stockout Buffer */}
        <div className="apple-glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
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
              <Store size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                Inventory Velocity Safety Stock
              </h3>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Days of supply runway</span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                Minimum Runway Buffer (Days)
              </label>
              <input
                type="number"
                step="0.5"
                value={stockoutBufferDays}
                onChange={(e) => setStockoutBufferDays(Number(e.target.value))}
                className="apple-input"
                style={{ marginTop: '6px', height: '36px' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                SKUs with runway below this threshold are marked for urgent reorder PO.
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
