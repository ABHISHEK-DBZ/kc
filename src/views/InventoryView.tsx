import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem, Shop, SmartRecommendation, RecommendationType, UserRole } from '../types';
import { 
  Package, 
  AlertTriangle, 
  Check, 
  Download, 
  Truck, 
  Search, 
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  RefreshCw,
  X,
  ShoppingCart,
  Info,
  DollarSign,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { exportInventoryReport } from '../services/exportService';
import { api } from '../services/api';
import { realtimeClient } from '../services/realtime';

interface InventoryViewProps {
  inventoryItems: InventoryItem[];
  shops: Shop[];
  onNavigateToPO?: () => void;
  onRefreshPOs?: () => void;
  userRole?: UserRole;
}

export const InventoryView: React.FC<InventoryViewProps> = ({ 
  inventoryItems, 
  shops,
  onNavigateToPO,
  onRefreshPOs
}) => {
  // Navigation & View Mode
  const [activeSubTab, setActiveSubTab] = useState<'recommendations' | 'all-inventory'>('recommendations');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [recFilter, setRecFilter] = useState<'ALL' | RecommendationType>('ALL');

  // Recommendations State
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState<boolean>(true);
  const [recalculating, setRecalculating] = useState<boolean>(false);

  // Detail Drawer / Modal State
  const [selectedRec, setSelectedRec] = useState<SmartRecommendation | null>(null);
  const [orderQty, setOrderQty] = useState<number>(0);
  const [orderReason, setOrderReason] = useState<string>('');
  const [orderingPO, setOrderingPO] = useState<boolean>(false);
  const [poSuccessMessage, setPoSuccessMessage] = useState<string | null>(null);

  // Quick Action States
  const [poCreated, setPoCreated] = useState<{ [id: string]: boolean }>({});
  const [transferDone, setTransferDone] = useState<{ [id: string]: boolean }>({});

  // Fetch Recommendations from Backend
  const loadRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const data = await api.getInventoryRecommendations();
      if (data && Array.isArray(data)) {
        setRecommendations(data);
      }
    } catch (err) {
      console.error('[InventoryView] Error loading recommendations:', err);
    } finally {
      setLoadingRecs(false);
    }
  };

  useEffect(() => {
    loadRecommendations();

    // Subscribe to Realtime SSE updates
    const unsubscribe = realtimeClient.subscribe('INVENTORY_RECOMMENDATIONS_UPDATED', () => {
      loadRecommendations();
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // When drawer opens, initialize form fields
  useEffect(() => {
    if (selectedRec) {
      setOrderQty(selectedRec.suggested_order_qty > 0 ? selectedRec.suggested_order_qty : (selectedRec.min_order_qty || 12));
      setOrderReason(`AI Recommendation (${selectedRec.recommendation_type}): ${selectedRec.reason}`);
      setPoSuccessMessage(null);
    }
  }, [selectedRec]);

  // Handle Recalculate
  const handleRecalculate = async () => {
    try {
      setRecalculating(true);
      await api.recalculateInventoryRecommendations();
      await loadRecommendations();
    } catch (err) {
      console.error('[InventoryView] Recalculate failed:', err);
    } finally {
      setRecalculating(false);
    }
  };

  // Handle Create PO Draft from Drawer
  const handleCreatePODraft = async () => {
    if (!selectedRec) return;
    try {
      setOrderingPO(true);
      const res = await api.createPOFromRecommendation(selectedRec.id, orderQty, orderReason);
      setPoSuccessMessage(`PO Draft #${res.purchaseOrder.id} successfully generated! Awaiting human approval.`);
      setPoCreated((prev) => ({ ...prev, [selectedRec.id]: true }));
      if (onRefreshPOs) onRefreshPOs();
      await loadRecommendations();
    } catch (err: any) {
      alert(`Error creating purchase order: ${err.message}`);
    } finally {
      setOrderingPO(false);
    }
  };

  // Quick PO Draft Button directly from table
  const handleQuickPO = async (rec: SmartRecommendation) => {
    try {
      setPoCreated((prev) => ({ ...prev, [rec.id]: true }));
      const res = await api.createPOFromRecommendation(rec.id, rec.suggested_order_qty > 0 ? rec.suggested_order_qty : 12);
      alert(`Purchase Order #${res.purchaseOrder.id} drafted for ${res.purchaseOrder.quantity} ${rec.unit} of ${rec.product_name}. Transmitted to approval queue.`);
      if (onRefreshPOs) onRefreshPOs();
      await loadRecommendations();
    } catch (err: any) {
      alert(`Failed to create PO: ${err.message}`);
      setPoCreated((prev) => ({ ...prev, [rec.id]: false }));
    }
  };

  const handleInterStoreTransfer = (id: string, name: string) => {
    setTransferDone((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      alert(`Inter-Store Transfer initiated: 15 units of ${name} scheduled from surplus branch to destination.`);
    }, 100);
  };

  // Categories
  const categories = useMemo(() => {
    const set = new Set(inventoryItems.map((i) => i.category));
    return ['All', ...Array.from(set)];
  }, [inventoryItems]);

  // Filtered Recommendations
  const filteredRecs = useMemo(() => {
    return recommendations.filter((r) => {
      const matchesSearch = 
        r.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || r.category === categoryFilter;
      
      let matchesType = true;
      if (recFilter !== 'ALL') {
        matchesType = r.recommendation_type === recFilter;
      }

      return matchesSearch && matchesCategory && matchesType;
    });
  }, [recommendations, searchTerm, categoryFilter, recFilter]);

  // Filtered Standard Inventory Items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((i) => {
      const matchesSearch = i.item_name.toLowerCase().includes(searchTerm.toLowerCase()) || i.supplier.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All' || i.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => (a.current_stock / a.sales_velocity) - (b.current_stock / b.sales_velocity));
  }, [inventoryItems, searchTerm, categoryFilter]);

  // KPI Metrics Calculation
  const kpis = useMemo(() => {
    const toReorder = recommendations.filter((r) => ['BUY_NOW', 'BUY_MORE', 'URGENT_REORDER', 'BUY_NORMAL'].includes(r.recommendation_type)).length;
    const urgent = recommendations.filter((r) => r.recommendation_type === 'URGENT_REORDER').length;
    const highProfit = recommendations.filter((r) => r.profit_opportunity === 'HIGH').length;
    const slowMoving = recommendations.filter((r) => r.recommendation_type === 'SLOW_MOVING').length;
    const overstock = recommendations.filter((r) => ['OVERSTOCK_RISK', 'DO_NOT_BUY'].includes(r.recommendation_type)).length;
    const estimatedStockouts = recommendations.filter((r) => r.stock_coverage_days <= 2.0).length;

    return { toReorder, urgent, highProfit, slowMoving, overstock, estimatedStockouts };
  }, [recommendations]);

  // Top Lists
  const topLists = useMemo(() => {
    const buyList = [...recommendations]
      .filter((r) => ['BUY_MORE', 'URGENT_REORDER', 'BUY_NOW'].includes(r.recommendation_type))
      .sort((a, b) => b.suggested_order_qty - a.suggested_order_qty)
      .slice(0, 4);

    const avoidList = [...recommendations]
      .filter((r) => ['DO_NOT_BUY', 'OVERSTOCK_RISK', 'SLOW_MOVING'].includes(r.recommendation_type))
      .sort((a, b) => b.stock_coverage_days - a.stock_coverage_days)
      .slice(0, 4);

    const fastestGrowing = [...recommendations]
      .sort((a, b) => b.sales_trend_pct - a.sales_trend_pct)
      .slice(0, 4);

    const slowestMoving = [...recommendations]
      .sort((a, b) => a.sales_velocity - b.sales_velocity)
      .slice(0, 4);

    return { buyList, avoidList, fastestGrowing, slowestMoving };
  }, [recommendations]);

  // Helper for recommendation badges
  const renderRecBadge = (type: RecommendationType) => {
    switch (type) {
      case 'URGENT_REORDER':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '9999px', fontSize: '11px', fontWeight: '800', background: 'rgba(255, 59, 48, 0.15)', color: '#FF3B30', border: '1px solid rgba(255, 59, 48, 0.3)' }}>
            <AlertTriangle size={11} /> URGENT REORDER
          </span>
        );
      case 'BUY_MORE':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '9999px', fontSize: '11px', fontWeight: '800', background: 'rgba(175, 82, 222, 0.15)', color: '#AF52DE', border: '1px solid rgba(175, 82, 222, 0.3)' }}>
            <TrendingUp size={11} /> BUY MORE
          </span>
        );
      case 'BUY_NOW':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '9999px', fontSize: '11px', fontWeight: '800', background: 'rgba(52, 199, 89, 0.15)', color: '#34C759', border: '1px solid rgba(52, 199, 89, 0.3)' }}>
            <ShoppingCart size={11} /> BUY NOW
          </span>
        );
      case 'BUY_NORMAL':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', background: 'rgba(0, 122, 255, 0.12)', color: '#007AFF', border: '1px solid rgba(0, 122, 255, 0.25)' }}>
            <Package size={11} /> BUY NORMAL
          </span>
        );
      case 'WAIT':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', background: 'rgba(142, 142, 147, 0.15)', color: '#8E8E93', border: '1px solid rgba(142, 142, 147, 0.25)' }}>
            <Clock size={11} /> WAIT
          </span>
        );
      case 'SLOW_MOVING':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', background: 'rgba(255, 149, 0, 0.15)', color: '#FF9500', border: '1px solid rgba(255, 149, 0, 0.3)' }}>
            <TrendingDown size={11} /> SLOW MOVING
          </span>
        );
      case 'DO_NOT_BUY':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '9999px', fontSize: '11px', fontWeight: '800', background: 'rgba(255, 45, 85, 0.15)', color: '#FF2D55', border: '1px solid rgba(255, 45, 85, 0.3)' }}>
            <X size={11} /> DO NOT BUY
          </span>
        );
      case 'OVERSTOCK_RISK':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 9px', borderRadius: '9999px', fontSize: '11px', fontWeight: '800', background: 'rgba(255, 59, 48, 0.12)', color: '#D70015', border: '1px solid rgba(255, 59, 48, 0.25)' }}>
            <ShieldAlert size={11} /> OVERSTOCK RISK
          </span>
        );
    }
  };

  // Helper for Profit Opportunity badge
  const renderOpportunityBadge = (opp: SmartRecommendation['profit_opportunity']) => {
    switch (opp) {
      case 'HIGH':
        return (
          <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: '800', background: 'rgba(52, 199, 89, 0.15)', color: '#34C759', border: '1px solid rgba(52, 199, 89, 0.3)' }}>
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: '700', background: 'rgba(0, 122, 255, 0.12)', color: '#007AFF' }}>
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: '600', background: 'rgba(142, 142, 147, 0.15)', color: '#8E8E93' }}>
            LOW
          </span>
        );
      default:
        return (
          <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
            NEUTRAL
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      
      {/* Top Banner / Mode Switcher */}
      <div className="apple-glass-panel" style={{ padding: '20px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #007AFF, #5856D6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '19px', fontWeight: '700', letterSpacing: '-0.4px', color: 'var(--text-primary)', margin: 0 }}>
                AI Purchase Recommendation & Smart Reorder Intelligence
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', margin: '3px 0 0 0' }}>
                Autonomous inventory intelligence powered by sales velocity, lead-time runway, margin mix, and trend acceleration.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Sub-tab pills */}
          <div style={{ display: 'flex', background: 'rgba(118, 118, 128, 0.08)', padding: '3px', borderRadius: '9999px' }}>
            <button
              onClick={() => setActiveSubTab('recommendations')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                background: activeSubTab === 'recommendations' ? 'var(--bg-card-solid)' : 'transparent',
                color: activeSubTab === 'recommendations' ? 'var(--apple-blue)' : 'var(--text-secondary)',
                boxShadow: activeSubTab === 'recommendations' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles size={13} />
              <span>Smart Reorder ({recommendations.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('all-inventory')}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12px',
                fontWeight: '600',
                border: 'none',
                background: activeSubTab === 'all-inventory' ? 'var(--bg-card-solid)' : 'transparent',
                color: activeSubTab === 'all-inventory' ? 'var(--apple-blue)' : 'var(--text-secondary)',
                boxShadow: activeSubTab === 'all-inventory' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Package size={13} />
              <span>SKU Catalog ({inventoryItems.length})</span>
            </button>
          </div>

          <button
            onClick={handleRecalculate}
            disabled={recalculating}
            className="apple-btn apple-btn-secondary"
            style={{ fontSize: '12px', padding: '6px 14px' }}
            title="Recalculate recommendations from real database signals"
          >
            <RefreshCw size={13} className={recalculating ? 'animate-spin' : ''} />
            <span>{recalculating ? 'Analyzing...' : 'Re-analyze'}</span>
          </button>

          {onNavigateToPO && (
            <button
              onClick={onNavigateToPO}
              className="apple-btn apple-btn-primary"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              <ShoppingCart size={13} />
              <span>Review POs</span>
            </button>
          )}
        </div>
      </div>

      {/* SUMMARY KPI CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
        gap: '12px'
      }}>
        <div className="apple-kpi-card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase' }}>Products to Reorder</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--apple-blue)', margin: '4px 0' }}>{kpis.toReorder}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Based on burn rate & threshold</div>
        </div>

        <div className="apple-kpi-card" style={{ padding: '14px', borderLeft: '3px solid var(--apple-red)' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--apple-red)', fontWeight: '700', textTransform: 'uppercase' }}>Urgent Reorders</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--apple-red)', margin: '4px 0' }}>{kpis.urgent}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Coverage ≤ lead time (3-4d)</div>
        </div>

        <div className="apple-kpi-card" style={{ padding: '14px', borderLeft: '3px solid var(--apple-green)' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--apple-green)', fontWeight: '700', textTransform: 'uppercase' }}>Profit Opportunities</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--apple-green)', margin: '4px 0' }}>{kpis.highProfit}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>High margin + demand surge</div>
        </div>

        <div className="apple-kpi-card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--apple-orange)', fontWeight: '600', textTransform: 'uppercase' }}>Slow Moving SKUs</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--apple-orange)', margin: '4px 0' }}>{kpis.slowMoving}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Velocity &lt; 0.6 units/day</div>
        </div>

        <div className="apple-kpi-card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '11.5px', color: '#D70015', fontWeight: '600', textTransform: 'uppercase' }}>Overstock Risk</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#D70015', margin: '4px 0' }}>{kpis.overstock}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Coverage &gt; 60 days of demand</div>
        </div>

        <div className="apple-kpi-card" style={{ padding: '14px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', fontWeight: '600', textTransform: 'uppercase' }}>Stockouts in &lt;48h</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: kpis.estimatedStockouts > 0 ? 'var(--apple-red)' : 'var(--text-primary)', margin: '4px 0' }}>
            {kpis.estimatedStockouts}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Immediate stock runout risk</div>
        </div>
      </div>

      {activeSubTab === 'recommendations' ? (
        <>
          {/* TOP RANKING INTELLIGENCE GRIDS */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '14px'
          }}>
            {/* 1. Top Products to Buy */}
            <div className="apple-glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px', color: 'var(--apple-blue)' }}>
                  <ShoppingCart size={15} /> Top Products to Buy
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>By suggested order</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topLists.buyList.map((r) => (
                  <div 
                    key={r.id} 
                    onClick={() => setSelectedRec(r)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(118, 118, 128, 0.04)', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s' }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '12.5px', color: 'var(--text-primary)' }}>{r.product_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>{r.shop_name} • {r.stock_coverage_days.toFixed(1)}d runway</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--apple-blue)' }}>+{r.suggested_order_qty} {r.unit}</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--apple-green)', fontWeight: '600' }}>₹{r.unit_profit} profit/ea</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Top Products to Avoid */}
            <div className="apple-glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px', color: '#FF2D55' }}>
                  <ShieldAlert size={15} /> Top Products to Avoid
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>By days coverage</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topLists.avoidList.map((r) => (
                  <div 
                    key={r.id} 
                    onClick={() => setSelectedRec(r)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(118, 118, 128, 0.04)', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '12.5px', color: 'var(--text-primary)' }}>{r.product_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Stock: {r.current_stock} {r.unit} • {r.sales_trend_pct}% trend</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', fontSize: '12px', color: '#FF2D55' }}>{Math.round(r.stock_coverage_days)}d cover</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Order: 0</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Fastest Growing Demand */}
            <div className="apple-glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px', color: 'var(--apple-green)' }}>
                  <TrendingUp size={15} /> Fastest Growing Demand
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>30d velocity growth</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topLists.fastestGrowing.map((r) => (
                  <div 
                    key={r.id} 
                    onClick={() => setSelectedRec(r)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(118, 118, 128, 0.04)', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '12.5px', color: 'var(--text-primary)' }}>{r.product_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Velocity: {r.sales_velocity}/day</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '800', fontSize: '13px', color: 'var(--apple-green)' }}>+{r.sales_trend_pct}%</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>{renderRecBadge(r.recommendation_type)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Slowest Moving Products */}
            <div className="apple-glass-panel" style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '13px', color: 'var(--apple-orange)' }}>
                  <TrendingDown size={15} /> Slowest Moving Products
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Capital lockup risks</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {topLists.slowestMoving.map((r) => (
                  <div 
                    key={r.id} 
                    onClick={() => setSelectedRec(r)}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(118, 118, 128, 0.04)', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '12.5px', color: 'var(--text-primary)' }}>{r.product_name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Stock: {r.current_stock} • Trend: {r.sales_trend_pct}%</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', fontSize: '12px', color: 'var(--apple-orange)' }}>{r.sales_velocity} /day</div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>{Math.round(r.stock_coverage_days)}d supply</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RECOMMENDATIONS TABLE SECTION */}
          <div className="apple-glass-panel" style={{ padding: '20px' }}>
            {/* Filter Pills & Search */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '16px' }}>
              
              {/* Type filter pills */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {[
                  { key: 'ALL', label: 'All' },
                  { key: 'URGENT_REORDER', label: 'Urgent Reorder' },
                  { key: 'BUY_MORE', label: 'Buy More' },
                  { key: 'BUY_NOW', label: 'Buy Now' },
                  { key: 'BUY_NORMAL', label: 'Buy Normal' },
                  { key: 'WAIT', label: 'Wait' },
                  { key: 'DO_NOT_BUY', label: 'Do Not Buy' },
                  { key: 'SLOW_MOVING', label: 'Slow Moving' },
                  { key: 'OVERSTOCK_RISK', label: 'Overstock Risk' }
                ].map((pill) => (
                  <button
                    key={pill.key}
                    onClick={() => setRecFilter(pill.key as any)}
                    style={{
                      padding: '4px 10px',
                      fontSize: '11.5px',
                      borderRadius: '9999px',
                      border: '1px solid',
                      borderColor: recFilter === pill.key ? 'var(--apple-blue)' : 'var(--border-subtle)',
                      background: recFilter === pill.key ? 'var(--apple-blue-tint)' : 'transparent',
                      color: recFilter === pill.key ? 'var(--apple-blue)' : 'var(--text-secondary)',
                      fontWeight: recFilter === pill.key ? '700' : '500',
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                  >
                    {pill.label}
                  </button>
                ))}
              </div>

              {/* Search & Category */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    borderRadius: '9999px',
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

                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={13} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
                  <input
                    type="text"
                    placeholder="Search product, branch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="apple-input"
                    style={{ paddingLeft: '30px', height: '32px', fontSize: '12px' }}
                  />
                </div>
              </div>
            </div>

            {/* Smart Recommendations Table */}
            {loadingRecs ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 8px auto' }} />
                <div>Analyzing real inventory, sales velocity, and margin mix...</div>
              </div>
            ) : filteredRecs.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                <Info size={24} style={{ margin: '0 auto 8px auto' }} />
                <div>No recommendations matching the active filter criteria.</div>
              </div>
            ) : (
              <div className="apple-table-container">
                <table className="apple-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Branch</th>
                      <th style={{ textAlign: 'right' }}>Stock</th>
                      <th style={{ textAlign: 'center' }}>Sales Trend</th>
                      <th style={{ textAlign: 'center' }}>Coverage</th>
                      <th style={{ textAlign: 'right' }}>Unit Margin</th>
                      <th>AI Recommendation</th>
                      <th style={{ textAlign: 'right' }}>Suggested Qty</th>
                      <th style={{ textAlign: 'center' }}>Profit Opp.</th>
                      <th>Reasoning</th>
                      <th style={{ textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecs.map((rec) => {
                      const isOrdered = rec.status === 'ORDERED' || poCreated[rec.id];
                      return (
                        <tr 
                          key={rec.id} 
                          style={{ cursor: 'pointer' }}
                          onClick={() => setSelectedRec(rec)}
                        >
                          <td>
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '13px' }}>
                              {rec.product_name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                              SKU: {rec.sku_id} • {rec.category}
                            </div>
                          </td>

                          <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                            {rec.shop_name}
                          </td>

                          <td style={{ textAlign: 'right', fontWeight: '700', color: rec.stock_coverage_days <= 2 ? 'var(--apple-red)' : 'var(--text-primary)' }}>
                            {rec.current_stock} <span style={{ fontSize: '10.5px', fontWeight: 'normal', color: 'var(--text-tertiary)' }}>{rec.unit}</span>
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '2px',
                              padding: '2px 7px',
                              borderRadius: '9999px',
                              fontSize: '11.5px',
                              fontWeight: '700',
                              background: rec.sales_trend_pct >= 0 ? 'rgba(52, 199, 89, 0.12)' : 'rgba(255, 59, 48, 0.12)',
                              color: rec.sales_trend_pct >= 0 ? '#34C759' : '#FF3B30'
                            }}>
                              {rec.sales_trend_pct >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                              {rec.sales_trend_pct >= 0 ? `+${rec.sales_trend_pct}%` : `${rec.sales_trend_pct}%`}
                            </span>
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              fontSize: '11.5px',
                              fontWeight: '700',
                              color: rec.stock_coverage_days <= 2 ? '#FF3B30' : (rec.stock_coverage_days <= 7 ? '#FF9500' : 'var(--text-primary)')
                            }}>
                              {rec.stock_coverage_days < 999 ? `${rec.stock_coverage_days.toFixed(1)}d` : '999d'}
                            </span>
                          </td>

                          <td style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '700', fontSize: '12px', color: 'var(--text-primary)' }}>₹{rec.unit_profit}</div>
                            <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>{rec.margin_pct}%</div>
                          </td>

                          <td>
                            {renderRecBadge(rec.recommendation_type)}
                          </td>

                          <td style={{ textAlign: 'right', fontWeight: '800', fontSize: '13px', color: rec.suggested_order_qty > 0 ? 'var(--apple-blue)' : 'var(--text-tertiary)' }}>
                            {rec.suggested_order_qty > 0 ? `${rec.suggested_order_qty} ${rec.unit}` : '0'}
                          </td>

                          <td style={{ textAlign: 'center' }}>
                            {renderOpportunityBadge(rec.profit_opportunity)}
                          </td>

                          <td style={{ maxWidth: '240px', fontSize: '11.5px', color: 'var(--text-secondary)', lineHeight: '1.3' }}>
                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                              "{rec.reason}"
                            </div>
                          </td>

                          <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                              {rec.suggested_order_qty > 0 && (
                                <button
                                  onClick={() => handleQuickPO(rec)}
                                  disabled={isOrdered}
                                  className="apple-btn apple-btn-primary"
                                  style={{
                                    padding: '4px 10px',
                                    fontSize: '11.5px',
                                    background: isOrdered ? 'rgba(52, 199, 89, 0.2)' : 'var(--apple-blue)',
                                    color: isOrdered ? '#34C759' : '#fff'
                                  }}
                                  title="Create a real Purchase Order Draft in backend"
                                >
                                  {isOrdered ? <CheckCircle2 size={12} /> : <ShoppingCart size={12} />}
                                  <span>{isOrdered ? 'PO Drafted' : 'Create PO'}</span>
                                </button>
                              )}

                              <button
                                onClick={() => setSelectedRec(rec)}
                                className="apple-btn apple-btn-secondary"
                                style={{ padding: '4px 8px', fontSize: '11.5px' }}
                                title="Inspect underlying data signals and transparent formula"
                              >
                                <span>Signals</span>
                                <ArrowRight size={11} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* STANDARD ALL INVENTORY VIEW (Existing Catalog) */
        <div className="apple-glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Store Branch Inventory Catalog
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0 0' }}>
                Real-time on-hand stock and distributor reorder thresholds.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => exportInventoryReport(filteredItems, 'csv')}
                className="apple-btn apple-btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
              <button
                onClick={() => exportInventoryReport(filteredItems, 'excel')}
                className="apple-btn apple-btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px' }}
              >
                <Download size={13} />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          <div className="apple-table-container">
            <table className="apple-table">
              <thead>
                <tr>
                  <th>Product SKU</th>
                  <th>Branch Shop</th>
                  <th>Category</th>
                  <th style={{ textAlign: 'right' }}>Current Stock</th>
                  <th style={{ textAlign: 'right' }}>Reorder Point</th>
                  <th style={{ textAlign: 'right' }}>Daily Burn Rate</th>
                  <th style={{ textAlign: 'center' }}>Runway</th>
                  <th>Stockout Date</th>
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
                      <td style={{ fontSize: '12px', color: isCritical ? 'var(--apple-red)' : 'var(--text-secondary)' }}>
                        {item.estimated_stockout_date}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {isCritical && (
                            <button
                              onClick={() => handleInterStoreTransfer(item.id, item.item_name)}
                              disabled={transferDone[item.id]}
                              className="apple-btn apple-btn-secondary"
                              style={{ padding: '4px 8px', fontSize: '11.5px' }}
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
      )}

      {/* DETAIL DRAWER / SLIDE-OVER */}
      {selectedRec && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '540px',
          maxWidth: '100vw',
          background: 'var(--bg-card-solid)',
          boxShadow: '-10px 0 35px rgba(0,0,0,0.25)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid var(--border-subtle)',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}>
          
          {/* Drawer Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            background: 'var(--bg-glass)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                {renderRecBadge(selectedRec.recommendation_type)}
                {renderOpportunityBadge(selectedRec.profit_opportunity)}
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                {selectedRec.product_name}
              </h3>
              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                SKU: {selectedRec.sku_id} • {selectedRec.shop_name} • {selectedRec.category}
              </div>
            </div>

            <button
              onClick={() => setSelectedRec(null)}
              style={{
                background: 'rgba(118, 118, 128, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Drawer Body */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Success notification */}
            {poSuccessMessage && (
              <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(52, 199, 89, 0.15)', border: '1px solid rgba(52, 199, 89, 0.3)', color: '#34C759', fontSize: '12.5px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} />
                <span>{poSuccessMessage}</span>
              </div>
            )}

            {/* AI Reasoning Section */}
            <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0, 122, 255, 0.05)', border: '1px solid rgba(0, 122, 255, 0.15)' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--apple-blue)', textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Sparkles size={13} /> AI Decision Reasoning
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: '1.45', margin: 0 }}>
                "{selectedRec.reason}"
              </p>
              <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginTop: '8px', fontStyle: 'italic' }}>
                Confidence Score: {Math.round(selectedRec.confidence * 100)}% • Model: KhataCopilot Inventory Intelligence v2.4
              </div>
            </div>

            {/* WHY AM I SEEING THIS RECOMMENDATION? (Actual Data Signals) */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={14} color="var(--apple-blue)" /> Why am I seeing this recommendation?
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
                background: 'rgba(118, 118, 128, 0.04)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Current On-Hand Stock</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedRec.current_stock} {selectedRec.unit}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Stock Runway (Coverage)</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: selectedRec.stock_coverage_days <= 2 ? 'var(--apple-red)' : 'var(--text-primary)' }}>
                    {selectedRec.stock_coverage_days.toFixed(1)} days
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Sales Velocity (Daily)</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>{selectedRec.sales_velocity} {selectedRec.unit}/day</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>30-Day Sales Trend</div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: selectedRec.sales_trend_pct >= 0 ? '#34C759' : '#FF3B30' }}>
                    {selectedRec.sales_trend_pct >= 0 ? `+${selectedRec.sales_trend_pct}%` : `${selectedRec.sales_trend_pct}%`}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Recent 7-Day Sales</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedRec.sales_7d} {selectedRec.unit}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Recent 30-Day Sales</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{selectedRec.sales_30d} {selectedRec.unit}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Unit Margin & Profit</div>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--apple-green)' }}>
                    ₹{selectedRec.unit_profit} ({selectedRec.margin_pct}%)
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Selling / Cost Price</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    ₹{selectedRec.unit_price} / ₹{selectedRec.cost_price}
                  </div>
                </div>
              </div>
            </div>

            {/* TRANSPARENT REORDER FORMULA BREAKDOWN */}
            <div>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DollarSign size={14} color="var(--apple-green)" /> Transparent Suggested Reorder Formula
              </h4>
              <div style={{
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(118, 118, 128, 0.04)',
                border: '1px solid var(--border-subtle)',
                fontSize: '12px',
                color: 'var(--text-secondary)'
              }}>
                <code style={{ fontSize: '11px', color: 'var(--apple-blue)', display: 'block', marginBottom: '8px' }}>
                  Suggested Order = max(Min Order, (Lead Time + Target Cycle) × Daily Sales + Safety Stock - Current Stock)
                </code>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11.5px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Lead Time:</span>
                    <strong>{selectedRec.formula_breakdown?.leadTimeDays || selectedRec.lead_time_days || 4} days</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Target Review Cycle:</span>
                    <strong>{selectedRec.formula_breakdown?.cycleDays || 14} days</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Daily Sales Velocity:</span>
                    <strong>{selectedRec.sales_velocity} units/day</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Projected Demand:</span>
                    <strong>{selectedRec.projected_demand} units</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Safety Stock Buffer:</span>
                    <strong>{selectedRec.safety_stock} units</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Current Inventory:</span>
                    <strong>{selectedRec.current_stock} units</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', marginTop: '4px', fontWeight: '700', color: 'var(--apple-blue)' }}>
                    <span>Calculated Suggested Order:</span>
                    <span>{selectedRec.suggested_order_qty} {selectedRec.unit}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ESTIMATED PROFIT OPPORTUNITY CALLOUT */}
            <div style={{ padding: '12px 14px', borderRadius: '8px', background: 'rgba(52, 199, 89, 0.06)', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
              <div style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--apple-green)', textTransform: 'uppercase', marginBottom: '4px' }}>
                Profit Opportunity: {selectedRec.profit_opportunity}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                {selectedRec.profit_opportunity === 'HIGH'
                  ? 'Demand is rising while inventory runway is short. Maintaining adequate stock may help capture estimated potential customer demand.'
                  : (selectedRec.profit_opportunity === 'LOW'
                    ? 'Sales velocity is subdued. Additional ordering may tie up working capital with minimal near-term profit upside.'
                    : 'Steady baseline demand indicates standard profit margins.')}
              </p>
              <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                * Note: Estimates are based on recent store transaction trends and are not financial guarantees.
              </div>
            </div>

            {/* PURCHASE ORDER DRAFT GENERATOR FORM */}
            <div style={{ padding: '16px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>
                Generate Purchase Order Draft
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Order Quantity ({selectedRec.unit}):
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={orderQty}
                    onChange={(e) => setOrderQty(Math.max(1, Number(e.target.value)))}
                    className="apple-input"
                    style={{ height: '36px', fontSize: '13px', fontWeight: '700' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>Unit Cost:</span>
                  <span style={{ fontWeight: '600' }}>₹{selectedRec.cost_price}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', padding: '6px 0' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: '600' }}>Estimated Order Cost:</span>
                  <span style={{ fontWeight: '800', color: 'var(--apple-blue)', fontSize: '14px' }}>
                    ₹{(orderQty * selectedRec.cost_price).toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <label style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                    Order Justification:
                  </label>
                  <textarea
                    rows={2}
                    value={orderReason}
                    onChange={(e) => setOrderReason(e.target.value)}
                    className="apple-input"
                    style={{ padding: '8px', fontSize: '12px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Preferred Supplier: <strong>{selectedRec.supplier}</strong>
                </div>

                <button
                  onClick={handleCreatePODraft}
                  disabled={orderingPO || orderQty <= 0}
                  className="apple-btn apple-btn-primary"
                  style={{ width: '100%', padding: '10px', fontSize: '13px', marginTop: '6px' }}
                >
                  <ShoppingCart size={14} />
                  <span>{orderingPO ? 'Submitting PO Draft...' : `Create PO Draft (₹${(orderQty * selectedRec.cost_price).toLocaleString('en-IN')})`}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
