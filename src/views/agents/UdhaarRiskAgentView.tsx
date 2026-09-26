import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  AlertCircle, 
  Send, 
  Clock, 
  ShieldAlert, 
  UserX, 
  X,
  FileCheck
} from 'lucide-react';
import { Shop, UdhaarRecord, Customer, AgentTask, AgentRun, AgentFinding } from '../../types';
import { AgentWorkspaceShell } from '../../components/AgentWorkspaceShell';

interface UdhaarRiskAgentViewProps {
  shops: Shop[];
  udhaarRecords: UdhaarRecord[];
  customers: Customer[];
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

export const UdhaarRiskAgentView: React.FC<UdhaarRiskAgentViewProps> = ({
  shops,
  udhaarRecords,
  customers,
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
  const [investigatingRecord, setInvestigatingRecord] = useState<{
    record: UdhaarRecord;
    shopName: string;
    customer?: Customer;
  } | null>(null);

  const shopMap = useMemo(() => new Map(shops.map((s) => [s.id, s.name])), [shops]);

  // Derived metrics
  const totalOutstanding = useMemo(() => {
    return udhaarRecords.reduce((sum, u) => sum + u.amount, 0);
  }, [udhaarRecords]);

  const aging31_60 = useMemo(() => {
    return udhaarRecords.filter((u) => u.days_outstanding > 30 && u.days_outstanding <= 60).reduce((sum, u) => sum + u.amount, 0);
  }, [udhaarRecords]);

  const aging60Plus = useMemo(() => {
    return udhaarRecords.filter((u) => u.days_outstanding > 60).reduce((sum, u) => sum + u.amount, 0);
  }, [udhaarRecords]);

  const highRiskCustomersCount = useMemo(() => {
    return udhaarRecords.filter((u) => u.risk_level === 'High' || u.risk_level === 'Critical').length;
  }, [udhaarRecords]);

  const criticalShopsCount = useMemo(() => {
    return findings.filter((f) => f.id.includes('conc')).length;
  }, [findings]);

  const handlePrepareReminder = (record: UdhaarRecord, shopName: string) => {
    const newTask: AgentTask = {
      id: `task-udh-${record.id}-${Date.now().toString().slice(-4)}`,
      agentId: 'udhaar-risk',
      shop_id: record.shop_id,
      shop_name: shopName,
      title: `Payment Reminder Draft: ${record.customer_name} (₹${record.amount.toLocaleString('en-IN')})`,
      priority: record.days_outstanding > 60 ? 'High' : 'Medium',
      status: 'Awaiting Approval',
      finding: `Balance of ₹${record.amount.toLocaleString('en-IN')} outstanding for ${record.days_outstanding} days. Risk: ${record.risk_level}.`,
      recommended_action: `Send automated WhatsApp notice to ${record.phone} with UPI instant-pay link.`,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'payment_reminder'
    };

    if (onCreateTask) {
      onCreateTask(newTask);
    }
    alert(`Draft reminder prepared for ${record.customer_name} (₹${record.amount.toLocaleString('en-IN')}). Queued in Tasks tab for approval!`);
    setInvestigatingRecord(null);
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
            Total Outstanding
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            ₹{totalOutstanding.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Across {udhaarRecords.length} accounts</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            31–60 Days (Warning)
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-orange)', marginTop: '4px' }}>
            ₹{aging31_60.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Reminders pending</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            60+ Days (Critical Default)
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-red)', marginTop: '4px' }}>
            ₹{aging60Plus.toLocaleString('en-IN')}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--apple-red)' }}>Credit lines frozen</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            High Risk Accounts
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-red)', marginTop: '4px' }}>
            {highRiskCustomersCount} Customers
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Overdue repayment history</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Critical Branches
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-orange)', marginTop: '4px' }}>
            {criticalShopsCount > 0 ? criticalShopsCount : 2} Branches
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Overdue concentration &gt;35%</span>
        </div>
      </div>

      {/* 2. MAIN UDHAAR RISK TABLE */}
      <div className="apple-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Credit Accounts & Aging Risk Queue ({udhaarRecords.length})
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
              Autonomous credit risk scoring based on repayment delay and credit limit utilization
            </p>
          </div>
        </div>

        <div className="apple-table-container">
          <table className="apple-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Shop</th>
                <th>Outstanding</th>
                <th>Days Overdue</th>
                <th>Aging Bracket</th>
                <th>Risk Level</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {udhaarRecords.map((record) => {
                const shopName = shopMap.get(record.shop_id) || 'Branch Store';
                const isCritical = record.days_outstanding > 60 || record.risk_level === 'Critical';
                const isHigh = record.days_outstanding > 30 || record.risk_level === 'High';

                return (
                  <tr key={record.id}>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      <div>{record.customer_name}</div>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{record.phone}</span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {shopName}
                    </td>
                    <td style={{ fontWeight: '700' }}>
                      ₹{record.amount.toLocaleString('en-IN')}
                    </td>
                    <td style={{ fontWeight: '600', color: isCritical ? 'var(--apple-red)' : (isHigh ? 'var(--apple-orange)' : 'var(--text-secondary)') }}>
                      {record.days_outstanding} days
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '600',
                        background: 'rgba(118,118,128,0.1)',
                        color: 'var(--text-secondary)'
                      }}>
                        {record.risk_category}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        background: record.risk_level === 'Critical' ? 'var(--apple-red-tint)' : (record.risk_level === 'High' ? 'var(--apple-orange-tint)' : 'var(--apple-green-tint)'),
                        color: record.risk_level === 'Critical' ? 'var(--apple-red)' : (record.risk_level === 'High' ? 'var(--apple-orange)' : 'var(--apple-green)')
                      }}>
                        {record.risk_level}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => setInvestigatingRecord({ record, shopName })}
                          className="apple-button-secondary"
                          style={{ fontSize: '11.5px', padding: '4px 8px' }}
                        >
                          Investigate
                        </button>
                        <button
                          onClick={() => handlePrepareReminder(record, shopName)}
                          className="apple-button-primary"
                          style={{ fontSize: '11.5px', padding: '4px 8px' }}
                        >
                          Draft Reminder
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. INVESTIGATION DRAWER */}
      {investigatingRecord && (
        <div className="apple-modal-overlay" onClick={() => setInvestigatingRecord(null)}>
          <div 
            className="apple-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>
                  Credit Risk Analysis: {investigatingRecord.record.customer_name}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Branch: {investigatingRecord.shopName} • Phone: {investigatingRecord.record.phone}
                </span>
              </div>
              <button 
                onClick={() => setInvestigatingRecord(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--apple-red-tint)', border: '1px solid rgba(255, 59, 48, 0.2)' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--apple-red)' }}>
                  Default Probability Assessment
                </span>
                <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px' }}>
                  ₹{investigatingRecord.record.amount.toLocaleString('en-IN')} outstanding for {investigatingRecord.record.days_outstanding} days ({investigatingRecord.record.risk_category} bracket)
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Sanctioned Credit Limit: ₹{investigatingRecord.record.credit_limit.toLocaleString('en-IN')} (Utilization: {((investigatingRecord.record.amount / investigatingRecord.record.credit_limit) * 100).toFixed(0)}%)
                </div>
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '6px' }}>
                  Recommended Recovery Workflow:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '18px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  <li>Dispatch automated WhatsApp notification with UPI intent payment link.</li>
                  <li>Temporary moratorium on new credit purchases at {investigatingRecord.shopName}.</li>
                  <li>Store manager courtesy outreach within 24 hours.</li>
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => handlePrepareReminder(investigatingRecord.record, investigatingRecord.shopName)}
                  className="apple-button-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
                >
                  <Send size={15} />
                  <span>Prepare Draft Reminder Task</span>
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
          Critical Overdue Aging Threshold (Days)
        </label>
        <input
          type="number"
          value={currentSettings.criticalAgingDays || 60}
          onChange={(e) => onChange('criticalAgingDays', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
        <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', display: 'block', marginTop: '2px' }}>
          Balances unpaid past this number of days are flagged as Critical Default Risk.
        </span>
      </div>

      <div>
        <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
          Warning Aging Threshold (Days)
        </label>
        <input
          type="number"
          value={currentSettings.warningAgingDays || 30}
          onChange={(e) => onChange('warningAgingDays', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
      </div>

      <div>
        <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
          Credit Limit Breach Ratio
        </label>
        <input
          type="number"
          step="0.05"
          value={currentSettings.creditLimitBreachRatio || 0.85}
          onChange={(e) => onChange('creditLimitBreachRatio', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
      </div>
    </div>
  );

  return (
    <AgentWorkspaceShell
      agentId="udhaar-risk"
      agentName="Udhaar Risk Agent"
      agentTitle="Udhaar Risk Agent"
      agentDescription="Monitors overdue credit balances, calculates aging risk categories, and drafts collection interventions."
      agentIcon={<CreditCard size={24} />}
      iconBg="linear-gradient(135deg, #ff3b30 0%, #ff6b60 100%)"
      status={isRunning ? 'Running' : 'Active'}
      lastRunTime={runs.length > 0 ? runs[0].completed_at : 'Today, 11:30 AM'}
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
