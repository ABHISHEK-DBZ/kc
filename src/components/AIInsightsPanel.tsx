import React, { useState } from 'react';
import { 
  Shop, 
  DailySales, 
  UdhaarRecord, 
  InventoryItem, 
  AIQueryResponse,
  NavigationTab
} from '../types';
import { queryAIInsights } from '../services/analyticsEngine';
import { exportShopsSummary } from '../services/exportService';
import { 
  Sparkles, 
  Search, 
  ArrowRight, 
  Calculator, 
  CheckCircle, 
  ExternalLink, 
  HelpCircle,
  X,
  ChevronDown,
  ChevronUp,
  Download,
  Table,
  Check
} from 'lucide-react';

interface AIInsightsPanelProps {
  shops: Shop[];
  dailySales: DailySales[];
  udhaarRecords: UdhaarRecord[];
  inventoryItems: InventoryItem[];
  onSelectShop: (shop: Shop) => void;
  onNavigateToAgent?: (agentTab: NavigationTab) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({
  shops,
  dailySales,
  udhaarRecords,
  inventoryItems,
  onSelectShop,
  onNavigateToAgent,
  onClose,
  isModal = false
}) => {
  const [queryInput, setQueryInput] = useState('');
  const [activeQuery, setActiveQuery] = useState('Which shops need immediate attention?');
  const [isComputing, setIsComputing] = useState(false);
  const [showEvidence, setShowEvidence] = useState(true);
  const [result, setResult] = useState<AIQueryResponse>(() => 
    queryAIInsights('Which shops need immediate attention?', shops, dailySales, udhaarRecords, inventoryItems)
  );

  const sampleQueries = [
    'Which shops need immediate attention?',
    'Which shops have the lowest profit this week?',
    'Which branches have rising udhaar risk?',
    'Which shop needs restocking urgently?',
    'Compare Pune shops vs Mumbai shops',
    'Which shops have unusually high cash variance?',
    'Which shops have revenue falling for 3 consecutive days?'
  ];

  const handleRunQuery = (queryString: string) => {
    if (!queryString.trim()) return;
    setActiveQuery(queryString);
    setIsComputing(true);

    setTimeout(() => {
      const computedResult = queryAIInsights(queryString, shops, dailySales, udhaarRecords, inventoryItems);
      setResult(computedResult);
      setIsComputing(false);
      setShowEvidence(true);
    }, 280);
  };

  const content = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header & Agent Badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #0071e3 0%, #5856d6 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles size={17} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                  KhataCopilot AI Intelligence & Reasoning Engine
                </h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: 'rgba(88, 86, 214, 0.12)',
                  color: 'var(--apple-indigo)'
                }}>
                  {result.agent_name || 'Specialized Agent'}
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                Deterministic mathematical reasoning over 15 retail stores, 30 days of sales records, and customer credit ledgers.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => exportShopsSummary(shops, 'csv')}
            className="apple-btn apple-btn-secondary"
            style={{ fontSize: '12px', padding: '5px 10px' }}
            title="Export query audit report as CSV"
          >
            <Download size={13} />
            <span>Export Report</span>
          </button>

          {isModal && onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'rgba(118, 118, 128, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Query Search Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleRunQuery(queryInput);
        }}
        style={{ display: 'flex', gap: '8px' }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '13px', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Ask business questions (e.g. 'Which shops need immediate attention?', 'Which shop needs restocking urgently?')..."
            className="apple-input"
            style={{ paddingLeft: '40px', paddingRight: '14px', height: '42px', fontSize: '14px' }}
          />
        </div>
        <button
          type="submit"
          className="apple-btn apple-btn-primary"
          style={{ height: '42px', padding: '0 20px', fontSize: '13.5px' }}
        >
          <span>Calculate</span>
          <ArrowRight size={14} />
        </button>
      </form>

      {/* Suggested Prompt Chips */}
      <div>
        <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Deterministic Operational Prompts:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
          {sampleQueries.map((q) => (
            <button
              key={q}
              onClick={() => {
                setQueryInput(q);
                handleRunQuery(q);
              }}
              style={{
                fontSize: '12px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-pill)',
                background: activeQuery === q ? 'var(--apple-blue-tint)' : 'rgba(118, 118, 128, 0.08)',
                border: activeQuery === q ? '1px solid var(--apple-blue)' : '1px solid var(--border-subtle)',
                color: activeQuery === q ? 'var(--apple-blue)' : 'var(--text-secondary)',
                cursor: 'pointer',
                fontWeight: activeQuery === q ? '600' : 'normal',
                transition: 'all var(--transition-fast)'
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* COMPUTATION OUTPUT */}
      {isComputing ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: 'rgba(118, 118, 128, 0.04)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            border: '3px solid rgba(0, 113, 227, 0.2)',
            borderTopColor: 'var(--apple-blue)',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            margin: '0 auto 12px'
          }}></div>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Executing specialized intelligence rules across 15 store ledgers...
          </span>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Summary Answer Card */}
          <div style={{
            padding: '18px 20px',
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '15px', color: 'var(--text-primary)', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{
                __html: result.summary.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              }}
            />
          </div>

          {/* Reasoning & Evidence Accordion ("Why?" section per spec) */}
          <div style={{
            padding: '16px 20px',
            background: 'rgba(0, 113, 227, 0.04)',
            border: '1px solid rgba(0, 113, 227, 0.18)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calculator size={15} color="var(--apple-blue)" />
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--apple-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Mathematical Proof & Analytical Evidence
                </span>
              </div>

              <button
                onClick={() => setShowEvidence(!showEvidence)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--apple-blue)',
                  fontSize: '12px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>{showEvidence ? 'Hide Reasoning' : 'Why? Show Reasoning'}</span>
                {showEvidence ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {showEvidence && (
              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.5', margin: 0 }}>
                  {result.reasoning}
                </p>

                <div style={{
                  padding: '6px 10px',
                  background: 'rgba(0, 113, 227, 0.08)',
                  borderRadius: 'var(--radius-xs)',
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono-apple)',
                  color: 'var(--apple-blue)'
                }}>
                  <strong>Formula:</strong> {result.formula}
                </div>

                {/* Supporting Records Table if present */}
                {result.supporting_records && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      {result.supporting_records.title}
                    </div>
                    <div className="apple-table-container">
                      <table className="apple-table" style={{ background: 'var(--bg-card-solid)' }}>
                        <thead>
                          <tr>
                            {result.supporting_records.headers.map((h, i) => (
                              <th key={i}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {result.supporting_records.rows.map((row, ri) => (
                            <tr key={ri}>
                              {row.map((val, ci) => (
                                <td key={ci} style={{ fontWeight: ci === 0 ? '600' : 'normal' }}>
                                  {val}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Computed Data Points Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px'
          }}>
            {result.data_points.map((pt, i) => (
              <div
                key={i}
                style={{
                  padding: '14px',
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{pt.label}</span>
                  {pt.status && (
                    <span className={`apple-badge apple-badge-${pt.status.toLowerCase().replace('-', '')}`} style={{ fontSize: '10px' }}>
                      {pt.status}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {pt.value}
                </div>
                {pt.subtext && (
                  <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {pt.subtext}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Affected Shops & One-Click Actions */}
          {result.affected_shops.length > 0 && (
            <div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                Target Branches & Remediation Actions:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                {result.affected_shops.map((aff) => {
                  const targetShop = shops.find((s) => s.id === aff.shop_id);
                  return (
                    <div
                      key={aff.shop_id}
                      style={{
                        padding: '12px 16px',
                        background: 'rgba(118, 118, 128, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px'
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)' }}>{aff.shop_name}</strong>
                        <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          {aff.metric_label}: <span style={{ color: 'var(--apple-blue)', fontWeight: '600' }}>{aff.metric_value}</span>
                        </div>
                        {aff.evidence && (
                          <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Evidence: {aff.evidence}
                          </div>
                        )}
                      </div>

                      {targetShop && (
                        <button
                          onClick={() => onSelectShop(targetShop)}
                          className="apple-btn apple-btn-secondary"
                          style={{ padding: '5px 12px', fontSize: '12px' }}
                        >
                          <span>Open Shop CRM</span>
                          <ExternalLink size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recommended Operational Steps */}
          {result.recommended_actions.length > 0 && (
            <div style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(52, 199, 89, 0.06)',
              border: '1px solid rgba(52, 199, 89, 0.2)'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--apple-green)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                AI Recommended Operational Remediation:
              </span>
              <ul style={{ margin: '8px 0 0 16px', padding: 0, fontSize: '12.5px', color: 'var(--text-primary)' }}>
                {result.recommended_actions.map((act, idx) => (
                  <li key={idx} style={{ marginBottom: '4px' }}>{act}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Direct Link to Dedicated Specialized Agent */}
          {onNavigateToAgent && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--apple-blue-tint)',
              border: '1px solid rgba(0, 113, 227, 0.2)'
            }}>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--apple-blue)' }}>
                  Continuous Operational Automation Available
                </span>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  Switch to the dedicated workspace for automated task dispatching, run audits, and threshold configurations.
                </p>
              </div>

              <button
                onClick={() => {
                  const name = result.agent_name?.toLowerCase() || '';
                  if (name.includes('health')) onNavigateToAgent('agent-shop-health');
                  else if (name.includes('inventory')) onNavigateToAgent('agent-inventory');
                  else if (name.includes('udhaar')) onNavigateToAgent('agent-udhaar-risk');
                  else if (name.includes('anomaly')) onNavigateToAgent('agent-revenue-anomaly');
                  else if (name.includes('cash')) onNavigateToAgent('agent-cash-risk');
                  else onNavigateToAgent('agent-sales');
                }}
                className="apple-button-primary"
                style={{ fontSize: '12px', padding: '6px 14px', whiteSpace: 'nowrap' }}
              >
                Open Dedicated Agent &rarr;
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );

  if (isModal) {
    return (
      <div className="apple-modal-overlay" onClick={onClose}>
        <div
          className="apple-modal-container"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: '850px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}
        >
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="apple-glass-panel" style={{ padding: '24px' }}>
      {content}
    </div>
  );
};
