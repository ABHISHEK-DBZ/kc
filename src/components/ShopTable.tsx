import React, { useState, useMemo } from 'react';
import { Shop, HealthStatus } from '../types';
import { 
  Search, 
  ArrowUpDown, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

interface ShopTableProps {
  shops: Shop[];
  onSelectShop: (shop: Shop) => void;
}

type SortField = 'name' | 'daily_revenue' | 'monthly_revenue' | 'profit_margin_pct' | 'udhaar_outstanding' | 'stock_alert_count' | 'status';
type SortOrder = 'asc' | 'desc';

export const ShopTable: React.FC<ShopTableProps> = ({ shops, onSelectShop }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | HealthStatus>('All');
  const [sortField, setSortField] = useState<SortField>('daily_revenue');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const filteredAndSortedShops = useMemo(() => {
    return shops
      .filter((shop) => {
        const matchesSearch = 
          shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          shop.manager_name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || shop.status === statusFilter;
        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        let valA: any = a[sortField];
        let valB: any = b[sortField];

        if (typeof valA === 'string') {
          return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }

        return sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [shops, searchTerm, statusFilter, sortField, sortOrder]);

  return (
    <div className="apple-glass-panel" style={{ padding: '20px', marginBottom: '28px' }}>
      {/* Table Toolbar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '14px',
        marginBottom: '18px'
      }}>
        {/* Title & Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
            Shop Network Performance
          </h2>
          <span style={{
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            background: 'rgba(118, 118, 128, 0.1)',
            padding: '2px 8px',
            borderRadius: '9999px',
            fontWeight: '500'
          }}>
            {filteredAndSortedShops.length} of {shops.length} branches
          </span>
        </div>

        {/* Filters & Search */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '10px' }}>
          {/* Status Tabs */}
          <div className="apple-segmented-control">
            <button
              className={`apple-segment-item ${statusFilter === 'All' ? 'active' : ''}`}
              onClick={() => setStatusFilter('All')}
            >
              All
            </button>
            <button
              className={`apple-segment-item ${statusFilter === 'Healthy' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Healthy')}
            >
              Healthy
            </button>
            <button
              className={`apple-segment-item ${statusFilter === 'Watch' ? 'active' : ''}`}
              onClick={() => setStatusFilter('Watch')}
            >
              Watch
            </button>
            <button
              className={`apple-segment-item ${statusFilter === 'At-Risk' ? 'active' : ''}`}
              onClick={() => setStatusFilter('At-Risk')}
            >
              At-Risk
            </button>
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search store, area..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="apple-input"
              style={{ paddingLeft: '32px', paddingRight: '12px', height: '34px', fontSize: '13px' }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="apple-table-container">
        <table className="apple-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Shop & Location
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('status')} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Health Status
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
                  Udhaar (Credit)
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th onClick={() => handleSort('stock_alert_count')} style={{ cursor: 'pointer', textAlign: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  Stock Alerts
                  <ArrowUpDown size={12} />
                </div>
              </th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedShops.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)' }}>
                  No branches match your current filter or search criteria.
                </td>
              </tr>
            ) : (
              filteredAndSortedShops.map((shop) => (
                <tr 
                  key={shop.id}
                  onClick={() => onSelectShop(shop)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Shop & Location */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '14px' }}>
                        {shop.name}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                        {shop.location} • Mgr: {shop.manager_name}
                      </span>
                    </div>
                  </td>

                  {/* Health Status */}
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className={`apple-badge apple-badge-${shop.status.toLowerCase().replace('-', '')}`}>
                        <span className="apple-status-dot"></span>
                        {shop.status}
                      </span>
                      {shop.cash_variance_today < -1000 && (
                        <span style={{
                          fontSize: '11px',
                          color: 'var(--apple-red)',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <ShieldAlert size={11} /> -₹{Math.abs(shop.cash_variance_today)} Cash Short
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Daily Revenue */}
                  <td style={{ textAlign: 'right', fontWeight: '600' }}>
                    ₹{shop.daily_revenue.toLocaleString('en-IN')}
                    <div style={{ fontSize: '11.5px', color: 'var(--apple-green)', fontWeight: '500' }}>
                      +₹{shop.daily_profit.toLocaleString('en-IN')} profit
                    </div>
                  </td>

                  {/* Monthly Revenue */}
                  <td style={{ textAlign: 'right', fontWeight: '500' }}>
                    ₹{shop.monthly_revenue.toLocaleString('en-IN')}
                  </td>

                  {/* Profit Margin % */}
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
                    <div style={{ fontWeight: '600', color: shop.udhaar_outstanding > 120000 ? 'var(--apple-red)' : 'var(--text-primary)' }}>
                      ₹{shop.udhaar_outstanding.toLocaleString('en-IN')}
                    </div>
                    {shop.udhaar_outstanding > 120000 && (
                      <span style={{ fontSize: '10.5px', color: 'var(--apple-red)', fontWeight: '500' }}>High Default Risk</span>
                    )}
                  </td>

                  {/* Stock Alert Count */}
                  <td style={{ textAlign: 'center' }}>
                    {shop.stock_alert_count > 0 ? (
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: shop.stock_alert_count >= 5 ? 'var(--apple-red-tint)' : 'var(--apple-orange-tint)',
                        color: shop.stock_alert_count >= 5 ? 'var(--apple-red)' : 'var(--apple-orange)',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {shop.stock_alert_count} SKUs
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>Optimal</span>
                    )}
                  </td>

                  {/* Action */}
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectShop(shop);
                      }}
                      className="apple-btn apple-btn-secondary"
                      style={{ padding: '5px 12px', fontSize: '12px' }}
                    >
                      <span>Drill Down</span>
                      <ChevronRight size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
