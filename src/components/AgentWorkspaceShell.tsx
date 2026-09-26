import React, { useState } from 'react';
import { 
  Play, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Layers, 
  ListTodo, 
  Search, 
  Check, 
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Cpu,
  RefreshCw,
  X
} from 'lucide-react';
import { AgentId, AgentTask, AgentRun, AgentFinding, Shop } from '../types';

export interface AgentWorkspaceShellProps {
  agentId: AgentId;
  agentName: string;
  agentTitle: string;
  agentDescription: string;
  agentIcon: React.ReactNode;
  iconBg: string;
  status: 'Active' | 'Running' | 'Idle';
  lastRunTime?: string;
  shops: Shop[];
  findings: AgentFinding[];
  tasks: AgentTask[];
  runs: AgentRun[];
  settings: Record<string, any>;
  onRunAgent: () => void;
  isRunning: boolean;
  runningProgress?: string;
  onUpdateTaskStatus: (taskId: string, status: 'Awaiting Approval' | 'In Progress' | 'Completed') => void;
  onSaveSettings: (newSettings: Record<string, any>) => void;
  onSelectShop?: (shop: Shop) => void;
  renderOverview: () => React.ReactNode;
  renderSettingsForm: (currentSettings: Record<string, any>, onChange: (key: string, val: any) => void) => React.ReactNode;
}

export const AgentWorkspaceShell: React.FC<AgentWorkspaceShellProps> = ({
  agentId,
  agentName,
  agentTitle,
  agentDescription,
  agentIcon,
  iconBg,
  status,
  lastRunTime = 'Just now',
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
  renderOverview,
  renderSettingsForm
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'findings' | 'tasks' | 'runs' | 'evidence' | 'settings'>('overview');
  const [inspectRun, setInspectRun] = useState<AgentRun | null>(null);
  const [inspectFinding, setInspectFinding] = useState<AgentFinding | null>(null);
  const [localSettings, setLocalSettings] = useState<Record<string, any>>(settings);
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  const handleSettingChange = (key: string, val: any) => {
    setLocalSettings((prev) => ({ ...prev, [key]: val }));
  };

  const handleSaveSettingsClick = () => {
    onSaveSettings(localSettings);
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  const activeTaskCount = tasks.filter((t) => t.status !== 'Completed').length;
  const criticalFindingCount = findings.filter((f) => f.severity === 'critical').length;

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* 1. AGENT HEADER */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        {/* Left: Icon, Name & Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            background: iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            {agentIcon}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '22px', fontWeight: '700', letterSpacing: '-0.4px', margin: 0 }}>
                {agentTitle}
              </h1>
              
              {/* Status Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '3px 9px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '600',
                background: isRunning ? 'var(--apple-blue-tint)' : 'var(--apple-green-tint)',
                color: isRunning ? 'var(--apple-blue)' : 'var(--apple-green)',
                border: `1px solid ${isRunning ? 'rgba(0,113,227,0.2)' : 'rgba(52,199,89,0.2)'}`
              }}>
                <span style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: isRunning ? 'var(--apple-blue)' : 'var(--apple-green)',
                  display: 'inline-block',
                  animation: isRunning ? 'pulse 1.5s infinite' : 'none'
                }} />
                {isRunning ? 'Running Scan...' : status}
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
              {agentDescription}
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setActiveTab('settings')}
            className="apple-button-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 14px' }}
          >
            <SettingsIcon size={15} />
            <span>Settings</span>
          </button>

          <button
            onClick={onRunAgent}
            disabled={isRunning}
            className="apple-button-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              padding: '8px 18px',
              opacity: isRunning ? 0.7 : 1,
              cursor: isRunning ? 'not-allowed' : 'pointer'
            }}
          >
            {isRunning ? (
              <>
                <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Scanning {shops.length} Shops...</span>
              </>
            ) : (
              <>
                <Play size={14} fill="currentColor" />
                <span>Run Agent Now</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. REAL SCANNING PROGRESS BANNER */}
      {isRunning && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--apple-blue-tint)',
          border: '1px solid rgba(0, 113, 227, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          fontSize: '13px',
          color: 'var(--apple-blue)'
        }}>
          <Cpu size={18} style={{ animation: 'spin 2s linear infinite' }} />
          <div style={{ flex: 1, fontWeight: '500' }}>
            {runningProgress || `Executing deterministic scan across ${shops.length} branches... Evaluating mathematical thresholds...`}
          </div>
        </div>
      )}

      {/* 3. AGENT INTERNAL NAVIGATION TABS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '22px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'findings', label: 'Findings', badge: findings.length, badgeColor: criticalFindingCount > 0 ? 'var(--apple-red)' : undefined },
          { id: 'tasks', label: 'Tasks', badge: activeTaskCount, badgeColor: 'var(--apple-blue)' },
          { id: 'runs', label: 'Runs', badge: runs.length },
          { id: 'evidence', label: 'Evidence' },
          { id: 'settings', label: 'Settings' }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 16px',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '2px solid var(--apple-blue)' : '2px solid transparent',
                color: isActive ? 'var(--apple-blue)' : 'var(--text-secondary)',
                fontSize: '13.5px',
                fontWeight: isActive ? '600' : '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap',
                transition: 'all var(--transition-fast)'
              }}
            >
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  background: tab.badgeColor ? `${tab.badgeColor}20` : 'rgba(118, 118, 128, 0.15)',
                  color: tab.badgeColor || 'var(--text-secondary)'
                }}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENTS */}
      {/* TAB A: OVERVIEW */}
      {activeTab === 'overview' && renderOverview()}

      {/* TAB B: FINDINGS */}
      {activeTab === 'findings' && (
        <div className="apple-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Detected Signals & Findings ({findings.length})
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              Scan refreshed {lastRunTime}
            </span>
          </div>

          {findings.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <CheckCircle2 size={36} color="var(--apple-green)" style={{ margin: '0 auto 12px auto' }} />
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>All Clear</p>
              <p style={{ fontSize: '12.5px' }}>No anomalous patterns or risk thresholds exceeded for current parameters.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {findings.map((finding) => (
                <div 
                  key={finding.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--bg-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          background: finding.severity === 'critical' ? 'var(--apple-red-tint)' : (finding.severity === 'warning' ? 'var(--apple-orange-tint)' : 'var(--apple-blue-tint)'),
                          color: finding.severity === 'critical' ? 'var(--apple-red)' : (finding.severity === 'warning' ? 'var(--apple-orange)' : 'var(--apple-blue)')
                        }}>
                          {finding.severity}
                        </span>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)' }}>
                          {finding.title}
                        </span>
                      </div>
                      <div style={{ fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
                        Branch: <strong style={{ color: 'var(--text-secondary)' }}>{finding.shop_name}</strong> • Metric: <strong>{finding.metric_label} ({finding.metric_value})</strong> vs baseline <strong>{finding.baseline}</strong>
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectFinding(finding)}
                      className="apple-button-secondary"
                      style={{ fontSize: '12px', padding: '5px 10px', whiteSpace: 'nowrap' }}
                    >
                      Inspect Evidence
                    </button>
                  </div>

                  {/* Math Formula / Calculation */}
                  <div style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'rgba(118, 118, 128, 0.06)',
                    fontFamily: 'SF Mono, Menlo, monospace',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    {finding.calculation}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--apple-blue)' }}>
                    <span>💡 Recommended Action: {finding.recommended_action}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB C: TASKS */}
      {activeTab === 'tasks' && (
        <div className="apple-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                Autonomous Agent Tasks ({tasks.length})
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                Operational interventions generated deterministically by {agentTitle}
              </p>
            </div>
          </div>

          {tasks.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <CheckCircle2 size={36} color="var(--apple-green)" style={{ margin: '0 auto 12px auto' }} />
              <p style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>No Pending Tasks</p>
              <p style={{ fontSize: '12.5px' }}>Run the agent to analyze active branch telemetry and generate intervention workflows.</p>
            </div>
          ) : (
            <div className="apple-table-container">
              <table className="apple-table">
                <thead>
                  <tr>
                    <th>Task ID</th>
                    <th>Branch</th>
                    <th>Action Summary</th>
                    <th>Priority</th>
                    <th>Finding Context</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Execution</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {task.id}
                      </td>
                      <td style={{ fontWeight: '600' }}>
                        {task.shop_name}
                      </td>
                      <td style={{ fontWeight: '500', color: 'var(--text-primary)' }}>
                        {task.title}
                      </td>
                      <td>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: '700',
                          background: task.priority === 'High' ? 'var(--apple-red-tint)' : 'var(--apple-orange-tint)',
                          color: task.priority === 'High' ? 'var(--apple-red)' : 'var(--apple-orange)'
                        }}>
                          {task.priority}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-secondary)', maxWidth: '240px' }}>
                        {task.finding}
                      </td>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 8px',
                          borderRadius: '9999px',
                          fontSize: '11.5px',
                          fontWeight: '600',
                          background: task.status === 'Completed' ? 'var(--apple-green-tint)' : 'var(--apple-blue-tint)',
                          color: task.status === 'Completed' ? 'var(--apple-green)' : 'var(--apple-blue)'
                        }}>
                          {task.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {task.status !== 'Completed' ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              onClick={() => {
                                onUpdateTaskStatus(task.id, 'Completed');
                                alert(`Task executed: "${task.title}". Logged in operational audit trail.`);
                              }}
                              className="apple-button-primary"
                              style={{ fontSize: '11.5px', padding: '4px 10px' }}
                            >
                              Approve & Dispatch
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--apple-green)', fontWeight: '600' }}>
                            ✓ Executed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB D: RUNS */}
      {activeTab === 'runs' && (
        <div className="apple-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Agent Execution Audit History ({runs.length} Runs)
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              Deterministic execution log
            </span>
          </div>

          <div className="apple-table-container">
            <table className="apple-table">
              <thead>
                <tr>
                  <th>Run ID</th>
                  <th>Started</th>
                  <th>Completed</th>
                  <th>Duration</th>
                  <th>Shops Scanned</th>
                  <th>Records Scanned</th>
                  <th>Critical / Warnings</th>
                  <th>Tasks Generated</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Audit</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--apple-blue)' }}>
                      #{run.id}
                    </td>
                    <td style={{ fontSize: '12.5px' }}>{run.started_at}</td>
                    <td style={{ fontSize: '12.5px' }}>{run.completed_at}</td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-tertiary)' }}>{run.duration_ms}ms</td>
                    <td>{run.shops_scanned}</td>
                    <td>{run.records_scanned}</td>
                    <td>
                      <span style={{ color: run.critical_findings > 0 ? 'var(--apple-red)' : 'var(--text-secondary)', fontWeight: '600' }}>
                        {run.critical_findings} crit
                      </span>
                      {' / '}
                      <span style={{ color: 'var(--apple-orange)' }}>
                        {run.warnings} warn
                      </span>
                    </td>
                    <td style={{ fontWeight: '600' }}>{run.tasks_generated}</td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: 'var(--apple-green-tint)',
                        color: 'var(--apple-green)'
                      }}>
                        {run.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setInspectRun(run)}
                        className="apple-button-secondary"
                        style={{ fontSize: '11.5px', padding: '4px 8px' }}
                      >
                        Inspect Run
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB E: EVIDENCE */}
      {activeTab === 'evidence' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="apple-card" style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
              Mathematical Rules & Evidence Tracing
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              All recommendations generated by {agentTitle} trace back to verifiable telemetry in your store database.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--apple-blue)' }}>Source Telemetry Tables</span>
                <ul style={{ margin: '8px 0 0 16px', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  <li>DailySales (30-day revenue, margins, cash transactions)</li>
                  <li>InventoryItem (POS velocity, reorder thresholds, shelf days)</li>
                  <li>UdhaarRecord (Khata credit balances, aging buckets)</li>
                  <li>StaffActivity (POS register drawer actions, cashier reconciliation)</li>
                </ul>
              </div>

              <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--apple-green)' }}>Auditability Guarantee</span>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '8px 0 0 0', lineHeight: '1.6' }}>
                  Zero black-box LLM estimations. Calculations use deterministic formulas:
                  <br />
                  <code style={{ fontSize: '12px', background: 'rgba(118,118,128,0.1)', padding: '2px 4px', borderRadius: '3px' }}>
                    Days Remaining = Current Stock / Daily Velocity
                  </code>
                  <br />
                  <code style={{ fontSize: '12px', background: 'rgba(118,118,128,0.1)', padding: '2px 4px', borderRadius: '3px' }}>
                    Deviation = (Actual - Baseline) / Baseline * 100
                  </code>
                </p>
              </div>
            </div>
          </div>

          {/* Active Findings Table */}
          <div className="apple-card" style={{ padding: '20px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
              Current Mathematical Proofs ({findings.length} findings)
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {findings.map((f) => (
                <div key={f.id} style={{ padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13.5px', fontWeight: '600' }}>{f.shop_name} — {f.title}</span>
                    <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>{f.metric_label}: {f.metric_value}</span>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--apple-blue)', background: 'rgba(0,113,227,0.05)', padding: '6px 10px', borderRadius: '4px' }}>
                    Formula: {f.calculation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB F: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="apple-card" style={{ padding: '24px', maxWidth: '720px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                {agentTitle} Operational Thresholds
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', margin: '4px 0 0 0' }}>
                Adjust mathematical triggers and autonomous execution parameters.
              </p>
            </div>

            <button
              onClick={handleSaveSettingsClick}
              className="apple-button-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
            >
              <Check size={14} />
              <span>Save Settings</span>
            </button>
          </div>

          {settingsSavedToast && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--apple-green-tint)',
              color: 'var(--apple-green)',
              fontSize: '12.5px',
              fontWeight: '600',
              marginBottom: '16px'
            }}>
              ✓ Threshold settings updated. New rules will apply to future scans.
            </div>
          )}

          {renderSettingsForm(localSettings, handleSettingChange)}
        </div>
      )}

      {/* 5. INSPECT RUN MODAL */}
      {inspectRun && (
        <div className="apple-modal-overlay" onClick={() => setInspectRun(null)}>
          <div 
            className="apple-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '640px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>
                  Run Audit: #{inspectRun.id}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Completed {inspectRun.completed_at} in {inspectRun.duration_ms}ms
                </span>
              </div>
              <button 
                onClick={() => setInspectRun(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Inputs Fed to Engine:</strong>
                <ul style={{ margin: '6px 0 0 16px', color: 'var(--text-secondary)' }}>
                  {inspectRun.inputs.map((inp, idx) => <li key={idx}>{inp}</li>)}
                </ul>
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)' }}>Rules & Equations Applied:</strong>
                <ul style={{ margin: '6px 0 0 16px', color: 'var(--text-secondary)' }}>
                  {inspectRun.rules_applied.map((rule, idx) => <li key={idx}>{rule}</li>)}
                </ul>
              </div>

              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Execution Summary:</strong>
                <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
                  {inspectRun.calculations_summary}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. INSPECT EVIDENCE MODAL */}
      {inspectFinding && (
        <div className="apple-modal-overlay" onClick={() => setInspectFinding(null)}>
          <div 
            className="apple-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '720px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>
                  Why Was This Flagged?
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  {inspectFinding.shop_name} • {inspectFinding.title}
                </span>
              </div>
              <button 
                onClick={() => setInspectFinding(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ padding: '12px', borderRadius: 'var(--radius-sm)', background: 'rgba(0,113,227,0.06)', border: '1px solid rgba(0,113,227,0.2)' }}>
                <strong style={{ color: 'var(--apple-blue)' }}>Calculation Proof:</strong>
                <div style={{ fontFamily: 'monospace', fontSize: '12.5px', marginTop: '4px', color: 'var(--text-primary)' }}>
                  {inspectFinding.calculation}
                </div>
              </div>

              {inspectFinding.evidence_headers && inspectFinding.evidence_records && (
                <div>
                  <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                    Supporting Database Records:
                  </strong>
                  <div className="apple-table-container">
                    <table className="apple-table">
                      <thead>
                        <tr>
                          {inspectFinding.evidence_headers.map((h, idx) => (
                            <th key={idx}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {inspectFinding.evidence_records.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => setInspectFinding(null)}
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
};
