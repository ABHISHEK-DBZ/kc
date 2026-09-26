import React, { useState, useMemo } from 'react';
import { AlertItem, Shop } from '../types';
import { 
  AlertTriangle, 
  ShieldAlert, 
  TrendingDown, 
  CreditCard, 
  Package, 
  UserCheck, 
  Check, 
  ExternalLink, 
  ArrowRight,
  Filter
} from 'lucide-react';

interface AlertsViewProps {
  alerts: AlertItem[];
  shops: Shop[];
  onSelectShop: (shop: Shop) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({ alerts, shops, onSelectShop }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [actionDone, setActionDone] = useState<{ [id: string]: boolean }>({});

  const filteredAlerts = useMemo(() => {
    return alerts.filter((a) => {
      const matchCat = selectedCategory === 'all' || a.category === selectedCategory;
      const matchSev = selectedSeverity === 'all' || a.severity === selectedSeverity;
      return matchCat && matchSev;
    });
  }, [alerts, selectedCategory, selectedSeverity]);

  const handleAction = (id: string, actionText: string, shopName: string) => {
    setActionDone((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      alert(`Action "${actionText}" executed for ${shopName}. Operational audit log updated.`);
    }, 100);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'revenue':
        return <TrendingDown size={17} color="var(--apple-red)" />;
      case 'udhaar':
        return <CreditCard size={17} color="var(--apple-orange)" />;
      case 'inventory':
        return <Package size={17} color="var(--apple-orange)" />;
      case 'cash':
        return <ShieldAlert size={17} color="var(--apple-red)" />;
      case 'staff':
        return <UserCheck size={17} color="var(--apple-blue)" />;
      default:
        return <AlertTriangle size={17} color="var(--apple-orange)" />;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div className="apple-glass-panel" style={{ padding: '22px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                Centralized Operations & Risk Radar
              </h2>
              <span style={{
                fontSize: '12px',
                padding: '2px 8px',
                borderRadius: '9999px',
                background: 'var(--apple-red-tint)',
                color: 'var(--apple-red)',
                fontWeight: '700'
              }}>
                {filteredAlerts.length} Active Alerts
              </span>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
              Autonomous detection of cash variances, revenue drops, credit defaults, and velocity stockouts with recommended remediation.
            </p>
          </div>
        </div>

        {/* Filter bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(118, 118, 128, 0.04)',
          borderRadius: 'var(--radius-md)'
        }}>
          {/* Category Tabs */}
          <div className="apple-segmented-control">
            <button className={`apple-segment-item ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => setSelectedCategory('all')}>All ({alerts.length})</button>
            <button className={`apple-segment-item ${selectedCategory === 'revenue' ? 'active' : ''}`} onClick={() => setSelectedCategory('revenue')}>Revenue</button>
            <button className={`apple-segment-item ${selectedCategory === 'inventory' ? 'active' : ''}`} onClick={() => setSelectedCategory('inventory')}>Inventory</button>
            <button className={`apple-segment-item ${selectedCategory === 'udhaar' ? 'active' : ''}`} onClick={() => setSelectedCategory('udhaar')}>Udhaar</button>
            <button className={`apple-segment-item ${selectedCategory === 'cash' ? 'active' : ''}`} onClick={() => setSelectedCategory('cash')}>Cash</button>
          </div>

          {/* Severity selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              style={{
                padding: '5px 12px',
                fontSize: '12.5px',
                borderRadius: 'var(--radius-pill)',
                border: '1px solid var(--border-subtle)',
                background: 'var(--bg-card-solid)',
                color: 'var(--text-primary)',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredAlerts.length === 0 ? (
          <div className="apple-glass-panel" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            No active alerts in this category. All branch metrics within normal limits.
          </div>
        ) : (
          filteredAlerts.map((a) => {
            const shop = shops.find((s) => s.id === a.shop_id);
            const isResolved = actionDone[a.id];

            return (
              <div
                key={a.id}
                className="apple-glass-panel"
                style={{
                  padding: '20px',
                  border: `1px solid ${a.severity === 'critical' ? 'rgba(255, 59, 48, 0.3)' : 'rgba(255, 149, 0, 0.3)'}`,
                  opacity: isResolved ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '8px',
                      background: a.severity === 'critical' ? 'var(--apple-red-tint)' : 'var(--apple-orange-tint)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {getCategoryIcon(a.category)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: 'var(--text-primary)' }}>
                          {a.title}
                        </span>
                        <span className={`apple-badge apple-badge-${a.severity === 'critical' ? 'atrisk' : 'watch'}`}>
                          {a.severity.toUpperCase()}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                        {a.shop_name} • {a.timestamp}
                      </div>
                    </div>
                  </div>

                  <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                    Category: <strong style={{ textTransform: 'capitalize' }}>{a.category}</strong>
                  </span>
                </div>

                <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', margin: 0 }}>
                  {a.message}
                </p>

                {/* Evidence / Reason Box */}
                <div style={{
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(118, 118, 128, 0.05)',
                  fontSize: '12px',
                  color: 'var(--text-secondary)'
                }}>
                  <div><strong>Root Cause Reason:</strong> {a.reason}</div>
                  <div style={{ marginTop: '4px' }}><strong>Supporting Evidence:</strong> {a.supporting_data}</div>
                </div>

                {/* Footer Action */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    Recommended: <strong style={{ color: 'var(--text-primary)' }}>{a.recommended_action}</strong>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {shop && (
                      <button
                        onClick={() => onSelectShop(shop)}
                        className="apple-btn apple-btn-secondary"
                        style={{ padding: '5px 12px', fontSize: '12px' }}
                      >
                        <span>Drill Down</span>
                        <ExternalLink size={12} />
                      </button>
                    )}

                    <button
                      onClick={() => handleAction(a.id, a.recommended_action, a.shop_name)}
                      disabled={isResolved}
                      className={`apple-btn ${isResolved ? 'apple-btn-secondary' : 'apple-btn-primary'}`}
                      style={{ padding: '5px 14px', fontSize: '12px' }}
                    >
                      {isResolved ? (
                        <>
                          <Check size={12} />
                          <span>Remediated</span>
                        </>
                      ) : (
                        <>
                          <ArrowRight size={12} />
                          <span>Execute Action</span>
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
  );
};
