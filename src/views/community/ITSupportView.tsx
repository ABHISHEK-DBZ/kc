import React, { useState } from 'react';
import { CommunityPost, KnownIssue, CommunityCategory, IssueStatus } from '../../types/community';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Users, 
  ChevronRight, 
  FileCode, 
  Filter, 
  UserCheck, 
  RefreshCw,
  ExternalLink,
  Search,
  Tag,
  Sparkles
} from 'lucide-react';

interface ITSupportViewProps {
  posts: CommunityPost[];
  knownIssues: KnownIssue[];
  onSelectPost: (postId: string) => void;
  onOpenConvertModal: (post: CommunityPost) => void;
  onChangeStatus: (postId: string, status: IssueStatus) => void;
}

type ITQueueTab = 'all' | 'new' | 'high_priority' | 'known_bugs' | 'awaiting_verification' | 'resolved' | 'recurring';

export const ITSupportView: React.FC<ITSupportViewProps> = ({
  posts,
  knownIssues,
  onSelectPost,
  onOpenConvertModal,
  onChangeStatus
}) => {
  const [activeQueueTab, setActiveQueueTab] = useState<ITQueueTab>('high_priority');
  const [searchQuery, setSearchQuery] = useState('');
  const [assignedFilter, setAssignedFilter] = useState('All');

  // Filtered queue items
  const queuePosts = posts.filter((p) => {
    // Tab filter
    if (activeQueueTab === 'new') {
      if (p.status !== 'OPEN') return false;
    } else if (activeQueueTab === 'high_priority') {
      if (p.severity !== 'High' && p.severity !== 'Critical' && p.escalation_status !== 'NEEDS_HQ_ATTENTION') return false;
    } else if (activeQueueTab === 'known_bugs') {
      if (p.status !== 'KNOWN ISSUE' && !p.linked_known_issue_id) return false;
    } else if (activeQueueTab === 'awaiting_verification') {
      if (p.status !== 'HQ REVIEWING') return false;
    } else if (activeQueueTab === 'resolved') {
      if (p.status !== 'RESOLVED' && p.status !== 'CLOSED') return false;
    } else if (activeQueueTab === 'recurring') {
      if ((p.affected_shops_count || 1) < 10) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = p.title.toLowerCase().includes(q) || 
                    p.description.toLowerCase().includes(q) || 
                    (p.ticket_id && p.ticket_id.toLowerCase().includes(q)) ||
                    p.shop_name.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  return (
    <div style={{ maxWidth: '1180px', margin: '0 auto', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Top Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(88, 86, 214, 0.1) 0%, var(--bg-card-solid) 100%)',
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
            background: 'var(--apple-purple)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(88, 86, 214, 0.3)'
          }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                HQ IT Support & Triage Desk
              </h2>
              <span style={{
                fontSize: '11px',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '9999px',
                backgroundColor: 'var(--apple-purple-tint)',
                color: 'var(--apple-purple)'
              }}>
                Internal Engineering Queue
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Investigate recurring store bugs, publish official solutions, and push patches across 48 franchise terminals.
            </p>
          </div>
        </div>

        {/* Quick Triage Counters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--apple-red)' }}>
              {posts.filter((p) => p.severity === 'Critical' || p.escalation_status === 'NEEDS_HQ_ATTENTION').length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Needs Attention</div>
          </div>

          <div style={{
            padding: '8px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-card-solid)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--apple-purple)' }}>
              {knownIssues.length}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Known Bugs</div>
          </div>
        </div>
      </div>

      {/* Queue Tabs Bar (Section 15) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px'
      }}>
        {/* Sub-tabs */}
        <div className="apple-segmented-control" style={{ overflowX: 'auto', maxWidth: '100%' }}>
          <button
            className={`apple-segment-item ${activeQueueTab === 'high_priority' ? 'active' : ''}`}
            onClick={() => setActiveQueueTab('high_priority')}
          >
            <AlertTriangle size={14} color="var(--apple-red)" />
            <span>High Priority ({posts.filter((p) => p.severity === 'High' || p.severity === 'Critical' || p.escalation_status === 'NEEDS_HQ_ATTENTION').length})</span>
          </button>

          <button
            className={`apple-segment-item ${activeQueueTab === 'new' ? 'active' : ''}`}
            onClick={() => setActiveQueueTab('new')}
          >
            <span>New Issues ({posts.filter((p) => p.status === 'OPEN').length})</span>
          </button>

          <button
            className={`apple-segment-item ${activeQueueTab === 'known_bugs' ? 'active' : ''}`}
            onClick={() => setActiveQueueTab('known_bugs')}
          >
            <span>Known Bugs ({posts.filter((p) => p.status === 'KNOWN ISSUE' || p.linked_known_issue_id).length})</span>
          </button>

          <button
            className={`apple-segment-item ${activeQueueTab === 'awaiting_verification' ? 'active' : ''}`}
            onClick={() => setActiveQueueTab('awaiting_verification')}
          >
            <span>Awaiting Verification ({posts.filter((p) => p.status === 'HQ REVIEWING').length})</span>
          </button>

          <button
            className={`apple-segment-item ${activeQueueTab === 'recurring' ? 'active' : ''}`}
            onClick={() => setActiveQueueTab('recurring')}
          >
            <span>Recurring ({posts.filter((p) => (p.affected_shops_count || 1) >= 10).length})</span>
          </button>

          <button
            className={`apple-segment-item ${activeQueueTab === 'resolved' ? 'active' : ''}`}
            onClick={() => setActiveQueueTab('resolved')}
          >
            <span>Resolved ({posts.filter((p) => p.status === 'RESOLVED' || p.status === 'CLOSED').length})</span>
          </button>

          <button
            className={`apple-segment-item ${activeQueueTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveQueueTab('all')}
          >
            <span>All Queue ({posts.length})</span>
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '240px' }}>
          <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-tertiary)' }} />
          <input
            type="text"
            placeholder="Search tickets, bugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="apple-input"
            style={{ width: '100%', paddingLeft: '32px', fontSize: '12.5px', height: '34px' }}
          />
        </div>
      </div>

      {/* Queue Items List (Section 15 Queue Example) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {queuePosts.map((post) => {
          const isHigh = post.severity === 'High' || post.severity === 'Critical';

          return (
            <div
              key={post.id}
              style={{
                background: 'var(--bg-card-solid)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px 22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                boxShadow: 'var(--shadow-sm)',
                transition: 'box-shadow var(--transition-fast)'
              }}
            >
              {/* Left Details */}
              <div style={{ flex: 1, minWidth: '300px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  {/* Ticket ID */}
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: 'var(--apple-purple)',
                    backgroundColor: 'var(--apple-purple-tint)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-xs)'
                  }}>
                    {post.ticket_id || `#TKT-${post.id.slice(-4)}`}
                  </span>

                  {/* Status Pill */}
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: post.status === 'RESOLVED' ? 'rgba(52, 199, 89, 0.15)' : 'rgba(0, 113, 227, 0.12)',
                    color: post.status === 'RESOLVED' ? 'var(--apple-green)' : 'var(--apple-blue)'
                  }}>
                    {post.status}
                  </span>

                  {/* Severity */}
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: isHigh ? 'rgba(255, 59, 48, 0.15)' : 'rgba(118, 118, 128, 0.1)',
                    color: isHigh ? 'var(--apple-red)' : 'var(--text-secondary)'
                  }}>
                    {post.severity.toUpperCase()}
                  </span>

                  {/* Affected Stores Count */}
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: '600',
                    color: 'var(--apple-orange)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Users size={13} />
                    {post.affected_shops_count || 1} affected stores
                  </span>

                  {/* Version */}
                  <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                    Version: <strong style={{ color: 'var(--text-primary)' }}>{post.app_version}</strong>
                  </span>
                </div>

                {/* Title */}
                <h3
                  onClick={() => onSelectPost(post.id)}
                  style={{
                    fontSize: '15px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    margin: '0 0 6px',
                    cursor: 'pointer'
                  }}
                >
                  {post.title}
                </h3>

                {/* Meta subtext */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>Reported by: <strong>{post.author_name}</strong> ({post.shop_name})</span>
                  <span>•</span>
                  <span>{post.replies_count} community replies</span>
                  <span>•</span>
                  <span>{post.created_at}</span>
                  {post.assigned_to_it && (
                    <>
                      <span>•</span>
                      <span style={{ color: 'var(--apple-purple)', fontWeight: '600' }}>
                        Assigned: {post.assigned_to_it}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Right Action Buttons (Section 15) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => onOpenConvertModal(post)}
                  className="apple-btn apple-btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--apple-purple)' }}
                  title="Promote to Known Issue Knowledge Base"
                >
                  Mark Known Issue
                </button>

                {post.status !== 'RESOLVED' && (
                  <button
                    type="button"
                    onClick={() => onChangeStatus(post.id, 'RESOLVED')}
                    className="apple-btn apple-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--apple-green)' }}
                  >
                    Resolve
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onSelectPost(post.id)}
                  className="apple-btn apple-btn-primary"
                  style={{ padding: '6px 16px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <span>Open Investigation</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {queuePosts.length === 0 && (
          <div style={{
            padding: '40px',
            textAlign: 'center',
            backgroundColor: 'var(--bg-card-solid)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-card)',
            color: 'var(--text-secondary)'
          }}>
            <CheckCircle2 size={36} color="var(--apple-green)" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontSize: '15px', fontWeight: '600' }}>No pending tickets in this queue</div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              All issues in this category have been resolved or investigated.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
