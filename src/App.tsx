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
import { DEFAULT_AGENT_SETTINGS } from './services/agentEngine';
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
import { CommunityView } from './views/community/CommunityView';
import { PurchaseOrdersView } from './views/PurchaseOrdersView';
import { CommunityNotification } from './types/community';
import { INITIAL_NOTIFICATIONS, INITIAL_COMMUNITY_POSTS } from './data/communitySeedData';
import { INITIAL_PURCHASE_ORDERS } from './data/purchaseOrdersData';
import { PurchaseOrder } from './types';

// Dedicated Agent Views
import { SalesAgentView } from './views/agents/SalesAgentView';
import { InventoryAgentView } from './views/agents/InventoryAgentView';
import { UdhaarRiskAgentView } from './views/agents/UdhaarRiskAgentView';
import { RevenueAnomalyAgentView } from './views/agents/RevenueAnomalyAgentView';
import { CashRiskAgentView } from './views/agents/CashRiskAgentView';
import { ShopHealthAgentView } from './views/agents/ShopHealthAgentView';
import { RetentionAgentView } from './views/agents/RetentionAgentView';
import { SupportAgentView } from './views/agents/SupportAgentView';
import { LoginView } from './views/LoginView';
import { api, AuthUser, getStoredUser, clearStoredAuth } from './services/api';
import { realtimeClient } from './services/realtime';

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
  if (clean === 'purchase-orders') return 'purchase-orders';
  if (clean === 'staff') return 'staff';
  if (clean === 'reports') return 'reports';
  if (clean === 'ai-insights') return 'ai-insights';
  if (clean === 'community' || clean.startsWith('community/')) return 'community';
  if (clean === 'agents/sales' || clean === 'agents') return 'agent-sales';
  if (clean === 'agents/inventory') return 'agent-inventory';
  if (clean === 'agents/udhaar-risk') return 'agent-udhaar-risk';
  if (clean === 'agents/revenue-anomaly') return 'agent-revenue-anomaly';
  if (clean === 'agents/cash-risk') return 'agent-cash-risk';
  if (clean === 'agents/shop-health') return 'agent-shop-health';
  if (clean === 'agents/retention') return 'agent-retention';
  if (clean === 'agents/support') return 'agent-support';
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
    case 'purchase-orders': return '/purchase-orders';
    case 'staff': return '/staff';
    case 'reports': return '/reports';
    case 'ai-insights': return '/ai-insights';
    case 'community': return '/community';
    case 'agent-sales': return '/agents/sales';
    case 'agent-inventory': return '/agents/inventory';
    case 'agent-udhaar-risk': return '/agents/udhaar-risk';
    case 'agent-revenue-anomaly': return '/agents/revenue-anomaly';
    case 'agent-cash-risk': return '/agents/cash-risk';
    case 'agent-shop-health': return '/agents/shop-health';
    case 'agent-retention': return '/agents/retention';
    case 'agent-support': return '/agents/support';
    case 'alerts': return '/alerts';
    case 'settings': return '/settings';
  }
};

export function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => getStoredUser());
  const [userRole, setUserRole] = useState<UserRole>(() => getStoredUser()?.role || 'HQ_OWNER');
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
  const [shops, setShops] = useState<Shop[]>(INITIAL_SHOPS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);
  const [dailySales, setDailySales] = useState<DailySales[]>(INITIAL_DAILY_SALES);
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [udhaarRecords, setUdhaarRecords] = useState<UdhaarRecord[]>(INITIAL_UDHAAR_RECORDS);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(INITIAL_INVENTORY_ITEMS);
  const [staffActivities, setStaffActivities] = useState<StaffActivity[]>(INITIAL_STAFF_ACTIVITIES);
  const [alerts] = useState<AlertItem[]>(INITIAL_ALERTS);
  const [communityNotifications, setCommunityNotifications] = useState<CommunityNotification[]>(INITIAL_NOTIFICATIONS);

  const communityUnreadCount = useMemo(() => {
    return communityNotifications.filter((n) => !n.read).length;
  }, [communityNotifications]);

  // Theme application
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Sync userRole when authUser changes
  useEffect(() => {
    if (authUser) {
      setUserRole(authUser.role);
    }
  }, [authUser]);

  // Realtime SSE Listener and live backend data synchronization
  useEffect(() => {
    if (!authUser) return;

    // Connect SSE client
    realtimeClient.connect();

    const unsubscribe = realtimeClient.subscribe('*', (event) => {
      console.log('[App Realtime Event Received]', event);

      if (event.type === 'AGENT_STARTED') {
        const { agentId } = event.payload || {};
        if (agentId) {
          setRunningAgentId(agentId as AgentId);
          setAgentProgress(`Autonomous agent '${agentId}' execution in progress...`);
        }
      } else if (event.type === 'AGENT_COMPLETED') {
        const runRecord = event.payload;
        const aId = runRecord?.agent_id as AgentId;
        if (aId) {
          setAgentRuns((prev) => ({
            ...prev,
            [aId]: [runRecord, ...(prev[aId] || []).filter((r) => r.id !== runRecord.id)]
          }));
          api.getAgentFindings(aId).then((findings) => {
            if (findings) setAgentFindings((prev) => ({ ...prev, [aId]: findings }));
          }).catch(() => {});
          api.getAgentTasks(aId).then((tasks) => {
            if (tasks) setAgentTasks((prev) => ({ ...prev, [aId]: tasks }));
          }).catch(() => {});
        }
        setRunningAgentId(null);
        setAgentProgress('');
      } else if (event.type === 'AGENT_FAILED') {
        setRunningAgentId(null);
        setAgentProgress('');
      } else if (event.type === 'TASK_CREATED') {
        const task = event.payload;
        const aId = task?.agent_id as AgentId;
        if (aId) {
          api.getAgentTasks(aId).then((tasks) => {
            if (tasks) setAgentTasks((prev) => ({ ...prev, [aId]: tasks }));
          }).catch(() => {});
        }
      } else if (event.type === 'PURCHASE_ORDER_CREATED') {
        api.getPurchaseOrders().then((freshPOs) => {
          if (freshPOs && freshPOs.length) setPurchaseOrders(freshPOs);
        }).catch(console.error);
      } else if (event.type === 'SHOP_HEALTH_UPDATED' || event.type === 'SHOP_CREATED') {
        api.getShops().then((freshShops) => {
          if (freshShops && freshShops.length) setShops(freshShops);
        }).catch(console.error);
      } else if (event.type === 'TRANSACTION_RECORDED') {
        api.getSales().then((s) => s && s.length && setDailySales(s)).catch(console.error);
        api.getShops().then((s) => s && s.length && setShops(s)).catch(console.error);
      } else if (event.type === 'INVENTORY_RESTOCKED') {
        api.getInventory().then((i) => i && i.length && setInventoryItems(i)).catch(console.error);
      } else if (event.type === 'UDHAAR_RECORDED') {
        api.getUdhaar().then((u) => u && u.length && setUdhaarRecords(u)).catch(console.error);
        api.getCustomers().then((c) => c && c.length && setCustomers(c)).catch(console.error);
      }
    });

    // Fetch initial fresh data from backend SQLite DB
    api.getShops().then((freshShops) => {
      if (freshShops && freshShops.length) setShops(freshShops);
    }).catch(console.error);

    api.getPurchaseOrders().then((freshPOs) => {
      if (freshPOs && freshPOs.length) setPurchaseOrders(freshPOs);
    }).catch(console.error);

    api.getCustomers().then((freshCust) => {
      if (freshCust && freshCust.length) setCustomers(freshCust);
    }).catch(console.error);

    api.getSales().then((freshSales) => {
      if (freshSales && freshSales.length) setDailySales(freshSales);
    }).catch(console.error);

    api.getInventory().then((freshInv) => {
      if (freshInv && freshInv.length) setInventoryItems(freshInv);
    }).catch(console.error);

    api.getUdhaar().then((freshUdh) => {
      if (freshUdh && freshUdh.length) setUdhaarRecords(freshUdh);
    }).catch(console.error);

    api.getStaffActivities().then((freshAct) => {
      if (freshAct && freshAct.length) setStaffActivities(freshAct);
    }).catch(console.error);

    // Fetch initial persistent agent runs, findings, and tasks for all 8 agents
    const allAgentIds: AgentId[] = ['sales', 'inventory', 'udhaar-risk', 'revenue-anomaly', 'cash-risk', 'shop-health', 'retention', 'support'];
    allAgentIds.forEach((aId) => {
      api.getAgentRuns(aId).then((runs) => {
        if (runs && runs.length) setAgentRuns((prev) => ({ ...prev, [aId]: runs }));
      }).catch(() => {});
      api.getAgentFindings(aId).then((findings) => {
        if (findings && findings.length) setAgentFindings((prev) => ({ ...prev, [aId]: findings }));
      }).catch(() => {});
      api.getAgentTasks(aId).then((tasks) => {
        if (tasks && tasks.length) setAgentTasks((prev) => ({ ...prev, [aId]: tasks }));
      }).catch(() => {});
    });

    const handleExpired = () => {
      setAuthUser(null);
    };
    window.addEventListener('auth:expired', handleExpired);

    return () => {
      unsubscribe();
      realtimeClient.disconnect();
      window.removeEventListener('auth:expired', handleExpired);
    };
  }, [authUser]);

  const handleLogout = async () => {
    await api.logout();
    clearStoredAuth();
    realtimeClient.disconnect();
    setAuthUser(null);
  };

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

  const [agentFindings, setAgentFindings] = useState<Record<AgentId, AgentFinding[]>>({
    sales: [],
    inventory: [],
    'udhaar-risk': [],
    'revenue-anomaly': [],
    'cash-risk': [],
    'shop-health': [],
    retention: [],
    support: []
  });

  const [agentTasks, setAgentTasks] = useState<Record<AgentId, AgentTask[]>>({
    sales: [],
    inventory: [],
    'udhaar-risk': [],
    'revenue-anomaly': [],
    'cash-risk': [],
    'shop-health': [],
    retention: [],
    support: []
  });

  const [agentRuns, setAgentRuns] = useState<Record<AgentId, AgentRun[]>>({
    sales: [],
    inventory: [],
    'udhaar-risk': [],
    'revenue-anomaly': [],
    'cash-risk': [],
    'shop-health': [],
    retention: [],
    support: []
  });

  // Handle "Run Agent Now" Action - Authenticated Backend Execution
  const handleRunAgent = async (agentId: AgentId) => {
    setRunningAgentId(agentId);
    setAgentProgress(`Executing autonomous ${agentId} agent on backend server...`);

    try {
      const runResult = await api.runAgent(agentId);
      setAgentProgress(`Completed: ${runResult.critical_findings || 0} critical findings, ${runResult.tasks_generated || 0} tasks created.`);

      // Refresh runs, findings, and tasks directly from SQLite DB
      const [runs, findings, tasks] = await Promise.all([
        api.getAgentRuns(agentId).catch(() => []),
        api.getAgentFindings(agentId).catch(() => []),
        api.getAgentTasks(agentId).catch(() => [])
      ]);

      if (runs && runs.length) setAgentRuns((prev) => ({ ...prev, [agentId]: runs }));
      if (findings && findings.length) setAgentFindings((prev) => ({ ...prev, [agentId]: findings }));
      if (tasks && tasks.length) setAgentTasks((prev) => ({ ...prev, [agentId]: tasks }));

      // If inventory agent was run, also refresh purchase orders
      if (agentId === 'inventory') {
        const freshPOs = await api.getPurchaseOrders().catch(() => []);
        if (freshPOs && freshPOs.length) setPurchaseOrders(freshPOs);
      }
    } catch (err: any) {
      console.error('[Run Agent Error]', err);
      setAgentProgress(`Agent execution error: ${err.message || 'Execution failed'}`);
    } finally {
      setTimeout(() => {
        setRunningAgentId(null);
        setAgentProgress('');
      }, 900);
    }
  };

  const handleUpdateTaskStatus = async (agentId: AgentId, taskId: string, newStatus: 'Awaiting Approval' | 'In Progress' | 'Completed') => {
    if (newStatus === 'Completed') {
      try {
        await api.approveTask(taskId);
      } catch (e) {
        console.error('[Task Approve Error]', e);
      }
    }
    api.getAgentTasks(agentId).then((tasks) => {
      if (tasks) setAgentTasks((prev) => ({ ...prev, [agentId]: tasks }));
    }).catch(() => {});
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

  const handleAddShop = (newShop: Shop) => {
    setShops((prev) => [newShop, ...prev]);
  };

  const handleApprovePO = async (poId: string) => {
    try {
      await api.approvePO(poId);
      const freshPOs = await api.getPurchaseOrders();
      if (freshPOs) setPurchaseOrders(freshPOs);
      api.getAgentTasks('inventory').then((tasks) => {
        if (tasks) setAgentTasks((prev) => ({ ...prev, inventory: tasks }));
      }).catch(() => {});
    } catch (err) {
      console.error('[Approve PO Error]', err);
    }
  };

  const handleRejectPO = async (poId: string, reason?: string) => {
    try {
      await api.rejectPO(poId, reason);
      const freshPOs = await api.getPurchaseOrders();
      if (freshPOs) setPurchaseOrders(freshPOs);
    } catch (err) {
      console.error('[Reject PO Error]', err);
    }
  };

  // Handle Demo "3 At-Risk Shops" click
  const handleFilterAtRisk = () => {
    setHealthFilterPreset('At-Risk');
    setActiveTab('shops');
    setSelectedShop(null);
    if (window.location.pathname !== '/shops' || !window.location.search.includes('health=at-risk')) {
      window.history.pushState({ tab: 'shops' }, '', '/shops?health=at-risk');
    }
  };

  // If unauthenticated, render Apple HIG Login Page
  if (!authUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setAuthUser(user);
          setUserRole(user.role);
        }}
      />
    );
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      
      {/* 1. Collapsible CRM Sidebar with Nested AI Agents */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={navigateToTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentRole={userRole}
        authUser={authUser}
        shopCount={visibleShops.length}
        customerCount={visibleCustomers.length}
        stockAlertCount={visibleInventory.filter((i) => i.current_stock <= i.reorder_threshold).length}
        alertCount={visibleAlerts.filter((a) => a.status === 'active').length}
        communityUnreadCount={communityUnreadCount}
        pendingPOCount={purchaseOrders.filter((p) => p.status === 'Awaiting Approval').length}
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
          communityNotifications={communityNotifications}
          onNavigateToCommunity={() => navigateToTab('community')}
          onOpenSearch={() => setShowSearchModal(true)}
          onOpenAnomalies={() => setShowAnomalyModal(true)}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')}
          authUser={authUser}
          onLogout={handleLogout}
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
                    allShops={shops}
                    dailySales={visibleDailySales}
                    udhaarRecords={visibleUdhaar}
                    inventoryItems={visibleInventory}
                    customers={visibleCustomers}
                    staffActivities={visibleStaff}
                    alerts={visibleAlerts}
                    anomalies={anomalies}
                    agentFindings={agentFindings}
                    agentTasks={agentTasks}
                    agentRuns={agentRuns}
                    onRunAgent={handleRunAgent}
                    runningAgentId={runningAgentId}
                    currentRole={userRole}
                    onRoleChange={(r) => setUserRole(r)}
                    selectedRegion={selectedRegion}
                    onRegionChange={(reg) => setSelectedRegion(reg)}
                    dateRange={dateRange}
                    onDateRangeChange={(dr) => setDateRange(dr)}
                    communityPosts={INITIAL_COMMUNITY_POSTS}
                    purchaseOrders={purchaseOrders}
                    onApprovePO={handleApprovePO}
                    onRejectPO={handleRejectPO}
                    onAddShop={handleAddShop}
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
                    onNavigateToPO={() => navigateToTab('purchase-orders')}
                    onRefreshPOs={() => api.getPurchaseOrders().then((pos) => pos && setPurchaseOrders(pos))}
                    userRole={userRole}
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

                {/* TAB 9.5: FRANCHISE COMMUNITY */}
                {activeTab === 'community' && (
                  <CommunityView
                    currentRole={userRole}
                    currentShopId={selectedBranchId !== 'all' ? selectedBranchId : 'shop-01'}
                    allShops={shops}
                    onUpdateNotifications={(notifs) => setCommunityNotifications(notifs)}
                  />
                )}

                {/* TAB 9.6: PURCHASE ORDERS APPROVAL QUEUE */}
                {activeTab === 'purchase-orders' && (
                  <PurchaseOrdersView
                    purchaseOrders={purchaseOrders}
                    onApprovePO={handleApprovePO}
                    onRejectPO={handleRejectPO}
                    currentRole={userRole}
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

                {/* AGENT 8: SUPPORT & COMMUNITY AGENT (/agents/support) */}
                {activeTab === 'agent-support' && (
                  <SupportAgentView
                    shops={visibleShops}
                    findings={agentFindings.support}
                    tasks={agentTasks.support}
                    runs={agentRuns.support}
                    settings={agentSettings.support}
                    onRunAgent={() => handleRunAgent('support')}
                    isRunning={runningAgentId === 'support'}
                    runningProgress={agentProgress}
                    onUpdateTaskStatus={(id, st) => handleUpdateTaskStatus('support', id, st)}
                    onSaveSettings={(st) => handleSaveSettings('support', st)}
                    onNavigateToCommunity={() => navigateToTab('community')}
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
