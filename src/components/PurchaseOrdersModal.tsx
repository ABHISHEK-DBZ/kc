import React, { useState } from 'react';
import { PurchaseOrder, UserRole, AgentTask } from '../types';
import { 
  PackageCheck, 
  X, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye, 
  Store, 
  Truck, 
  TrendingDown, 
  ShieldAlert, 
  FileText,
  AlertTriangle
} from 'lucide-react';

interface PurchaseOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrders: PurchaseOrder[];
  onApprovePO: (poId: string) => void;
  onRejectPO: (poId: string, reason?: string) => void;
  currentRole?: UserRole;
  onSuccess: (message: string) => void;
}

export const PurchaseOrdersModal: React.FC<PurchaseOrdersModalProps> = ({
  isOpen,
  onClose,
  purchaseOrders,
  onApprovePO,
  onRejectPO,
  currentRole = 'HQ_OWNER',
  onSuccess
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Awaiting Approval' | 'Approved' | 'Rejected'>('Awaiting Approval');
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [rejectingPO, setRejectingPO] = useState<PurchaseOrder | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!isOpen) return null;

  const filteredPOs = purchaseOrders.filter((po) => {
    if (activeFilter === 'All') return true;
    return po.status === activeFilter;
  });

  const awaitingCount = purchaseOrders.filter((p) => p.status === 'Awaiting Approval').length;
  const approvedCount = purchaseOrders.filter((p) => p.status === 'Approved' || p.status === 'Completed').length;
  const rejectedCount = purchaseOrders.filter((p) => p.status === 'Rejected').length;

  const handleApprove = (po: PurchaseOrder) => {
    onApprovePO(po.id);
    onSuccess(`PO ${po.id} for "${po.product_name}" (${po.quantity} ${po.unit}) approved and dispatched to ${po.supplier}.`);
    if (selectedPO?.id === po.id) setSelectedPO(null);
  };

  const handleConfirmReject = () => {
    if (!rejectingPO) return;
    onRejectPO(rejectingPO.id, rejectionReason.trim() || 'Declined by HQ Operations Review.');
    onSuccess(`PO ${rejectingPO.id} marked as Rejected.`);
    setRejectingPO(null);
    setRejectionReason('');
    if (selectedPO?.id === rejectingPO.id) setSelectedPO(null);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '880px',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--apple-blue-tint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--apple-blue)'
            }}>
              <PackageCheck size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Autonomous Purchase Order Approvals
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                Inventory Agent replenishment recommendations awaiting operational sign-off
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="apple-icon-btn"
            style={{ width: '32px', height: '32px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Filter Pills */}
        <div style={{
          padding: '12px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
          backgroundColor: 'var(--bg-primary)'
        }}>
          <div style={{ display: 'flex', gap: '8px' }}>
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
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-pill)',
                  border: activeFilter === tab.id ? '1px solid var(--apple-blue)' : '1px solid var(--border-subtle)',
                  backgroundColor: activeFilter === tab.id ? 'var(--apple-blue-tint)' : 'var(--bg-card-solid)',
                  color: activeFilter === tab.id ? 'var(--apple-blue)' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{tab.label}</span>
                <span style={{
                  fontSize: '10.5px',
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

          <div style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
            Signing as: <strong style={{ color: 'var(--apple-blue)' }}>{currentRole.replace(/_/g, ' ')}</strong>
          </div>
        </div>

        {/* PO Table / Cards List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
          {filteredPOs.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              <CheckCircle2 size={40} color="var(--apple-green)" style={{ margin: '0 auto 12px' }} />
              <div style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
                No Purchase Orders In This View
              </div>
              <p style={{ fontSize: '12.5px', margin: '4px 0 0' }}>
                All inventory replenishment recommendations are currently up to date.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredPOs.map((po) => (
                <div
                  key={po.id}
                  style={{
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-card)',
                    backgroundColor: 'var(--bg-elevated)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* Top Bar: ID, Branch, Status */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontFamily: 'SF Mono, Menlo, monospace',
                        fontSize: '12px',
                        fontWeight: '700',
                        color: 'var(--apple-blue)',
                        backgroundColor: 'var(--apple-blue-tint)',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {po.id}
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                        {po.shop_name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        • {po.created_at}
                      </span>
                    </div>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      padding: '3px 8px',
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

                  {/* Product Details & Inventory Telemetry */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-card-solid)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12px'
                  }}>
                    <div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Product Item</div>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>{po.product_name}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>PO Order Qty</div>
                      <div style={{ fontWeight: '700', color: 'var(--apple-blue)', marginTop: '2px' }}>{po.quantity} {po.unit}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Current Shelf Stock</div>
                      <div style={{ fontWeight: '700', color: 'var(--apple-red)', marginTop: '2px' }}>{po.current_stock} {po.unit}</div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Velocity & Runway</div>
                      <div style={{ fontWeight: '700', color: 'var(--apple-orange)', marginTop: '2px' }}>
                        {po.sales_velocity} /day ({po.days_remaining}d left)
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Estimated Cost</div>
                      <div style={{ fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                        ₹{po.total_amount.toLocaleString('en-IN')}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>Authorized Supplier</div>
                      <div style={{ fontWeight: '500', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {po.supplier}
                      </div>
                    </div>
                  </div>

                  {/* Agent Rationale & Context */}
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontWeight: '600', color: 'var(--apple-purple)' }}>Agent Rationale:</span>
                    <span>{po.reason}</span>
                  </div>

                  {/* Approved or Rejected Metadata */}
                  {po.approved_by && (
                    <div style={{ fontSize: '11px', color: 'var(--apple-green)', fontWeight: '600' }}>
                      ✓ Authorized by {po.approved_by} on {po.approved_at || 'Today'}
                    </div>
                  )}
                  {po.rejection_reason && (
                    <div style={{ fontSize: '11px', color: 'var(--apple-red)', fontWeight: '600' }}>
                      ✕ Rejection Note: {po.rejection_reason}
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                    marginTop: '2px'
                  }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      Origin: {po.created_by}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => setSelectedPO(po)}
                        className="apple-btn apple-btn-secondary"
                        style={{ padding: '4px 10px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Eye size={13} />
                        <span>Review</span>
                      </button>

                      {po.status === 'Awaiting Approval' && (
                        <>
                          <button
                            onClick={() => setRejectingPO(po)}
                            className="apple-btn"
                            style={{
                              padding: '4px 10px',
                              fontSize: '11.5px',
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
                              padding: '4px 12px',
                              fontSize: '11.5px',
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
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--bg-elevated)'
        }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
            Approving triggers automated electronic dispatch to franchised vendor networks.
          </span>
          <button
            onClick={onClose}
            className="apple-btn apple-btn-secondary"
            style={{ padding: '6px 16px', fontSize: '12.5px' }}
          >
            Close
          </button>
        </div>
      </div>

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
