import React from 'react';
import { Shop, StaffActivity } from '../types';
import { 
  UserCheck, 
  Clock, 
  ShieldAlert, 
  IndianRupee, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

interface StaffViewProps {
  shops: Shop[];
  staffActivities: StaffActivity[];
  onSelectShop: (shop: Shop) => void;
}

export const StaffView: React.FC<StaffViewProps> = ({
  shops,
  staffActivities,
  onSelectShop
}) => {
  const varianceShops = shops.filter((s) => s.cash_variance_today < -300);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 1. Cash Variance Monitoring Section */}
      <div className="apple-glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
              Cash Drawer Variance & Reconciliation
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Daily tracking of physical cash-in-hand vs. POS-reported billing to catch shortages immediately.
            </p>
          </div>

          <span className="apple-badge apple-badge-atrisk">
            {varianceShops.length} Branches with Shortages Flagged
          </span>
        </div>

        <div className="apple-table-container">
          <table className="apple-table">
            <thead>
              <tr>
                <th>Branch Shop</th>
                <th>Store Manager</th>
                <th style={{ textAlign: 'right' }}>Expected Cash</th>
                <th style={{ textAlign: 'right' }}>Actual Cash Counted</th>
                <th style={{ textAlign: 'right' }}>Discrepancy (Variance)</th>
                <th style={{ textAlign: 'center' }}>Variance %</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => {
                const variance = shop.cash_variance_today;
                const isShort = variance < -1000;
                const expected = shop.cash_expected_today;
                const actual = shop.cash_actual_today;
                const variancePct = expected > 0 ? ((Math.abs(variance) / expected) * 100).toFixed(1) : '0.0';

                return (
                  <tr key={shop.id}>
                    <td>
                      <strong style={{ color: 'var(--text-primary)' }}>{shop.name}</strong>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>{shop.location}</div>
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>{shop.manager_name}</td>
                    <td style={{ textAlign: 'right', fontWeight: '500' }}>₹{expected.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: '500' }}>₹{actual.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: isShort ? 'var(--apple-red)' : (variance < 0 ? 'var(--apple-orange)' : 'var(--apple-green)') }}>
                      {variance < 0 ? `-₹${Math.abs(variance).toLocaleString('en-IN')}` : `+₹${variance}`}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        background: isShort ? 'var(--apple-red-tint)' : 'rgba(118, 118, 128, 0.08)',
                        color: isShort ? 'var(--apple-red)' : 'var(--text-secondary)'
                      }}>
                        {variance < 0 ? `-${variancePct}%` : '0%'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => onSelectShop(shop)}
                        className="apple-btn apple-btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '11.5px' }}
                      >
                        {isShort ? 'Audit Drawer' : 'View Store'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2. Real-Time Cashier Activity Stream */}
      <div className="apple-glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Live Cashier & POS Terminal Audit Stream
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
              Real-time events: Voice orders, UPI payments, credit settlements, and inventory adjustments.
            </p>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--apple-green)', fontWeight: '600' }}>
            ● KhataPOS Live Socket Connected
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {staffActivities.map((act) => (
            <div
              key={act.id}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(118, 118, 128, 0.04)',
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
                  background: act.category === 'cash_reconciliation' ? 'var(--apple-red-tint)' : (act.category === 'voice_order' ? 'var(--apple-purple-tint)' : 'var(--apple-blue-tint)'),
                  color: act.category === 'cash_reconciliation' ? 'var(--apple-red)' : (act.category === 'voice_order' ? 'var(--apple-purple)' : 'var(--apple-blue)'),
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
                    Staff: <strong>{act.staff_name}</strong> ({act.role}) • {act.metadata}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                {act.amount !== undefined && (
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: act.amount < 0 ? 'var(--apple-red)' : 'var(--apple-green)'
                  }}>
                    {act.amount < 0 ? `-₹${Math.abs(act.amount).toLocaleString('en-IN')}` : `₹${act.amount.toLocaleString('en-IN')}`}
                  </div>
                )}
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{act.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
