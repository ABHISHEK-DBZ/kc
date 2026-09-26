import React, { useState } from 'react';
import { Shop, HealthStatus, Region } from '../types';
import { Store, X, Check, AlertCircle, Building2, MapPin, User, Phone, FileText } from 'lucide-react';

interface AddShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddShop: (shop: Shop) => void;
  currentRegion?: Region;
}

export const AddShopModal: React.FC<AddShopModalProps> = ({
  isOpen,
  onClose,
  onAddShop,
  currentRegion = 'West'
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [city, setCity] = useState('');
  const [region, setRegion] = useState<'West' | 'North' | 'South'>(currentRegion === 'All' ? 'West' : currentRegion);
  const [ownerName, setOwnerName] = useState('');
  const [ownerContact, setOwnerContact] = useState('+91 ');
  const [gstin, setGstin] = useState('');
  const [status, setStatus] = useState<HealthStatus>('Healthy');
  const [managerName, setManagerName] = useState('');
  const [storeSize, setStoreSize] = useState('1200');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // 1. Validation
    if (!name.trim() || name.trim().length < 3) {
      setErrorMessage('Please enter a valid Shop Name (at least 3 characters).');
      return;
    }
    if (!city.trim()) {
      setErrorMessage('City is required (e.g. Pune, Mumbai, Nashik, Thane).');
      return;
    }
    if (!location.trim()) {
      setErrorMessage('Location / Street address is required.');
      return;
    }
    if (!ownerContact.trim() || ownerContact.trim().length < 8) {
      setErrorMessage('Please enter a valid contact phone number.');
      return;
    }

    setIsSubmitting(true);

    const generatedId = `shop-${Date.now().toString().slice(-4)}`;
    const healthScore = status === 'Healthy' ? 88 : (status === 'Watch' ? 68 : 45);
    const assignedMgr = managerName.trim() || ownerName.trim() || 'Store In-Charge';

    const newShop: Shop = {
      id: generatedId,
      name: name.trim(),
      location: location.trim(),
      city: city.trim(),
      region,
      owner_contact: ownerContact.trim(),
      manager_name: assignedMgr,
      status,
      status_reason: status === 'Healthy' 
        ? 'Newly onboarded franchise branch. Operations normal.' 
        : (status === 'Watch' ? 'Onboarding probation. Baseline sales establishing.' : 'Initial inventory and cash reconciliation flagged.'),
      health_score: healthScore,
      health_reasons: [
        'Newly established retail terminal',
        `Assigned territory: ${region} region`,
        `Initial target margin: 15.5%`
      ],
      store_size_sqft: parseInt(storeSize, 10) || 1200,
      daily_revenue: 48500,
      monthly_revenue: 1450000,
      daily_profit: 7500,
      monthly_profit: 225000,
      profit_margin_pct: 15.5,
      udhaar_outstanding: 45000,
      stock_alert_count: 1,
      cash_variance_today: 0,
      cash_expected_today: 48500,
      cash_actual_today: 48500,
      active_cashiers_count: 2,
      last_active: 'Just now'
    };

    setTimeout(() => {
      onAddShop(newShop);
      setIsSubmitting(false);
      onClose();
    }, 250);
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
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
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
              backgroundColor: 'var(--apple-blue-tint)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--apple-blue)'
            }}>
              <Store size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Onboard New Franchise Branch
              </h2>
              <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '2px 0 0' }}>
                Add shop to KhataCopilot retail network OS
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
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {errorMessage && (
            <div style={{
              padding: '10px 14px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--apple-red-tint)',
              border: '1px solid var(--apple-red)',
              color: 'var(--apple-red)',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Shop Name & Region */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Shop / Store Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pune Central Daily Mart"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="apple-input"
                style={{ width: '100%', height: '38px', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Territory / Region
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as 'West' | 'North' | 'South')}
                className="apple-input"
                style={{ width: '100%', height: '38px', fontSize: '13px' }}
              >
                <option value="West">West (MH / GJ)</option>
                <option value="South">South (KA / TN)</option>
                <option value="North">North (DL / NCR)</option>
              </select>
            </div>
          </div>

          {/* City & Street Location */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                City *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pune"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="apple-input"
                style={{ width: '100%', height: '38px', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Street Location / Landmark *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Shop 4, FC Road, Shivajinagar"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="apple-input"
                style={{ width: '100%', height: '38px', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Owner Details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Franchise Owner Name
              </label>
              <input
                type="text"
                placeholder="e.g. Rajesh Kulkarni"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="apple-input"
                style={{ width: '100%', height: '38px', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Owner Contact / Mobile *
              </label>
              <input
                type="text"
                required
                placeholder="+91 98221 44556"
                value={ownerContact}
                onChange={(e) => setOwnerContact(e.target.value)}
                className="apple-input"
                style={{ width: '100%', height: '38px', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Assigned Manager & GSTIN */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Assigned Store Manager
              </label>
              <input
                type="text"
                placeholder="e.g. Amit Deshmukh"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                className="apple-input"
                style={{ width: '100%', height: '38px', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                GSTIN / Tax ID
              </label>
              <input
                type="text"
                placeholder="e.g. 27AAPFU1029P1ZV"
                value={gstin}
                onChange={(e) => setGstin(e.target.value.toUpperCase())}
                className="apple-input"
                style={{ width: '100%', height: '38px', fontSize: '13px', textTransform: 'uppercase' }}
              />
            </div>
          </div>

          {/* Status & Store Size */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Initial Health Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as HealthStatus)}
                className="apple-input"
                style={{ width: '100%', height: '38px', fontSize: '13px' }}
              >
                <option value="Healthy">Healthy (Green — Normal)</option>
                <option value="Watch">Watch (Orange — Close Eye)</option>
                <option value="At-Risk">At-Risk (Red — Attention)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Floor Space (Sq. Ft)
              </label>
              <input
                type="number"
                placeholder="1200"
                value={storeSize}
                onChange={(e) => setStoreSize(e.target.value)}
                className="apple-input"
                style={{ width: '100%', height: '38px', fontSize: '13px' }}
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '12px',
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
              disabled={isSubmitting}
              className="apple-btn apple-btn-primary"
              style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isSubmitting ? (
                <span>Registering Shop...</span>
              ) : (
                <>
                  <Check size={16} />
                  <span>Create Shop</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
