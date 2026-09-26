import React from 'react';
import { Shop, DailySales } from '../types';
import { computeGSTConsolidation } from '../services/analyticsEngine';
import { exportGSTReportCSV } from '../services/exportService';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  ShieldCheck, 
  IndianRupee,
  Layers,
  Printer
} from 'lucide-react';

interface GSTReportModalProps {
  shops: Shop[];
  dailySales: DailySales[];
  onClose: () => void;
}

export const GSTReportModal: React.FC<GSTReportModalProps> = ({ shops, dailySales, onClose }) => {
  const gstData = computeGSTConsolidation(shops, dailySales);

  return (
    <div className="apple-modal-overlay" onClick={onClose}>
      <div 
        className="apple-modal-container" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '980px', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-glass-header)',
          backdropFilter: 'var(--backdrop-blur)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--apple-green-tint)',
              color: 'var(--apple-green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.3px', color: 'var(--text-primary)' }}>
                  Consolidated GST Draft (GSTR-1 & GSTR-3B)
                </h2>
                <span className="apple-badge apple-badge-healthy">
                  FY 2026-27 • Sep Draft
                </span>
              </div>
              <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
                Multi-branch aggregated tax liability computation for enterprise kirana network
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => exportGSTReportCSV(gstData.items)}
              className="apple-btn apple-btn-primary"
              style={{ padding: '6px 14px', fontSize: '12.5px' }}
            >
              <Download size={14} />
              <span>Download GSTR CSV</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(118, 118, 128, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          
          {/* Summary Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
            marginBottom: '24px'
          }}>
            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(118, 118, 128, 0.05)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Gross Aggregate Turnover</span>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                ₹{gstData.totalTurnover.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>All {shops.length} branches</span>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(118, 118, 128, 0.05)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Taxable Supplies (65%)</span>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '4px' }}>
                ₹{gstData.totalTaxable.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>FMCG, Oils, Personal Care</span>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'rgba(118, 118, 128, 0.05)', border: '1px solid var(--border-subtle)' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Exempt / Zero Rated (35%)</span>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-green)', marginTop: '4px' }}>
                ₹{gstData.totalExempt.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Loose Grains, Milk, Salt</span>
            </div>

            <div style={{ padding: '16px', borderRadius: 'var(--radius-md)', background: 'var(--apple-blue-tint)', border: '1px solid rgba(0, 113, 227, 0.2)' }}>
              <span style={{ fontSize: '12px', color: 'var(--apple-blue)', fontWeight: '600' }}>Total GST Liability</span>
              <div style={{ fontSize: '20px', fontWeight: '700', color: 'var(--apple-blue)', marginTop: '4px' }}>
                ₹{gstData.totalTax.toLocaleString('en-IN')}
              </div>
              <span style={{ fontSize: '11px', color: 'var(--apple-blue)' }}>CGST: ₹{gstData.totalCGST.toLocaleString('en-IN')} | SGST: ₹{gstData.totalSGST.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Section: Outward Supplies Table (Per Store GSTR-1 Breakdown) */}
          <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Branch-Wise Outward Supplies & Tax Liability Table
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              Intra-state CGST (5%) + SGST (5%) split
            </span>
          </div>

          <div className="apple-table-container">
            <table className="apple-table">
              <thead>
                <tr>
                  <th>Branch Name</th>
                  <th>GSTIN</th>
                  <th style={{ textAlign: 'right' }}>Taxable Turnover</th>
                  <th style={{ textAlign: 'right' }}>Exempt Turnover</th>
                  <th style={{ textAlign: 'right' }}>CGST</th>
                  <th style={{ textAlign: 'right' }}>SGST</th>
                  <th style={{ textAlign: 'right' }}>Total Tax</th>
                  <th style={{ textAlign: 'center' }}>Invoices</th>
                </tr>
              </thead>
              <tbody>
                {gstData.items.map((item) => (
                  <tr key={item.shop_id}>
                    <td style={{ fontWeight: '600' }}>{item.shop_name}</td>
                    <td>
                      <code style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{item.gstin}</code>
                    </td>
                    <td style={{ textAlign: 'right' }}>₹{item.taxable_turnover.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', color: 'var(--apple-green)' }}>₹{item.exempt_turnover.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>₹{item.cgst.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right' }}>₹{item.sgst.toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: '700', color: 'var(--apple-blue)' }}>
                      ₹{item.total_tax.toLocaleString('en-IN')}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                      {item.b2c_invoices_count} B2C
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </div>
  );
};
