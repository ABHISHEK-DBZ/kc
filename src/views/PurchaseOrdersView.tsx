import React, { useState } from 'react';
import { PurchaseOrder, UserRole, NavigationTab } from '../types';
import { 
  PackageCheck, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Store, 
  Truck, 
  AlertTriangle, 
  X, 
  Filter, 
  Search,
  ArrowRight
} from 'lucide-react';

interface PurchaseOrdersViewProps {
  purchaseOrders: PurchaseOrder[];
  onApprovePO: (poId: string) => void;
  onRejectPO: (poId: string, reason?: string) => void;
  currentRole?: UserRole;
  onNavigateToAgent?: (tab: NavigationTab) => void;
}

export const PurchaseOrdersView: React.FC<PurchaseOrdersViewProps> = ({
  purchaseOrders,
  onApprovePO,
  onRejectPO,
  currentRole = 'HQ_OWNER',
  onNavigateToAgent
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Awaiting Approval' | 'Approved' | 'Rejected'>('Awaiting Approval');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [rejectingPO, setRejectingPO] = useState<PurchaseOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesFilter = activeFilter === 'All' ? true : po.status === activeFilter;
    const matchesSearch = 
      po.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.shop_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      po.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const awaitingCount = purchaseOrders.filter((p) => p.status === 'Awaiting Approval').length;
  const approvedCount = purchaseOrders.filter((p) => p.status === 'Approved' || p.status === 'Completed').length;
  const rejectedCount = purchaseOrders.filter((p) => p.status === 'Rejected').length;

  const handleApprove = (po: PurchaseOrder) => {
    onApprovePO(po.id);
    showToast(`PO ${po.id} for "${po.product_name}" (${po.quantity} ${po.unit}) approved and dispatched.`);
    if (selectedPO?.id === po.id) setSelectedPO(null);
  };

  const handleConfirmReject = () => {
    if (!rejectingPO) return;
    onRejectPO(rejectingPO.id, rejectionReason.trim() || 'Declined during operations review.');
    showToast(`PO ${rejectingPO.id} marked as Rejected.`);
    setRejectingPO(null);
    setRejectionReason('');
    if (selectedPO?.id === rejectingPO.id) setSelectedPO(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '40px' }}>
      
      {/* Toast Notification */}
      {toastMessage && (
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
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="apple-icon-btn" style={{ width: '20px', height: '20px', marginLeft: '6px' }}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{
        backgroundColor: 'var(--bg-card-solid)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-lg)',
            backgroundColor: 'var(--apple-blue-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--apple-blue)'
          }}>
            <PackageCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--apple-blue)' }}>
                Supply Chain Operations
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>• Inventory Agent Pipeline</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.4px', color: 'var(--text-primary)', margin: '2px 0 0' }}>
              Purchase Order Approvals
            </h1>
          </div>
        </div>

        {onNavigateToAgent && (
          <button
            onClick={() => onNavigateToAgent('agent-inventory')}
            className="apple-btn apple-btn-secondary"
            style={{ padding: '8px 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <span>Open Inventory Agent</span>
            <ArrowRight size={14} />
          </button>
        )}
      </div>

      {/* Search & Tabs Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'Awaiting Approval', label: 'Awaiting Approval', count: awaitingCount, color: 'var(--apple-orange)' },
            { id: 'All', label: 'All Orders', count: purchaseOrders.length, color: 'var(--text-secondary)' },
            { id: 'Approved', label: 'Approved', count: approvedCount, color: 'var(--apple-green)' },
            { id: 'Rejected', label: 'Rejected', count: rejectedCount, color: 'var(--apple-red)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-pill)',
                border: activeFilter === tab.id ? '1px solid var(--apple-blue)' : '1px solid var(--border-subtle)',
                backgroundColor: activeFilter === tab.id ? 'var(--apple-blue-tint)' : 'var(--bg-card-solid)',
                color: activeFilter === tab.id ? 'var(--apple-blue)' : 'var(--text-secondary)',
                fontSize: '12.5px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{tab.label}</span>
              <span style={{
                fontSize: '11px',
                padding: '1px 6px',
                borderRadius: '10px',
                backgroundColor: activeFilter === tab.id ? 'var(--apple-blue)' : 'var(--bg-elevated)',
                color: activeFilter === tab.id ? '#ffffff' : tab.color,
                fontWeight: '700'
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={14} color="var(--text-tertiary)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search PO, SKU or shop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="apple-input"
            style={{ width: '100%', height: '34px', paddingLeft: '32px', fontSize: '12.5px' }}
          />
        </div>
      </div>

      {/* Orders List */}
      {filteredPOs.length === 0 ? (
        <div className="apple-glass-panel" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
          <CheckCircle2 size={44} color="var(--apple-green)" style={{ margin: '0 auto 12px' }} />
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
            No Purchase Orders Found
          </h3>
          <p style={{ fontSize: '13px', margin: '6px 0 0' }}>
            There are currently no orders matching the selected filter or query.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredPOs.map((po) => (
            <div
              key={po.id}
              className="apple-glass-panel"
              style={{
                padding: '18px 22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all var(--transition-fast)'
              }}
            >
              {/* Header line */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontFamily: 'SF Mono, Menlo, monospace',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    color: 'var(--apple-blue)',
                    backgroundColor: 'var(--apple-blue-tint)',
                    padding: '3px 8px',
                    borderRadius: '6px'
                  }}>
                    {po.id}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {po.shop_name}
                  </span>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                    • Generated {po.created_at}
                  </span>
                </div>

                <span style={{
                  fontSize: '11.5px',
                  fontWeight: '700',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-pill)',
                  backgroundColor: po.status === 'Approved' || po.status === 'Completed'
                    ? 'rgba(52, 199, 89, 0.15)' 
                    : (po.status === 'Awaiting Approval' ? 'rgba(255, 149, 0, 0.15)' : 'rgba(255, 59, 48, 0.15)'),
                  color: po.status === 'Approved' || po.status === 'Completed'
                    ? 'var(--apple-green)'
                    : (po.status === 'Awaiting Approval' ? 'var(--apple-orange)' : 'var(--apple-red)')
                }}>
                  {po.status === 'Awaiting Approval' ? '● Awaiting Approval' : po.status}
                </span>
              </div>

              {/* Data Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '12px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '12.5px'
              }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Product Item</div>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{po.product_name}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Order Quantity</div>
                  <div style={{ fontWeight: '700', color: 'var(--apple-blue)', marginTop: '2px' }}>{po.quantity} {po.unit}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Shelf Stock</div>
                  <div style={{ fontWeight: '700', color: 'var(--apple-red)', marginTop: '2px' }}>{po.current_stock} {po.unit}</div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Velocity / Runway</div>
                  <div style={{ fontWeight: '700', color: 'var(--apple-orange)', marginTop: '2px' }}>
                    {po.sales_velocity} /day ({po.days_remaining}d left)
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Total Order Cost</div>
                  <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                    ₹{po.total_amount.toLocaleString('en-IN')}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Vendor Supplier</div>
                  <div style={{ fontWeight: '500', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {po.supplier}
                  </div>
                </div>
              </div>

              {/* Agent Rationale */}
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--apple-purple)' }}>Agent Rationale: </strong>
                <span>{po.reason}</span>
              </div>

              {po.approved_by && (
                <div style={{ fontSize: '11.5px', color: 'var(--apple-green)', fontWeight: '600' }}>
                  ✓ Approved by {po.approved_by} on {po.approved_at || 'Today'}
                </div>
              )}
              {po.rejection_reason && (
                <div style={{ fontSize: '11.5px', color: 'var(--apple-red)', fontWeight: '600' }}>
                  ✕ Rejection Reason: {po.rejection_reason}
                </div>
              )}

              {/* Actions */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '8px',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: '4px'
              }}>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  Origin: {po.created_by}
                </span>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setSelectedPO(po)}
                    className="apple-btn apple-btn-secondary"
                    style={{ padding: '5px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Eye size={13} />
                    <span>Review Rationale</span>
                  </button>

                  {po.status === 'Awaiting Approval' && (
                    <>
                      <button
                        onClick={() => setRejectingPO(po)}
                        className="apple-btn"
                        style={{
                          padding: '5px 12px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          backgroundColor: 'rgba(255, 59, 48, 0.1)',
                          color: 'var(--apple-red)',
                          border: '1px solid var(--apple-red)'
                        }}
                      >
                        <XCircle size={13} />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => handleApprove(po)}
                        className="apple-btn apple-btn-primary"
                        style={{
                          padding: '5px 14px',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <CheckCircle2 size={13} />
                        <span>Approve & Dispatch</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Inspector Sub-Modal */}
      {selectedPO && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setSelectedPO(null)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-xl)',
              padding: '24px',
              boxShadow: 'var(--shadow-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                PO Audit Inspection: {selectedPO.id}
              </h3>
              <button onClick={() => setSelectedPO(null)} className="apple-icon-btn">
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
              <div><strong>Branch:</strong> {selectedPO.shop_name} ({selectedPO.shop_id})</div>
              <div><strong>Item SKU:</strong> {selectedPO.product_name} ({selectedPO.sku_id})</div>
              <div><strong>Order Batch:</strong> {selectedPO.quantity} {selectedPO.unit} @ ₹{selectedPO.unit_price}/{selectedPO.unit}</div>
              <div><strong>Total Order Value:</strong> ₹{selectedPO.total_amount.toLocaleString('en-IN')}</div>
              <div><strong>Distributor:</strong> {selectedPO.supplier}</div>
              <div><strong>Lead Time:</strong> 1 business day (Standard Road Dispatch)</div>
              <div><strong>Depletion Formula:</strong> Current Stock ({selectedPO.current_stock}) ÷ Sales Velocity ({selectedPO.sales_velocity}/day) = {selectedPO.days_remaining} Days Runway</div>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-elevated)', marginTop: '4px' }}>
                <span style={{ color: 'var(--apple-purple)', fontWeight: '600' }}>Algorithm Finding: </span>
                {selectedPO.reason}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '18px' }}>
              <button
                onClick={() => setSelectedPO(null)}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '6px 14px' }}
              >
                Done
              </button>
              {selectedPO.status === 'Awaiting Approval' && (
                <button
                  onClick={() => handleApprove(selectedPO)}
                  className="apple-btn apple-btn-primary"
                  style={{ padding: '6px 16px' }}
                >
                  Approve Order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Sub-Modal */}
      {rejectingPO && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setRejectingPO(null)}
        >
          <div 
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid var(--border-card)',
              borderRadius: 'var(--radius-xl)',
              padding: '20px 24px',
              boxShadow: 'var(--shadow-xl)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <AlertTriangle size={18} color="var(--apple-red)" />
              <h3 style={{ fontSize: '15px', fontWeight: '700', color: 'var(--apple-red)', margin: 0 }}>
                Reject Purchase Order {rejectingPO.id}
              </h3>
            </div>

            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '0 0 12px' }}>
              Please provide an operational rationale for rejecting replenishment of <strong>{rejectingPO.product_name}</strong> for {rejectingPO.shop_name}.
            </p>

            <textarea
              placeholder="e.g. Supplier stock out, alternative brand stocked, or seasonal SKU phase-out."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="apple-input"
              rows={3}
              style={{ width: '100%', fontSize: '12.5px', padding: '8px 10px', resize: 'vertical' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
              <button
                onClick={() => setRejectingPO(null)}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '6px 14px' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                className="apple-btn"
                style={{
                  padding: '6px 16px',
                  backgroundColor: 'var(--apple-red)',
                  color: '#ffffff',
                  fontWeight: '600'
                }}
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
