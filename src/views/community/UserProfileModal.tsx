import React from 'react';
import { CommunityUser } from '../../types/community';
import { X, Award, CheckCircle2, ShieldCheck, MessageSquare, HelpCircle, Store, MapPin, Mail, Phone, Calendar } from 'lucide-react';

interface UserProfileModalProps {
  user: CommunityUser | null;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, onClose }) => {
  if (!user) return null;

  const roleLabel = ({
    HQ_OWNER: 'HQ Enterprise Owner',
    HQ_IT: 'HQ IT / Support Engineer',
    AREA_MANAGER: 'Regional Area Manager',
    REGIONAL_MANAGER: 'Regional Area Manager',
    FRANCHISE_OWNER: 'Franchise Owner',
    STORE_MANAGER: 'Store Manager'
  } as Record<string, string>)[user.role] || user.role;

  const roleBadgeColor = ({
    HQ_OWNER: 'var(--apple-blue)',
    HQ_IT: 'var(--apple-purple)',
    AREA_MANAGER: 'var(--apple-orange)',
    REGIONAL_MANAGER: 'var(--apple-orange)',
    FRANCHISE_OWNER: 'var(--apple-green)',
    STORE_MANAGER: 'var(--apple-teal)'
  } as Record<string, string>)[user.role] || 'var(--apple-blue)';

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-card-solid)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-modal)',
        width: '100%',
        maxWidth: '480px',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        {/* Header Banner */}
        <div style={{
          background: `linear-gradient(135deg, ${roleBadgeColor}22 0%, var(--bg-card-solid) 100%)`,
          padding: '24px 24px 16px',
          position: 'relative',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(118, 118, 128, 0.12)',
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

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              backgroundColor: user.avatar_color || roleBadgeColor,
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: '700',
              boxShadow: `0 4px 14px ${roleBadgeColor}40`
            }}>
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                  {user.name}
                </h3>
                {user.verified_count > 0 && (
                  <span title="Verified Network Contributor">
                    <ShieldCheck size={18} color="var(--apple-blue)" />
                  </span>
                )}
              </div>
              <div style={{
                display: 'inline-block',
                marginTop: '4px',
                fontSize: '11.5px',
                fontWeight: '600',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: `${roleBadgeColor}18`,
                color: roleBadgeColor
              }}>
                {roleLabel}
              </div>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {user.shop_name && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <Store size={15} color="var(--text-tertiary)" />
                <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{user.shop_name}</span>
              </div>
            )}
            {user.region && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                <MapPin size={15} color="var(--text-tertiary)" />
                <span>{user.region} Region</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <Mail size={15} color="var(--text-tertiary)" />
              <span style={{ fontSize: '12px' }}>{user.email}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              <Calendar size={15} color="var(--text-tertiary)" />
              <span>Joined {user.member_since}</span>
            </div>
          </div>

          {/* Contribution Stats */}
          <div style={{
            marginTop: '8px',
            padding: '16px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)'
          }}>
            <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-tertiary)', margin: '0 0 12px' }}>
              Franchise Resolution Contributions
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div style={{ padding: '8px 4px' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {user.posts_count}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Posts
                </div>
              </div>

              <div style={{ padding: '8px 4px' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  {user.answers_count}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Answers
                </div>
              </div>

              <div style={{ padding: '8px 4px' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--apple-green)' }}>
                  {user.accepted_count}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Accepted
                </div>
              </div>

              <div style={{ padding: '8px 4px' }}>
                <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--apple-blue)' }}>
                  {user.verified_count}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  HQ Verified
                </div>
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            color: 'var(--text-tertiary)',
            backgroundColor: 'rgba(118, 118, 128, 0.06)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-sm)'
          }}>
            <Award size={16} color="var(--apple-orange)" />
            <span>Contributions build operational trust across 48 franchise stores.</span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'flex-end',
          backgroundColor: 'var(--bg-elevated)'
        }}>
          <button
            onClick={onClose}
            className="apple-btn apple-btn-secondary"
            style={{ padding: '6px 16px', fontSize: '13px' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
