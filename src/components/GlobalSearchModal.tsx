import React, { useState, useMemo, useEffect } from 'react';
import { Shop, Customer, InventoryItem, StaffActivity, UdhaarRecord } from '../types';
import { 
  Search, 
  X, 
  Store, 
  User, 
  Package, 
  CreditCard, 
  UserCheck, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  shops: Shop[];
  customers: Customer[];
  inventoryItems: InventoryItem[];
  staffActivities: StaffActivity[];
  udhaarRecords: UdhaarRecord[];
  onSelectShop: (shop: Shop) => void;
  onSelectTab: (tab: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  shops,
  customers,
  inventoryItems,
  staffActivities,
  udhaarRecords,
  onSelectShop,
  onSelectTab
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase().trim();

    const matchedShops = shops.filter(
      (s) => s.name.toLowerCase().includes(q) || s.location.toLowerCase().includes(q) || s.manager_name.toLowerCase().includes(q)
    );

    const matchedCustomers = customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.shop_name.toLowerCase().includes(q)
    );

    const matchedProducts = inventoryItems.filter(
      (i) => i.item_name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
    );

    const matchedUdhaar = udhaarRecords.filter(
      (u) => u.customer_name.toLowerCase().includes(q) || u.phone.includes(q)
    );

    const matchedStaff = staffActivities.filter(
      (s) => s.staff_name.toLowerCase().includes(q) || s.action.toLowerCase().includes(q)
    );

    return {
      shops: matchedShops.slice(0, 4),
      customers: matchedCustomers.slice(0, 4),
      products: matchedProducts.slice(0, 4),
      udhaar: matchedUdhaar.slice(0, 4),
      staff: matchedStaff.slice(0, 4),
      totalCount: matchedShops.length + matchedCustomers.length + matchedProducts.length + matchedUdhaar.length + matchedStaff.length
    };
  }, [query, shops, customers, inventoryItems, udhaarRecords, staffActivities]);

  if (!isOpen) return null;

  return (
    <div className="apple-modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '10vh' }}>
      <div 
        className="apple-modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}
      >
        {/* Search Input Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '14px 18px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-card-solid)'
        }}>
          <Search size={18} color="var(--apple-blue)" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stores, customers, items, udhaar, or staff (e.g. 'Ramesh', 'Atta', 'Sharma')..."
            style={{
              flex: 1,
              border: 'none',
              background: 'transparent',
              fontSize: '15px',
              fontFamily: 'inherit',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
            >
              <X size={16} />
            </button>
          ) : (
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)', background: 'rgba(118, 118, 128, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
              ESC
            </span>
          )}
        </div>

        {/* Results Container */}
        <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '12px' }}>
          {!searchResults ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
              Type to search across 15 retail stores, 16 customer khata accounts, and inventory items.
            </div>
          ) : searchResults.totalCount === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '13px' }}>
              No matches found for "<strong>{query}</strong>". Try searching "Ramesh", "Amul", or "Sharma".
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Shops Matches */}
              {searchResults.shops.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-tertiary)', marginBottom: '6px', paddingLeft: '8px' }}>
                    Shops ({searchResults.shops.length})
                  </div>
                  {searchResults.shops.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        onClose();
                        onSelectShop(s);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer',
                        transition: 'background var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(118, 118, 128, 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Store size={15} color="var(--apple-blue)" />
                        <div>
                          <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>{s.name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '6px' }}>{s.location}</span>
                        </div>
                      </div>
                      <span className={`apple-badge apple-badge-${s.status.toLowerCase().replace('-', '')}`} style={{ fontSize: '10.5px' }}>
                        {s.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Customers Matches */}
              {searchResults.customers.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-tertiary)', marginBottom: '6px', paddingLeft: '8px' }}>
                    Khata Customers ({searchResults.customers.length})
                  </div>
                  {searchResults.customers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        onClose();
                        onSelectTab('customers');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(118, 118, 128, 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <User size={15} color="var(--apple-indigo)" />
                        <div>
                          <span style={{ fontSize: '13.5px', fontWeight: '600', color: 'var(--text-primary)' }}>{c.name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '6px' }}>{c.phone} • {c.shop_name}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '12.5px', fontWeight: '700', color: c.risk_level === 'Critical' ? 'var(--apple-red)' : 'var(--text-primary)' }}>
                        ₹{c.total_udhaar.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Products Matches */}
              {searchResults.products.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-tertiary)', marginBottom: '6px', paddingLeft: '8px' }}>
                    Inventory Products ({searchResults.products.length})
                  </div>
                  {searchResults.products.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => {
                        onClose();
                        onSelectTab('inventory');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(118, 118, 128, 0.08)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Package size={15} color="var(--apple-orange)" />
                        <div>
                          <span style={{ fontSize: '13.5px', fontWeight: '500', color: 'var(--text-primary)' }}>{p.item_name}</span>
                          <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginLeft: '6px' }}>{p.category}</span>
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {p.current_stock} {p.unit} (₹{p.unit_price})
                      </span>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};
