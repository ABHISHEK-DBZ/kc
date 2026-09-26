import React, { useState } from 'react';
import { IssueLink, IssueRelationshipType, KnownIssue, CommunityPost } from '../../types/community';
import { X, Link2, GitMerge, Check, AlertCircle, ArrowRight } from 'lucide-react';

interface IssueLinkingModalProps {
  currentIssue: { id: string; ticket_id?: string; title: string };
  allKnownIssues: KnownIssue[];
  allPosts: CommunityPost[];
  existingLinks: IssueLink[];
  onAddLink: (newLink: Omit<IssueLink, 'id'>) => void;
  onClose: () => void;
}

export const IssueLinkingModal: React.FC<IssueLinkingModalProps> = ({
  currentIssue,
  allKnownIssues,
  allPosts,
  existingLinks,
  onAddLink,
  onClose
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [relationship, setRelationship] = useState<IssueRelationshipType>('RELATED');
  const [details, setDetails] = useState('');

  // Target candidates (excluding current issue)
  const candidateTargets = [
    ...allKnownIssues.map((ki) => ({
      id: ki.id,
      ticket_id: ki.ticket_id || `#${ki.id}`,
      title: ki.title,
      type: 'Known Issue'
    })),
    ...allPosts.map((p) => ({
      id: p.id,
      ticket_id: p.ticket_id || `#${p.id}`,
      title: p.title,
      type: 'Community Post'
    }))
  ].filter((item) => item.id !== currentIssue.id && item.ticket_id !== currentIssue.ticket_id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetId) return;

    const target = candidateTargets.find((c) => c.id === selectedTargetId);
    if (!target) return;

    onAddLink({
      source_issue_id: currentIssue.id,
      source_title: `${currentIssue.ticket_id || currentIssue.id} ${currentIssue.title}`,
      target_issue_id: target.id,
      target_title: `${target.ticket_id} ${target.title}`,
      relationship,
      details: details.trim() || undefined
    });

    onClose();
  };

  const currentRelatedLinks = existingLinks.filter(
    (l) => l.source_issue_id === currentIssue.id || l.target_issue_id === currentIssue.id
  );

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
        maxWidth: '560px',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-elevated)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'var(--apple-blue-tint)',
              color: 'var(--apple-blue)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <GitMerge size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                Knowledge Graph: Link Related Issues
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Connect recurring tickets to track root cause clusters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              CURRENT SOURCE TICKET
            </label>
            <div style={{
              padding: '10px 14px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              fontWeight: '600',
              color: 'var(--text-primary)'
            }}>
              {currentIssue.ticket_id || currentIssue.id} — {currentIssue.title}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              RELATIONSHIP TYPE
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {(['RELATED', 'SAME_ROOT_CAUSE', 'FIXED_BY', 'DUPLICATE'] as IssueRelationshipType[]).map((rel) => (
                <button
                  type="button"
                  key={rel}
                  onClick={() => setRelationship(rel)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${relationship === rel ? 'var(--apple-blue)' : 'var(--border-subtle)'}`,
                    background: relationship === rel ? 'var(--apple-blue-tint)' : 'var(--bg-elevated)',
                    color: relationship === rel ? 'var(--apple-blue)' : 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {relationship === rel && <Check size={14} />}
                  <span>{rel.replace(/_/g, ' ')}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              TARGET TICKET / ISSUE
            </label>
            <select
              value={selectedTargetId}
              onChange={(e) => setSelectedTargetId(e.target.value)}
              className="apple-input"
              style={{ width: '100%', fontSize: '13px', padding: '9px 12px' }}
              required
            >
              <option value="">Select an issue or known bug to link...</option>
              {candidateTargets.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.type}] {t.ticket_id} {t.title.slice(0, 55)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              ENGINEERING / TRIAGE NOTES (OPTIONAL)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="e.g. Both issues stem from GST configuration parser deadlock on Android 12"
              className="apple-input"
              rows={2}
              style={{ width: '100%', fontSize: '13px', resize: 'vertical' }}
            />
          </div>

          {/* Existing Links list */}
          {currentRelatedLinks.length > 0 && (
            <div style={{
              marginTop: '4px',
              padding: '12px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-sm)'
            }}>
              <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                Existing Graph Relationships ({currentRelatedLinks.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {currentRelatedLinks.map((link) => (
                  <div key={link.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: 'var(--apple-blue-tint)',
                      color: 'var(--apple-blue)',
                      fontWeight: '700',
                      fontSize: '10px'
                    }}>
                      {link.relationship}
                    </span>
                    <span style={{ color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {link.target_title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '8px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)'
          }}>
            <button
              type="button"
              onClick={onClose}
              className="apple-btn apple-btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedTargetId}
              className="apple-btn apple-btn-primary"
              style={{ padding: '8px 18px', fontSize: '13px', opacity: selectedTargetId ? 1 : 0.5 }}
            >
              Create Issue Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
