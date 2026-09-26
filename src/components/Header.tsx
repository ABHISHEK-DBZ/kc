import React, { useState } from 'react';
import { UserRole, Region, DateRange, Shop, AlertItem } from '../types';
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
  Menu
} from 'lucide-react';

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
  onOpenSearch: () => void;
  onOpenAnomalies: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  onToggleMobileSidebar?: () => void;
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
  onOpenSearch,
  onOpenAnomalies,
  theme,
  onToggleTheme,
  onToggleMobileSidebar
}) => {
  const [showNotifications, setShowNotifications] = useState(false);

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

      {/* Center: Role Switcher Segmented Control */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
        <div className="apple-segmented-control">
          <button
            className={`apple-segment-item ${currentRole === 'HQ_OWNER' ? 'active' : ''}`}
            onClick={() => onRoleChange('HQ_OWNER')}
          >
            <ShieldCheck size={14} />
            <span>HQ Owner</span>
          </button>
          <button
            className={`apple-segment-item ${currentRole === 'REGIONAL_MANAGER' ? 'active' : ''}`}
            onClick={() => onRoleChange('REGIONAL_MANAGER')}
          >
            <MapPin size={14} />
            <span>Area Manager (West)</span>
          </button>
          <button
            className={`apple-segment-item ${currentRole === 'STORE_MANAGER' ? 'active' : ''}`}
            onClick={() => onRoleChange('STORE_MANAGER')}
          >
            <Store size={14} />
            <span>Store Manager</span>
          </button>
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
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: 'var(--apple-red)'
            }}></span>
          </button>

          {/* Notifications Flyout */}
          {showNotifications && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '42px',
              width: '320px',
              background: 'var(--bg-card-solid)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-modal)',
              padding: '14px',
              zIndex: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Operational Notifications</strong>
                <span style={{ fontSize: '11px', color: 'var(--apple-blue)', cursor: 'pointer' }} onClick={() => setShowNotifications(false)}>Close</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
                {alerts.slice(0, 4).map((a) => (
                  <div key={a.id} style={{ fontSize: '12px', padding: '6px 8px', borderRadius: 'var(--radius-xs)', background: 'rgba(118, 118, 128, 0.05)' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{a.title}</div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '11px', marginTop: '1px' }}>{a.shop_name} • {a.timestamp}</div>
                  </div>
                ))}
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

      </div>

    </header>
  );
};
