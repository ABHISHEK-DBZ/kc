import React, { useState, useMemo } from 'react';
import { InventoryItem, Shop } from '../types';
import { 
  Package, 
  AlertTriangle, 
  Check, 
  Download, 
  Truck, 
  Search, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { exportInventoryReport } from '../services/exportService';

interface InventoryViewProps {
  inventoryItems: InventoryItem[];
  shops: Shop[];
}

export const InventoryView: React.FC<InventoryViewProps> = ({ inventoryItems, shops }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [poCreated, setPoCreated] = useState<{ [id: string]: boolean }>({});
  const [transferDone, setTransferDone] = useState<{ [id: string]: boolean }>({});

  const categories = useMemo(() => {
    const set = new Set(inventoryItems.map((i) => i.category));
    return ['All', ...Array.from(set)];
  }, [inventoryItems]);

  const filteredItems = useMemo(() => {
    return inventoryItems.filter((i) => {
      const matchesSearch = i.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || i.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || i.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => (a.current_stock / a.sales_velocity) - (b.current_stock / b.sales_velocity));
  }, [inventoryItems, searchTerm, categoryFilter]);

  const criticalCount = useMemo(() => {
    return inventoryItems.filter((i) => (i.current_stock / i.sales_velocity) < 2.0).length;
  }, [inventoryItems]);

  const handleCreatePO = (id: string, name: string, qty: number, unit: string) => {
    setPoCreated((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      alert(`Purchase Order #${Math.floor(1000 + Math.random() * 9000)} generated for ${qty} ${unit} of ${name}. Transmitted to distributor.`);
    }, 100);
  };

  const handleInterStoreTransfer = (id: string, name: string) => {
    setTransferDone((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      alert(`Inter-Store Transfer initiated: 15 units of ${name} dispatched from Ganesh Stores (Surplus) to destination branch.`);
    }, 100);
  };

  return (
    <div className="apple-glass-panel" style={{ padding: '22px' }}>
      
      {/* Header */}
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
              Predictive Inventory & Velocity Replenishment
            </h2>
            <span style={{
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'var(--apple-orange-tint)',
              color: 'var(--apple-orange)',
              fontWeight: '700'
            }}>
              {criticalCount} Critical SKUs
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Burn-rate velocity aware stockout forecasting: <code>Days of Runway = Current Stock / Daily Velocity</code>.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => exportInventoryReport(filteredItems, 'csv')}
            className="apple-btn apple-btn-secondary"
            style={{ fontSize: '12.5px', padding: '6px 12px' }}
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => exportInventoryReport(filteredItems, 'excel')}
            className="apple-btn apple-btn-secondary"
            style={{ fontSize: '12.5px', padding: '6px 12px' }}
          >
            <Download size={13} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Filter toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
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
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search SKU, supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="apple-input"
            style={{ paddingLeft: '32px', height: '34px', fontSize: '12.5px' }}
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="apple-table-container">
        <table className="apple-table">
          <thead>
            <tr>
              <th>Product SKU</th>
              <th>Branch Shop</th>
              <th>Category</th>
              <th style={{ textAlign: 'right' }}>Current Stock</th>
              <th style={{ textAlign: 'right' }}>Reorder Threshold</th>
              <th style={{ textAlign: 'right' }}>Sales Velocity</th>
              <th style={{ textAlign: 'center' }}>Days of Runway</th>
              <th>Stockout Date</th>
              <th style={{ textAlign: 'right' }}>Suggested PO</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => {
              const shop = shops.find((s) => s.id === item.shop_id);
              const runway = item.sales_velocity > 0 ? (item.current_stock / item.sales_velocity).toFixed(1) : '99';
              const isCritical = Number(runway) < 2.0;

              return (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{item.item_name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Supplier: {item.supplier}</div>
                  </td>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                    {shop?.name || item.shop_id}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{item.category}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: isCritical ? 'var(--apple-red)' : 'var(--text-primary)' }}>
                    {item.current_stock} {item.unit}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--text-tertiary)' }}>
                    {item.reorder_threshold} {item.unit}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '600' }}>
                    {item.sales_velocity} {item.unit}/day
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      background: isCritical ? 'var(--apple-red-tint)' : (Number(runway) < 3.5 ? 'var(--apple-orange-tint)' : 'var(--apple-green-tint)'),
                      color: isCritical ? 'var(--apple-red)' : (Number(runway) < 3.5 ? 'var(--apple-orange)' : 'var(--apple-green)')
                    }}>
                      {runway} days
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: isCritical ? 'var(--apple-red)' : 'var(--text-secondary)', fontWeight: isCritical ? '600' : 'normal' }}>
                    {item.estimated_stockout_date}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--apple-blue)' }}>
                    {item.suggested_reorder_qty > 0 ? `${item.suggested_reorder_qty} ${item.unit}` : '—'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                      <button
                        onClick={() => handleCreatePO(item.id, item.item_name, item.suggested_reorder_qty, item.unit)}
                        disabled={poCreated[item.id]}
                        className="apple-btn apple-btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11.5px' }}
                        title="Dispatch automated distributor PO"
                      >
                        {poCreated[item.id] ? <Check size={12} /> : <Package size={12} />}
                        <span>{poCreated[item.id] ? 'PO Sent' : 'Reorder'}</span>
                      </button>

                      {isCritical && (
                        <button
                          onClick={() => handleInterStoreTransfer(item.id, item.item_name)}
                          disabled={transferDone[item.id]}
                          className="apple-btn apple-btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11.5px' }}
                          title="Trigger inter-store stock balancing"
                        >
                          <Truck size={12} />
                          <span>{transferDone[item.id] ? 'Transferring' : 'Transfer'}</span>
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
  );
};
