import React, { useState } from 'react';
import { Anomaly, Shop } from '../types';
import { 
  AlertTriangle, 
  X, 
  ShieldAlert, 
  TrendingDown, 
  CreditCard, 
  Package, 
  ArrowRight, 
  Check, 
  BellRing,
  ExternalLink
} from 'lucide-react';

interface AnomalyCenterProps {
  anomalies: Anomaly[];
  shops: Shop[];
  onSelectShop: (shop: Shop) => void;
  onClose: () => void;
}

export const AnomalyCenter: React.FC<AnomalyCenterProps> = ({
  anomalies,
  shops,
  onSelectShop,
  onClose
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [actionDone, setActionDone] = useState<{ [id: string]: boolean }>({});

  const filteredAnomalies = filterType === 'all' 
    ? anomalies 
    : anomalies.filter((a) => a.type === filterType);

  const handleAction = (id: string, actionLabel: string, shopName: string) => {
    setActionDone((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      alert(`Action "${actionLabel}" triggered for ${shopName}. Notification sent to Store Manager and HQ Audit log updated.`);
    }, 100);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'CASH_VARIANCE':
        return <ShieldAlert size={18} color="var(--apple-red)" />;
      case 'REVENUE_DROP':
        return <TrendingDown size={18} color="var(--apple-orange)" />;
      case 'UDHAAR_DEFAULT_RISK':
        return <CreditCard size={18} color="var(--apple-red)" />;
      case 'STOCKOUT_IMMINENT':
        return <Package size={18} color="var(--apple-orange)" />;
      default:
        return <AlertTriangle size={18} color="var(--apple-orange)" />;
    }
  };

  return (
    <div className="apple-modal-overlay" onClick={onClose}>
      <div 
        className="apple-modal-container" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '850px', maxHeight: '90vh' }}
      >
        {/* Drawer Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-glass-header)',
          backdropFilter: 'var(--backdrop-blur)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--apple-red-tint)',
              color: 'var(--apple-red)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BellRing size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                Autonomous Risk & Anomaly Radar
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
                Auto-detected {anomalies.length} high-priority operational discrepancies across retail branches
              </p>
            </div>
          </div>

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

        {/* Filter Pills */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '8px',
          background: 'rgba(118, 118, 128, 0.02)'
        }}>
          <button
            onClick={() => setFilterType('all')}
            style={{
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              background: filterType === 'all' ? 'var(--apple-blue-tint)' : 'transparent',
              border: filterType === 'all' ? '1px solid var(--apple-blue)' : '1px solid var(--border-subtle)',
              color: filterType === 'all' ? 'var(--apple-blue)' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontWeight: filterType === 'all' ? '600' : 'normal'
            }}
          >
            All Flags ({anomalies.length})
          </button>
          <button
            onClick={() => setFilterType('CASH_VARIANCE')}
            style={{
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              background: filterType === 'CASH_VARIANCE' ? 'var(--apple-red-tint)' : 'transparent',
              border: filterType === 'CASH_VARIANCE' ? '1px solid var(--apple-red)' : '1px solid var(--border-subtle)',
              color: filterType === 'CASH_VARIANCE' ? 'var(--apple-red)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Cash Variance
          </button>
          <button
            onClick={() => setFilterType('REVENUE_DROP')}
            style={{
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              background: filterType === 'REVENUE_DROP' ? 'var(--apple-orange-tint)' : 'transparent',
              border: filterType === 'REVENUE_DROP' ? '1px solid var(--apple-orange)' : '1px solid var(--border-subtle)',
              color: filterType === 'REVENUE_DROP' ? 'var(--apple-orange)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Revenue Drops
          </button>
          <button
            onClick={() => setFilterType('UDHAAR_DEFAULT_RISK')}
            style={{
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              background: filterType === 'UDHAAR_DEFAULT_RISK' ? 'var(--apple-red-tint)' : 'transparent',
              border: filterType === 'UDHAAR_DEFAULT_RISK' ? '1px solid var(--apple-red)' : '1px solid var(--border-subtle)',
              color: filterType === 'UDHAAR_DEFAULT_RISK' ? 'var(--apple-red)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Udhaar Default Risk
          </button>
          <button
            onClick={() => setFilterType('STOCKOUT_IMMINENT')}
            style={{
              fontSize: '12px',
              padding: '4px 12px',
              borderRadius: 'var(--radius-pill)',
              background: filterType === 'STOCKOUT_IMMINENT' ? 'var(--apple-orange-tint)' : 'transparent',
              border: filterType === 'STOCKOUT_IMMINENT' ? '1px solid var(--apple-orange)' : '1px solid var(--border-subtle)',
              color: filterType === 'STOCKOUT_IMMINENT' ? 'var(--apple-orange)' : 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            Imminent Stockouts
          </button>
        </div>

        {/* Anomaly Cards List */}
        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredAnomalies.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
              No active anomalies in this category. All operations within normal bounds.
            </div>
          ) : (
            filteredAnomalies.map((anom) => {
              const shop = shops.find((s) => s.id === anom.shop_id);
              const isResolved = actionDone[anom.id];

              return (
                <div
                  key={anom.id}
                  style={{
                    padding: '18px 20px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-card-solid)',
                    border: `1px solid ${anom.severity === 'critical' ? 'rgba(255, 59, 48, 0.3)' : 'rgba(255, 149, 0, 0.3)'}`,
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    opacity: isResolved ? 0.65 : 1
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: anom.severity === 'critical' ? 'var(--apple-red-tint)' : 'var(--apple-orange-tint)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {getIcon(anom.type)}
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <strong style={{ fontSize: '15px', color: 'var(--text-primary)' }}>
                            {anom.title}
                          </strong>
                          <span className={`apple-badge apple-badge-${anom.severity === 'critical' ? 'atrisk' : 'watch'}`}>
                            {anom.severity.toUpperCase()}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          {anom.shop_name} ({anom.city}) • {anom.timestamp}
                        </span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: anom.severity === 'critical' ? 'var(--apple-red)' : 'var(--apple-orange)'
                      }}>
                        {anom.metric_delta}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0 }}>
                    {anom.message}
                  </p>

                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(118, 118, 128, 0.05)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    <strong>Auditing Evidence:</strong> {anom.reasoning}
                  </div>

                  {/* Actions footer */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '6px' }}>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      Baseline: <code>{anom.baseline_value}</code>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {shop && (
                        <button
                          onClick={() => {
                            onClose();
                            onSelectShop(shop);
                          }}
                          className="apple-btn apple-btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '12px' }}
                        >
                          <span>View Shop</span>
                          <ExternalLink size={12} />
                        </button>
                      )}

                      <button
                        onClick={() => handleAction(anom.id, anom.action_label, anom.shop_name)}
                        disabled={isResolved}
                        className={`apple-btn ${isResolved ? 'apple-btn-secondary' : 'apple-btn-primary'}`}
                        style={{ padding: '5px 14px', fontSize: '12px' }}
                      >
                        {isResolved ? (
                          <>
                            <Check size={13} />
                            <span>Action Taken</span>
                          </>
                        ) : (
                          <>
                            <ArrowRight size={13} />
                            <span>{anom.action_label}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
