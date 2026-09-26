import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  TrendingDown, 
  BarChart2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  X,
  Search
} from 'lucide-react';
import { Shop, DailySales, AgentTask, AgentRun, AgentFinding } from '../../types';
import { AgentWorkspaceShell } from '../../components/AgentWorkspaceShell';

interface RevenueAnomalyAgentViewProps {
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

export const RevenueAnomalyAgentView: React.FC<RevenueAnomalyAgentViewProps> = ({
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
  const [inspectingAnomaly, setInspectingAnomaly] = useState<AgentFinding | null>(null);

  const highSeverityCount = useMemo(() => {
    return findings.filter((f) => f.severity === 'critical').length;
  }, [findings]);

  const branchesAffectedCount = useMemo(() => {
    return new Set(findings.map((f) => f.shop_id)).size;
  }, [findings]);

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
            Anomalies Detected
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: findings.length > 0 ? 'var(--apple-red)' : 'var(--apple-green)', marginTop: '4px' }}>
            {findings.length} Events
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Across 30-day window</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            High Severity
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-red)', marginTop: '4px' }}>
            {highSeverityCount} Critical
          </div>
          <span style={{ fontSize: '11px', color: 'var(--apple-red)' }}>Deviation &gt; 18%</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Branches Affected
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-orange)', marginTop: '4px' }}>
            {branchesAffectedCount} Branches
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Out of {shops.length} total</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Last Scan
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {runs.length > 0 ? runs[0].completed_at : 'Today, 11:45 AM'}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Statistical moving average</span>
        </div>
      </div>

      {/* 2. MAIN ANOMALY LIST */}
      <div className="apple-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Statistical Revenue Deviations ({findings.length})
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
              Comparison of 3-day rolling sales against 18-day historical branch baselines
            </p>
          </div>
        </div>

        {findings.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <CheckCircle size={32} color="var(--apple-green)" style={{ margin: '0 auto 8px auto' }} />
            <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-primary)' }}>No Statistical Deviations</p>
            <span style={{ fontSize: '12px' }}>All branches operating within standard Gaussian revenue bands.</span>
          </div>
        ) : (
          <div className="apple-table-container">
            <table className="apple-table">
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Current 3-Day Avg</th>
                  <th>Historical Baseline</th>
                  <th>Deviation %</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {findings.map((anomaly) => (
                  <tr key={anomaly.id}>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {anomaly.shop_name}
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {anomaly.metric_value}
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '12.5px' }}>
                      {anomaly.baseline}
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontWeight: '700',
                        fontSize: '13px',
                        color: 'var(--apple-red)'
                      }}>
                        <TrendingDown size={14} />
                        {anomaly.deviation}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: anomaly.severity === 'critical' ? 'var(--apple-red-tint)' : 'var(--apple-orange-tint)',
                        color: anomaly.severity === 'critical' ? 'var(--apple-red)' : 'var(--apple-orange)'
                      }}>
                        {anomaly.severity}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {anomaly.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setInspectingAnomaly(anomaly)}
                        className="apple-button-secondary"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                      >
                        Inspect Anomaly
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. INVESTIGATION DRAWER: WHY THIS WAS FLAGGED */}
      {inspectingAnomaly && (
        <div className="apple-modal-overlay" onClick={() => setInspectingAnomaly(null)}>
          <div 
            className="apple-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '720px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>
                  WHY THIS WAS FLAGGED: {inspectingAnomaly.shop_name}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Deviation: {inspectingAnomaly.deviation} vs moving baseline
                </span>
              </div>
              <button 
                onClick={() => setInspectingAnomaly(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              {/* Math Proof */}
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--apple-red-tint)', border: '1px solid rgba(255, 59, 48, 0.2)' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--apple-red)' }}>
                  Statistical Baseline Calculation
                </span>
                <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {inspectingAnomaly.calculation}
                </div>
              </div>

              {/* Supporting Table */}
              {inspectingAnomaly.evidence_records && (
                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                    Supporting DailySales Telemetry Records:
                  </strong>
                  <div className="apple-table-container">
                    <table className="apple-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Actual Revenue</th>
                          <th>Baseline Target</th>
                          <th>Transaction Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inspectingAnomaly.evidence_records.map((r, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: '500' }}>{r[0]}</td>
                            <td style={{ fontWeight: '600', color: 'var(--apple-red)' }}>{r[1]}</td>
                            <td style={{ color: 'var(--text-secondary)' }}>{r[2]}</td>
                            <td>{r[3]} bills</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Recommended Investigation:</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                  {inspectingAnomaly.recommended_action}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => setInspectingAnomaly(null)}
                  className="apple-button-primary"
                  style={{ fontSize: '12.5px', padding: '6px 14px' }}
                >
                  Close Inspection
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
          Anomaly Deviation Trigger Threshold (%)
        </label>
        <input
          type="number"
          value={currentSettings.deviationThresholdPct || 15}
          onChange={(e) => onChange('deviationThresholdPct', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
        <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', display: 'block', marginTop: '2px' }}>
          Negative deviation from baseline that triggers a statistical anomaly alert.
        </span>
      </div>

      <div>
        <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
          Baseline Evaluation Window (Days)
        </label>
        <input
          type="number"
          value={currentSettings.baselinePeriodDays || 30}
          onChange={(e) => onChange('baselinePeriodDays', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
      </div>
    </div>
  );

  return (
    <AgentWorkspaceShell
      agentId="revenue-anomaly"
      agentName="Revenue Anomaly Agent"
      agentTitle="Revenue Anomaly Agent"
      agentDescription="Detects statistical deviations in daily branch revenue baselines and flags localized sales drop-offs."
      agentIcon={<BarChart2 size={24} />}
      iconBg="linear-gradient(135deg, #af52de 0%, #da8fff 100%)"
      status={isRunning ? 'Running' : 'Active'}
      lastRunTime={runs.length > 0 ? runs[0].completed_at : 'Today, 11:45 AM'}
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
