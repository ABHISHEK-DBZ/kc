import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shop, 
  DailySales, 
  UdhaarRecord, 
  Customer, 
  InventoryItem, 
  StaffActivity, 
  AlertItem,
  UserRole, 
  Region,
  DateRange,
  NavigationTab,
  Anomaly,
  AgentId,
  AgentTask,
  AgentRun,
  AgentFinding
} from './types';
import { 
  INITIAL_SHOPS, 
  INITIAL_DAILY_SALES, 
  INITIAL_CUSTOMERS, 
  INITIAL_UDHAAR_RECORDS, 
  INITIAL_INVENTORY_ITEMS, 
  INITIAL_STAFF_ACTIVITIES,
  INITIAL_ALERTS 
} from './data/mockData';
import { computeAnomalies } from './services/analyticsEngine';
import { 
  DEFAULT_AGENT_SETTINGS, 
  runSalesAgent, 
  runInventoryAgent, 
  runUdhaarRiskAgent, 
  runRevenueAnomalyAgent, 
  runCashRiskAgent, 
  runShopHealthAgent, 
  runRetentionAgent 
} from './services/agentEngine';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { AnomalyCenter } from './components/AnomalyCenter';
import { OverviewView } from './views/OverviewView';
import { ShopsView } from './views/ShopsView';
import { ShopCRMView } from './views/ShopCRMView';
import { CustomersView } from './views/CustomersView';
import { SalesView } from './views/SalesView';
import { UdhaarView } from './views/UdhaarView';
import { InventoryView } from './views/InventoryView';
import { StaffView } from './views/StaffView';
import { ReportsView } from './views/ReportsView';
import { AlertsView } from './views/AlertsView';
import { SettingsView } from './views/SettingsView';
import { AIInsightsPanel } from './components/AIInsightsPanel';

// Dedicated Agent Views
import { SalesAgentView } from './views/agents/SalesAgentView';
import { InventoryAgentView } from './views/agents/InventoryAgentView';
import { UdhaarRiskAgentView } from './views/agents/UdhaarRiskAgentView';
import { RevenueAnomalyAgentView } from './views/agents/RevenueAnomalyAgentView';
import { CashRiskAgentView } from './views/agents/CashRiskAgentView';
import { ShopHealthAgentView } from './views/agents/ShopHealthAgentView';
import { RetentionAgentView } from './views/agents/RetentionAgentView';

import './styles/apple-theme.css';

// URL Helpers for Real Routing and Browser History
const pathToTab = (pathname: string): NavigationTab => {
  const clean = pathname.replace(/^\/+|\/+$/g, '');
  if (!clean || clean === 'overview') return 'overview';
  if (clean === 'shops') return 'shops';
  if (clean === 'customers') return 'customers';
  if (clean === 'sales') return 'sales';
  if (clean === 'udhaar') return 'udhaar';
  if (clean === 'inventory') return 'inventory';
  if (clean === 'staff') return 'staff';
  if (clean === 'reports') return 'reports';
  if (clean === 'ai-insights') return 'ai-insights';
  if (clean === 'agents/sales' || clean === 'agents') return 'agent-sales';
  if (clean === 'agents/inventory') return 'agent-inventory';
  if (clean === 'agents/udhaar-risk') return 'agent-udhaar-risk';
  if (clean === 'agents/revenue-anomaly') return 'agent-revenue-anomaly';
  if (clean === 'agents/cash-risk') return 'agent-cash-risk';
  if (clean === 'agents/shop-health') return 'agent-shop-health';
  if (clean === 'agents/retention') return 'agent-retention';
  if (clean === 'alerts') return 'alerts';
  if (clean === 'settings') return 'settings';
  return 'overview';
};

const tabToPath = (tab: NavigationTab): string => {
  switch (tab) {
    case 'overview': return '/';
    case 'shops': return '/shops';
    case 'customers': return '/customers';
    case 'sales': return '/sales';
    case 'udhaar': return '/udhaar';
    case 'inventory': return '/inventory';
    case 'staff': return '/staff';
    case 'reports': return '/reports';
    case 'ai-insights': return '/ai-insights';
    case 'agent-sales': return '/agents/sales';
    case 'agent-inventory': return '/agents/inventory';
    case 'agent-udhaar-risk': return '/agents/udhaar-risk';
    case 'agent-revenue-anomaly': return '/agents/revenue-anomaly';
    case 'agent-cash-risk': return '/agents/cash-risk';
    case 'agent-shop-health': return '/agents/shop-health';
    case 'agent-retention': return '/agents/retention';
    case 'alerts': return '/alerts';
    case 'settings': return '/settings';
  }
};

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [userRole, setUserRole] = useState<UserRole>('HQ_OWNER');
  const [selectedRegion, setSelectedRegion] = useState<Region>('All');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>('30d');
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavigationTab>(() => pathToTab(window.location.pathname));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [healthFilterPreset, setHealthFilterPreset] = useState<'All' | 'Healthy' | 'Watch' | 'At-Risk'>('All');

  // Modals
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);

  // Core Data
  const [shops] = useState<Shop[]>(INITIAL_SHOPS);
  const [dailySales] = useState<DailySales[]>(INITIAL_DAILY_SALES);
  const [customers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [udhaarRecords] = useState<UdhaarRecord[]>(INITIAL_UDHAAR_RECORDS);
  const [inventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY_ITEMS);
  const [staffActivities] = useState<StaffActivity[]>(INITIAL_STAFF_ACTIVITIES);
  const [alerts] = useState<AlertItem[]>(INITIAL_ALERTS);

  // Theme application
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Browser History & Popstate Sync for URL Routing
  useEffect(() => {
    const handlePopState = () => {
      const tab = pathToTab(window.location.pathname);
      setActiveTab(tab);
      setSelectedShop(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    setSelectedShop(null);
    const path = tabToPath(tab);
    if (window.location.pathname !== path) {
      window.history.pushState({ tab }, '', path);
    }
  };

  // Global Keyboard Shortcut (⌘K / Ctrl+K) for Global Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute live anomalies across branches
  const anomalies: Anomaly[] = useMemo(() => {
    return computeAnomalies(shops, dailySales, udhaarRecords, inventoryItems);
  }, [shops, dailySales, udhaarRecords, inventoryItems]);

  // Role & Filter Scope Resolution
  const visibleShops = useMemo(() => {
    let result = shops;

    // 1. Role filtering
    if (userRole === 'STORE_MANAGER') {
      result = result.filter((s) => s.id === 'shop-01'); // Sharma General Store
    } else if (userRole === 'REGIONAL_MANAGER') {
      result = result.filter((s) => s.region === 'West'); // 10 Maharashtra branches
    } else if (selectedRegion !== 'All') {
      result = result.filter((s) => s.region === selectedRegion);
    }

    // 2. Specific branch selector
    if (selectedBranchId !== 'all') {
      result = result.filter((s) => s.id === selectedBranchId);
    }

    return result;
  }, [shops, userRole, selectedRegion, selectedBranchId]);

  // Filtered sub-datasets according to visible shops
  const visibleShopIds = useMemo(() => new Set(visibleShops.map((s) => s.id)), [visibleShops]);

  const visibleDailySales = useMemo(() => {
    return dailySales.filter((s) => visibleShopIds.has(s.shop_id));
  }, [dailySales, visibleShopIds]);

  const visibleCustomers = useMemo(() => {
    return customers.filter((c) => visibleShopIds.has(c.shop_id));
  }, [customers, visibleShopIds]);

  const visibleUdhaar = useMemo(() => {
    return udhaarRecords.filter((u) => visibleShopIds.has(u.shop_id));
  }, [udhaarRecords, visibleShopIds]);

  const visibleInventory = useMemo(() => {
    return inventoryItems.filter((i) => visibleShopIds.has(i.shop_id));
  }, [inventoryItems, visibleShopIds]);

  const visibleStaff = useMemo(() => {
    return staffActivities.filter((a) => visibleShopIds.has(a.shop_id));
  }, [staffActivities, visibleShopIds]);

  const visibleAlerts = useMemo(() => {
    return alerts.filter((a) => visibleShopIds.has(a.shop_id));
  }, [alerts, visibleShopIds]);

  // ==========================================
  // AGENT STATE MANAGEMENT (Deterministic Engines)
  // ==========================================
  const [agentSettings, setAgentSettings] = useState<Record<AgentId, Record<string, any>>>(DEFAULT_AGENT_SETTINGS);
  const [runningAgentId, setRunningAgentId] = useState<AgentId | null>(null);
  const [agentProgress, setAgentProgress] = useState<string>('');

  // Initial runs and findings
  const initialSales = useMemo(() => runSalesAgent(visibleShops, visibleDailySales, agentSettings.sales), []);
  const initialInv = useMemo(() => runInventoryAgent(visibleShops, visibleInventory, agentSettings.inventory), []);
  const initialUdh = useMemo(() => runUdhaarRiskAgent(visibleShops, visibleUdhaar, visibleCustomers, agentSettings['udhaar-risk']), []);
  const initialAnm = useMemo(() => runRevenueAnomalyAgent(visibleShops, visibleDailySales, agentSettings['revenue-anomaly']), []);
  const initialCsh = useMemo(() => runCashRiskAgent(visibleShops, visibleDailySales, visibleStaff, agentSettings['cash-risk']), []);
  const initialHlt = useMemo(() => runShopHealthAgent(visibleShops, visibleDailySales, visibleUdhaar, visibleInventory, agentSettings['shop-health']), []);
  const initialRet = useMemo(() => runRetentionAgent(
    visibleShops,
    initialSales.findings,
    initialInv.findings,
    initialUdh.findings,
    initialCsh.findings,
    initialHlt.findings,
    agentSettings.retention
  ), []);

  const [agentFindings, setAgentFindings] = useState<Record<AgentId, AgentFinding[]>>({
    sales: initialSales.findings,
    inventory: initialInv.findings,
    'udhaar-risk': initialUdh.findings,
    'revenue-anomaly': initialAnm.findings,
    'cash-risk': initialCsh.findings,
    'shop-health': initialHlt.findings,
    retention: initialRet.findings
  });

  const [agentTasks, setAgentTasks] = useState<Record<AgentId, AgentTask[]>>({
    sales: initialSales.tasks,
    inventory: initialInv.tasks,
    'udhaar-risk': initialUdh.tasks,
    'revenue-anomaly': initialAnm.tasks,
    'cash-risk': initialCsh.tasks,
    'shop-health': initialHlt.tasks,
    retention: initialRet.tasks
  });

  const [agentRuns, setAgentRuns] = useState<Record<AgentId, AgentRun[]>>({
    sales: [initialSales.run],
    inventory: [initialInv.run],
    'udhaar-risk': [initialUdh.run],
    'revenue-anomaly': [initialAnm.run],
    'cash-risk': [initialCsh.run],
    'shop-health': [initialHlt.run],
    retention: [initialRet.run]
  });

  // Handle "Run Agent Now" Action
  const handleRunAgent = (agentId: AgentId) => {
    setRunningAgentId(agentId);
    setAgentProgress(`Reading live telemetry from ${visibleShops.length} branches...`);

    setTimeout(() => {
      setAgentProgress(`Scanning records across branches... Evaluating mathematical threshold formulas...`);
    }, 400);

    setTimeout(() => {
      let result: { findings: AgentFinding[]; tasks: AgentTask[]; run: AgentRun };
      if (agentId === 'sales') {
        result = runSalesAgent(visibleShops, visibleDailySales, agentSettings.sales);
      } else if (agentId === 'inventory') {
        result = runInventoryAgent(visibleShops, visibleInventory, agentSettings.inventory);
      } else if (agentId === 'udhaar-risk') {
        result = runUdhaarRiskAgent(visibleShops, visibleUdhaar, visibleCustomers, agentSettings['udhaar-risk']);
      } else if (agentId === 'revenue-anomaly') {
        result = runRevenueAnomalyAgent(visibleShops, visibleDailySales, agentSettings['revenue-anomaly']);
      } else if (agentId === 'cash-risk') {
        result = runCashRiskAgent(visibleShops, visibleDailySales, visibleStaff, agentSettings['cash-risk']);
      } else if (agentId === 'shop-health') {
        result = runShopHealthAgent(visibleShops, visibleDailySales, visibleUdhaar, visibleInventory, agentSettings['shop-health']);
      } else {
        result = runRetentionAgent(
          visibleShops,
          agentFindings.sales,
          agentFindings.inventory,
          agentFindings['udhaar-risk'],
          agentFindings['cash-risk'],
          agentFindings['shop-health'],
          agentSettings.retention
        );
      }

      setAgentProgress(`Complete. Detected ${result.findings.length} findings & generated ${result.tasks.length} tasks.`);
      
      setTimeout(() => {
        setAgentFindings((prev) => ({ ...prev, [agentId]: result.findings }));
        setAgentTasks((prev) => ({ 
          ...prev, 
          [agentId]: [...result.tasks, ...prev[agentId].filter(t => !result.tasks.some(rt => rt.id === t.id))] 
        }));
        setAgentRuns((prev) => ({ ...prev, [agentId]: [result.run, ...prev[agentId]] }));
        setRunningAgentId(null);
        setAgentProgress('');
      }, 350);
    }, 850);
  };

  const handleUpdateTaskStatus = (agentId: AgentId, taskId: string, newStatus: 'Awaiting Approval' | 'In Progress' | 'Completed') => {
    setAgentTasks((prev) => ({
      ...prev,
      [agentId]: prev[agentId].map((t) => t.id === taskId ? { ...t, status: newStatus } : t)
    }));
  };

  const handleCreateTask = (agentId: AgentId, task: AgentTask) => {
    setAgentTasks((prev) => ({
      ...prev,
      [agentId]: [task, ...prev[agentId]]
    }));
  };

  const handleSaveSettings = (agentId: AgentId, newSettings: Record<string, any>) => {
    setAgentSettings((prev) => ({
      ...prev,
      [agentId]: newSettings
    }));
  };

  // Handle Demo "3 At-Risk Shops" click
  const handleFilterAtRisk = () => {
    setHealthFilterPreset('At-Risk');
    navigateToTab('shops');
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      {/* 1. Collapsible CRM Sidebar with Nested AI Agents */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={navigateToTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentRole={userRole}
        shopCount={visibleShops.length}
        customerCount={visibleCustomers.length}
        stockAlertCount={visibleInventory.filter((i) => i.current_stock <= i.reorder_threshold).length}
        alertCount={visibleAlerts.filter((a) => a.status === 'active').length}
      />

      {/* 2. Main Application Body */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-primary)'
      }}>
        
        {/* Apple Frosted Glass Header */}
        <Header
          currentRole={userRole}
          onRoleChange={(r: UserRole) => setUserRole(r)}
          currentRegion={selectedRegion}
          onRegionChange={(reg: Region) => setSelectedRegion(reg)}
          selectedBranchId={selectedBranchId}
          onBranchChange={(id: string) => setSelectedBranchId(id)}
          dateRange={dateRange}
          onDateRangeChange={(dr: DateRange) => setDateRange(dr)}
          shops={shops}
          alerts={alerts}
          onOpenSearch={() => setShowSearchModal(true)}
          onOpenAnomalies={() => setShowAnomalyModal(true)}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
        />

        {/* Dynamic Route Content */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          position: 'relative'
        }}>
          <div style={{ minHeight: '100%' }}>
            
            {/* If a shop is explicitly selected for drill-down, render ShopCRMView */}
            {selectedShop ? (
              <ShopCRMView
                shop={selectedShop}
                dailySales={dailySales}
                udhaarRecords={udhaarRecords}
                inventoryItems={inventoryItems}
                staffActivities={staffActivities}
                onBack={() => setSelectedShop(null)}
              />
            ) : (
              <>
                {/* TAB 1: OVERVIEW */}
                {activeTab === 'overview' && (
                  <OverviewView
                    shops={visibleShops}
                    dailySales={visibleDailySales}
                    udhaarRecords={visibleUdhaar}
                    inventoryItems={visibleInventory}
                    anomalies={anomalies}
                    onSelectShop={(s) => setSelectedShop(s)}
                    onNavigateToTab={navigateToTab}
                    onFilterAtRisk={handleFilterAtRisk}
                  />
                )}

                {/* TAB 2: SHOPS */}
                {activeTab === 'shops' && (
                  <ShopsView
                    shops={visibleShops}
                    onSelectShop={(s) => setSelectedShop(s)}
                    initialHealthFilter={healthFilterPreset}
                  />
                )}

                {/* TAB 3: CUSTOMERS */}
                {activeTab === 'customers' && (
                  <CustomersView
                    customers={visibleCustomers}
                  />
                )}

                {/* TAB 4: SALES */}
                {activeTab === 'sales' && (
                  <SalesView
                    shops={visibleShops}
                    dailySales={visibleDailySales}
                  />
                )}

                {/* TAB 5: UDHAAR */}
                {activeTab === 'udhaar' && (
                  <UdhaarView
                    shops={visibleShops}
                    udhaarRecords={visibleUdhaar}
                    customers={visibleCustomers}
                    onSelectShop={(s) => setSelectedShop(s)}
                  />
                )}

                {/* TAB 6: INVENTORY */}
                {activeTab === 'inventory' && (
                  <InventoryView
                    inventoryItems={visibleInventory}
                    shops={visibleShops}
                  />
                )}

                {/* TAB 7: STAFF */}
                {activeTab === 'staff' && (
                  <StaffView
                    shops={visibleShops}
                    staffActivities={visibleStaff}
                    onSelectShop={(s) => setSelectedShop(s)}
                  />
                )}

                {/* TAB 8: REPORTS */}
                {activeTab === 'reports' && (
                  <ReportsView
                    shops={visibleShops}
                    dailySales={visibleDailySales}
                    udhaarRecords={visibleUdhaar}
                    inventoryItems={visibleInventory}
                  />
                )}

                {/* TAB 9: AI INSIGHTS */}
                {activeTab === 'ai-insights' && (
                  <AIInsightsPanel
                    shops={visibleShops}
                    dailySales={visibleDailySales}
                    udhaarRecords={visibleUdhaar}
                    inventoryItems={visibleInventory}
                    onSelectShop={(s) => setSelectedShop(s)}
                    onNavigateToAgent={navigateToTab}
                  />
                )}

                {/* ============================================================ */}
                {/* 7 DEDICATED AI AGENT WORKSPACES                             */}
                {/* ============================================================ */}

                {/* AGENT 1: SALES INTELLIGENCE AGENT (/agents/sales) */}
                {activeTab === 'agent-sales' && (
                  <SalesAgentView
                    shops={visibleShops}
                    dailySales={visibleDailySales}
                    findings={agentFindings.sales}
                    tasks={agentTasks.sales}
                    runs={agentRuns.sales}
                    settings={agentSettings.sales}
                    onRunAgent={() => handleRunAgent('sales')}
                    isRunning={runningAgentId === 'sales'}
                    runningProgress={agentProgress}
                    onUpdateTaskStatus={(id, st) => handleUpdateTaskStatus('sales', id, st)}
                    onSaveSettings={(st) => handleSaveSettings('sales', st)}
                    onSelectShop={(s) => setSelectedShop(s)}
                  />
                )}

                {/* AGENT 2: INVENTORY AGENT (/agents/inventory) */}
                {activeTab === 'agent-inventory' && (
                  <InventoryAgentView
                    shops={visibleShops}
                    inventoryItems={visibleInventory}
                    findings={agentFindings.inventory}
                    tasks={agentTasks.inventory}
                    runs={agentRuns.inventory}
                    settings={agentSettings.inventory}
                    onRunAgent={() => handleRunAgent('inventory')}
                    isRunning={runningAgentId === 'inventory'}
                    runningProgress={agentProgress}
                    onUpdateTaskStatus={(id, st) => handleUpdateTaskStatus('inventory', id, st)}
                    onSaveSettings={(st) => handleSaveSettings('inventory', st)}
                    onSelectShop={(s) => setSelectedShop(s)}
                    onCreateTask={(t) => handleCreateTask('inventory', t)}
                  />
                )}

                {/* AGENT 3: UDHAAR RISK AGENT (/agents/udhaar-risk) */}
                {activeTab === 'agent-udhaar-risk' && (
                  <UdhaarRiskAgentView
                    shops={visibleShops}
                    udhaarRecords={visibleUdhaar}
                    customers={visibleCustomers}
                    findings={agentFindings['udhaar-risk']}
                    tasks={agentTasks['udhaar-risk']}
                    runs={agentRuns['udhaar-risk']}
                    settings={agentSettings['udhaar-risk']}
                    onRunAgent={() => handleRunAgent('udhaar-risk')}
                    isRunning={runningAgentId === 'udhaar-risk'}
                    runningProgress={agentProgress}
                    onUpdateTaskStatus={(id, st) => handleUpdateTaskStatus('udhaar-risk', id, st)}
                    onSaveSettings={(st) => handleSaveSettings('udhaar-risk', st)}
                    onSelectShop={(s) => setSelectedShop(s)}
                    onCreateTask={(t) => handleCreateTask('udhaar-risk', t)}
                  />
                )}

                {/* AGENT 4: REVENUE ANOMALY AGENT (/agents/revenue-anomaly) */}
                {activeTab === 'agent-revenue-anomaly' && (
                  <RevenueAnomalyAgentView
                    shops={visibleShops}
                    dailySales={visibleDailySales}
                    findings={agentFindings['revenue-anomaly']}
                    tasks={agentTasks['revenue-anomaly']}
                    runs={agentRuns['revenue-anomaly']}
                    settings={agentSettings['revenue-anomaly']}
                    onRunAgent={() => handleRunAgent('revenue-anomaly')}
                    isRunning={runningAgentId === 'revenue-anomaly'}
                    runningProgress={agentProgress}
                    onUpdateTaskStatus={(id, st) => handleUpdateTaskStatus('revenue-anomaly', id, st)}
                    onSaveSettings={(st) => handleSaveSettings('revenue-anomaly', st)}
                    onSelectShop={(s) => setSelectedShop(s)}
                  />
                )}

                {/* AGENT 5: CASH RISK AGENT (/agents/cash-risk) */}
                {activeTab === 'agent-cash-risk' && (
                  <CashRiskAgentView
                    shops={visibleShops}
                    dailySales={visibleDailySales}
                    staffActivities={visibleStaff}
                    findings={agentFindings['cash-risk']}
                    tasks={agentTasks['cash-risk']}
                    runs={agentRuns['cash-risk']}
                    settings={agentSettings['cash-risk']}
                    onRunAgent={() => handleRunAgent('cash-risk')}
                    isRunning={runningAgentId === 'cash-risk'}
                    runningProgress={agentProgress}
                    onUpdateTaskStatus={(id, st) => handleUpdateTaskStatus('cash-risk', id, st)}
                    onSaveSettings={(st) => handleSaveSettings('cash-risk', st)}
                    onSelectShop={(s) => setSelectedShop(s)}
                  />
                )}

                {/* AGENT 6: SHOP HEALTH AGENT (/agents/shop-health) */}
                {activeTab === 'agent-shop-health' && (
                  <ShopHealthAgentView
                    shops={visibleShops}
                    dailySales={visibleDailySales}
                    udhaarRecords={visibleUdhaar}
                    inventoryItems={visibleInventory}
                    findings={agentFindings['shop-health']}
                    tasks={agentTasks['shop-health']}
                    runs={agentRuns['shop-health']}
                    settings={agentSettings['shop-health']}
                    onRunAgent={() => handleRunAgent('shop-health')}
                    isRunning={runningAgentId === 'shop-health'}
                    runningProgress={agentProgress}
                    onUpdateTaskStatus={(id, st) => handleUpdateTaskStatus('shop-health', id, st)}
                    onSaveSettings={(st) => handleSaveSettings('shop-health', st)}
                    onSelectShop={(s) => setSelectedShop(s)}
                  />
                )}

                {/* AGENT 7: RETENTION AGENT (/agents/retention) */}
                {activeTab === 'agent-retention' && (
                  <RetentionAgentView
                    shops={visibleShops}
                    findings={agentFindings.retention}
                    tasks={agentTasks.retention}
                    runs={agentRuns.retention}
                    settings={agentSettings.retention}
                    onRunAgent={() => handleRunAgent('retention')}
                    isRunning={runningAgentId === 'retention'}
                    runningProgress={agentProgress}
                    onUpdateTaskStatus={(id, st) => handleUpdateTaskStatus('retention', id, st)}
                    onSaveSettings={(st) => handleSaveSettings('retention', st)}
                    onSelectShop={(s) => setSelectedShop(s)}
                    onCreateTask={(t) => handleCreateTask('retention', t)}
                  />
                )}

                {/* TAB 10: ALERTS */}
                {activeTab === 'alerts' && (
                  <AlertsView
                    alerts={visibleAlerts}
                    shops={visibleShops}
                    onSelectShop={(s) => setSelectedShop(s)}
                  />
                )}

                {/* TAB 11: SETTINGS */}
                {activeTab === 'settings' && (
                  <SettingsView />
                )}
              </>
            )}

          </div>
        </main>

      </div>

      {/* Global Search Modal (Triggered by ⌘K) */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        shops={shops}
        customers={customers}
        inventoryItems={inventoryItems}
        staffActivities={staffActivities}
        udhaarRecords={udhaarRecords}
        onSelectShop={(s) => {
          setShowSearchModal(false);
          setSelectedShop(s);
        }}
        onSelectTab={(tab) => {
          setShowSearchModal(false);
          navigateToTab(tab);
        }}
      />

      {/* Autonomous Anomaly Center Modal */}
      {showAnomalyModal && (
        <AnomalyCenter
          anomalies={anomalies}
          shops={shops}
          onSelectShop={(s) => {
            setShowAnomalyModal(false);
            setSelectedShop(s);
          }}
          onClose={() => setShowAnomalyModal(false)}
        />
      )}

    </div>
  );
}

export default App;
