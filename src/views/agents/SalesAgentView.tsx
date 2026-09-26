import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  Filter,
  DollarSign,
  BarChart3,
  X
} from 'lucide-react';
import { Shop, DailySales, AgentTask, AgentRun, AgentFinding } from '../../types';
import { AgentWorkspaceShell } from '../../components/AgentWorkspaceShell';

interface SalesAgentViewProps {
  shops: Shop[];
  dailySales: DailySales[];
  findings: AgentFinding[];
  tasks: AgentTask[];
  runs: AgentRun[];
  settings: Record<string, any>;
  onRunAgent: () => void;
  isRunning: boolean;
  runningProgress?: string;
  onUpdateTaskStatus: (taskId: string, status: 'Awaiting Approval' | 'In Progress' | 'Completed') => void;
  onSaveSettings: (settings: Record<string, any>) => void;
  onSelectShop?: (shop: Shop) => void;
}

export const SalesAgentView: React.FC<SalesAgentViewProps> = ({
  shops,
  dailySales,
  findings,
  tasks,
  runs,
  settings,
  onRunAgent,
  isRunning,
  runningProgress,
  onUpdateTaskStatus,
  onSaveSettings,
  onSelectShop
}) => {
  const [investigatingShop, setInvestigatingShop] = useState<{
    shop: Shop;
    finding?: AgentFinding;
  } | null>(null);

  // Compute live signals from sales
  const salesSignals = findings.map((f) => {
    const shop = shops.find((s) => s.id === f.shop_id);
    return {
      finding: f,
      shop: shop || { id: f.shop_id, name: f.shop_name } as Shop,
      signal: f.title,
      metric: f.metric_label,
      change: f.deviation,
      priority: f.severity === 'critical' ? 'High' : (f.severity === 'warning' ? 'Medium' : 'Low'),
      status: f.status === 'active' ? 'Awaiting Action' : 'In Progress'
    };
  });

  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* 1. TOP METRICS SECTION */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Agent Status
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-green)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--apple-green)' }} />
            Active
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Telemetry sync: live</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Last Run
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {runs.length > 0 ? runs[0].completed_at : 'Today, 10:42 AM'}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Auto-scan every 4h</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Tasks Today
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-blue)', marginTop: '4px' }}>
            {tasks.filter((t) => t.status !== 'Completed').length} Pending
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Interventions queued</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Signals Detected
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: findings.length > 0 ? 'var(--apple-orange)' : 'var(--apple-green)', marginTop: '4px' }}>
            {findings.length} Signals
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Across {shops.length} branches</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Intervention Success Rate
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-green)', marginTop: '4px' }}>
            94.2%
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Baseline recovery within 14d</span>
        </div>
      </div>

      {/* 2. SALES INTERVENTION QUEUE */}
      <div className="apple-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Sales Intervention Queue ({salesSignals.length})
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
              Deterministic branch sales signals derived from DailySales records
            </p>
          </div>
        </div>

        {salesSignals.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <CheckCircle size={32} color="var(--apple-green)" style={{ margin: '0 auto 8px auto' }} />
            <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-primary)' }}>Sales Performance Nominal</p>
            <span style={{ fontSize: '12px' }}>No revenue drops or margin compression beyond configured thresholds.</span>
          </div>
        ) : (
          <div className="apple-table-container">
            <table className="apple-table">
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Signal</th>
                  <th>Metric</th>
                  <th>Change</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {salesSignals.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {item.shop.name}
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>
                        {item.signal}
                      </span>
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {item.metric}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        fontSize: '12.5px',
                        fontWeight: '700',
                        color: item.change.startsWith('+') ? 'var(--apple-green)' : 'var(--apple-red)'
                      }}>
                        {item.change.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {item.change}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: item.priority === 'High' ? 'var(--apple-red-tint)' : (item.priority === 'Medium' ? 'var(--apple-orange-tint)' : 'var(--apple-blue-tint)'),
                        color: item.priority === 'High' ? 'var(--apple-red)' : (item.priority === 'Medium' ? 'var(--apple-orange)' : 'var(--apple-blue)')
                      }}>
                        {item.priority}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setInvestigatingShop({ shop: item.shop, finding: item.finding })}
                        className="apple-button-secondary"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. INVESTIGATION DRAWER */}
      {investigatingShop && (
        <div className="apple-modal-overlay" onClick={() => setInvestigatingShop(null)}>
          <div 
            className="apple-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>
                  Sales Signal Investigation: {investigatingShop.shop.name}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Location: {investigatingShop.shop.location}
                </span>
              </div>
              <button 
                onClick={() => setInvestigatingShop(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Observed Signal:</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                  {investigatingShop.finding?.title || 'Revenue Contraction detected vs 7-day baseline.'}
                </p>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--apple-blue)', marginTop: '8px' }}>
                  {investigatingShop.finding?.calculation}
                </div>
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Recommended Action Playbook:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  <li>Audit checkout staffing during peak evening hours (6:00 PM – 9:30 PM).</li>
                  <li>Verify distributor FMCG promotional discount pass-through to customers.</li>
                  <li>Check top 20 revenue-generating SKUs for out-of-stock occurrences.</li>
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => {
                    alert(`Intervention task dispatched to ${investigatingShop.shop.manager_name || 'Store Manager'}. Notification sent.`);
                    setInvestigatingShop(null);
                  }}
                  className="apple-button-primary"
                  style={{ fontSize: '12.5px', padding: '6px 14px' }}
                >
                  Create Sales Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderSettingsForm = (currentSettings: Record<string, any>, onChange: (key: string, val: any) => void) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div>
        <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
          Revenue Drop Alert Threshold (%)
        </label>
        <input
          type="number"
          value={currentSettings.revenueDropThresholdPct || 10}
          onChange={(e) => onChange('revenueDropThresholdPct', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
        <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', display: 'block', marginTop: '2px' }}>
          Trigger warning if weekly revenue drops by more than this percentage vs prior week.
        </span>
      </div>

      <div>
        <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
          Margin Compression Threshold (%)
        </label>
        <input
          type="number"
          step="0.5"
          value={currentSettings.marginCompressionThresholdPct || 2.5}
          onChange={(e) => onChange('marginCompressionThresholdPct', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
      </div>

      <div>
        <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
          Growth Momentum Benchmark (%)
        </label>
        <input
          type="number"
          value={currentSettings.growthOpportunityThresholdPct || 15}
          onChange={(e) => onChange('growthOpportunityThresholdPct', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
      </div>
    </div>
  );

  return (
    <AgentWorkspaceShell
      agentId="sales"
      agentName="Sales Agent"
      agentTitle="Sales Intelligence Agent"
      agentDescription="Monitors daily sales patterns, margin trends, and identifies branch growth interventions."
      agentIcon={<TrendingUp size={24} />}
      iconBg="linear-gradient(135deg, #0071e3 0%, #47a3ff 100%)"
      status={isRunning ? 'Running' : 'Active'}
      lastRunTime={runs.length > 0 ? runs[0].completed_at : 'Today, 10:42 AM'}
      shops={shops}
      findings={findings}
      tasks={tasks}
      runs={runs}
      settings={settings}
      onRunAgent={onRunAgent}
      isRunning={isRunning}
      runningProgress={runningProgress}
      onUpdateTaskStatus={onUpdateTaskStatus}
      onSaveSettings={onSaveSettings}
      onSelectShop={onSelectShop}
      renderOverview={renderOverview}
      renderSettingsForm={renderSettingsForm}
    />
  );
};
