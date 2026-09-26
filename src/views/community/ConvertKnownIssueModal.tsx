import React, { useState } from 'react';
import { CommunityPost, CommunityReply, KnownIssue, CommunityCategory } from '../../types/community';
import { X, BookOpen, Check, ShieldCheck } from 'lucide-react';

interface ConvertKnownIssueModalProps {
  post: CommunityPost;
  replies: CommunityReply[];
  onConvert: (newKnownIssue: KnownIssue) => void;
  onClose: () => void;
}

export const ConvertKnownIssueModal: React.FC<ConvertKnownIssueModalProps> = ({
  post,
  replies,
  onConvert,
  onClose
}) => {
  const verifiedOrAcceptedReply = replies.find((r) => r.is_verified) || replies.find((r) => r.is_accepted);

  const [title, setTitle] = useState(post.title);
  const [problem, setProblem] = useState(post.description);
  const [rootCause, setRootCause] = useState('Regex backtracking in tax line parser under high customer cart volume.');
  const [solution, setSolution] = useState(verifiedOrAcceptedReply?.body || 'Update KhataCopilot terminal to version 2.8.2 and re-sync configuration.');
  const [affectedVersion, setAffectedVersion] = useState(post.app_version || '2.8.1');
  const [fixedVersion, setFixedVersion] = useState('2.8.2');
  const [category, setCategory] = useState<CommunityCategory>(post.category);

  const handleConvert = (e: React.FormEvent) => {
    e.preventDefault();

    const kbNumber = Math.floor(1000 + Math.random() * 9000);
    const newKi: KnownIssue = {
      id: `KB-${kbNumber}`,
      ticket_id: post.ticket_id || `#BUG-${Math.floor(1800 + Math.random() * 200)}`,
      title: title.trim(),
      problem: problem.trim(),
      root_cause: rootCause.trim(),
      solution: solution.trim(),
      affected_version: affectedVersion.trim(),
      fixed_version: fixedVersion.trim(),
      category,
      severity: post.severity,
      status: 'RESOLVED_IN_RELEASE',
      verified_by: 'HQ IT Support Lead',
      success_reports_count: post.affected_shops_count || 17,
      affected_shops_count: post.affected_shops_count || 23,
      affected_regions: post.affected_regions || ['West', 'North'],
      affected_shop_ids: post.affected_shop_ids || [post.shop_id],
      created_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 16).replace('T', ' '),
      last_verified_at: 'Just now',
      linked_post_ids: [post.id]
    };

    onConvert(newKi);
    onClose();
  };

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
        maxWidth: '620px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(88, 86, 214, 0.08) 0%, var(--bg-card-solid) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--apple-purple-tint)',
              color: 'var(--apple-purple)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
                Publish to Knowledge Base
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                Convert solved discussion into reusable institutional knowledge (#KB-XXXX)
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
        <form onSubmit={handleConvert} style={{
          padding: '20px 24px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '5px' }}>
              ARTICLE TITLE
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="apple-input"
              style={{ width: '100%', fontSize: '13px' }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                AFFECTED VERSION
              </label>
              <input
                type="text"
                value={affectedVersion}
                onChange={(e) => setAffectedVersion(e.target.value)}
                className="apple-input"
                style={{ width: '100%', fontSize: '13px' }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                FIXED IN RELEASE
              </label>
              <input
                type="text"
                value={fixedVersion}
                onChange={(e) => setFixedVersion(e.target.value)}
                className="apple-input"
                style={{ width: '100%', fontSize: '13px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '5px' }}>
              PROBLEM SYMPTOMS
            </label>
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="apple-input"
              rows={2}
              style={{ width: '100%', fontSize: '13px' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '5px' }}>
              ENGINEERING ROOT CAUSE
            </label>
            <textarea
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              className="apple-input"
              rows={2}
              style={{ width: '100%', fontSize: '13px' }}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '5px' }}>
              OFFICIAL VERIFIED SOLUTION
            </label>
            <textarea
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              className="apple-input"
              rows={3}
              style={{ width: '100%', fontSize: '13px' }}
              required
            />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: 'var(--apple-green-tint)',
            color: 'var(--apple-green)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
            fontWeight: '600'
          }}>
            <ShieldCheck size={16} />
            <span>This article will be automatically indexed for Similar Issue retrieval across all 48 branches.</span>
          </div>

          {/* Footer actions */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
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
              className="apple-btn apple-btn-primary"
              style={{ padding: '8px 20px', fontSize: '13px' }}
            >
              Publish to Knowledge Base
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
