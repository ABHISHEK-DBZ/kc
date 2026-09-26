import React, { useState, useMemo } from 'react';
import { Customer } from '../types';
import { 
  Search, 
  Send, 
  Check, 
  AlertTriangle, 
  Users, 
  CreditCard, 
  Phone,
  ShieldAlert,
  ArrowUpDown
} from 'lucide-react';

interface CustomersViewProps {
  customers: Customer[];
}

export const CustomersView: React.FC<CustomersViewProps> = ({ customers }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'All' | 'Low' | 'Medium' | 'High' | 'Critical'>('All');
  const [reminderSent, setReminderSent] = useState<{ [id: string]: boolean }>({});

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm) || c.shop_name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRisk = riskFilter === 'All' || c.risk_level === riskFilter;
      return matchesSearch && matchesRisk;
    });
  }, [customers, searchTerm, riskFilter]);

  const totalOutstanding = useMemo(() => {
    return customers.reduce((sum, c) => sum + c.total_udhaar, 0);
  }, [customers]);

  const criticalCount = useMemo(() => {
    return customers.filter((c) => c.risk_level === 'Critical').length;
  }, [customers]);

  const handleSendReminder = (id: string, name: string, amount: number) => {
    setReminderSent((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      alert(`WhatsApp payment reminder dispatched to ${name} for ₹${amount.toLocaleString('en-IN')} with instant UPI payment QR link.`);
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
              Network Customer Directory & Khata Ledgers
            </h2>
            <span style={{
              fontSize: '12px',
              padding: '2px 8px',
              borderRadius: '9999px',
              background: 'rgba(118, 118, 128, 0.1)',
              color: 'var(--text-secondary)',
              fontWeight: '600'
            }}>
              {filteredCustomers.length} accounts
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
            Cross-branch customer credit accounts, repayment scoring, and WhatsApp collection triggers.
          </p>
        </div>

        {/* Quick stats pills */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'rgba(118, 118, 128, 0.06)', fontSize: '12px' }}>
            Total Credit: <strong style={{ color: 'var(--text-primary)' }}>₹{totalOutstanding.toLocaleString('en-IN')}</strong>
          </div>
          <div style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', background: 'var(--apple-red-tint)', color: 'var(--apple-red)', fontSize: '12px', fontWeight: '600' }}>
            {criticalCount} Critical Accounts
          </div>
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
        {/* Risk Tabs */}
        <div className="apple-segmented-control">
          <button className={`apple-segment-item ${riskFilter === 'All' ? 'active' : ''}`} onClick={() => setRiskFilter('All')}>All</button>
          <button className={`apple-segment-item ${riskFilter === 'Critical' ? 'active' : ''}`} onClick={() => setRiskFilter('Critical')}>Critical</button>
          <button className={`apple-segment-item ${riskFilter === 'High' ? 'active' : ''}`} onClick={() => setRiskFilter('High')}>High</button>
          <button className={`apple-segment-item ${riskFilter === 'Medium' ? 'active' : ''}`} onClick={() => setRiskFilter('Medium')}>Medium</button>
          <button className={`apple-segment-item ${riskFilter === 'Low' ? 'active' : ''}`} onClick={() => setRiskFilter('Low')}>Low</button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search customer, phone, store..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="apple-input"
            style={{ paddingLeft: '32px', height: '34px', fontSize: '12.5px' }}
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="apple-table-container">
        <table className="apple-table">
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Branch Shop</th>
              <th style={{ textAlign: 'right' }}>Credit Limit</th>
              <th style={{ textAlign: 'right' }}>Outstanding Balance</th>
              <th style={{ textAlign: 'center' }}>Days Overdue</th>
              <th>Risk Level</th>
              <th>Repayment Score</th>
              <th style={{ textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-tertiary)' }}>
                  No customer records match your filter criteria.
                </td>
              </tr>
            ) : (
              filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: '600' }}>{c.name}</td>
                  <td style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.phone}</td>
                  <td style={{ fontSize: '12.5px', color: 'var(--text-tertiary)' }}>{c.shop_name}</td>
                  <td style={{ textAlign: 'right', color: 'var(--text-tertiary)' }}>₹{c.credit_limit.toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right', fontWeight: '700', color: c.days_outstanding > 30 ? 'var(--apple-red)' : 'var(--text-primary)' }}>
                    ₹{c.total_udhaar.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      fontSize: '11.5px',
                      fontWeight: '600',
                      background: c.days_outstanding > 30 ? 'var(--apple-red-tint)' : 'rgba(118, 118, 128, 0.08)',
                      color: c.days_outstanding > 30 ? 'var(--apple-red)' : 'var(--text-primary)'
                    }}>
                      {c.days_outstanding} days
                    </span>
                  </td>
                  <td>
                    <span style={{
                      fontSize: '11.5px',
                      fontWeight: '700',
                      color: c.risk_level === 'Critical' ? 'var(--apple-red)' : (c.risk_level === 'High' ? 'var(--apple-orange)' : 'var(--apple-green)')
                    }}>
                      {c.risk_level}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ flex: 1, height: '4px', background: 'rgba(118, 118, 128, 0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${c.repayment_score}%`, height: '100%', background: c.repayment_score > 70 ? 'var(--apple-green)' : (c.repayment_score > 40 ? 'var(--apple-orange)' : 'var(--apple-red)') }}></div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)', minWidth: '24px' }}>
                        {c.repayment_score}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      onClick={() => handleSendReminder(c.id, c.name, c.total_udhaar)}
                      disabled={reminderSent[c.id]}
                      className={`apple-btn ${reminderSent[c.id] ? 'apple-btn-secondary' : 'apple-btn-primary'}`}
                      style={{ padding: '4px 10px', fontSize: '11.5px' }}
                    >
                      {reminderSent[c.id] ? <Check size={12} /> : <Send size={12} />}
                      <span>{reminderSent[c.id] ? 'Sent' : 'WhatsApp Ping'}</span>
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
