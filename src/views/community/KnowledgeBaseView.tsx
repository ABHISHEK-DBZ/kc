import React, { useState } from 'react';
import { KnownIssue, CommunityCategory } from '../../types/community';
import { 
  BookOpen, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  Tag, 
  Users, 
  Calendar, 
  ExternalLink,
  ChevronDown,
  Filter,
  Check
} from 'lucide-react';

interface KnowledgeBaseViewProps {
  knownIssues: KnownIssue[];
  onSelectKnownIssue: (ki: KnownIssue) => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  knownIssues,
  onSelectKnownIssue
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVersion, setSelectedVersion] = useState<string>('All');
  const [expandedId, setExpandedId] = useState<string | null>(knownIssues[0]?.id || null);

  const categories = ['All', 'Billing', 'Hardware', 'Sync / Offline Mode', 'Payments', 'GST', 'Voice Orders'];
  const versions = ['All', '2.8.1', '2.8.0', '2.7.9'];

  const filteredIssues = knownIssues.filter((ki) => {
    if (selectedCategory !== 'All' && ki.category !== selectedCategory) return false;
    if (selectedVersion !== 'All' && ki.affected_version !== selectedVersion) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = ki.title.toLowerCase().includes(q) ||
                    ki.problem.toLowerCase().includes(q) ||
                    ki.solution.toLowerCase().includes(q) ||
                    ki.root_cause.toLowerCase().includes(q) ||
                    ki.id.toLowerCase().includes(q) ||
                    (ki.ticket_id && ki.ticket_id.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.08) 0%, var(--bg-card-solid) 100%)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px 28px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--apple-blue)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 113, 227, 0.3)'
          }}>
            <BookOpen size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                Franchise Knowledge Base & Known Issues
              </h2>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'var(--apple-blue-tint)',
                color: 'var(--apple-blue)'
              }}>
                Verified Solutions
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Institutional library of documented bugs, official root cause analyses, and verified store workarounds.
            </p>
          </div>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)', fontSize: '18px' }}>{knownIssues.length}</strong> Documented Articles
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search solutions, root causes, error codes (e.g. GST freeze, baud rate)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="apple-input"
            style={{ width: '100%', paddingLeft: '34px', fontSize: '13px', height: '38px' }}
          />
        </div>

        {/* Category Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="apple-input"
            style={{ fontSize: '12.5px', height: '38px', padding: '0 12px' }}
          >
            {categories.map((c) => (
              <option key={c} value={c}>Category: {c}</option>
            ))}
          </select>

          {/* Version Filter */}
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value)}
            className="apple-input"
            style={{ fontSize: '12.5px', height: '38px', padding: '0 12px' }}
          >
            {versions.map((v) => (
              <option key={v} value={v}>Version: {v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Articles List (Section 11) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filteredIssues.map((ki) => {
          const isExpanded = expandedId === ki.id;

          return (
            <div
              key={ki.id}
              style={{
                background: 'var(--bg-card-solid)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                transition: 'all var(--transition-fast)'
              }}
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : ki.id)}
                style={{
                  padding: '18px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  backgroundColor: isExpanded ? 'rgba(0, 113, 227, 0.02)' : 'var(--bg-card-solid)',
                  borderBottom: isExpanded ? '1px solid var(--border-subtle)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '800',
                    color: 'var(--apple-blue)',
                    backgroundColor: 'var(--apple-blue-tint)',
                    padding: '3px 9px',
                    borderRadius: 'var(--radius-xs)'
                  }}>
                    {ki.id}
                  </span>

                  {ki.ticket_id && (
                    <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '600' }}>
                      {ki.ticket_id}
                    </span>
                  )}

                  <h3 style={{ fontSize: '15.5px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {ki.title}
                  </h3>

                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(52, 199, 89, 0.15)',
                    color: 'var(--apple-green)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Check size={12} />
                    Verified Solution
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--apple-orange)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Users size={13} />
                    {ki.success_reports_count} stores confirmed
                  </span>

                  <ChevronDown
                    size={18}
                    style={{
                      transform: isExpanded ? 'rotate(180deg)' : 'none',
                      transition: 'transform var(--transition-fast)',
                      color: 'var(--text-tertiary)'
                    }}
                  />
                </div>
              </div>

              {/* Expanded Article Body (Section 11) */}
              {isExpanded && (
                <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {/* Problem & Cause Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
                    <div style={{
                      padding: '14px 16px',
                      backgroundColor: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                        Observed Problem
                      </div>
                      <div style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                        {ki.problem}
                      </div>
                    </div>

                    <div style={{
                      padding: '14px 16px',
                      backgroundColor: 'var(--bg-elevated)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                        Root Cause
                      </div>
                      <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {ki.root_cause}
                      </div>
                    </div>
                  </div>

                  {/* Solution Highlight Box */}
                  <div style={{
                    padding: '16px 20px',
                    backgroundColor: 'rgba(52, 199, 89, 0.08)',
                    border: '1px solid var(--apple-green)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: 'var(--apple-green)', fontWeight: '700', fontSize: '13px' }}>
                      <CheckCircle2 size={16} />
                      <span>OFFICIAL VERIFIED SOLUTION</span>
                    </div>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)', lineHeight: '1.55' }}>
                      {ki.solution}
                    </div>
                  </div>

                  {/* Version & Verification Metadata Row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      <div>Affected Version: <strong style={{ color: 'var(--text-primary)' }}>{ki.affected_version}</strong></div>
                      <div>Fixed Version: <strong style={{ color: 'var(--apple-green)' }}>{ki.fixed_version}</strong></div>
                      <div>Verified By: <strong style={{ color: 'var(--text-primary)' }}>{ki.verified_by}</strong></div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-tertiary)' }}>
                      <Calendar size={13} />
                      <span>Last verified {ki.last_verified_at}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
