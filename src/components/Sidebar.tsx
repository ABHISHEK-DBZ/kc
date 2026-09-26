import React from 'react';
import { NavigationTab, UserRole } from '../types';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  IndianRupee, 
  CreditCard, 
  Package, 
  UserCheck, 
  FileSpreadsheet, 
  Sparkles, 
  AlertTriangle, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  MapPin,
  Cpu,
  TrendingUp,
  BarChart3,
  MessagesSquare,
  PackageCheck
} from 'lucide-react';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  currentRole: UserRole;
  shopCount: number;
  customerCount: number;
  stockAlertCount: number;
  alertCount: number;
  communityUnreadCount?: number;
  pendingPOCount?: number;
  authUser?: any;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  currentRole,
  shopCount,
  customerCount,
  stockAlertCount,
  alertCount,
  communityUnreadCount = 4,
  pendingPOCount = 3,
  authUser
}) => {
  const [agentsExpanded, setAgentsExpanded] = React.useState(true);

  // Keep AI Agents menu expanded whenever user is on any agent tab
  const isAgentTab = activeTab.startsWith('agent-');
  React.useEffect(() => {
    if (isAgentTab) {
      setAgentsExpanded(true);
    }
  }, [isAgentTab]);

  const topNavItems = [
    { id: 'overview' as NavigationTab, label: 'Overview', icon: LayoutDashboard },
    { id: 'shops' as NavigationTab, label: 'Shops', icon: Store, badge: shopCount },
    { id: 'customers' as NavigationTab, label: 'Customers', icon: Users, badge: customerCount },
    { id: 'sales' as NavigationTab, label: 'Sales', icon: IndianRupee },
    { id: 'udhaar' as NavigationTab, label: 'Udhaar', icon: CreditCard },
    { id: 'inventory' as NavigationTab, label: 'Inventory', icon: Package, badge: stockAlertCount, badgeColor: 'var(--apple-orange)' },
    { id: 'purchase-orders' as NavigationTab, label: 'Purchase Orders', icon: PackageCheck, badge: pendingPOCount, badgeColor: 'var(--apple-orange)' },
    { id: 'staff' as NavigationTab, label: 'Staff', icon: UserCheck },
    { id: 'reports' as NavigationTab, label: 'Reports', icon: FileSpreadsheet },
    { id: 'ai-insights' as NavigationTab, label: 'AI Insights', icon: Sparkles, highlight: true },
    { id: 'community' as NavigationTab, label: 'Franchise Community', icon: MessagesSquare, badge: communityUnreadCount, badgeColor: 'var(--apple-blue)', highlight: true }
  ];

  const agentItems = [
    { id: 'agent-sales' as NavigationTab, label: 'Sales Agent', icon: TrendingUp },
    { id: 'agent-inventory' as NavigationTab, label: 'Inventory Agent', icon: Package },
    { id: 'agent-udhaar-risk' as NavigationTab, label: 'Udhaar Risk Agent', icon: CreditCard },
    { id: 'agent-revenue-anomaly' as NavigationTab, label: 'Revenue Anomaly Agent', icon: BarChart3 },
    { id: 'agent-cash-risk' as NavigationTab, label: 'Cash Risk Agent', icon: IndianRupee },
    { id: 'agent-shop-health' as NavigationTab, label: 'Shop Health Agent', icon: ShieldCheck },
    { id: 'agent-retention' as NavigationTab, label: 'Retention Agent', icon: Users },
    { id: 'agent-support' as NavigationTab, label: 'Support Agent', icon: MessagesSquare }
  ];

  const bottomNavItems = [
    { id: 'alerts' as NavigationTab, label: 'Alerts', icon: AlertTriangle, badge: alertCount, badgeColor: 'var(--apple-red)' },
    { id: 'settings' as NavigationTab, label: 'Settings', icon: Settings }
  ];

  const renderNavItem = (item: { id: NavigationTab; label: string; icon: any; badge?: number; badgeColor?: string; highlight?: boolean }, isSubItem = false) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => onSelectTab(item.id)}
        title={collapsed ? item.label : undefined}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isSubItem ? '10px' : '12px',
          width: '100%',
          padding: collapsed ? '9px 0' : (isSubItem ? '7px 12px 7px 28px' : '8px 12px'),
          justifyContent: collapsed ? 'center' : 'flex-start',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: isActive ? 'var(--apple-blue-tint)' : 'transparent',
          color: isActive ? 'var(--apple-blue)' : (item.highlight ? 'var(--apple-indigo)' : 'var(--text-secondary)'),
          fontSize: isSubItem ? '12.5px' : '13.5px',
          fontWeight: isActive ? '600' : '500',
          cursor: 'pointer',
          transition: 'all var(--transition-fast)',
          position: 'relative'
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'rgba(118, 118, 128, 0.08)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = item.highlight ? 'var(--apple-indigo)' : 'var(--text-secondary)';
          }
        }}
      >
        <Icon size={isSubItem ? 15 : 17} style={{ minWidth: isSubItem ? '15px' : '17px' }} />

        {!collapsed && (
          <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.label}
          </span>
        )}

        {!collapsed && item.badge !== undefined && item.badge > 0 && (
          <span style={{
            fontSize: '10.5px',
            fontWeight: '700',
            padding: '1px 6px',
            borderRadius: '9999px',
            background: item.badgeColor ? `${item.badgeColor}20` : 'rgba(118, 118, 128, 0.15)',
            color: item.badgeColor || 'var(--text-secondary)'
          }}>
            {item.badge}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside style={{
      width: collapsed ? '68px' : '230px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-card)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      transition: 'width var(--transition-smooth)',
      zIndex: 50,
      userSelect: 'none',
      position: 'relative'
    }}>
      {/* Brand & Workspace */}
      <div style={{ overflowY: 'auto', overflowX: 'hidden' }}>
        <div style={{
          padding: collapsed ? '18px 14px' : '18px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          borderBottom: '1px solid var(--border-subtle)',
          minHeight: '64px'
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            minWidth: '36px',
            borderRadius: '10px',
            overflow: 'hidden',
            backgroundColor: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0, 113, 227, 0.2)',
            border: '1px solid rgba(0, 0, 0, 0.08)'
          }}>
            <img 
              src="/logo.png" 
              alt="KhataCopilot HQ Logo" 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </div>

          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                  KhataCopilot <span style={{ color: 'var(--apple-blue)' }}>HQ</span>
                </span>
              </div>
              <p style={{ fontSize: '10.5px', fontWeight: '600', letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: 0 }}>
                Retail Chain ERP
              </p>
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {/* Top Main Section */}
          {topNavItems.map((item) => renderNavItem(item))}

          {/* AI AGENTS NESTED SECTION */}
          <div style={{ marginTop: '4px', marginBottom: '4px' }}>
            <button
              onClick={() => {
                if (collapsed) {
                  onSelectTab('agent-sales');
                } else {
                  setAgentsExpanded(!agentsExpanded);
                }
              }}
              title={collapsed ? 'AI Agents' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: collapsed ? '9px 0' : '8px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: isAgentTab ? 'rgba(0, 113, 227, 0.06)' : 'transparent',
                color: isAgentTab ? 'var(--apple-blue)' : 'var(--text-primary)',
                fontSize: '13.5px',
                fontWeight: isAgentTab ? '600' : '500',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              onMouseEnter={(e) => {
                if (!isAgentTab) {
                  e.currentTarget.style.backgroundColor = 'rgba(118, 118, 128, 0.08)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isAgentTab) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Cpu size={17} style={{ minWidth: '17px', color: isAgentTab ? 'var(--apple-blue)' : 'var(--apple-indigo)' }} />

              {!collapsed && (
                <>
                  <span style={{ flex: 1, textAlign: 'left', fontWeight: '600', color: 'var(--text-primary)' }}>
                    AI Agents
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center' }}>
                    {agentsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </span>
                </>
              )}
            </button>

            {/* Sub-Agent Links (Expanded when agentsExpanded is true) */}
            {!collapsed && agentsExpanded && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1px',
                marginTop: '2px',
                position: 'relative'
              }}>
                {/* Visual subtle left guide line */}
                <div style={{
                  position: 'absolute',
                  left: '19px',
                  top: '4px',
                  bottom: '8px',
                  width: '1.5px',
                  background: 'var(--border-subtle)',
                  borderRadius: '1px'
                }} />
                {agentItems.map((agent) => renderNavItem(agent, true))}
              </div>
            )}
          </div>

          {/* Bottom Items: Alerts & Settings */}
          {bottomNavItems.map((item) => renderNavItem(item))}
        </nav>
      </div>

      {/* Footer Profile & Collapse Toggle */}
      <div style={{
        padding: '12px 10px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        {/* User Card */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '6px 8px',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(118, 118, 128, 0.04)'
        }}>
          <div style={{
            width: '28px',
            height: '28px',
            minWidth: '28px',
            borderRadius: '50%',
            background: 'var(--apple-blue)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: '700'
          }}>
            {authUser?.avatar_initials || (currentRole === 'HQ_OWNER' ? 'HQ' : (currentRole === 'HQ_IT' ? 'IT' : (currentRole === 'STORE_MANAGER' ? 'SM' : 'FO')))}
          </div>

          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-primary)' }}>
                {authUser?.name || (currentRole === 'HQ_OWNER' ? 'Aditya Singhal' : (currentRole === 'HQ_IT' ? 'Priya Nair' : (currentRole === 'STORE_MANAGER' ? 'Ramesh Sharma' : 'Amit Patel')))}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
                {currentRole === 'HQ_OWNER' ? 'Enterprise Owner' : (currentRole === 'HQ_IT' ? 'HQ IT Lead' : (currentRole === 'STORE_MANAGER' ? 'Store Manager' : 'Franchise Owner'))}
              </div>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            padding: '6px',
            border: 'none',
            borderRadius: 'var(--radius-xs)',
            background: 'transparent',
            color: 'var(--text-tertiary)',
            cursor: 'pointer',
            fontSize: '12px',
            transition: 'color var(--transition-fast)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          {collapsed ? <ChevronRight size={16} /> : (
            <>
              <ChevronLeft size={16} />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
