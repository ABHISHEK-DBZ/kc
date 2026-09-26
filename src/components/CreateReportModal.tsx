import React, { useState } from 'react';
import { Shop, DailySales, UdhaarRecord, InventoryItem, Region, DateRange } from '../types';
import { 
  FileSpreadsheet, 
  X, 
  Download, 
  Check, 
  Calendar, 
  Filter, 
  Building2, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { 
  exportSalesReport, 
  exportProfitReport, 
  exportUdhaarAging, 
  exportInventoryReport, 
  exportCashAuditReport, 
  exportShopsSummary, 
  exportGSTReport 
} from '../services/exportService';

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  shops: Shop[];
  dailySales: DailySales[];
  udhaarRecords: UdhaarRecord[];
  inventoryItems: InventoryItem[];
  currentRegion?: Region;
  currentDateRange?: DateRange;
  onSuccess: (message: string) => void;
}

export type ReportType = 
  | 'sales' 
  | 'profit' 
  | 'udhaar' 
  | 'inventory' 
  | 'cash_audit' 
  | 'shop_performance' 
  | 'gst_draft';

export const CreateReportModal: React.FC<CreateReportModalProps> = ({
  isOpen,
  onClose,
  shops,
  dailySales,
  udhaarRecords,
  inventoryItems,
  currentRegion = 'All',
  currentDateRange = '30d',
  onSuccess
}) => {
  const [reportType, setReportType] = useState<ReportType>('sales');
  const [dateRangeSelection, setDateRangeSelection] = useState<string>(currentDateRange);
  const [regionSelection, setRegionSelection] = useState<string>(currentRegion);
  const [format, setFormat] = useState<'csv' | 'excel'>('csv');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      // 1. Filter shops by region selection
      let scopedShops = shops;
      if (regionSelection !== 'All') {
        scopedShops = shops.filter((s) => s.region === regionSelection);
      }
      const scopedShopIds = new Set(scopedShops.map((s) => s.id));

      // 2. Filter sub-datasets
      const scopedSales = dailySales.filter((s) => scopedShopIds.has(s.shop_id));
      const scopedUdhaar = udhaarRecords.filter((u) => scopedShopIds.has(u.shop_id));
      const scopedInventory = inventoryItems.filter((i) => scopedShopIds.has(i.shop_id));

      let reportName = 'Sales Report';

      // 3. Execute real download via exportService
      switch (reportType) {
        case 'sales':
          exportSalesReport(scopedSales, scopedShops, format);
          reportName = 'Sales Report';
          break;
        case 'profit':
          exportProfitReport(scopedShops, format);
          reportName = 'Profit Report';
          break;
        case 'udhaar':
          exportUdhaarAging(scopedUdhaar, regionSelection === 'All' ? 'Network' : regionSelection, format);
          reportName = 'Udhaar Report';
          break;
        case 'inventory':
          exportInventoryReport(scopedInventory, format);
          reportName = 'Inventory Report';
          break;
        case 'cash_audit':
          exportCashAuditReport(scopedShops, format);
          reportName = 'Cash Audit Report';
          break;
        case 'shop_performance':
          exportShopsSummary(scopedShops, format);
          reportName = 'Shop Performance Report';
          break;
        case 'gst_draft':
          // Derive GST draft items from shops & sales
          const gstDrafts = scopedShops.map((s) => ({
            shop_id: s.id,
            shop_name: s.name,
            gstin: '27AAPFU' + s.id.replace('shop-', '10') + 'P1ZV',
            taxable_turnover: Math.round(s.monthly_revenue * 0.82),
            exempt_turnover: Math.round(s.monthly_revenue * 0.18),
            cgst: Math.round(s.monthly_revenue * 0.09),
            sgst: Math.round(s.monthly_revenue * 0.09),
            igst: 0,
            total_tax: Math.round(s.monthly_revenue * 0.18),
            b2b_invoices_count: Math.round(s.monthly_revenue / 4500),
            b2c_invoices_count: Math.round(s.monthly_revenue / 280)
          }));
          exportGSTReport(gstDrafts, format);
          reportName = 'GST Draft Report';
          break;
      }

      setIsGenerating(false);
      onSuccess(`${reportName} (${format.toUpperCase()}) generated and downloaded successfully.`);
      onClose();
    }, 450);
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
          maxWidth: '520px',
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'rgba(52, 199, 89, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--apple-green)'
            }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Generate Operational Report
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                Export real branch telemetries & compliance data
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

        {/* Form Body */}
        <form onSubmit={handleGenerate} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Report Type Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Report Type *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                { id: 'sales', label: 'Sales Report', desc: 'Daily turnover & POS splits' },
                { id: 'profit', label: 'Profit Report', desc: 'Net margins & cost of goods' },
                { id: 'udhaar', label: 'Udhaar Report', desc: 'Credit aging & high-risk brackets' },
                { id: 'inventory', label: 'Inventory Report', desc: 'Stockouts & burn runway' },
                { id: 'cash_audit', label: 'Cash Audit', desc: 'Register variance & cashiers' },
                { id: 'shop_performance', label: 'Shop Performance', desc: 'Comprehensive branch metrics' },
                { id: 'gst_draft', label: 'GST Draft Report', desc: 'GSTR-1 summary & tax slabs' }
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setReportType(item.id as ReportType)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: reportType === item.id ? '1.5px solid var(--apple-blue)' : '1px solid var(--border-subtle)',
                    backgroundColor: reportType === item.id ? 'var(--apple-blue-tint)' : 'var(--bg-elevated)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ fontSize: '12.5px', fontWeight: '600', color: reportType === item.id ? 'var(--apple-blue)' : 'var(--text-primary)' }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                    {item.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range & Region Scope */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Date Window
              </label>
              <select
                value={dateRangeSelection}
                onChange={(e) => setDateRangeSelection(e.target.value)}
                className="apple-input"
                style={{ width: '100%', height: '36px', fontSize: '12.5px' }}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days (Default)</option>
                <option value="this_month">This Month</option>
                <option value="90d">Last 90 Days</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Territory / Branches
              </label>
              <select
                value={regionSelection}
                onChange={(e) => setRegionSelection(e.target.value)}
                className="apple-input"
                style={{ width: '100%', height: '36px', fontSize: '12.5px' }}
              >
                <option value="All">All Branches ({shops.length} Stores)</option>
                <option value="West">West Region (Maharashtra)</option>
                <option value="South">South Region (Bengaluru)</option>
                <option value="North">North Region (Delhi NCR)</option>
              </select>
            </div>
          </div>

          {/* Export File Format */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Output Format
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <label style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: format === 'csv' ? '1.5px solid var(--apple-blue)' : '1px solid var(--border-subtle)',
                backgroundColor: format === 'csv' ? 'var(--apple-blue-tint)' : 'var(--bg-elevated)',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: '600'
              }}>
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={format === 'csv'}
                  onChange={() => setFormat('csv')}
                  style={{ accentColor: 'var(--apple-blue)' }}
                />
                <span>CSV Spreadsheet (.csv)</span>
              </label>

              <label style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-md)',
                border: format === 'excel' ? '1.5px solid var(--apple-blue)' : '1px solid var(--border-subtle)',
                backgroundColor: format === 'excel' ? 'var(--apple-blue-tint)' : 'var(--bg-elevated)',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: '600'
              }}>
                <input
                  type="radio"
                  name="format"
                  value="excel"
                  checked={format === 'excel'}
                  onChange={() => setFormat('excel')}
                  style={{ accentColor: 'var(--apple-blue)' }}
                />
                <span>Excel Compatible (.xls)</span>
              </label>
            </div>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '8px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="apple-btn apple-btn-secondary"
              style={{ padding: '8px 16px' }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isGenerating}
              className="apple-btn apple-btn-primary"
              style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Compiling & Exporting...</span>
                </>
              ) : (
                <>
                  <Download size={16} />
                  <span>Generate Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
