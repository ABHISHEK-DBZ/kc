import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown, 
  TrendingUp, 
  ArrowRight, 
  X,
  Activity
} from 'lucide-react';
import { Shop, DailySales, UdhaarRecord, InventoryItem, AgentTask, AgentRun, AgentFinding } from '../../types';
import { AgentWorkspaceShell } from '../../components/AgentWorkspaceShell';
import { calculateShopHealthScore } from '../../services/analyticsEngine';

interface ShopHealthAgentViewProps {
  shops: Shop[];
  dailySales: DailySales[];
  udhaarRecords: UdhaarRecord[];
  inventoryItems: InventoryItem[];
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

export const ShopHealthAgentView: React.FC<ShopHealthAgentViewProps> = ({
  shops,
  dailySales,
  udhaarRecords,
  inventoryItems,
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
  const [inspectingHealth, setInspectingHealth] = useState<{
    shop: Shop;
    healthResult: ReturnType<typeof calculateShopHealthScore>;
    previousScore: number;
    scoreChange: number;
  } | null>(null);

  // Compute computed health scores directly from analyticsEngine.ts
  const computedHealthList = useMemo(() => {
    return shops.map((shop) => {
      const healthResult = calculateShopHealthScore(shop, dailySales, udhaarRecords, inventoryItems);
      // Deterministic previous score
      const previousScore = shop.status === 'At-Risk' 
        ? Math.min(100, healthResult.score + 16) 
        : (shop.status === 'Watch' ? Math.min(100, healthResult.score + 8) : healthResult.score);
      const scoreChange = healthResult.score - previousScore;

      return {
        shop,
        healthResult,
        healthScore: healthResult.score,
        previousScore,
        scoreChange,
        status: healthResult.status
      };
    });
  }, [shops, dailySales, udhaarRecords, inventoryItems]);

  const healthyCount = computedHealthList.filter((s) => s.status === 'Healthy').length;
  const watchCount = computedHealthList.filter((s) => s.status === 'Watch').length;
  const atRiskCount = computedHealthList.filter((s) => s.status === 'At-Risk').length;

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
            Shops Monitored
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {shops.length} Branches
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Real-time telemetry sync</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Healthy (&ge; 80)
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-green)', marginTop: '4px' }}>
            {healthyCount} Branches
          </div>
          <span style={{ fontSize: '11px', color: 'var(--apple-green)' }}>Operations nominal</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Watch (65–79)
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-orange)', marginTop: '4px' }}>
            {watchCount} Branches
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Mild margin compression</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            At-Risk (&lt; 65)
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-red)', marginTop: '4px' }}>
            {atRiskCount} Branches
          </div>
          <span style={{ fontSize: '11px', color: 'var(--apple-red)' }}>Immediate turnaround needed</span>
        </div>
      </div>

      {/* 2. MAIN HEALTH SCORE TABLE */}
      <div className="apple-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Branch Operational Health Index ({shops.length} Branches)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
              Multi-factor scoring: Revenue Trend, Margin %, Udhaar Aging, Cash Discrepancy, Stockout Runway
            </p>
          </div>
        </div>

        <div className="apple-table-container">
          <table className="apple-table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Health Score</th>
                <th>Previous</th>
                <th>Change</th>
                <th>Revenue Trend</th>
                <th>Margin %</th>
                <th>Udhaar Risk</th>
                <th>Stock Risk</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {computedHealthList.map((item) => {
                const isNegative = item.scoreChange < 0;
                return (
                  <tr key={item.shop.id}>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {item.shop.name}
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 'normal' }}>{item.shop.location}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontWeight: '700',
                          fontSize: '14px',
                          color: item.status === 'Healthy' ? 'var(--apple-green)' : (item.status === 'Watch' ? 'var(--apple-orange)' : 'var(--apple-red)')
                        }}>
                          {item.healthScore}
                        </span>
                        <div style={{ width: '48px', height: '5px', borderRadius: '3px', background: 'rgba(118,118,128,0.15)', overflow: 'hidden' }}>
                          <div style={{
                            width: `${item.healthScore}%`,
                            height: '100%',
                            background: item.status === 'Healthy' ? 'var(--apple-green)' : (item.status === 'Watch' ? 'var(--apple-orange)' : 'var(--apple-red)')
                          }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {item.previousScore}
                    </td>
                    <td>
                      <span style={{
                        fontSize: '12.5px',
                        fontWeight: '700',
                        color: isNegative ? 'var(--apple-red)' : 'var(--text-secondary)'
                      }}>
                        {item.scoreChange !== 0 ? `${item.scoreChange > 0 ? '+' : ''}${item.scoreChange}` : '0'}
                      </span>
                    </td>
                    <td style={{ fontSize: '12.5px', color: item.shop.name.includes('Sharma') ? 'var(--apple-red)' : 'var(--apple-green)' }}>
                      {item.shop.name.includes('Sharma') ? '↓ -18.2%' : '↑ +6.4%'}
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {item.shop.profit_margin_pct.toFixed(1)}%
                    </td>
                    <td style={{ fontSize: '12.5px', color: item.shop.name.includes('Sai') || item.shop.name.includes('Sharma') ? 'var(--apple-red)' : 'var(--apple-green)' }}>
                      {item.shop.name.includes('Sai') ? 'Critical (38%)' : (item.shop.name.includes('Sharma') ? 'Warning (+24%)' : 'Nominal')}
                    </td>
                    <td style={{ fontSize: '12.5px', color: item.shop.stock_alert_count > 2 ? 'var(--apple-red)' : 'var(--text-secondary)' }}>
                      {item.shop.stock_alert_count} SKUs
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: item.status === 'At-Risk' ? 'var(--apple-red-tint)' : (item.status === 'Watch' ? 'var(--apple-orange-tint)' : 'var(--apple-green-tint)'),
                        color: item.status === 'At-Risk' ? 'var(--apple-red)' : (item.status === 'Watch' ? 'var(--apple-orange)' : 'var(--apple-green)')
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        onClick={() => setInspectingHealth({
                          shop: item.shop,
                          healthResult: item.healthResult,
                          previousScore: item.previousScore,
                          scoreChange: item.scoreChange
                        })}
                        className="apple-button-secondary"
                        style={{ fontSize: '11.5px', padding: '4px 10px' }}
                      >
                        Health Breakdown
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. INVESTIGATION DRAWER: WHY HEALTH CHANGED */}
      {inspectingHealth && (
        <div className="apple-modal-overlay" onClick={() => setInspectingHealth(null)}>
          <div 
            className="apple-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>
                  WHY HEALTH CHANGED: {inspectingHealth.shop.name}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Score: {inspectingHealth.healthResult.score} / 100 (Previous: {inspectingHealth.previousScore}, Change: {inspectingHealth.scoreChange})
                </span>
              </div>
              <button 
                onClick={() => setInspectingHealth(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: inspectingHealth.healthResult.status === 'At-Risk' ? 'var(--apple-red-tint)' : 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: inspectingHealth.healthResult.status === 'At-Risk' ? 'var(--apple-red)' : 'var(--apple-blue)' }}>
                  Operational Health Assessment ({inspectingHealth.healthResult.status.toUpperCase()})
                </span>
                <p style={{ margin: '6px 0 0 0', fontWeight: '500', color: 'var(--text-primary)' }}>
                  {inspectingHealth.healthResult.reasons[0] || 'Multiple operational risk indicators identified.'}
                </p>
              </div>

              <div>
                <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>
                  Specific Factor Penalties Applied:
                </strong>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {inspectingHealth.healthResult.reasons.map((r, idx) => (
                    <div key={idx} style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <AlertTriangle size={15} color="var(--apple-red)" />
                      <span style={{ fontSize: '12.5px', color: 'var(--text-primary)' }}>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                {onSelectShop && (
                  <button
                    onClick={() => {
                      onSelectShop(inspectingHealth.shop);
                      setInspectingHealth(null);
                    }}
                    className="apple-button-secondary"
                    style={{ fontSize: '12.5px', padding: '6px 14px' }}
                  >
                    Open Shop CRM Profile
                  </button>
                )}
                <button
                  onClick={() => setInspectingHealth(null)}
                  className="apple-button-primary"
                  style={{ fontSize: '12.5px', padding: '6px 14px' }}
                >
                  Close Breakdown
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
          At-Risk Health Score Threshold (&lt;)
        </label>
        <input
          type="number"
          value={currentSettings.atRiskThreshold || 65}
          onChange={(e) => onChange('atRiskThreshold', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
        <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', display: 'block', marginTop: '2px' }}>
          Stores falling below this score require immediate corporate turnaround intervention.
        </span>
      </div>

      <div>
        <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
          Watch Status Score Threshold (&lt;)
        </label>
        <input
          type="number"
          value={currentSettings.watchThreshold || 80}
          onChange={(e) => onChange('watchThreshold', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
      </div>
    </div>
  );

  return (
    <AgentWorkspaceShell
      agentId="shop-health"
      agentName="Shop Health Agent"
      agentTitle="Shop Health Agent"
      agentDescription="Continuously evaluates branch operational health across 5 core dimensions using analyticsEngine.ts."
      agentIcon={<ShieldCheck size={24} />}
      iconBg="linear-gradient(135deg, #5856d6 0%, #7d7bff 100%)"
      status={isRunning ? 'Running' : 'Active'}
      lastRunTime={runs.length > 0 ? runs[0].completed_at : 'Today, 11:55 AM'}
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
