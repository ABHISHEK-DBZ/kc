import React, { useState, useMemo } from 'react';
import { 
  CommunityPost, 
  CommunityReply, 
  KnownIssue, 
  IssueLink, 
  CommunityUser, 
  UserRole, 
  IssueStatus,
  CommunityAttachment
} from '../../types/community';
import { Shop } from '../../types';
import { generateThreadAISummary, calculateAffectedFranchises } from '../../services/communityEngine';
import { 
  ArrowLeft, 
  CheckCircle2, 
  ShieldCheck, 
  Check, 
  AlertTriangle, 
  ThumbsUp, 
  Sparkles, 
  BookOpen, 
  GitMerge, 
  Share2, 
  Bookmark, 
  BookmarkCheck, 
  Upload, 
  Clock, 
  Store, 
  MapPin, 
  MessageSquare, 
  ShieldAlert, 
  Send, 
  ChevronDown, 
  ExternalLink,
  Users,
  Paperclip,
  CheckCheck
} from 'lucide-react';

interface IssueDetailViewProps {
  post: CommunityPost;
  replies: CommunityReply[];
  knownIssues: KnownIssue[];
  issueLinks: IssueLink[];
  allUsers: CommunityUser[];
  allShops: Shop[];
  currentRole: UserRole;
  currentUserId: string;
  onBack: () => void;
  onAddReply: (reply: Omit<CommunityReply, 'id' | 'created_at'>) => void;
  onAcceptReply: (replyId: string) => void;
  onVerifyReply: (replyId: string) => void;
  onVoteHelpful: (replyId: string) => void;
  onConfirmSolutionWorked: (replyId: string, shopId: string) => void;
  onChangeStatus: (newStatus: IssueStatus) => void;
  onEscalate: () => void;
  onToggleFollow: () => void;
  onOpenUserProfile: (user: CommunityUser) => void;
  onOpenLinkModal: () => void;
  onOpenConvertModal: () => void;
}

export const IssueDetailView: React.FC<IssueDetailViewProps> = ({
  post,
  replies,
  knownIssues,
  issueLinks,
  allUsers,
  allShops,
  currentRole,
  currentUserId,
  onBack,
  onAddReply,
  onAcceptReply,
  onVerifyReply,
  onVoteHelpful,
  onConfirmSolutionWorked,
  onChangeStatus,
  onEscalate,
  onToggleFollow,
  onOpenUserProfile,
  onOpenLinkModal,
  onOpenConvertModal
}) => {
  const [replyBody, setReplyBody] = useState('');
  const [isOfficialIT, setIsOfficialIT] = useState(currentRole === 'HQ_IT');
  const [showAffectedShopsModal, setShowAffectedShopsModal] = useState(false);
  const [previewAttachment, setPreviewAttachment] = useState<CommunityAttachment | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<CommunityAttachment[]>([]);
  const [showFullAISummary, setShowFullAISummary] = useState(true);

  // Dynamic AI Summary generated from actual thread content (Section 22)
  const aiSummary = useMemo(() => {
    return generateThreadAISummary(post, replies, knownIssues);
  }, [post, replies, knownIssues]);

  // Dynamic Affected Franchises (Section 14)
  const affectedFranchises = useMemo(() => {
    return calculateAffectedFranchises(post, allShops, replies);
  }, [post, allShops, replies]);

  // Author details
  const postAuthor = allUsers.find((u) => u.id === post.author_id) || {
    id: post.author_id,
    name: post.author_name,
    role: post.author_role,
    shop_name: post.shop_name,
    region: post.region,
    email: '',
    phone: '',
    member_since: '2024',
    posts_count: 5,
    answers_count: 8,
    accepted_count: 2,
    verified_count: 1
  };

  // Accepted & Verified replies
  const acceptedReply = replies.find((r) => r.id === post.accepted_reply_id || r.is_accepted);
  const verifiedReply = replies.find((r) => r.id === post.verified_reply_id || r.is_verified);

  // Status Progression Timeline (Section 8)
  const statusSteps: IssueStatus[] = ['OPEN', 'HQ REVIEWING', 'KNOWN ISSUE', 'RESOLVED', 'CLOSED'];
  const currentStatusIndex = statusSteps.indexOf(post.status);

  const handleSimulateReplyAttachment = () => {
    const newAtt: CommunityAttachment = {
      id: `att-reply-${Date.now()}`,
      file_name: 'verified_solution_log.txt',
      file_url: '#',
      file_type: 'log',
      file_size: '14 KB',
      created_at: 'Just now'
    };
    setAttachedFiles([...attachedFiles, newAtt]);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyBody.trim()) return;

    const currentUserObj = allUsers.find((u) => u.id === currentUserId) || {
      id: currentUserId,
      name: currentRole === 'HQ_OWNER' ? 'Aditya Singhal' : (currentRole === 'HQ_IT' ? 'Priya Nair' : (currentRole === 'REGIONAL_MANAGER' ? 'Vikram Sawant' : 'Ramesh Sharma')),
      role: currentRole,
      shop_id: 'shop-01',
      shop_name: 'Sharma General Store',
      region: 'West' as const
    };

    onAddReply({
      post_id: post.id,
      author_id: currentUserObj.id,
      author_name: currentUserObj.name,
      author_role: currentRole,
      author_shop_id: currentUserObj.shop_id,
      author_shop_name: currentUserObj.shop_name,
      author_region: currentUserObj.region,
      body: replyBody.trim(),
      is_accepted: false,
      is_verified: currentRole === 'HQ_IT' && isOfficialIT,
      official_it_response: currentRole === 'HQ_IT' && isOfficialIT,
      helpful_count: 0,
      verified_by: (currentRole === 'HQ_IT' && isOfficialIT) ? `HQ IT — ${currentUserObj.name}` : undefined,
      verified_at: (currentRole === 'HQ_IT' && isOfficialIT) ? 'Just now' : undefined,
      attachments: attachedFiles.length > 0 ? attachedFiles : undefined
    });

    setReplyBody('');
    setAttachedFiles([]);
  };

  const statusColor = {
    'OPEN': 'var(--apple-blue)',
    'IN DISCUSSION': 'var(--apple-purple)',
    'HQ REVIEWING': 'var(--apple-orange)',
    'KNOWN ISSUE': 'var(--apple-indigo)',
    'RESOLVED': 'var(--apple-green)',
    'CLOSED': 'var(--text-tertiary)'
  }[post.status];

  const severityColor = {
    'Low': 'var(--apple-blue)',
    'Medium': 'var(--apple-orange)',
    'High': 'var(--apple-red)',
    'Critical': '#d70015'
  }[post.severity];

  const canModerate = currentRole === 'HQ_OWNER' || currentRole === 'HQ_IT';
  const isAuthor = post.author_id === currentUserId || post.author_role === currentRole;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '24px 20px', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Top Navigation & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <button
          onClick={onBack}
          className="apple-btn apple-btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Discussions</span>
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Follow / Bookmark Button */}
          <button
            onClick={onToggleFollow}
            className={`apple-btn ${post.followed_by_user ? 'apple-btn-secondary' : 'apple-btn-secondary'}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              color: post.followed_by_user ? 'var(--apple-blue)' : 'var(--text-secondary)'
            }}
          >
            {post.followed_by_user ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            <span>{post.followed_by_user ? 'Following' : 'Follow Discussion'}</span>
          </button>

          {/* Link Issue to Knowledge Graph (Section 23) */}
          <button
            onClick={onOpenLinkModal}
            className="apple-btn apple-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px' }}
            title="Link related bugs & root causes"
          >
            <GitMerge size={15} color="var(--apple-indigo)" />
            <span>Link Issue</span>
          </button>

          {/* Convert to Known Issue (Section 11) - for HQ IT / Admin */}
          {canModerate && (
            <button
              onClick={onOpenConvertModal}
              className="apple-btn apple-btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px' }}
              title="Publish to official Knowledge Base"
            >
              <BookOpen size={15} color="var(--apple-purple)" />
              <span>Convert to Known Issue</span>
            </button>
          )}

          {/* Escalate Button (Section 16) */}
          {post.status !== 'RESOLVED' && post.status !== 'CLOSED' && (
            <button
              onClick={onEscalate}
              className={`apple-btn ${post.escalation_status === 'NEEDS_HQ_ATTENTION' ? 'apple-btn-danger' : 'apple-btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px' }}
            >
              <AlertTriangle size={15} />
              <span>{post.escalation_status === 'NEEDS_HQ_ATTENTION' ? 'Needs HQ Attention' : 'Escalate to HQ'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Card */}
      <div style={{
        background: 'var(--bg-card-solid)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden'
      }}>
        {/* Header Section (Section 6) */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-card-solid)'
        }}>
          {/* Metadata badges row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              {/* Ticket ID */}
              {post.ticket_id && (
                <span style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-secondary)'
                }}>
                  {post.ticket_id}
                </span>
              )}

              {/* Status pill */}
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                padding: '3px 10px',
                borderRadius: '9999px',
                backgroundColor: `${statusColor}18`,
                color: statusColor
              }}>
                {post.status}
              </span>

              {/* Severity pill */}
              <span style={{
                fontSize: '12px',
                fontWeight: '700',
                padding: '3px 10px',
                borderRadius: '9999px',
                backgroundColor: `${severityColor}18`,
                color: severityColor
              }}>
                {post.severity.toUpperCase()}
              </span>

              {/* Category pill */}
              <span style={{
                fontSize: '12px',
                fontWeight: '600',
                padding: '3px 10px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(118, 118, 128, 0.1)',
                color: 'var(--text-secondary)'
              }}>
                {post.category} {post.subcategory && `• ${post.subcategory}`}
              </span>

              {/* Affected stores count badge (Section 14) */}
              <button
                type="button"
                onClick={() => setShowAffectedShopsModal(true)}
                style={{
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 149, 0, 0.14)',
                  color: 'var(--apple-orange)'
                }}
              >
                <Users size={13} />
                <span>{affectedFranchises.count} stores affected</span>
              </button>
            </div>

            {/* IT Status Selector */}
            {canModerate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontWeight: '600' }}>
                  SET STATUS:
                </span>
                <select
                  value={post.status}
                  onChange={(e) => onChangeStatus(e.target.value as IssueStatus)}
                  className="apple-input"
                  style={{ fontSize: '12px', padding: '4px 10px' }}
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN DISCUSSION">IN DISCUSSION</option>
                  <option value="HQ REVIEWING">HQ REVIEWING</option>
                  <option value="KNOWN ISSUE">KNOWN ISSUE</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '22px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            margin: '0 0 14px',
            lineHeight: '1.3'
          }}>
            {post.title}
          </h1>

          {/* Author & shop info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--border-subtle)',
            fontSize: '13px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                onClick={() => onOpenUserProfile(postAuthor)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  backgroundColor: postAuthor.avatar_color || 'var(--apple-blue)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
                title="View user profile & contributions"
              >
                {post.author_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => onOpenUserProfile(postAuthor)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      fontWeight: '600',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      fontSize: '13.5px'
                    }}
                  >
                    {post.author_name}
                  </button>
                  <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    ({post.author_role.replace(/_/g, ' ')})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Store size={13} color="var(--text-tertiary)" />
                    {post.shop_name}
                  </span>
                  <span>•</span>
                  <span>{post.region} Region</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={13} color="var(--text-tertiary)" />
                    {post.created_at}
                  </span>
                </div>
              </div>
            </div>

            {/* Device & Version info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '12px',
              color: 'var(--text-tertiary)',
              backgroundColor: 'var(--bg-elevated)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div>Device: <strong style={{ color: 'var(--text-primary)' }}>{post.device}</strong></div>
              <div>App Version: <strong style={{ color: 'var(--text-primary)' }}>{post.app_version}</strong></div>
            </div>
          </div>
        </div>

        {/* Status Lifecycle Stepper (Section 8) */}
        <div style={{
          padding: '12px 28px',
          backgroundColor: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          overflowX: 'auto'
        }}>
          {statusSteps.map((step, idx) => {
            const isPassed = currentStatusIndex >= idx;
            const isCurrent = post.status === step;

            return (
              <React.Fragment key={step}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: isPassed ? 'var(--apple-green)' : 'rgba(118, 118, 128, 0.2)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {isPassed ? <Check size={12} /> : idx + 1}
                  </div>
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: isCurrent ? '700' : '500',
                    color: isCurrent ? 'var(--text-primary)' : (isPassed ? 'var(--apple-green)' : 'var(--text-tertiary)')
                  }}>
                    {step}
                  </span>
                </div>

                {idx < statusSteps.length - 1 && (
                  <div style={{
                    flex: 1,
                    height: '2px',
                    backgroundColor: currentStatusIndex > idx ? 'var(--apple-green)' : 'var(--border-subtle)',
                    margin: '0 8px',
                    minWidth: '24px'
                  }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Problem Description Body */}
        <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-tertiary)', margin: '0 0 10px' }}>
            Problem Description
          </h3>

          <p style={{
            fontSize: '14.5px',
            lineHeight: '1.6',
            color: 'var(--text-primary)',
            margin: '0 0 16px',
            whiteSpace: 'pre-wrap'
          }}>
            {post.description}
          </p>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
            {post.tags.map((t) => (
              <span
                key={t}
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-xs)',
                  backgroundColor: 'rgba(118, 118, 128, 0.08)',
                  color: 'var(--text-secondary)'
                }}
              >
                #{t}
              </span>
            ))}
          </div>

          {/* Attachments Section (Section 5) */}
          {post.attachments && post.attachments.length > 0 && (
            <div style={{
              marginTop: '16px',
              padding: '16px',
              backgroundColor: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)'
            }}>
              <h4 style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-tertiary)', margin: '0 0 10px' }}>
                Attachments & Diagnostics ({post.attachments.length})
              </h4>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {post.attachments.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => setPreviewAttachment(att)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 12px',
                      backgroundColor: 'var(--bg-card-solid)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'transform var(--transition-fast)'
                    }}
                  >
                    {att.file_type === 'image' ? (
                      <img
                        src={att.file_url}
                        alt={att.file_name}
                        style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px' }}
                      />
                    ) : (
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--apple-blue-tint)',
                        color: 'var(--apple-blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Paperclip size={18} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                        {att.file_name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        {att.file_size || 'Image'} • Click to preview
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* AI DISCUSSION SUMMARY (Section 21 & 22) */}
        <div style={{
          padding: '20px 28px',
          backgroundColor: 'linear-gradient(135deg, rgba(88, 86, 214, 0.04) 0%, var(--bg-card-solid) 100%)',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #af52de 0%, #5856d6 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Sparkles size={15} />
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
                  AI DISCUSSION SUMMARY
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)', marginLeft: '8px' }}>
                  Generated dynamically from actual thread responses
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowFullAISummary(!showFullAISummary)}
              className="apple-btn apple-btn-secondary"
              style={{ padding: '3px 10px', fontSize: '11.5px' }}
            >
              {showFullAISummary ? 'Hide Summary' : 'Show Full Discussion Summary'}
            </button>
          </div>

          {showFullAISummary && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
              padding: '14px',
              backgroundColor: 'var(--bg-elevated)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              fontSize: '12.5px'
            }}>
              <div>
                <div style={{ color: 'var(--text-tertiary)', fontWeight: '600', marginBottom: '2px' }}>
                  PROBLEM STATEMENT
                </div>
                <div style={{ color: 'var(--text-primary)' }}>{aiSummary.problem}</div>
              </div>

              <div>
                <div style={{ color: 'var(--text-tertiary)', fontWeight: '600', marginBottom: '2px' }}>
                  OBSERVED ON / VERSION
                </div>
                <div style={{ color: 'var(--text-primary)' }}>
                  {aiSummary.observedOn} • v{aiSummary.affectedVersions}
                </div>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <div style={{ color: 'var(--apple-green)', fontWeight: '700', marginBottom: '2px' }}>
                  SUGGESTED RESOLUTION
                </div>
                <div style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                  {aiSummary.suggestedSolution}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--apple-blue)', marginTop: '4px', fontWeight: '600' }}>
                  ✓ {aiSummary.verification}
                </div>
              </div>

              <div>
                <div style={{ color: 'var(--text-tertiary)', fontWeight: '600', marginBottom: '2px' }}>
                  PROBABLE ROOT CAUSE
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>{aiSummary.probableRootCause}</div>
              </div>

              <div>
                <div style={{ color: 'var(--text-tertiary)', fontWeight: '600', marginBottom: '2px' }}>
                  POSSIBLE RELATED ISSUES (AI)
                </div>
                {aiSummary.possibleRelatedIssues.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {aiSummary.possibleRelatedIssues.map((rel) => (
                      <div key={rel.ticket_id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px' }}>
                        <span style={{ fontWeight: '700', color: 'var(--apple-blue)' }}>{rel.ticket_id}</span>
                        <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rel.title}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>({rel.similarity}% match)</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--text-tertiary)' }}>No historical duplicates detected</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ACCEPTED & HQ VERIFIED SOLUTION BANNER (Section 6 & 9) */}
        {(verifiedReply || acceptedReply) && (
          <div style={{
            margin: '20px 28px',
            padding: '20px 24px',
            backgroundColor: 'rgba(52, 199, 89, 0.08)',
            border: '1.5px solid var(--apple-green)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--apple-green)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCheck size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--apple-green)', margin: 0 }}>
                    ACCEPTED SOLUTION
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                    {verifiedReply ? `Officially Verified by ${verifiedReply.verified_by || 'HQ IT'} • ${verifiedReply.verified_at || 'Recently'}` : 'Marked as accepted solution by original store poster'}
                  </div>
                </div>
              </div>

              {/* Status Badges (Section 9) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                {acceptedReply && (
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(52, 199, 89, 0.2)',
                    color: 'var(--apple-green)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Check size={13} />
                    Accepted Answer
                  </span>
                )}

                {verifiedReply && (
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--apple-blue-tint)',
                    color: 'var(--apple-blue)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <ShieldCheck size={13} />
                    HQ Verified
                  </span>
                )}

                {(verifiedReply?.is_community_confirmed || acceptedReply?.is_community_confirmed) && (
                  <span style={{
                    fontSize: '11.5px',
                    fontWeight: '700',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(175, 82, 222, 0.15)',
                    color: 'var(--apple-purple)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Users size={13} />
                    Community Confirmed
                  </span>
                )}
              </div>
            </div>

            <div style={{
              padding: '14px 16px',
              backgroundColor: 'var(--bg-card-solid)',
              border: '1px solid rgba(52, 199, 89, 0.25)',
              borderRadius: 'var(--radius-md)',
              fontSize: '14px',
              lineHeight: '1.5',
              color: 'var(--text-primary)',
              fontWeight: '500'
            }}>
              {(verifiedReply || acceptedReply)?.body}
            </div>

            {/* "Did this solve your issue?" Franchise Confirmation Action (Section 14 & 18) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
              fontSize: '12.5px',
              paddingTop: '6px'
            }}>
              <span style={{ color: 'var(--text-secondary)' }}>
                Faced this problem at your store? Confirming helps regional managers track release adoption.
              </span>

              <button
                type="button"
                onClick={() => {
                  const targetRep = verifiedReply || acceptedReply;
                  if (targetRep) {
                    onConfirmSolutionWorked(targetRep.id, post.shop_id);
                  }
                }}
                className="apple-btn apple-btn-secondary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 12px',
                  fontSize: '12px',
                  color: 'var(--apple-green)',
                  borderColor: 'rgba(52, 199, 89, 0.4)'
                }}
              >
                <Check size={14} />
                <span>Yes, this fixed my store's issue</span>
              </button>
            </div>
          </div>
        )}

        {/* DISCUSSION THREAD LIST */}
        <div style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
              DISCUSSION ({replies.length} REPLIES)
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              Prioritizing HQ Verified & Accepted Solutions
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {replies.map((reply, idx) => {
              const replyUser = allUsers.find((u) => u.id === reply.author_id) || {
                id: reply.author_id,
                name: reply.author_name,
                role: reply.author_role,
                shop_name: reply.author_shop_name,
                region: reply.author_region,
                email: '',
                phone: '',
                member_since: '2024',
                posts_count: 3,
                answers_count: 6,
                accepted_count: 1,
                verified_count: 1
              };

              const isReplyHQ = reply.author_role === 'HQ_IT' || reply.official_it_response;

              return (
                <div
                  key={reply.id}
                  style={{
                    padding: '18px 20px',
                    borderRadius: 'var(--radius-lg)',
                    border: `1px solid ${reply.is_verified ? 'rgba(0, 113, 227, 0.3)' : (reply.is_accepted ? 'rgba(52, 199, 89, 0.3)' : 'var(--border-card)')}`,
                    backgroundColor: reply.is_verified ? 'rgba(0, 113, 227, 0.03)' : (reply.is_accepted ? 'rgba(52, 199, 89, 0.03)' : 'var(--bg-elevated)'),
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}
                >
                  {/* Reply Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        onClick={() => onOpenUserProfile(replyUser)}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: replyUser.avatar_color || (isReplyHQ ? 'var(--apple-purple)' : 'var(--apple-blue)'),
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '700',
                          fontSize: '13px',
                          cursor: 'pointer'
                        }}
                      >
                        {reply.author_name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => onOpenUserProfile(replyUser)}
                            style={{
                              background: 'transparent',
                              border: 'none',
                              padding: 0,
                              fontWeight: '600',
                              color: 'var(--text-primary)',
                              fontSize: '13.5px',
                              cursor: 'pointer'
                            }}
                          >
                            {reply.author_name}
                          </button>

                          {/* Role Pill */}
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '1px 7px',
                            borderRadius: '9999px',
                            backgroundColor: isReplyHQ ? 'var(--apple-purple-tint)' : 'rgba(118, 118, 128, 0.1)',
                            color: isReplyHQ ? 'var(--apple-purple)' : 'var(--text-secondary)'
                          }}>
                            {isReplyHQ ? 'HQ IT — Support' : reply.author_role.replace(/_/g, ' ')}
                          </span>

                          {reply.author_shop_name && (
                            <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                              • {reply.author_shop_name}
                            </span>
                          )}
                        </div>

                        <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                          {reply.created_at}
                        </span>
                      </div>
                    </div>

                    {/* Verified / Accepted Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {reply.is_accepted && (
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
                          Accepted Answer
                        </span>
                      )}

                      {reply.is_verified && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          backgroundColor: 'var(--apple-blue-tint)',
                          color: 'var(--apple-blue)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <ShieldCheck size={12} />
                          HQ Verified
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Reply Body */}
                  <div style={{
                    fontSize: '13.5px',
                    lineHeight: '1.55',
                    color: 'var(--text-primary)',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {reply.body}
                  </div>

                  {/* Reply Actions: Helpful Upvote & Marking (Section 7, 9, 18) */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '8px',
                    borderTop: '1px solid var(--border-subtle)',
                    marginTop: '4px',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    {/* Helpful Upvote Button (Section 18) */}
                    <button
                      type="button"
                      onClick={() => onVoteHelpful(reply.id)}
                      className="apple-btn apple-btn-secondary"
                      style={{
                        padding: '4px 10px',
                        fontSize: '11.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: reply.user_voted_helpful ? 'var(--apple-blue)' : 'var(--text-secondary)'
                      }}
                    >
                      <ThumbsUp size={13} />
                      <span>
                        {reply.helpful_count > 0 ? `Helpful (${reply.helpful_count} franchisees)` : 'Helpful'}
                      </span>
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {/* Mark as Accepted (for OP / Admin) */}
                      {(isAuthor || canModerate) && !reply.is_accepted && (
                        <button
                          type="button"
                          onClick={() => onAcceptReply(reply.id)}
                          className="apple-btn apple-btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '11.5px', color: 'var(--apple-green)' }}
                        >
                          Mark as Accepted Solution
                        </button>
                      )}

                      {/* Mark as Verified (for HQ IT / Admin) */}
                      {canModerate && !reply.is_verified && (
                        <button
                          type="button"
                          onClick={() => onVerifyReply(reply.id)}
                          className="apple-btn apple-btn-secondary"
                          style={{ padding: '4px 10px', fontSize: '11.5px', color: 'var(--apple-blue)' }}
                        >
                          Mark as Officially Verified
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ADD REPLY COMPOSER */}
          <div style={{
            marginTop: '28px',
            padding: '20px',
            backgroundColor: 'var(--bg-elevated)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <h4 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 10px' }}>
              Add Your Answer or Diagnostic Feedback
            </h4>

            <form onSubmit={handleSendReply}>
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder="Share your troubleshooting steps, workarounds, or confirmation if you faced this..."
                className="apple-input"
                rows={3}
                style={{ width: '100%', fontSize: '13.5px', marginBottom: '10px' }}
                required
              />

              {/* Staged attachments */}
              {attachedFiles.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  {attachedFiles.map((f) => (
                    <span key={f.id} style={{ fontSize: '11.5px', padding: '3px 8px', borderRadius: '4px', backgroundColor: 'var(--bg-card-solid)', border: '1px solid var(--border-subtle)' }}>
                      📎 {f.file_name}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={handleSimulateReplyAttachment}
                    className="apple-btn apple-btn-secondary"
                    style={{ padding: '5px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Upload size={13} />
                    <span>Attach Log / Screenshot</span>
                  </button>

                  {/* Official IT toggle */}
                  {currentRole === 'HQ_IT' && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--apple-purple)', cursor: 'pointer', fontWeight: '600' }}>
                      <input
                        type="checkbox"
                        checked={isOfficialIT}
                        onChange={(e) => setIsOfficialIT(e.target.checked)}
                      />
                      <span>Post as Official HQ IT Resolution</span>
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  className="apple-btn apple-btn-primary"
                  style={{ padding: '7px 20px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Send size={14} />
                  <span>Reply</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* AFFECTED SHOPS BREAKDOWN MODAL (Section 14) */}
      {showAffectedShopsModal && (
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
            maxWidth: '520px',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                {affectedFranchises.count} Stores Correlated with this Issue
              </h3>
              <button
                onClick={() => setShowAffectedShopsModal(false)}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                Close
              </button>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '12px' }}>
              {affectedFranchises.confidenceReason}
            </div>

            <div style={{ maxHeight: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {affectedFranchises.shops.map((s) => (
                <div
                  key={s.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {s.city} • {s.region} Region • Mgr: {s.manager_name}
                    </div>
                  </div>
                  <span style={{ fontSize: '11.5px', color: 'var(--apple-blue)', fontWeight: '600' }}>
                    v{post.app_version || '2.8.1'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ATTACHMENT PREVIEW LIGHTBOX */}
      {previewAttachment && (
        <div
          onClick={() => setPreviewAttachment(null)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '24px'
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px', maxHeight: '80vh', overflow: 'hidden' }}>
            {previewAttachment.file_type === 'image' ? (
              <img
                src={previewAttachment.file_url}
                alt={previewAttachment.file_name}
                style={{ width: '100%', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
              />
            ) : (
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', maxWidth: '500px' }}>
                <h3>{previewAttachment.file_name}</h3>
                <p>Diagnostic log stream captured at store terminal.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
