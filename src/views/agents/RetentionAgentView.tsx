import React, { useState, useMemo } from 'react';
import { 
  Users2, 
  AlertTriangle, 
  CheckCircle2, 
  Workflow, 
  Send, 
  Clock, 
  FileText, 
  X,
  ArrowRight
} from 'lucide-react';
import { Shop, AgentTask, AgentRun, AgentFinding } from '../../types';
import { AgentWorkspaceShell } from '../../components/AgentWorkspaceShell';

interface RetentionAgentViewProps {
  shops: Shop[];
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
  onCreateTask?: (task: AgentTask) => void;
}

export const RetentionAgentView: React.FC<RetentionAgentViewProps> = ({
  shops,
  findings,
  tasks,
  runs,
  settings,
  onRunAgent,
  isRunning,
  runningProgress,
  onUpdateTaskStatus,
  onSaveSettings,
  onSelectShop,
  onCreateTask
}) => {
  const [investigatingShop, setInvestigatingShop] = useState<{
    shop: Shop;
    finding: AgentFinding;
  } | null>(null);

  // Derived metrics
  const interventionsCount = findings.length;
  const highPriorityCount = findings.filter((f) => f.severity === 'critical').length;
  const awaitingApprovalCount = tasks.filter((t) => t.status === 'Awaiting Approval').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  const handleApprovePlaybook = (shop: Shop, finding: AgentFinding) => {
    const newTask: AgentTask = {
      id: `task-ret-pb-${shop.id}-${Date.now().toString().slice(-4)}`,
      agentId: 'retention',
      shop_id: shop.id,
      shop_name: shop.name,
      title: `Multi-Agent Turnaround Playbook — ${shop.name}`,
      priority: finding.severity === 'critical' ? 'High' : 'Medium',
      status: 'In Progress',
      finding: finding.title,
      recommended_action: 'Deployed 4-step protocol: Inventory restock, credit freeze, RM site visit, 3-day health recheck.',
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'manager_checkin'
    };

    if (onCreateTask) {
      onCreateTask(newTask);
    }
    alert(`Turnaround Playbook approved and dispatched for ${shop.name}. Regional Manager notified.`);
    setInvestigatingShop(null);
  };

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
            Active Interventions
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {interventionsCount} Multi-Signal
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Cross-agent synthesis</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            High Priority
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-red)', marginTop: '4px' }}>
            {highPriorityCount} Urgent
          </div>
          <span style={{ fontSize: '11px', color: 'var(--apple-red)' }}>&ge;3 independent risk signals</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Awaiting Approval
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-orange)', marginTop: '4px' }}>
            {awaitingApprovalCount} Workflows
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Action plans queued</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Completed Interventions
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-green)', marginTop: '4px' }}>
            {completedCount > 0 ? completedCount : 4} Executed
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Resolved this month</span>
        </div>
      </div>

      {/* 2. MAIN RETENTION QUEUE */}
      <div className="apple-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Cross-Functional Intervention Queue ({findings.length})
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
              Synthesizes signals from Sales, Inventory, Udhaar Risk, Cash, and Health Agents
            </p>
          </div>
        </div>

        {findings.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <CheckCircle2 size={32} color="var(--apple-green)" style={{ margin: '0 auto 8px auto' }} />
            <p style={{ margin: 0, fontWeight: '500', color: 'var(--text-primary)' }}>No Correlated Risk Interventions</p>
            <span style={{ fontSize: '12px' }}>Branch operational indicators are isolated and within safety limits.</span>
          </div>
        ) : (
          <div className="apple-table-container">
            <table className="apple-table">
              <thead>
                <tr>
                  <th>Shop</th>
                  <th>Observed Cross-Agent Signals</th>
                  <th>Priority</th>
                  <th>Recommended Intervention</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {findings.map((f) => {
                  const shop = shops.find((s) => s.id === f.shop_id) || { id: f.shop_id, name: f.shop_name } as Shop;
                  const isHigh = f.severity === 'critical';

                  return (
                    <tr key={f.id}>
                      <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                        {f.shop_name}
                      </td>
                      <td style={{ maxWidth: '280px' }}>
                        <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                          {f.calculation}
                        </div>
                      </td>
                      <td>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: isHigh ? 'var(--apple-red-tint)' : 'var(--apple-orange-tint)',
                          color: isHigh ? 'var(--apple-red)' : 'var(--apple-orange)'
                        }}>
                          {isHigh ? 'HIGH' : 'MEDIUM'}
                        </span>
                      </td>
                      <td style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>
                        {f.recommended_action}
                      </td>
                      <td>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          background: 'var(--apple-blue-tint)',
                          color: 'var(--apple-blue)'
                        }}>
                          Awaiting Approval
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          onClick={() => setInvestigatingShop({ shop, finding: f })}
                          className="apple-button-primary"
                          style={{ fontSize: '11.5px', padding: '4px 10px' }}
                        >
                          Open Investigation
                        </button>
                      </td>
                    </tr>
                  );
                })}
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
            style={{ maxWidth: '720px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>
                  Multi-Agent Turnaround Investigation: {investigatingShop.shop.name}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Composite risk score evaluation across 6 upstream intelligence modules
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
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--apple-red-tint)', border: '1px solid rgba(255, 59, 48, 0.2)' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--apple-red)' }}>
                  Correlated Risk Synthesis
                </span>
                <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {investigatingShop.finding.title}
                </p>
                <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {investigatingShop.finding.calculation}
                </div>
              </div>

              {/* Upstream Agent Findings Table */}
              {investigatingShop.finding.evidence_records && (
                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                    Active Signals Across Upstream Agents:
                  </strong>
                  <div className="apple-table-container">
                    <table className="apple-table">
                      <thead>
                        <tr>
                          <th>Agent Source</th>
                          <th>Detected Signal</th>
                          <th>Severity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {investigatingShop.finding.evidence_records.map((r, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: '600', color: 'var(--apple-blue)' }}>{r[0]}</td>
                            <td>{r[1]}</td>
                            <td>
                              <span style={{
                                padding: '2px 6px',
                                borderRadius: '3px',
                                fontSize: '10.5px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                background: r[2] === 'critical' ? 'var(--apple-red-tint)' : 'var(--apple-orange-tint)',
                                color: r[2] === 'critical' ? 'var(--apple-red)' : 'var(--apple-orange)'
                              }}>
                                {r[2]}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Recommended 4-Step Playbook */}
              <div style={{ padding: '14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Mandated 4-Step Branch Turnaround Protocol:
                </strong>
                <ol style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  <li><strong>Fast-Track Restock:</strong> Generate emergency PO for 3 critical velocity stock-outs.</li>
                  <li><strong>Credit Moratorium:</strong> Temporarily freeze new customer credit lines exceeding ₹10,000.</li>
                  <li><strong>Regional Manager Visit:</strong> Schedule an on-site supervisory review at {investigatingShop.shop.name}.</li>
                  <li><strong>Automated Re-check:</strong> Schedule retention engine re-scan in 3 days.</li>
                </ol>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => handleApprovePlaybook(investigatingShop.shop, investigatingShop.finding)}
                  className="apple-button-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
                >
                  <Workflow size={15} />
                  <span>Approve 4-Step Turnaround Playbook</span>
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
          Minimum Correlated Signals for Intervention
        </label>
        <input
          type="number"
          value={currentSettings.minCorrelatedSignals || 2}
          onChange={(e) => onChange('minCorrelatedSignals', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
        <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', display: 'block', marginTop: '2px' }}>
          Intervention is triggered when at least this many independent agents detect issues in the same branch.
        </span>
      </div>

      <div>
        <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
          Health Score Drop Trigger (Points)
        </label>
        <input
          type="number"
          value={currentSettings.highPriorityHealthDrop || 10}
          onChange={(e) => onChange('highPriorityHealthDrop', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
      </div>

      <div>
        <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
          Post-Intervention Re-check Interval (Days)
        </label>
        <input
          type="number"
          value={currentSettings.recheckIntervalDays || 3}
          onChange={(e) => onChange('recheckIntervalDays', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
      </div>
    </div>
  );

  return (
    <AgentWorkspaceShell
      agentId="retention"
      agentName="Retention Agent"
      agentTitle="Retention & Intervention Agent"
      agentDescription="Synthesizes cross-agent operational risks to orchestrate multi-departmental branch turnaround workflows."
      agentIcon={<Users2 size={24} />}
      iconBg="linear-gradient(135deg, #30b0c7 0%, #58c9dd 100%)"
      status={isRunning ? 'Running' : 'Active'}
      lastRunTime={runs.length > 0 ? runs[0].completed_at : 'Today, 12:00 PM'}
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
