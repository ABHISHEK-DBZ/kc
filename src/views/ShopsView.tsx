import React, { useState, useMemo, useEffect } from 'react';
import { Shop, HealthStatus, Region } from '../types';
import { 
  Search, 
  ArrowUpDown, 
  ChevronRight, 
  ChevronLeft, 
  Download, 
  ShieldAlert, 
  Filter, 
  Store, 
  MapPin, 
  Clock 
} from 'lucide-react';
import { exportShopsSummary } from '../services/exportService';

interface ShopsViewProps {
  shops: Shop[];
  onSelectShop: (shop: Shop) => void;
  initialHealthFilter?: HealthStatus | 'All';
}

type SortField = 'name' | 'daily_revenue' | 'monthly_revenue' | 'profit_margin_pct' | 'udhaar_outstanding' | 'stock_alert_count' | 'health_score';
type SortOrder = 'asc' | 'desc';

export const ShopsView: React.FC<ShopsViewProps> = ({
  shops,
  onSelectShop,
  initialHealthFilter = 'All'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [healthFilter, setHealthFilter] = useState<'All' | HealthStatus>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const healthParam = urlParams.get('health');
    if (healthParam === 'at-risk') return 'At-Risk';
    if (healthParam === 'watch') return 'Watch';
    if (healthParam === 'healthy') return 'Healthy';
    return initialHealthFilter;
  });

  useEffect(() => {
    if (initialHealthFilter && initialHealthFilter !== 'All') {
      setHealthFilter(initialHealthFilter);
    }
  }, [initialHealthFilter]);
  const [cityFilter, setCityFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('monthly_revenue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Extract unique cities
  const cities = useMemo(() => {
    const set = new Set(shops.map((s) => s.city));
    return ['All', ...Array.from(set)];
  }, [shops]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredShops = useMemo(() => {
    return shops
      .filter((shop) => {
        const matchesSearch = 
          shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.manager_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesHealth = healthFilter === 'All' || shop.status === healthFilter;
        const matchesCity = cityFilter === 'All' || shop.city === cityFilter;

        return matchesSearch && matchesHealth && matchesCity;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [shops, searchTerm, healthFilter, cityFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredShops.length / pageSize) || 1;
  const paginatedShops = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredShops.slice(start, start + pageSize);
  }, [filteredShops, currentPage, pageSize]);

  return (
    <div className="apple-glass-panel" style={{ padding: '22px' }}>
      
      {/* Top Header & Export */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        marginBottom: '18px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
              Retail Branch Directory & CRM
            </h2>
            <span style={{
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(118, 118, 128, 0.1)',
              color: 'var(--text-secondary)',
              fontWeight: '600'
            }}>
              {filteredShops.length} stores
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Multi-branch operational metrics, calculated health scores, and cashier audit states.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => exportShopsSummary(filteredShops, 'csv')}
            className="apple-btn apple-btn-secondary"
            style={{ fontSize: '12.5px', padding: '6px 12px' }}
          >
            <Download size={13} />
            <span>CSV</span>
          </button>
          <button
            onClick={() => exportShopsSummary(filteredShops, 'excel')}
            className="apple-btn apple-btn-secondary"
            style={{ fontSize: '12.5px', padding: '6px 12px' }}
          >
            <Download size={13} />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        padding: '12px 14px',
        background: 'rgba(118, 118, 128, 0.04)',
        borderRadius: 'var(--radius-md)',
        marginBottom: '16px'
      }}>
        {/* Health Tabs */}
        <div className="apple-segmented-control">
          <button
            className={`apple-segment-item ${healthFilter === 'All' ? 'active' : ''}`}
            onClick={() => { setHealthFilter('All'); setCurrentPage(1); }}
          >
            All ({shops.length})
          </button>
          <button
            className={`apple-segment-item ${healthFilter === 'Healthy' ? 'active' : ''}`}
            onClick={() => { setHealthFilter('Healthy'); setCurrentPage(1); }}
          >
            Healthy ({shops.filter((s) => s.status === 'Healthy').length})
          </button>
          <button
            className={`apple-segment-item ${healthFilter === 'Watch' ? 'active' : ''}`}
            onClick={() => { setHealthFilter('Watch'); setCurrentPage(1); }}
          >
            Watch ({shops.filter((s) => s.status === 'Watch').length})
          </button>
          <button
            className={`apple-segment-item ${healthFilter === 'At-Risk' ? 'active' : ''}`}
            onClick={() => { setHealthFilter('At-Risk'); setCurrentPage(1); }}
          >
            At-Risk ({shops.filter((s) => s.status === 'At-Risk').length})
          </button>
        </div>

        {/* City Filter & Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <select
            value={cityFilter}
            onChange={(e) => { setCityFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '6px 12px',
              fontSize: '12.5px',
              borderRadius: 'var(--radius-pill)',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card-solid)',
              color: 'var(--text-primary)',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {cities.map((c) => (
              <option key={c} value={c}>City: {c}</option>
            ))}
          </select>

          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search store, manager..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="apple-input"
              style={{ paddingLeft: '32px', height: '34px', fontSize: '12.5px' }}
            />
          </div>
        </div>
      </div>

      {/* CRM Table */}
      <div className="apple-table-container">
        <table className="apple-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Shop & Manager
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th>Location</th>
              <th onClick={() => handleSort('health_score')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  Health Score
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('daily_revenue')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  Daily Revenue
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('monthly_revenue')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  Monthly Revenue
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('profit_margin_pct')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  Margin %
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('udhaar_outstanding')} style={{ cursor: 'pointer', textAlign: 'right' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                  Udhaar Outstanding
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('stock_alert_count')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  Stock Alerts
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ textAlign: 'center' }}>Last Active</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedShops.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)' }}>
                  No branches found matching your filter criteria.
                </td>
              </tr>
            ) : (
              paginatedShops.map((shop) => (
                <tr
                  key={shop.id}
                  onClick={() => onSelectShop(shop)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Shop & Manager */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13.5px' }}>
                        {shop.name}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        Mgr: {shop.manager_name} ({shop.owner_contact})
                      </span>
                    </div>
                  </td>

                  {/* Location */}
                  <td>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                      {shop.location}
                    </span>
                  </td>

                  {/* Health Score Pill */}
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                      <span className={`apple-badge apple-badge-${shop.status.toLowerCase().replace('-', '')}`}>
                        <span className="apple-status-dot"></span>
                        {shop.health_score}/100 • {shop.status}
                      </span>
                      {shop.cash_variance_today < -1000 && (
                        <span style={{ fontSize: '10px', color: 'var(--apple-red)', fontWeight: '600' }}>
                          Cash: -₹{Math.abs(shop.cash_variance_today)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Daily Revenue */}
                  <td style={{ textAlign: 'right', fontWeight: '600' }}>
                    ₹{shop.daily_revenue.toLocaleString('en-IN')}
                  </td>

                  {/* Monthly Revenue */}
                  <td style={{ textAlign: 'right', fontWeight: '500' }}>
                    ₹{shop.monthly_revenue.toLocaleString('en-IN')}
                  </td>

                  {/* Margin % */}
                  <td style={{ textAlign: 'right' }}>
                    <span style={{
                      fontWeight: '600',
                      color: shop.profit_margin_pct >= 15 ? 'var(--apple-green)' : (shop.profit_margin_pct >= 12 ? 'var(--apple-orange)' : 'var(--apple-red)')
                    }}>
                      {shop.profit_margin_pct.toFixed(1)}%
                    </span>
                  </td>

                  {/* Udhaar Outstanding */}
                  <td style={{ textAlign: 'right' }}>
                    <span style={{
                      fontWeight: '600',
                      color: shop.udhaar_outstanding > 120000 ? 'var(--apple-red)' : 'var(--text-primary)'
                    }}>
                      ₹{shop.udhaar_outstanding.toLocaleString('en-IN')}
                    </span>
                  </td>

                  {/* Stock Alert */}
                  <td style={{ textAlign: 'center' }}>
                    {shop.stock_alert_count > 0 ? (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: shop.stock_alert_count >= 3 ? 'var(--apple-red-tint)' : 'var(--apple-orange-tint)',
                        color: shop.stock_alert_count >= 3 ? 'var(--apple-red)' : 'var(--apple-orange)',
                        fontSize: '11.5px',
                        fontWeight: '700'
                      }}>
                        {shop.stock_alert_count} SKUs
                      </span>
                    ) : (
                      <span style={{ fontSize: '11.5px', color: 'var(--apple-green)', fontWeight: '500' }}>Optimal</span>
                    )}
                  </td>

                  {/* Last Active */}
                  <td style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    {shop.last_active}
                  </td>

                  {/* Action */}
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectShop(shop);
                      }}
                      className="apple-btn apple-btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '11.5px' }}
                    >
                      <span>Drill Down</span>
                      <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '16px',
        marginTop: '10px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: '12.5px',
        color: 'var(--text-tertiary)'
      }}>
        <span>
          Showing {paginatedShops.length} of {filteredShops.length} branches (Page {currentPage} of {totalPages})
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="apple-btn apple-btn-secondary"
            style={{ padding: '4px 10px', fontSize: '12px' }}
          >
            <ChevronLeft size={13} />
            <span>Prev</span>
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="apple-btn apple-btn-secondary"
            style={{ padding: '4px 10px', fontSize: '12px' }}
          >
            <span>Next</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

    </div>
  );
};
