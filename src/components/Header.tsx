import React, { useState } from 'react';
import { UserRole, Region, DateRange, Shop, AlertItem, CommunityNotification } from '../types';
import { 
  Building2, 
  MapPin, 
  Store, 
  AlertTriangle, 
  Sparkles, 
  Moon, 
  Sun, 
  Download, 
  ShieldCheck, 
  Search, 
  Calendar, 
  Bell, 
  ChevronDown, 
  Check, 
  Menu,
  Wrench,
  Users,
  MessagesSquare,
  CheckCircle2,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { AuthUser } from '../services/api';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentRegion: Region;
  onRegionChange: (region: Region) => void;
  selectedBranchId: string;
  onBranchChange: (branchId: string) => void;
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  shops: Shop[];
  alerts: AlertItem[];
  communityNotifications?: CommunityNotification[];
  onNavigateToCommunity?: () => void;
  onOpenSearch: () => void;
  onOpenAnomalies: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleMobileSidebar?: () => void;
  authUser?: AuthUser | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  currentRegion,
  onRegionChange,
  selectedBranchId,
  onBranchChange,
  dateRange,
  onDateRangeChange,
  shops,
  alerts,
  communityNotifications = [],
  onNavigateToCommunity,
  onOpenSearch,
  onOpenAnomalies,
  theme,
  onToggleTheme,
  onToggleMobileSidebar,
  authUser,
  onLogout
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifTab, setNotifTab] = useState<'community' | 'alerts'>('community');

  const unreadCommunityCount = communityNotifications.filter((n) => !n.read).length;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      backgroundColor: 'var(--bg-glass-header)',
      backdropFilter: 'var(--backdrop-blur)',
      WebkitBackdropFilter: 'var(--backdrop-blur)',
      borderBottom: '1px solid var(--border-card)',
      padding: '10px 22px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '14px',
      minHeight: '64px'
    }}>
      
      {/* Left: Mobile Toggle + Global Search Trigger */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className="apple-btn apple-btn-secondary"
            style={{ padding: '6px', display: 'flex', alignItems: 'center' }}
            title="Toggle Menu"
          >
            <Menu size={18} />
          </button>
        )}

        {/* Global Search Bar (Trigger) */}
        <button
          onClick={onOpenSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(118, 118, 128, 0.08)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '7px 14px',
            cursor: 'pointer',
            color: 'var(--text-tertiary)',
            fontSize: '13px',
            minWidth: '220px',
            transition: 'all var(--transition-fast)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-card-solid)';
            e.currentTarget.style.borderColor = 'var(--apple-blue)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(118, 118, 128, 0.08)';
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }}
        >
          <Search size={15} color="var(--apple-blue)" />
          <span style={{ flex: 1, textAlign: 'left' }}>Search stores, customers...</span>
          <span style={{
            fontSize: '11px',
            fontWeight: '600',
            background: 'rgba(118, 118, 128, 0.12)',
            padding: '1px 5px',
            borderRadius: '4px',
            color: 'var(--text-secondary)'
          }}>
            ⌘K
          </span>
        </button>

        {/* Branch Selector Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={selectedBranchId}
            onChange={(e) => onBranchChange(e.target.value)}
            disabled={currentRole === 'STORE_MANAGER'}
            style={{
              padding: '6px 12px',
              fontSize: '12.5px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(118, 118, 128, 0.06)',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: currentRole === 'STORE_MANAGER' ? 'not-allowed' : 'pointer'
            }}
          >
            <option value="all">All Branches ({shops.length})</option>
            {shops.map((s) => (
              <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
            ))}
          </select>
        </div>

        {/* Date Range Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <select
            value={dateRange}
            onChange={(e) => onDateRangeChange(e.target.value as DateRange)}
            style={{
              padding: '6px 12px',
              fontSize: '12.5px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(118, 118, 128, 0.06)',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="this_month">This Month</option>
          </select>
        </div>
      </div>

      {/* Center: Realtime Network Operations & Territory Scope Indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 14px',
          background: 'rgba(118, 118, 128, 0.08)',
          borderRadius: 'var(--radius-pill)',
          border: '1px solid var(--border-subtle)',
          fontSize: '12px',
          fontWeight: 600,
          color: 'var(--text-primary)'
        }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: 'var(--apple-green)',
            boxShadow: '0 0 8px rgba(52, 199, 89, 0.7)'
          }} />
          <span>
            {currentRole === 'HQ_OWNER' && 'Enterprise HQ • All 15 Stores (West, North, South)'}
            {currentRole === 'HQ_IT' && 'HQ IT Lead • Diagnostics & Agent Monitoring'}
            {(currentRole === 'AREA_MANAGER' || (currentRole as any) === 'REGIONAL_MANAGER') && 'West Regional Command • 5 Assigned Stores'}
            {currentRole === 'FRANCHISE_OWNER' && 'Patel Retail Network • Franchise Operations'}
            {currentRole === 'STORE_MANAGER' && 'Sharma General Store • Counter POS Operations'}
          </span>
        </div>
      </div>

      {/* Right: Notifications, Anomaly Radar & Theme */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        {/* Risk / Anomaly Alert Trigger */}
        <button
          onClick={onOpenAnomalies}
          className={`apple-btn ${alerts.length > 0 ? 'apple-btn-danger' : 'apple-btn-secondary'}`}
          style={{ padding: '6px 12px', fontSize: '12.5px' }}
          title="Open Risk & Anomaly Radar"
        >
          <AlertTriangle size={14} />
          <span>{alerts.length} Risks</span>
        </button>

        {/* Notifications Popover Trigger */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            style={{
              background: 'rgba(118, 118, 128, 0.1)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              position: 'relative'
            }}
            title="Notifications"
          >
            <Bell size={16} />
            {(unreadCommunityCount > 0 || alerts.length > 0) && (
              <span style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--apple-blue)'
              }}></span>
            )}
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '42px',
              width: '360px',
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-modal)',
              padding: '16px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Notification Center</strong>
                <span style={{ fontSize: '11px', color: 'var(--apple-blue)', cursor: 'pointer' }} onClick={() => setShowNotifications(false)}>Close</span>
              </div>

              {/* Sub-tabs: Community vs Operational Alerts */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setNotifTab('community')}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: 'var(--radius-xs)',
                    border: 'none',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    backgroundColor: notifTab === 'community' ? 'var(--apple-blue-tint)' : 'var(--bg-elevated)',
                    color: notifTab === 'community' ? 'var(--apple-blue)' : 'var(--text-secondary)'
                  }}
                >
                  Franchise Community ({unreadCommunityCount})
                </button>
                <button
                  type="button"
                  onClick={() => setNotifTab('alerts')}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: 'var(--radius-xs)',
                    border: 'none',
                    fontSize: '11.5px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    backgroundColor: notifTab === 'alerts' ? 'var(--apple-blue-tint)' : 'var(--bg-elevated)',
                    color: notifTab === 'alerts' ? 'var(--apple-blue)' : 'var(--text-secondary)'
                  }}
                >
                  Operational Risks ({alerts.length})
                </button>
              </div>

              {/* Notifications Content */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
                {notifTab === 'community' ? (
                  communityNotifications.length > 0 ? (
                    communityNotifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setShowNotifications(false);
                          if (onNavigateToCommunity) onNavigateToCommunity();
                        }}
                        style={{
                          fontSize: '12px',
                          padding: '8px 10px',
                          borderRadius: 'var(--radius-sm)',
                          background: n.read ? 'var(--bg-elevated)' : 'var(--apple-blue-tint)',
                          border: '1px solid var(--border-subtle)',
                          cursor: 'pointer'
                        }}
                      >
                        <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '2px' }}>
                          {n.message}
                        </div>
                        <div style={{ color: 'var(--text-tertiary)', fontSize: '10.5px' }}>
                          {n.created_at}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                      No new community notifications
                    </div>
                  )
                ) : (
                  alerts.slice(0, 5).map((a) => (
                    <div key={a.id} style={{ fontSize: '12px', padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'rgba(118, 118, 128, 0.05)' }}>
                      <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{a.title}</div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginTop: '2px' }}>{a.shop_name} • {a.timestamp}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          style={{
            background: 'rgba(118, 118, 128, 0.1)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-primary)'
          }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {/* Authenticated User Profile & Sign Out */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 8px 4px 4px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              background: 'rgba(118, 118, 128, 0.08)',
              cursor: 'pointer',
              color: 'var(--text-primary)'
            }}
            title="User Profile & Session"
          >
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'var(--apple-blue)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700
            }}>
              {authUser?.avatar_initials || (currentRole === 'HQ_OWNER' ? 'AS' : (currentRole === 'HQ_IT' ? 'PN' : (currentRole === 'STORE_MANAGER' ? 'RS' : 'AP')))}
            </div>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>
              {authUser?.name?.split(' ')[0] || (currentRole === 'HQ_OWNER' ? 'Aditya' : (currentRole === 'HQ_IT' ? 'Priya' : (currentRole === 'STORE_MANAGER' ? 'Ramesh' : 'Amit')))}
            </span>
            <ChevronDown size={13} style={{ color: 'var(--text-secondary)' }} />
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '240px',
              background: 'var(--bg-elevated)',
              backdropFilter: 'blur(20px)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-lg)',
              padding: '12px',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)' }}>
                  {authUser?.name || 'Authenticated User'}
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {authUser?.email || 'user@khatacopilot.com'}
                </div>
                <div style={{
                  display: 'inline-block',
                  marginTop: '6px',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)',
                  background: 'var(--apple-blue-tint)',
                  color: 'var(--apple-blue)',
                  fontSize: '10.5px',
                  fontWeight: 700
                }}>
                  ROLE: {currentRole}
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onLogout();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    background: 'rgba(255, 59, 48, 0.08)',
                    color: 'var(--apple-red)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left'
                  }}
                >
                  <LogOut size={14} />
                  <span>Sign Out of KhataCopilot</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
