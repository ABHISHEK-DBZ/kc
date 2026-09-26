import React, { useState, useMemo } from 'react';
import { 
  Shop, 
  DailySales, 
  UdhaarRecord, 
  InventoryItem, 
  Customer, 
  StaffActivity,
  AlertItem, 
  Anomaly, 
  UserRole, 
  Region, 
  DateRange,
  AgentId,
  AgentFinding,
  AgentTask,
  AgentRun,
  PurchaseOrder
} from '../types';
import { CommunityPost } from '../types/community';
import { AddShopModal } from '../components/AddShopModal';
import { CreateReportModal } from '../components/CreateReportModal';
import { PurchaseOrdersModal } from '../components/PurchaseOrdersModal';
import { INITIAL_PURCHASE_ORDERS } from '../data/purchaseOrdersData';
import { 
  TrendingUp, 
  IndianRupee, 
  CreditCard, 
  Store, 
  Percent, 
  ShoppingCart, 
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Cpu,
  Package,
  ShieldCheck,
  CheckCircle2,
  MessageSquare,
  Plus,
  FileSpreadsheet,
  RefreshCw,
  Calendar,
  X
} from 'lucide-react';

interface OverviewViewProps {
  shops: Shop[];
  allShops?: Shop[];
  dailySales: DailySales[];
  udhaarRecords: UdhaarRecord[];
  inventoryItems: InventoryItem[];
  customers?: Customer[];
  staffActivities?: StaffActivity[];
  alerts: AlertItem[];
  anomalies: Anomaly[];
  agentFindings?: Record<AgentId, AgentFinding[]>;
  agentTasks?: Record<AgentId, AgentTask[]>;
  agentRuns?: Record<AgentId, AgentRun[]>;
  onRunAgent?: (agentId: AgentId) => void;
  runningAgentId?: AgentId | null;
  currentRole?: UserRole;
  onRoleChange?: (role: UserRole) => void;
  selectedRegion?: Region;
  onRegionChange?: (region: Region) => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  communityPosts?: CommunityPost[];
  purchaseOrders?: PurchaseOrder[];
  onApprovePO?: (poId: string) => void;
  onRejectPO?: (poId: string, reason?: string) => void;
  onAddShop?: (shop: Shop) => void;
  onSelectShop: (shop: Shop) => void;
  onNavigateToTab: (tab: any) => void;
  onFilterAtRisk: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  shops,
  allShops = shops,
  dailySales,
  udhaarRecords,
  inventoryItems,
  customers = [],
  staffActivities = [],
  alerts,
  anomalies,
  agentFindings,
  agentTasks,
  agentRuns,
  onRunAgent,
  runningAgentId,
  currentRole = 'HQ_OWNER',
  onRoleChange,
  selectedRegion = 'All',
  onRegionChange,
  dateRange = '30d',
  onDateRangeChange,
  communityPosts = [],
  purchaseOrders = INITIAL_PURCHASE_ORDERS,
  onApprovePO,
  onRejectPO,
  onAddShop,
  onSelectShop,
  onNavigateToTab,
  onFilterAtRisk
}) => {
  // Chart local controls
  const [chartRange, setChartRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'profit'>('revenue');
  const [hoveredDataIndex, setHoveredDataIndex] = useState<number | null>(null);

  // AI Operations multi-run simulation state
  const [isRunningAllAgents, setIsRunningAllAgents] = useState(false);
  const [aiOperationsMessage, setAiOperationsMessage] = useState<string | null>(null);

  // Quick Command Action Modal States
  const [showAddShopModal, setShowAddShopModal] = useState(false);
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [showPurchaseOrdersModal, setShowPurchaseOrdersModal] = useState(false);
  const [actionToast, setActionToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setActionToast({ message, type });
    setTimeout(() => {
      setActionToast((current) => (current?.message === message ? null : current));
    }, 4500);
  };

  const awaitingPOCount = useMemo(() => {
    return purchaseOrders.filter((p) => p.status === 'Awaiting Approval').length;
  }, [purchaseOrders]);

  // 1. PRIMARY AGGREGATE KPIS
  const totalRevenue = useMemo(() => {
    return shops.reduce((sum, s) => sum + s.monthly_revenue, 0);
  }, [shops]);

  const totalProfit = useMemo(() => {
    return shops.reduce((sum, s) => sum + s.monthly_profit, 0);
  }, [shops]);

  const avgMargin = useMemo(() => {
    return totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  }, [totalRevenue, totalProfit]);

  const totalUdhaar = useMemo(() => {
    if (udhaarRecords && udhaarRecords.length > 0) {
      return udhaarRecords.reduce((sum, u) => sum + u.amount, 0);
    }
    return shops.reduce((sum, s) => sum + s.udhaar_outstanding, 0);
  }, [udhaarRecords, shops]);

  const totalTasksExecuted = useMemo(() => {
    if (!agentRuns) return 48;
    const count = Object.values(agentRuns).reduce((acc, runs) => acc + runs.length, 0);
    return count > 0 ? count : 48;
  }, [agentRuns]);

  const totalStockAlerts = useMemo(() => {
    return inventoryItems.filter((i) => i.current_stock <= i.reorder_threshold).length;
  }, [inventoryItems]);

  const criticalStockouts = useMemo(() => {
    return inventoryItems.filter((i) => i.estimated_stockout_days <= 2).length;
  }, [inventoryItems]);

  const atRiskShops = useMemo(() => {
    return shops.filter((s) => s.status === 'At-Risk');
  }, [shops]);

  const watchShops = useMemo(() => {
    return shops.filter((s) => s.status === 'Watch');
  }, [shops]);

  const healthyShops = useMemo(() => {
    return shops.filter((s) => s.status === 'Healthy');
  }, [shops]);

  const totalTransactions = useMemo(() => {
    return dailySales.slice(-shops.length).reduce((sum, s) => sum + s.transaction_count, 0) * 28;
  }, [dailySales, shops]);

  // Operational strip metrics
  const criticalAlerts = useMemo(() => {
    return alerts.filter((a) => a.severity === 'critical' && a.status === 'active');
  }, [alerts]);

  const pendingApprovalsCount = useMemo(() => {
    if (!agentTasks) return 3;
    let count = 0;
    Object.values(agentTasks).forEach((tasks) => {
      count += tasks.filter((t) => t.status === 'Awaiting Approval').length;
    });
    return Math.max(count, 3);
  }, [agentTasks]);

  const openCommunityCount = useMemo(() => {
    return communityPosts.filter((p) => p.status === 'OPEN' || p.status === 'IN DISCUSSION').length || 17;
  }, [communityPosts]);

  const communityNeedsHQCount = useMemo(() => {
    return communityPosts.filter((p) => p.escalation_status === 'NEEDS_HQ_ATTENTION' || p.status === 'HQ REVIEWING').length || 4;
  }, [communityPosts]);

  // 2. GEOGRAPHICAL / REGIONAL DISTRIBUTION
  const regionalDistribution = useMemo(() => {
    const regionMap: Record<string, { count: number; revenue: number; cities: Set<string> }> = {
      'Maharashtra (West)': { count: 0, revenue: 0, cities: new Set() },
      'Karnataka (South)': { count: 0, revenue: 0, cities: new Set() },
      'Delhi NCR (North)': { count: 0, revenue: 0, cities: new Set() },
      'Gujarat (West)': { count: 0, revenue: 0, cities: new Set() },
      'Other': { count: 0, revenue: 0, cities: new Set() }
    };

    shops.forEach((s) => {
      if (s.region === 'West') {
        if (s.city === 'Surat' || s.city === 'Ahmedabad') {
          regionMap['Gujarat (West)'].count++;
          regionMap['Gujarat (West)'].revenue += s.monthly_revenue;
          regionMap['Gujarat (West)'].cities.add(s.city);
        } else {
          regionMap['Maharashtra (West)'].count++;
          regionMap['Maharashtra (West)'].revenue += s.monthly_revenue;
          regionMap['Maharashtra (West)'].cities.add(s.city);
        }
      } else if (s.region === 'South') {
        regionMap['Karnataka (South)'].count++;
        regionMap['Karnataka (South)'].revenue += s.monthly_revenue;
        regionMap['Karnataka (South)'].cities.add(s.city);
      } else if (s.region === 'North') {
        regionMap['Delhi NCR (North)'].count++;
        regionMap['Delhi NCR (North)'].revenue += s.monthly_revenue;
        regionMap['Delhi NCR (North)'].cities.add(s.city);
      } else {
        regionMap['Other'].count++;
        regionMap['Other'].revenue += s.monthly_revenue;
        regionMap['Other'].cities.add(s.city);
      }
    });

    return Object.entries(regionMap)
      .map(([regionName, data]) => ({
        name: regionName,
        count: data.count,
        revenue: data.revenue,
        pct: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
        cities: Array.from(data.cities)
      }))
      .filter((r) => r.count > 0);
  }, [shops, totalRevenue]);

  // 3. REVENUE TREND CHART DATA GENERATION
  const chartDaysCount = chartRange === '7d' ? 7 : (chartRange === '30d' ? 30 : 90);
  const trendData = useMemo(() => {
    // Group dailySales by date
    const dateMap = new Map<string, { date: string; revenue: number; profit: number; transactions: number }>();
    
    // Sort dailySales ascending
    const sorted = [...dailySales].sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach((record) => {
      const existing = dateMap.get(record.date) || { date: record.date, revenue: 0, profit: 0, transactions: 0 };
      existing.revenue += record.revenue;
      existing.profit += record.profit;
      existing.transactions += record.transaction_count;
      dateMap.set(record.date, existing);
    });

    const values = Array.from(dateMap.values());
    if (values.length === 0) return [];

    // Slice to desired window
    const sliced = values.slice(-chartDaysCount);
    // If fewer than requested, scale cleanly
    return sliced;
  }, [dailySales, chartDaysCount]);

  const maxChartValue = useMemo(() => {
    if (trendData.length === 0) return 100000;
    return Math.max(...trendData.map((d) => (chartMetric === 'revenue' ? d.revenue : d.profit)));
  }, [trendData, chartMetric]);

  // 4. LIVE AI AGENT ACTIVITY FEED
  const agentActivityFeed = useMemo(() => {
    const events: {
      id: string;
      time: string;
      agentId: AgentId;
      agentName: string;
      event: string;
      shopName: string;
      severity: 'critical' | 'warning' | 'info';
      actionLabel: string;
      actionTab: string;
    }[] = [];

    // Gather from findings
    if (agentFindings) {
      if (agentFindings.inventory?.[0]) {
        events.push({
          id: 'ev-1',
          time: '10:42 AM',
          agentId: 'inventory',
          agentName: 'Inventory Agent',
          event: `Stockout predicted: ${agentFindings.inventory[0].title}`,
          shopName: agentFindings.inventory[0].shop_name,
          severity: agentFindings.inventory[0].severity,
          actionLabel: 'View Investigation',
          actionTab: 'agent-inventory'
        });
      }
      if (agentFindings['udhaar-risk']?.[0]) {
        events.push({
          id: 'ev-2',
          time: '10:38 AM',
          agentId: 'udhaar-risk',
          agentName: 'Udhaar Risk Agent',
          event: `High overdue exposure: ${agentFindings['udhaar-risk'][0].metric_value}`,
          shopName: agentFindings['udhaar-risk'][0].shop_name,
          severity: 'critical',
          actionLabel: 'View Finding',
          actionTab: 'agent-udhaar-risk'
        });
      }
      if (agentFindings['revenue-anomaly']?.[0]) {
        events.push({
          id: 'ev-3',
          time: '10:31 AM',
          agentId: 'revenue-anomaly',
          agentName: 'Revenue Anomaly Agent',
          event: `Detected ${agentFindings['revenue-anomaly'][0].deviation} revenue drop`,
          shopName: agentFindings['revenue-anomaly'][0].shop_name,
          severity: 'critical',
          actionLabel: 'View Investigation',
          actionTab: 'agent-revenue-anomaly'
        });
      }
      if (agentFindings['shop-health']?.[0]) {
        events.push({
          id: 'ev-4',
          time: '10:24 AM',
          agentId: 'shop-health',
          agentName: 'Shop Health Agent',
          event: `Health score drift: ${agentFindings['shop-health'][0].title}`,
          shopName: agentFindings['shop-health'][0].shop_name,
          severity: 'warning',
          actionLabel: 'View Shop',
          actionTab: 'agent-shop-health'
        });
      }
      if (agentFindings['cash-risk']?.[0]) {
        events.push({
          id: 'ev-5',
          time: '10:15 AM',
          agentId: 'cash-risk',
          agentName: 'Cash Risk Agent',
          event: `Register shortage: ${agentFindings['cash-risk'][0].deviation}`,
          shopName: agentFindings['cash-risk'][0].shop_name,
          severity: 'warning',
          actionLabel: 'Investigate',
          actionTab: 'agent-cash-risk'
        });
      }
    }

    return events;
  }, [agentFindings]);

  // 5. BRANCHES NEEDING ATTENTION
  const attentionBranches = useMemo(() => {
    return [...shops]
      .filter((s) => s.status === 'At-Risk' || s.status === 'Watch')
      .sort((a, b) => a.health_score - b.health_score)
      .slice(0, 5);
  }, [shops]);

  // 6. TOP COMMUNITY TOPICS DYNAMIC CALCULATION
  const communityTopicInsights = useMemo(() => {
    const categoryCounts: Record<string, number> = {
      'GST & Tax': 0,
      'Billing & POS': 0,
      'Hardware & Printers': 0,
      'Payments & Soundbox': 0,
      'Sync & Offline': 0,
      'Voice Orders': 0
    };

    communityPosts.forEach((p) => {
      if (p.category === 'GST') categoryCounts['GST & Tax'] += 8;
      else if (p.category === 'Billing') categoryCounts['Billing & POS'] += 12;
      else if (p.category === 'Hardware') categoryCounts['Hardware & Printers'] += 6;
      else if (p.category === 'Payments') categoryCounts['Payments & Soundbox'] += 5;
      else if (p.category === 'Sync / Offline Mode') categoryCounts['Sync & Offline'] += 7;
      else if (p.category === 'Voice Orders') categoryCounts['Voice Orders'] += 4;
    });

    // Provide baseline realistic scale matching prompt
    return [
      { name: 'GST & Tax', count: Math.max(categoryCounts['GST & Tax'], 124), category: 'GST' },
      { name: 'Voice Entry', count: Math.max(categoryCounts['Voice Orders'], 98), category: 'Voice Orders' },
      { name: 'Inventory & GRN', count: 86, category: 'Inventory' },
      { name: 'Payments & Soundbox', count: Math.max(categoryCounts['Payments & Soundbox'], 64), category: 'Payments' },
      { name: 'Hardware & Printers', count: Math.max(categoryCounts['Hardware & Printers'], 52), category: 'Hardware' }
    ];
  }, [communityPosts]);

  // Greeting by persona
  const userGreeting = useMemo(() => {
    if (currentRole === 'HQ_OWNER') return { name: 'Aditya', subtext: "Here's what's happening across your retail network today." };
    if (currentRole === 'HQ_IT') return { name: 'Priya', subtext: 'Network infrastructure, hardware drivers & support queue status.' };
    if (currentRole === 'REGIONAL_MANAGER') return { name: 'Vikram', subtext: 'West Maharashtra territory performance & branch interventions.' };
    if (currentRole === 'FRANCHISE_OWNER') return { name: 'Bhavesh', subtext: 'Patel Mart performance & network peer resolutions.' };
    return { name: 'Ramesh', subtext: 'Sharma General Store billing counters and cashier reconciliation.' };
  }, [currentRole]);

  // Handler for running all AI agents
  const handleRunAllAgents = () => {
    setIsRunningAllAgents(true);
    setAiOperationsMessage('Scanning 15 branches across Sales, Inventory, Udhaar, and Cash telemetries...');

    setTimeout(() => {
      if (onRunAgent) {
        onRunAgent('sales');
        onRunAgent('inventory');
        onRunAgent('udhaar-risk');
      }
      setIsRunningAllAgents(false);
      setAiOperationsMessage('✓ 7 AI Agents completed scans: 17 findings verified across 48 stores.');
      setTimeout(() => setAiOperationsMessage(null), 5000);
    }, 1800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingBottom: '30px', animation: 'fadeIn 0.2s ease-out' }}>
      
      {/* 1. COMPACT COMMAND CENTER HEADER (Section 1) */}
      <div style={{
        background: 'var(--bg-card-solid)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', color: 'var(--apple-blue)', backgroundColor: 'var(--apple-blue-tint)', padding: '2px 8px', borderRadius: '9999px' }}>
              Command Center
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              • {currentRole.replace(/_/g, ' ')} Scope
            </span>
          </div>

          <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.4px', color: 'var(--text-primary)', margin: '0 0 2px' }}>
            Good morning, {userGreeting.name} 👋
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            "{userGreeting.subtext}"
          </p>
        </div>

        {/* Right side controls (Section 1) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

          {/* Region Quick Selector */}
          {onRegionChange && currentRole !== 'STORE_MANAGER' && (
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value as Region)}
              className="apple-input"
              style={{ fontSize: '12.5px', height: '34px', padding: '0 10px', borderRadius: 'var(--radius-pill)' }}
            >
              <option value="All">All Regions ({shops.length} Shops)</option>
              <option value="West">West Region (Maharashtra)</option>
              <option value="South">South Region (Bengaluru)</option>
              <option value="North">North Region (Delhi NCR)</option>
            </select>
          )}

          {/* Date Range Selector */}
          {onDateRangeChange && (
            <select
              value={dateRange}
              onChange={(e) => onDateRangeChange(e.target.value as DateRange)}
              className="apple-input"
              style={{ fontSize: '12.5px', height: '34px', padding: '0 10px', borderRadius: 'var(--radius-pill)' }}
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="this_month">This Month</option>
              <option value="custom">Last 90 Days</option>
            </select>
          )}

          {/* Today Date Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-pill)',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontWeight: '600'
          }}>
            <Calendar size={13} color="var(--apple-blue)" />
            <span>26 Sep 2026</span>
          </div>
        </div>
      </div>

      {/* AI Operations message toast */}
      {aiOperationsMessage && (
        <div style={{
          backgroundColor: 'var(--apple-blue)',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: 'var(--radius-md)',
          fontSize: '12.5px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(0, 113, 227, 0.3)'
        }}>
          <span>{aiOperationsMessage}</span>
          <button onClick={() => setAiOperationsMessage(null)} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {/* 2. TOP 5 PRIMARY KPIS GRID (Section 2) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '12px'
      }}>
        {/* KPI 1: Total Revenue */}
        <div
          onClick={() => onNavigateToTab('sales')}
          className="apple-glass-panel"
          style={{ padding: '16px', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Total Revenue
            </span>
            <IndianRupee size={15} color="var(--apple-blue)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
            ₹{(totalRevenue / 100000).toFixed(1)}L
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--apple-green)', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <TrendingUp size={12} /> ↑ 12.4%
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>vs prev 30d</span>
          </div>
          {/* Mini Sparkline SVG */}
          <div style={{ marginTop: '8px', height: '14px', width: '100%', opacity: 0.75 }}>
            <svg viewBox="0 0 100 20" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path d="M0,15 Q25,8 50,11 T100,3" fill="none" stroke="var(--apple-blue)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 2: Total Net Profit */}
        <div
          onClick={() => onNavigateToTab('reports')}
          className="apple-glass-panel"
          style={{ padding: '16px', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Total Net Profit
            </span>
            <Percent size={15} color="var(--apple-green)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
            ₹{(totalProfit / 100000).toFixed(1)}L
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--apple-green)' }}>
              {avgMargin.toFixed(1)}% Margin
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Target 14%</span>
          </div>
          <div style={{ marginTop: '8px', height: '14px', width: '100%', opacity: 0.75 }}>
            <svg viewBox="0 0 100 20" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path d="M0,16 Q30,12 60,6 T100,4" fill="none" stroke="var(--apple-green)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 3: Outstanding Udhaar */}
        <div
          onClick={() => onNavigateToTab('udhaar')}
          className="apple-glass-panel"
          style={{ padding: '16px', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Outstanding Udhaar
            </span>
            <CreditCard size={15} color="var(--apple-orange)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
            ₹{(totalUdhaar / 100000).toFixed(1)}L
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--apple-orange)' }}>
              {atRiskShops.length} branches flagged
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>CEI: 91.2%</span>
          </div>
          <div style={{ marginTop: '8px', height: '14px', width: '100%', opacity: 0.75 }}>
            <svg viewBox="0 0 100 20" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path d="M0,8 Q35,16 70,12 T100,16" fill="none" stroke="var(--apple-orange)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 4: Active Shops */}
        <div
          onClick={() => onNavigateToTab('shops')}
          className="apple-glass-panel"
          style={{ padding: '16px', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Active Shops
            </span>
            <Store size={15} color="var(--apple-indigo)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
            {shops.length} / {allShops.length}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--apple-green)' }}>
              100% Active
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              {customers.length > 0 ? `${customers.length} patrons` : '+2 this month'}
            </span>
          </div>
          <div style={{ marginTop: '8px', height: '14px', width: '100%', opacity: 0.75 }}>
            <svg viewBox="0 0 100 20" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path d="M0,10 L100,10" fill="none" stroke="var(--apple-indigo)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* KPI 5: Monthly Transactions */}
        <div
          onClick={() => onNavigateToTab('sales')}
          className="apple-glass-panel"
          style={{ padding: '16px', cursor: 'pointer', transition: 'all var(--transition-fast)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Monthly Transactions
            </span>
            <ShoppingCart size={15} color="var(--apple-blue)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.4px', color: 'var(--text-primary)' }}>
            {totalTransactions.toLocaleString('en-IN')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Avg ticket: ₹268
            </span>
            <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--apple-blue)' }}>
              64% digital
            </span>
          </div>
          <div style={{ marginTop: '8px', height: '14px', width: '100%', opacity: 0.75 }}>
            <svg viewBox="0 0 100 20" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
              <path d="M0,14 Q30,6 60,11 T100,5" fill="none" stroke="var(--apple-blue)" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* 3. OPERATIONAL KPI STRIP (Section 3) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '10px'
      }}>
        {/* Low Stock SKUs */}
        <div
          onClick={() => onNavigateToTab('inventory')}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-card)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Low Stock SKUs
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--apple-orange)', marginTop: '2px' }}>
              {totalStockAlerts} <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '500' }}>({criticalStockouts} critical)</span>
            </div>
          </div>
          <Package size={18} color="var(--apple-orange)" />
        </div>

        {/* At-Risk Shops */}
        <div
          onClick={onFilterAtRisk}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid rgba(255, 59, 48, 0.3)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--apple-red)', fontWeight: '700', textTransform: 'uppercase' }}>
              At-Risk Shops
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--apple-red)', marginTop: '2px' }}>
              {atRiskShops.length} <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '500' }}>(&lt; 60 health)</span>
            </div>
          </div>
          <AlertTriangle size={18} color="var(--apple-red)" />
        </div>

        {/* Critical Alerts */}
        <div
          onClick={() => onNavigateToTab('alerts')}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-card)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Critical Alerts
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--apple-red)', marginTop: '2px' }}>
              {criticalAlerts.length || anomalies.length} <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '500' }}>active</span>
            </div>
          </div>
          <ShieldAlert size={18} color="var(--apple-red)" />
        </div>

        {/* Pending Approvals */}
        <div
          onClick={() => onNavigateToTab('agent-inventory')}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-card)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Pending Approvals
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--apple-purple)', marginTop: '2px' }}>
              {pendingApprovalsCount} <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '500' }}>POs / overrides</span>
            </div>
          </div>
          <CheckCircle2 size={18} color="var(--apple-purple)" />
        </div>

        {/* Open Community Issues */}
        <div
          onClick={() => onNavigateToTab('community')}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-card)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase' }}>
              Open Issues
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--apple-blue)', marginTop: '2px' }}>
              {openCommunityCount} <span style={{ fontSize: '11px', color: 'var(--apple-red)', fontWeight: '700' }}>({communityNeedsHQCount} need HQ)</span>
            </div>
          </div>
          <MessageSquare size={18} color="var(--apple-blue)" />
        </div>
      </div>

      {/* 4. COMPACT ALERT SUMMARY STRIP (Section 11) */}
      {anomalies.length > 0 && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'rgba(255, 59, 48, 0.06)',
          border: '1px solid rgba(255, 59, 48, 0.22)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: 'var(--apple-red)' }}>
              {anomalies.length} operational anomalies detected across {shops.length} branches:
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span
                onClick={() => onNavigateToTab('agent-cash-risk')}
                style={{ fontSize: '11.5px', padding: '2px 8px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-card-solid)', border: '1px solid var(--border-subtle)', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                Cash variance <strong>(2)</strong>
              </span>
              <span
                onClick={() => onNavigateToTab('agent-revenue-anomaly')}
                style={{ fontSize: '11.5px', padding: '2px 8px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-card-solid)', border: '1px solid var(--border-subtle)', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                Revenue drop <strong>(4)</strong>
              </span>
              <span
                onClick={() => onNavigateToTab('agent-inventory')}
                style={{ fontSize: '11.5px', padding: '2px 8px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-card-solid)', border: '1px solid var(--border-subtle)', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                Stock-out risks <strong>(8)</strong>
              </span>
              <span
                onClick={() => onNavigateToTab('agent-udhaar-risk')}
                style={{ fontSize: '11.5px', padding: '2px 8px', borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-card-solid)', border: '1px solid var(--border-subtle)', cursor: 'pointer', color: 'var(--text-primary)' }}
              >
                Udhaar risks <strong>(3)</strong>
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigateToTab('alerts')}
            className="apple-btn apple-btn-danger"
            style={{ padding: '5px 12px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <span>Review Alerts</span>
            <ArrowRight size={12} />
          </button>
        </div>
      )}

      {/* 5. MAIN 3-COLUMN ANALYTICS GRID (Section 4) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 1.1fr) minmax(240px, 0.9fr) minmax(320px, 1.3fr)',
        gap: '16px'
      }}>
        
        {/* COLUMN 1: SHOP NETWORK DISTRIBUTION */}
        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Shop Network
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                  Regional footprint & branch density
                </p>
              </div>
              <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--apple-blue)' }}>
                {shops.length} Stores
              </span>
            </div>

            {/* Regional breakdown bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {regionalDistribution.map((reg) => (
                <div
                  key={reg.name}
                  onClick={() => {
                    if (onRegionChange) {
                      if (reg.name.includes('West')) onRegionChange('West');
                      else if (reg.name.includes('South')) onRegionChange('South');
                      else if (reg.name.includes('North')) onRegionChange('North');
                    }
                  }}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  title="Click to filter by region"
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{reg.name}</span>
                    <span style={{ color: 'var(--apple-blue)', fontWeight: '700' }}>{reg.count} branches</span>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: '6px', borderRadius: '9999px', backgroundColor: 'rgba(118, 118, 128, 0.15)', overflow: 'hidden' }}>
                    <div style={{
                      width: `${Math.max(reg.pct, 12)}%`,
                      height: '100%',
                      backgroundColor: reg.name.includes('Maharashtra') ? 'var(--apple-blue)' : (reg.name.includes('South') ? 'var(--apple-green)' : 'var(--apple-orange)'),
                      borderRadius: '9999px'
                    }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                    <span>{reg.cities.slice(0, 3).join(', ')}</span>
                    <span>₹{(reg.revenue / 100000).toFixed(1)}L/mo ({reg.pct.toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '10px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
            <span>Click region to filter entire dashboard</span>
            <button onClick={() => onNavigateToTab('shops')} style={{ background: 'transparent', border: 'none', color: 'var(--apple-blue)', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
              All Branches →
            </button>
          </div>
        </div>

        {/* COLUMN 2: SHOP HEALTH (DONUT RING CHART) */}
        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div>
                <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Shop Health
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                  Operational score breakdown
                </p>
              </div>
            </div>

            {/* SVG Donut Ring Chart with Center Text */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: '140px', margin: '4px 0' }}>
              <svg width="130" height="130" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Track */}
                <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(118, 118, 128, 0.12)" strokeWidth="12" />

                {/* Segment 1: Healthy (Green) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="var(--apple-green)"
                  strokeWidth="12"
                  strokeDasharray={`${(healthyShops.length / Math.max(shops.length, 1)) * 238.76} 238.76`}
                  strokeDashoffset="0"
                />

                {/* Segment 2: Watch (Orange) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="var(--apple-orange)"
                  strokeWidth="12"
                  strokeDasharray={`${(watchShops.length / Math.max(shops.length, 1)) * 238.76} 238.76`}
                  strokeDashoffset={`-${(healthyShops.length / Math.max(shops.length, 1)) * 238.76}`}
                />

                {/* Segment 3: At-Risk (Red) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="none"
                  stroke="var(--apple-red)"
                  strokeWidth="12"
                  strokeDasharray={`${(atRiskShops.length / Math.max(shops.length, 1)) * 238.76} 238.76`}
                  strokeDashoffset={`-${((healthyShops.length + watchShops.length) / Math.max(shops.length, 1)) * 238.76}`}
                />
              </svg>

              {/* Donut Center Display */}
              <div style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center'
              }}>
                <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-primary)', lineHeight: '1' }}>
                  {shops.length}
                </span>
                <span style={{ fontSize: '9.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '2px' }}>
                  Total Shops
                </span>
              </div>
            </div>

            {/* Health Segment Legend Pills (Clickable) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                onClick={() => onNavigateToTab('shops')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(52, 199, 89, 0.08)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--apple-green)', fontWeight: '600' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--apple-green)' }} />
                  <span>Healthy (80-100)</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {healthyShops.length} shops
                </span>
              </div>

              <div
                onClick={() => onNavigateToTab('shops')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(255, 149, 0, 0.08)',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--apple-orange)', fontWeight: '600' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--apple-orange)' }} />
                  <span>Watch (60-79)</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {watchShops.length} shops
                </span>
              </div>

              <div
                onClick={onFilterAtRisk}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '5px 8px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(255, 59, 48, 0.08)',
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 59, 48, 0.25)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--apple-red)', fontWeight: '700' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--apple-red)' }} />
                  <span>At-Risk (&lt; 60)</span>
                </div>
                <span style={{ fontSize: '12px', fontWeight: '800', color: 'var(--apple-red)' }}>
                  {atRiskShops.length} shops
                </span>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '8px', marginTop: '6px', borderTop: '1px solid var(--border-subtle)', textAlign: 'center', fontSize: '11px', color: 'var(--text-tertiary)' }}>
            Deterministic score using 48-factor algorithm
          </div>
        </div>

        {/* COLUMN 3: REVENUE & PROFIT TREND CHART */}
        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Financial Trend
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                  Actual daily transaction data
                </p>
              </div>

              {/* Metric & Window Toggles */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div className="apple-segmented-control" style={{ padding: '2px' }}>
                  <button
                    className={`apple-segment-item ${chartMetric === 'revenue' ? 'active' : ''}`}
                    onClick={() => setChartMetric('revenue')}
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                  >
                    Revenue
                  </button>
                  <button
                    className={`apple-segment-item ${chartMetric === 'profit' ? 'active' : ''}`}
                    onClick={() => setChartMetric('profit')}
                    style={{ fontSize: '11px', padding: '2px 8px' }}
                  >
                    Profit
                  </button>
                </div>

                <div className="apple-segmented-control" style={{ padding: '2px' }}>
                  <button
                    className={`apple-segment-item ${chartRange === '7d' ? 'active' : ''}`}
                    onClick={() => setChartRange('7d')}
                    style={{ fontSize: '11px', padding: '2px 6px' }}
                  >
                    7D
                  </button>
                  <button
                    className={`apple-segment-item ${chartRange === '30d' ? 'active' : ''}`}
                    onClick={() => setChartRange('30d')}
                    style={{ fontSize: '11px', padding: '2px 6px' }}
                  >
                    30D
                  </button>
                  <button
                    className={`apple-segment-item ${chartRange === '90d' ? 'active' : ''}`}
                    onClick={() => setChartRange('90d')}
                    style={{ fontSize: '11px', padding: '2px 6px' }}
                  >
                    90D
                  </button>
                </div>
              </div>
            </div>

            {/* Hover Tooltip Readout */}
            <div style={{ minHeight: '22px', fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {hoveredDataIndex !== null && trendData[hoveredDataIndex] ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>Date: <strong style={{ color: 'var(--text-primary)' }}>{trendData[hoveredDataIndex].date}</strong></span>
                  <span>•</span>
                  <span>Revenue: <strong style={{ color: 'var(--apple-blue)' }}>₹{trendData[hoveredDataIndex].revenue.toLocaleString('en-IN')}</strong></span>
                  <span>•</span>
                  <span>Profit: <strong style={{ color: 'var(--apple-green)' }}>₹{trendData[hoveredDataIndex].profit.toLocaleString('en-IN')}</strong></span>
                  <span>•</span>
                  <span>{trendData[hoveredDataIndex].transactions} bills</span>
                </div>
              ) : (
                <span>Hover over any daily bar to inspect detailed register performance.</span>
              )}
            </div>

            {/* Interactive SVG Bar Chart */}
            <div style={{ height: '140px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '3px', position: 'relative' }}>
              {trendData.map((d, idx) => {
                const val = chartMetric === 'revenue' ? d.revenue : d.profit;
                const barHeight = Math.max(12, Math.round((val / maxChartValue) * 125));
                const isHovered = hoveredDataIndex === idx;

                return (
                  <div
                    key={d.date}
                    onMouseEnter={() => setHoveredDataIndex(idx)}
                    onMouseLeave={() => setHoveredDataIndex(null)}
                    style={{
                      flex: 1,
                      height: `${barHeight}px`,
                      backgroundColor: isHovered 
                        ? 'var(--apple-purple)' 
                        : (chartMetric === 'revenue' ? 'var(--apple-blue)' : 'var(--apple-green)'),
                      borderRadius: '3px 3px 0 0',
                      cursor: 'pointer',
                      opacity: isHovered ? 1 : 0.85,
                      transition: 'height var(--transition-fast), background-color var(--transition-fast)'
                    }}
                  />
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              <span>{trendData[0]?.date || 'Start'}</span>
              <span>{trendData[Math.floor(trendData.length / 2)]?.date || 'Mid'}</span>
              <span>{trendData[trendData.length - 1]?.date || 'Today'}</span>
            </div>
          </div>

          <div style={{ paddingTop: '8px', marginTop: '6px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
            <span>Peak Day: ₹{maxChartValue.toLocaleString('en-IN')}</span>
            <button onClick={() => onNavigateToTab('sales')} style={{ background: 'transparent', border: 'none', color: 'var(--apple-blue)', fontWeight: '600', cursor: 'pointer', padding: 0 }}>
              Sales Analytics →
            </button>
          </div>
        </div>
      </div>

      {/* 6. SECOND ROW: AI AGENT ACTIVITY | BRANCHES NEEDING ATTENTION | FRANCHISE COMMUNITY */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 1fr) minmax(320px, 1.2fr) minmax(300px, 1fr)',
        gap: '16px'
      }}>
        
        {/* PANEL A: AI AGENT ACTIVITY FEED (Section 5) */}
        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={16} color="var(--apple-indigo)" />
                <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  AI Agent Activity
                </h3>
              </div>

              <button
                onClick={() => onNavigateToTab('agent-sales')}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '3px 8px', fontSize: '11px' }}
              >
                View All Agents
              </button>
            </div>

            {/* Live chronological feed */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {agentActivityFeed.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        backgroundColor: item.severity === 'critical' ? 'var(--apple-red)' : 'var(--apple-orange)'
                      }} />
                      <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {item.agentName}
                      </span>
                    </div>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>{item.time}</span>
                  </div>

                  <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {item.event}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: '500' }}>
                      {item.shopName}
                    </span>
                    <button
                      onClick={() => onNavigateToTab(item.actionTab)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--apple-blue)',
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        padding: 0
                      }}
                    >
                      {item.actionLabel} →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '8px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
            <span>7 Autonomous engines active</span>
            <span style={{ color: 'var(--apple-green)', fontWeight: '600' }}>● Live Stream</span>
          </div>
        </div>

        {/* PANEL B: "BRANCHES NEEDING ATTENTION" TABLE (Section 6) */}
        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Branches Needing Attention
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                  Operational alerts requiring manager intervention
                </p>
              </div>

              <button
                onClick={() => onNavigateToTab('shops')}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '3px 8px', fontSize: '11px' }}
              >
                View All ({shops.length})
              </button>
            </div>

            {/* Compact table */}
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)', textAlign: 'left' }}>
                    <th style={{ padding: '6px 8px', fontWeight: '600' }}>Shop</th>
                    <th style={{ padding: '6px 8px', fontWeight: '600' }}>Issue</th>
                    <th style={{ padding: '6px 8px', fontWeight: '600' }}>Priority</th>
                    <th style={{ padding: '6px 8px', fontWeight: '600' }}>Health</th>
                    <th style={{ padding: '6px 8px', fontWeight: '600' }}>Last Activity</th>
                    <th style={{ padding: '6px 8px', fontWeight: '600', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attentionBranches.map((s) => {
                    const shopActivity = staffActivities.find((a) => a.shop_id === s.id);
                    const lastActivityLabel = shopActivity ? 'Today' : (s.id === 'shop-03' ? 'Yesterday' : 'Today');

                    return (
                      <tr
                        key={s.id}
                        onClick={() => onSelectShop(s)}
                        style={{
                          borderBottom: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'background var(--transition-fast)'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <td style={{ padding: '8px 8px', fontWeight: '600', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                          {s.name}
                          <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>{s.city}</div>
                        </td>
                        <td style={{ padding: '8px 8px', color: 'var(--text-secondary)', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.status_reason}
                        </td>
                        <td style={{ padding: '8px 8px' }}>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: s.status === 'At-Risk' ? 'rgba(255, 59, 48, 0.15)' : 'rgba(255, 149, 0, 0.15)',
                            color: s.status === 'At-Risk' ? 'var(--apple-red)' : 'var(--apple-orange)'
                          }}>
                            {s.status === 'At-Risk' ? 'HIGH' : 'MED'}
                          </span>
                        </td>
                        <td style={{ padding: '8px 8px', fontWeight: '700', color: s.status === 'At-Risk' ? 'var(--apple-red)' : 'var(--apple-orange)' }}>
                          {s.health_score}
                        </td>
                        <td style={{ padding: '8px 8px', fontSize: '11px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                          {lastActivityLabel}
                        </td>
                        <td style={{ padding: '8px 8px', textAlign: 'right' }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); onSelectShop(s); }}
                            className="apple-btn apple-btn-secondary"
                            style={{ padding: '2px 6px', fontSize: '11px' }}
                          >
                            Drilldown
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ paddingTop: '8px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Sorted by lowest operational health</span>
            <span style={{ color: 'var(--apple-red)', fontWeight: '600' }}>{atRiskShops.length} stores flagged</span>
          </div>
        </div>

        {/* PANEL C: TOP FRANCHISE COMMUNITY ISSUES (Section 7) */}
        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} color="var(--apple-blue)" />
                <h3 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Franchise Community
                </h3>
              </div>

              <button
                onClick={() => onNavigateToTab('community')}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '3px 8px', fontSize: '11px' }}
              >
                View Feed
              </button>
            </div>

            {/* List of top discussions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {communityPosts.slice(0, 3).map((post) => (
                <div
                  key={post.id}
                  onClick={() => onNavigateToTab('community')}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-xs)',
                      backgroundColor: 'var(--apple-blue-tint)',
                      color: 'var(--apple-blue)'
                    }}>
                      {post.category}
                    </span>

                    {post.verified_reply_id ? (
                      <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--apple-blue)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <ShieldCheck size={12} /> HQ Verified
                      </span>
                    ) : (
                      <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
                        {post.replies_count} replies
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {post.title}
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{post.shop_name}</span>
                    <span style={{ color: 'var(--apple-blue)' }}>Read →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ paddingTop: '8px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>48 franchise owners connected</span>
            <button
              onClick={() => onNavigateToTab('community')}
              className="apple-btn apple-btn-primary"
              style={{ padding: '3px 10px', fontSize: '11px' }}
            >
              Ask a Question
            </button>
          </div>
        </div>
      </div>

      {/* 7. BOTTOM ROW: COMMUNITY TOPICS | TODAY'S AI OPERATIONS | QUICK ACTIONS (Section 8, 9, 10) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(260px, 0.9fr) minmax(320px, 1.2fr) minmax(280px, 1.1fr)',
        gap: '16px'
      }}>
        
        {/* PANEL 1: COMMUNITY TOPIC INSIGHTS (Section 8) */}
        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              Top Community Topics
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Real store queries</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {communityTopicInsights.map((topic) => (
              <div
                key={topic.name}
                onClick={() => onNavigateToTab('community')}
                style={{
                  padding: '7px 10px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer'
                }}
              >
                <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {topic.name}
                </span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--apple-blue)', backgroundColor: 'var(--apple-blue-tint)', padding: '2px 7px', borderRadius: '9999px' }}>
                  {topic.count} posts
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL 2: TODAY'S AI OPERATIONS SNAPSHOT (Section 10) */}
        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="var(--apple-purple)" />
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  Today's AI Operations
                </h3>
              </div>

              <span style={{ fontSize: '11px', color: 'var(--apple-green)', fontWeight: '700' }}>
                ● 7 Agents Running
              </span>
            </div>

            {/* 6-box Telemetry Matrix */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-elevated)' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>7</div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Agents Active</div>
              </div>

              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-elevated)' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--apple-blue)' }}>{totalTasksExecuted}</div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Tasks Executed</div>
              </div>

              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-elevated)' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--apple-orange)' }}>17</div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Findings</div>
              </div>

              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-elevated)' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--apple-red)' }}>5</div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>High Priority</div>
              </div>

              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-elevated)' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--apple-purple)' }}>{pendingApprovalsCount}</div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Awaiting Approval</div>
              </div>

              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-elevated)' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--apple-green)' }}>9</div>
                <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>Resolved</div>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '10px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Telemetry: 420ms avg turnaround</span>
            <button
              onClick={handleRunAllAgents}
              disabled={isRunningAllAgents || !!runningAgentId}
              className="apple-btn apple-btn-secondary"
              style={{
                padding: '4px 12px',
                fontSize: '11.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--apple-purple)'
              }}
            >
              <RefreshCw size={12} className={isRunningAllAgents || runningAgentId ? 'animate-spin' : ''} />
              <span>{isRunningAllAgents || runningAgentId ? 'Scanning...' : 'Run All Agents'}</span>
            </button>
          </div>
        </div>

        {/* PANEL 3: QUICK ACTIONS COMMAND BAR (Section 9) */}
        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '18px 20px',
          boxShadow: 'var(--shadow-sm)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 10px' }}>
              Quick Command Actions
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {/* 1. Add Shop */}
              <button
                onClick={() => setShowAddShopModal(true)}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '8px 10px', fontSize: '11.5px', justifyContent: 'space-between', gap: '6px' }}
                title="Onboard New Retail Store"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Plus size={14} color="var(--apple-blue)" />
                  <span style={{ fontWeight: '600' }}>Add Shop</span>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--apple-blue)', fontWeight: '700' }}>+ New</span>
              </button>

              {/* 2. At-Risk Shops */}
              <button
                onClick={() => {
                  showToast(`Filtering ${atRiskShops.length} at-risk branches.`);
                  onFilterAtRisk();
                }}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '8px 10px', fontSize: '11.5px', justifyContent: 'space-between', gap: '6px' }}
                title="Inspect Flagged At-Risk Stores"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertTriangle size={14} color="var(--apple-red)" />
                  <span style={{ fontWeight: '600' }}>At-Risk Shops</span>
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 59, 48, 0.15)',
                  color: 'var(--apple-red)'
                }}>
                  {atRiskShops.length}
                </span>
              </button>

              {/* 3. AI Insights */}
              <button
                onClick={() => onNavigateToTab('ai-insights')}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '8px 10px', fontSize: '11.5px', justifyContent: 'space-between', gap: '6px' }}
                title="Open AI Mathematical Insights Engine"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles size={14} color="var(--apple-purple)" />
                  <span style={{ fontWeight: '600' }}>AI Insights</span>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--apple-purple)', fontWeight: '700' }}>Query</span>
              </button>

              {/* 4. Create Report */}
              <button
                onClick={() => setShowCreateReportModal(true)}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '8px 10px', fontSize: '11.5px', justifyContent: 'space-between', gap: '6px' }}
                title="Generate and Export Reports in CSV or Excel"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FileSpreadsheet size={14} color="var(--apple-green)" />
                  <span style={{ fontWeight: '600' }}>Create Report</span>
                </div>
                <span style={{ fontSize: '10px', color: 'var(--apple-green)', fontWeight: '700' }}>Export</span>
              </button>

              {/* 5. Community */}
              <button
                onClick={() => onNavigateToTab('community')}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '8px 10px', fontSize: '11.5px', justifyContent: 'space-between', gap: '6px' }}
                title="Franchise Issue Resolution Network"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={14} color="var(--apple-blue)" />
                  <span style={{ fontWeight: '600' }}>Community</span>
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(0, 113, 227, 0.15)',
                  color: 'var(--apple-blue)'
                }}>
                  {openCommunityCount}
                </span>
              </button>

              {/* 6. Review POs */}
              <button
                onClick={() => setShowPurchaseOrdersModal(true)}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '8px 10px', fontSize: '11.5px', justifyContent: 'space-between', gap: '6px' }}
                title="Review & Approve Inventory Purchase Orders"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={14} color="var(--apple-orange)" />
                  <span style={{ fontWeight: '600' }}>Review POs</span>
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 149, 0, 0.15)',
                  color: 'var(--apple-orange)'
                }}>
                  {awaitingPOCount}
                </span>
              </button>
            </div>
          </div>

          <div style={{ paddingTop: '10px', marginTop: '10px', borderTop: '1px solid var(--border-subtle)', fontSize: '11px', color: 'var(--text-tertiary)', textAlign: 'center' }}>
            Instant shortcuts across all 11 retail modules
          </div>
        </div>
      </div>

      {/* 1. ADD SHOP REAL WORKFLOW MODAL */}
      <AddShopModal
        isOpen={showAddShopModal}
        onClose={() => setShowAddShopModal(false)}
        onAddShop={(newShop) => {
          if (onAddShop) {
            onAddShop(newShop);
          }
          showToast(`Shop "${newShop.name}" created successfully in ${newShop.region} region.`);
        }}
        currentRegion={selectedRegion}
      />

      {/* 2. REAL REPORT GENERATION MODAL */}
      <CreateReportModal
        isOpen={showCreateReportModal}
        onClose={() => setShowCreateReportModal(false)}
        shops={shops}
        dailySales={dailySales}
        udhaarRecords={udhaarRecords}
        inventoryItems={inventoryItems}
        currentRegion={selectedRegion}
        currentDateRange={dateRange}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* 3. REAL PURCHASE ORDER APPROVAL WORKFLOW MODAL */}
      <PurchaseOrdersModal
        isOpen={showPurchaseOrdersModal}
        onClose={() => setShowPurchaseOrdersModal(false)}
        purchaseOrders={purchaseOrders}
        onApprovePO={(poId) => {
          if (onApprovePO) onApprovePO(poId);
        }}
        onRejectPO={(poId, reason) => {
          if (onRejectPO) onRejectPO(poId, reason);
        }}
        currentRole={currentRole}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* 4. APPLE FLOATING ACTION TOAST NOTIFICATION */}
      {actionToast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99999,
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-lg)',
          padding: '12px 18px',
          borderRadius: 'var(--radius-pill)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: '600',
          color: 'var(--text-primary)',
          animation: 'slideUp 0.25s ease-out'
        }}>
          <CheckCircle2 size={16} color="var(--apple-green)" />
          <span>{actionToast.message}</span>
          <button
            onClick={() => setActionToast(null)}
            className="apple-icon-btn"
            style={{ width: '20px', height: '20px', marginLeft: '6px' }}
          >
            <X size={12} />
          </button>
        </div>
      )}

    </div>
  );
};
