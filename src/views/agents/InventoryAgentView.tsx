import React, { useState, useMemo } from 'react';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  FilePlus2, 
  Clock, 
  TrendingDown, 
  Calendar, 
  X,
  Plus
} from 'lucide-react';
import { Shop, InventoryItem, AgentTask, AgentRun, AgentFinding } from '../../types';
import { AgentWorkspaceShell } from '../../components/AgentWorkspaceShell';

interface InventoryAgentViewProps {
  shops: Shop[];
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
  onCreateTask?: (task: AgentTask) => void;
}

export const InventoryAgentView: React.FC<InventoryAgentViewProps> = ({
  shops,
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
  onSelectShop,
  onCreateTask
}) => {
  const [investigatingItem, setInvestigatingItem] = useState<{
    item: InventoryItem;
    shopName: string;
    finding?: AgentFinding;
  } | null>(null);

  const shopMap = useMemo(() => new Map(shops.map((s) => [s.id, s.name])), [shops]);

  // Derived metrics from inventoryItems
  const criticalStockouts = useMemo(() => {
    return inventoryItems.filter((i) => i.estimated_stockout_days <= (settings.criticalStockoutDays || 2.0));
  }, [inventoryItems, settings]);

  const atRiskStockouts = useMemo(() => {
    return inventoryItems.filter(
      (i) => i.estimated_stockout_days > (settings.criticalStockoutDays || 2.0) && i.estimated_stockout_days <= (settings.warningStockoutDays || 3.5)
    );
  }, [inventoryItems, settings]);

  const poTasksCount = tasks.filter((t) => t.type === 'po_draft').length;

  const handleGeneratePO = (item: InventoryItem, shopName: string) => {
    const suggestedQty = item.suggested_reorder_qty || Math.ceil(item.sales_velocity * 14);
    const newTask: AgentTask = {
      id: `task-po-${item.id}-${Date.now().toString().slice(-4)}`,
      agentId: 'inventory',
      shop_id: item.shop_id,
      shop_name: shopName,
      title: `PO Draft: ${item.item_name} (${suggestedQty} ${item.unit}) — ${shopName}`,
      priority: item.estimated_stockout_days <= 2 ? 'High' : 'Medium',
      status: 'Awaiting Approval',
      finding: `Stock at ${item.current_stock} units. Sales velocity ${item.sales_velocity} units/day. Depletes in ${item.estimated_stockout_days} days.`,
      recommended_action: `Dispatch Purchase Order to ${item.supplier} for ${suggestedQty} ${item.unit}.`,
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'po_draft'
    };

    if (onCreateTask) {
      onCreateTask(newTask);
    }
    alert(`Purchase Order drafted for ${item.item_name} (${suggestedQty} ${item.unit}) to ${item.supplier}. Queued in Tasks tab!`);
    setInvestigatingItem(null);
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
            Products Monitored
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {inventoryItems.length} SKUs
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Across {shops.length} branches</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Critical Stock-outs (&le; {settings.criticalStockoutDays || 2}d)
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-red)', marginTop: '4px' }}>
            {criticalStockouts.length} Items
          </div>
          <span style={{ fontSize: '11px', color: 'var(--apple-red)' }}>Immediate PO required</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            At Risk (&le; {settings.warningStockoutDays || 3.5}d)
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-orange)', marginTop: '4px' }}>
            {atRiskStockouts.length} Items
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Depletion within 72h</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Purchase Orders
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-blue)', marginTop: '4px' }}>
            {poTasksCount} Drafts
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Supplier orders generated</span>
        </div>

        <div className="apple-card" style={{ padding: '16px' }}>
          <span style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Last Scan
          </span>
          <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
            {runs.length > 0 ? runs[0].completed_at : 'Today, 11:15 AM'}
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Live POS velocity feed</span>
        </div>
      </div>

      {/* 2. MAIN PREDICTIVE INVENTORY TABLE */}
      <div className="apple-card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
              Sales Velocity & Stock-out Runway ({inventoryItems.length} Products)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
              Formula: Days Remaining = Current Stock / Daily Sales Velocity
            </p>
          </div>
        </div>

        <div className="apple-table-container">
          <table className="apple-table">
            <thead>
              <tr>
                <th>Shop</th>
                <th>Product</th>
                <th>Current Stock</th>
                <th>Sales Velocity</th>
                <th>Days Remaining</th>
                <th>Reorder Threshold</th>
                <th>Risk</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => {
                const shopName = shopMap.get(item.shop_id) || 'Branch Store';
                const daysRemaining = item.estimated_stockout_days;
                const isCritical = daysRemaining <= (settings.criticalStockoutDays || 2.0);
                const isWarning = daysRemaining <= (settings.warningStockoutDays || 3.5);

                return (
                  <tr key={item.id}>
                    <td style={{ fontWeight: '600', color: 'var(--text-primary)' }}>
                      {shopName}
                    </td>
                    <td>
                      <div style={{ fontWeight: '500' }}>{item.item_name}</div>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{item.category}</span>
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {item.current_stock} {item.unit}
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {item.sales_velocity} / day
                    </td>
                    <td>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontWeight: '700',
                        fontSize: '13px',
                        color: isCritical ? 'var(--apple-red)' : (isWarning ? 'var(--apple-orange)' : 'var(--apple-green)')
                      }}>
                        {daysRemaining.toFixed(1)} days
                      </span>
                    </td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {item.reorder_threshold} {item.unit}
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: isCritical ? 'var(--apple-red-tint)' : (isWarning ? 'var(--apple-orange-tint)' : 'var(--apple-green-tint)'),
                        color: isCritical ? 'var(--apple-red)' : (isWarning ? 'var(--apple-orange)' : 'var(--apple-green)')
                      }}>
                        {isCritical ? 'CRITICAL' : (isWarning ? 'WARNING' : 'HEALTHY')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                        <button
                          onClick={() => setInvestigatingItem({ item, shopName })}
                          className="apple-button-secondary"
                          style={{ fontSize: '11.5px', padding: '4px 8px' }}
                        >
                          Investigate
                        </button>
                        {isWarning && (
                          <button
                            onClick={() => handleGeneratePO(item, shopName)}
                            className="apple-button-primary"
                            style={{ fontSize: '11.5px', padding: '4px 8px' }}
                          >
                            + Draft PO
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. INVENTORY INVESTIGATION DRAWER */}
      {investigatingItem && (
        <div className="apple-modal-overlay" onClick={() => setInvestigatingItem(null)}>
          <div 
            className="apple-modal-container"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '680px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0 }}>
                  Stock Velocity Analysis: {investigatingItem.item.item_name}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Branch: {investigatingItem.shopName} • Category: {investigatingItem.item.category}
                </span>
              </div>
              <button 
                onClick={() => setInvestigatingItem(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-tertiary)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
              {/* Formula & Calculation Box */}
              <div style={{ padding: '14px', borderRadius: 'var(--radius-md)', background: 'var(--apple-blue-tint)', border: '1px solid rgba(0, 113, 227, 0.2)' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--apple-blue)' }}>
                  Days Remaining Equation
                </span>
                <div style={{ fontFamily: 'monospace', fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', marginTop: '4px' }}>
                  {investigatingItem.item.current_stock} units / {investigatingItem.item.sales_velocity} units/day = {investigatingItem.item.estimated_stockout_days} days
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Estimated Stock-Out Date: <strong>{investigatingItem.item.estimated_stockout_date}</strong> (at current velocity)
                </div>
              </div>

              {/* Data Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Current On-Hand Stock</span>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {investigatingItem.item.current_stock} {investigatingItem.item.unit}
                  </div>
                </div>

                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Reorder Threshold</span>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {investigatingItem.item.reorder_threshold} {investigatingItem.item.unit}
                  </div>
                </div>

                <div style={{ padding: '10px 14px', borderRadius: 'var(--radius-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Primary Distributor</span>
                  <div style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--apple-blue)', marginTop: '2px' }}>
                    {investigatingItem.item.supplier}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => handleGeneratePO(investigatingItem.item, investigatingItem.shopName)}
                  className="apple-button-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '8px 16px' }}
                >
                  <FilePlus2 size={15} />
                  <span>Generate Purchase Order ({investigatingItem.item.suggested_reorder_qty} {investigatingItem.item.unit})</span>
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
          Critical Stock-Out Threshold (Days)
        </label>
        <input
          type="number"
          step="0.5"
          value={currentSettings.criticalStockoutDays || 2.0}
          onChange={(e) => onChange('criticalStockoutDays', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
        <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', display: 'block', marginTop: '2px' }}>
          Items with fewer days of stock remaining trigger urgent red flags.
        </span>
      </div>

      <div>
        <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
          Warning Stock-Out Threshold (Days)
        </label>
        <input
          type="number"
          step="0.5"
          value={currentSettings.warningStockoutDays || 3.5}
          onChange={(e) => onChange('warningStockoutDays', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
      </div>

      <div>
        <label style={{ fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>
          Safety Stock Days for PO Drafting
        </label>
        <input
          type="number"
          value={currentSettings.defaultSafetyStockDays || 14}
          onChange={(e) => onChange('defaultSafetyStockDays', Number(e.target.value))}
          style={{ width: '100%', maxWidth: '240px', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}
        />
      </div>
    </div>
  );

  return (
    <AgentWorkspaceShell
      agentId="inventory"
      agentName="Inventory Agent"
      agentTitle="Inventory Agent"
      agentDescription="Predicts stock-outs using real sales velocity and generates autonomous replenishment orders."
      agentIcon={<Package size={24} />}
      iconBg="linear-gradient(135deg, #ff9500 0%, #ffb340 100%)"
      status={isRunning ? 'Running' : 'Active'}
      lastRunTime={runs.length > 0 ? runs[0].completed_at : 'Today, 11:15 AM'}
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
