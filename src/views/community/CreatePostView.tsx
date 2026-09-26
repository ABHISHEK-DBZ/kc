import React, { useState, useEffect, useMemo } from 'react';
import { 
  CommunityPost, 
  CommunityCategory, 
  CommunitySeverity, 
  KnownIssue, 
  CommunityReply, 
  CommunityAttachment,
  UserRole
} from '../../types/community';
import { Shop } from '../../types';
import { findSimilarIssues, predictCategory, SimilarIssueMatch } from '../../services/communityEngine';
import { 
  ArrowLeft, 
  Upload, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  FileText, 
  Image as ImageIcon, 
  X, 
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';

interface CreatePostViewProps {
  currentRole: UserRole;
  currentShopId?: string;
  allShops: Shop[];
  knownIssues: KnownIssue[];
  allPosts: CommunityPost[];
  allReplies: CommunityReply[];
  onBack: () => void;
  onSubmitPost: (newPost: CommunityPost) => void;
  onSelectExistingIssue: (postIdOrKiId: string) => void;
}

const CATEGORIES: CommunityCategory[] = [
  'Technical Issue',
  'Billing',
  'GST',
  'Udhaar',
  'Inventory',
  'Payments',
  'Voice Orders',
  'Login / Account',
  'Hardware',
  'Sync / Offline Mode',
  'Feature Request',
  'How-To',
  'Other'
];

const SEVERITIES: CommunitySeverity[] = ['Low', 'Medium', 'High', 'Critical'];

const DEVICES = [
  'Android POS (Sunmi V2 / D2s)',
  'Android Tablet (Samsung Tab / Lenovo)',
  'Desktop / Windows POS',
  'Web POS (Chrome / Edge)',
  'Pine Labs EDC Smart Terminal',
  'Epson / Thermal Receipt Printer',
  'Mobile Phone (Store Manager App)'
];

const VERSIONS = ['2.8.2 (Latest)', '2.8.1', '2.8.0', '2.7.9', '2.7.5'];

export const CreatePostView: React.FC<CreatePostViewProps> = ({
  currentRole,
  currentShopId,
  allShops,
  knownIssues,
  allPosts,
  allReplies,
  onBack,
  onSubmitPost,
  onSelectExistingIssue
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<CommunityCategory>('Billing');
  const [subcategory, setSubcategory] = useState('GST Calculation');
  const [shopId, setShopId] = useState<string>(currentShopId || (allShops[0]?.id || 'shop-01'));
  const [device, setDevice] = useState(DEVICES[0]);
  const [appVersion, setAppVersion] = useState('2.8.1');
  const [severity, setSeverity] = useState<CommunitySeverity>('High');
  const [tagInput, setTagInput] = useState('Billing, GST, Bug');
  const [attachments, setAttachments] = useState<CommunityAttachment[]>([]);
  const [showSensitiveWarning, setShowSensitiveWarning] = useState(true);

  // Live Similar Issues Modal / Drawer State
  const [showSimilarModal, setShowSimilarModal] = useState(false);
  const [hasDismissedSimilar, setHasDismissedSimilar] = useState(false);

  // Auto-Categorization state
  const [predictedCat, setPredictedCat] = useState<{ category: CommunityCategory; subcategory: string } | null>(null);

  // Real-time similar issues calculation
  const similarMatches: SimilarIssueMatch[] = useMemo(() => {
    return findSimilarIssues(title, description, knownIssues, allPosts, allReplies, 40);
  }, [title, description, knownIssues, allPosts, allReplies]);

  // Handle live categorization suggestions
  useEffect(() => {
    if (title.length > 8 || description.length > 15) {
      const pred = predictCategory(`${title} ${description}`);
      if (pred.confidence > 0.8) {
        setPredictedCat(pred);
      } else {
        setPredictedCat(null);
      }
    } else {
      setPredictedCat(null);
    }
  }, [title, description]);

  // Auto-trigger similar issues preview when high match exists
  useEffect(() => {
    const highestScore = similarMatches[0]?.similarityScore || 0;
    if (highestScore >= 80 && !hasDismissedSimilar && (title.length > 10 || description.length > 20)) {
      // Don't auto pop if user already explicitly dismissed
    }
  }, [similarMatches, hasDismissedSimilar, title, description]);

  const handleApplyPredictedCategory = () => {
    if (predictedCat) {
      setCategory(predictedCat.category);
      setSubcategory(predictedCat.subcategory);
      setPredictedCat(null);
    }
  };

  // Simulated file attachment
  const handleSimulateAttachment = () => {
    const sampleFiles = [
      { name: 'terminal_freeze_screenshot.png', type: 'image' as const, size: '420 KB', url: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&q=80' },
      { name: 'pos_driver_syslog.log', type: 'log' as const, size: '24 KB', url: '#' },
      { name: 'invoice_error_dump.pdf', type: 'pdf' as const, size: '150 KB', url: '#' }
    ];
    const fileToAdd = sampleFiles[attachments.length % sampleFiles.length];
    const newAtt: CommunityAttachment = {
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      file_name: fileToAdd.name,
      file_url: fileToAdd.url,
      file_type: fileToAdd.type,
      file_size: fileToAdd.size,
      created_at: 'Just now'
    };
    setAttachments([...attachments, newAtt]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter((a) => a.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if user is submitting without seeing high similarity solutions
    if (similarMatches.length > 0 && similarMatches[0].similarityScore >= 80 && !hasDismissedSimilar) {
      setShowSimilarModal(true);
      return;
    }

    proceedSubmit();
  };

  const proceedSubmit = () => {
    const selectedShop = allShops.find((s) => s.id === shopId) || allShops[0];
    const cleanTags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const newPost: CommunityPost = {
      id: `post-${Date.now()}`,
      ticket_id: `#BUG-${Math.floor(1800 + Math.random() * 200)}`,
      author_id: 'user-05',
      author_name: currentRole === 'HQ_OWNER' ? 'Aditya Singhal' : (currentRole === 'HQ_IT' ? 'Priya Nair' : (currentRole === 'REGIONAL_MANAGER' ? 'Vikram Sawant' : 'Ramesh Sharma')),
      author_role: currentRole,
      shop_id: selectedShop.id,
      shop_name: selectedShop.name,
      region: selectedShop.region,
      title: title.trim(),
      description: description.trim(),
      category,
      subcategory: subcategory.trim() || undefined,
      severity,
      status: 'OPEN',
      escalation_status: severity === 'Critical' ? 'NEEDS_HQ_ATTENTION' : 'NORMAL',
      device,
      app_version: appVersion.replace(' (Latest)', ''),
      created_at: 'Just now',
      updated_at: 'Just now',
      views_count: 1,
      replies_count: 0,
      affected_shops_count: 1,
      affected_shop_ids: [selectedShop.id],
      affected_regions: [selectedShop.region],
      tags: cleanTags.length > 0 ? cleanTags : [category, severity],
      attachments: attachments.length > 0 ? attachments : undefined,
      followed_by_user: true
    };

    onSubmitPost(newPost);
  };

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px', animation: 'fadeIn 0.2s ease-out' }}>
      {/* Top back navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <button
          onClick={onBack}
          className="apple-btn apple-btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 14px' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Discussions</span>
        </button>

        <span style={{ fontSize: '12.5px', color: 'var(--text-tertiary)' }}>
          Posting as <strong style={{ color: 'var(--text-primary)' }}>{currentRole.replace(/_/g, ' ')}</strong>
        </span>
      </div>

      <div style={{
        background: 'var(--bg-card-solid)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-card)',
        overflow: 'hidden'
      }}>
        {/* Header Banner */}
        <div style={{
          padding: '24px 28px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.05) 0%, var(--bg-card-solid) 100%)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Report an Issue or Ask Franchise Network
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            Before submitting, KhataCopilot automatically cross-references 48 stores and historical HQ resolutions to surface instant fixes.
          </p>
        </div>

        {/* Live Similar Issues Real-Time Inline Alert (Section 10) */}
        {similarMatches.length > 0 && (
          <div style={{
            margin: '20px 28px 0',
            padding: '16px 20px',
            backgroundColor: 'var(--apple-blue-tint)',
            border: '1px solid rgba(0, 113, 227, 0.3)',
            borderRadius: 'var(--radius-md)'
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={20} color="var(--apple-blue)" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: '700', color: 'var(--apple-blue)' }}>
                    SIMILAR ISSUES FOUND ({similarMatches.length})
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', marginTop: '2px' }}>
                    An existing verified solution might already solve your issue without waiting for HQ.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSimilarModal(true)}
                className="apple-btn apple-btn-primary"
                style={{ padding: '6px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
              >
                View Existing Solutions
              </button>
            </div>

            {/* Quick Preview Card */}
            <div style={{
              marginTop: '12px',
              padding: '12px 14px',
              backgroundColor: 'var(--bg-card-solid)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 7px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(52, 199, 89, 0.15)',
                    color: 'var(--apple-green)'
                  }}>
                    {similarMatches[0].similarityScore}% similar
                  </span>
                  {similarMatches[0].isHQVerified && (
                    <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--apple-blue)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={13} />
                      HQ Verified
                    </span>
                  )}
                  <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    {similarMatches[0].ticket_id} {similarMatches[0].title}
                  </strong>
                </div>
                {similarMatches[0].solution && (
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0', fontStyle: 'italic' }}>
                    Solution: {similarMatches[0].solution.slice(0, 110)}...
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onSelectExistingIssue(similarMatches[0].id)}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '5px 12px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span>Open Fix</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        )}

        {/* Post Creation Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Title */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                ISSUE TITLE <span style={{ color: 'var(--apple-red)' }}>*</span>
              </label>
              <span style={{ fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
                Be specific (e.g. "Billing screen freezes after GSTIN update")
              </span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. KhataCopilot billing page stuck after GSTIN update"
              className="apple-input"
              style={{ width: '100%', fontSize: '14px', padding: '10px 14px' }}
              required
            />
          </div>

          {/* AI Predicted Category Banner */}
          {predictedCat && predictedCat.category !== category && (
            <div style={{
              padding: '8px 14px',
              backgroundColor: 'var(--apple-purple-tint)',
              border: '1px solid rgba(175, 82, 222, 0.25)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--apple-purple)' }}>
                <Sparkles size={15} />
                <span>
                  AI Suggested Category: <strong>{predictedCat.category}</strong> → {predictedCat.subcategory}
                </span>
              </div>
              <button
                type="button"
                onClick={handleApplyPredictedCategory}
                className="apple-btn"
                style={{
                  padding: '3px 10px',
                  fontSize: '11px',
                  background: 'var(--apple-purple)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-xs)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Apply Category
              </button>
            </div>
          )}

          {/* Category & Subcategory */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                CATEGORY <span style={{ color: 'var(--apple-red)' }}>*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as CommunityCategory)}
                className="apple-input"
                style={{ width: '100%', fontSize: '13px' }}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                SUBCATEGORY
              </label>
              <input
                type="text"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="e.g. Tax Slabs, Printing, Inward GRN"
                className="apple-input"
                style={{ width: '100%', fontSize: '13px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                SEVERITY <span style={{ color: 'var(--apple-red)' }}>*</span>
              </label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as CommunitySeverity)}
                className="apple-input"
                style={{ width: '100%', fontSize: '13px' }}
              >
                {SEVERITIES.map((sev) => (
                  <option key={sev} value={sev}>{sev}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Shop, Device, App Version */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                AFFECTED SHOP
              </label>
              <select
                value={shopId}
                onChange={(e) => setShopId(e.target.value)}
                className="apple-input"
                style={{ width: '100%', fontSize: '13px' }}
              >
                {allShops.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.city})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                DEVICE HARDWARE
              </label>
              <select
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className="apple-input"
                style={{ width: '100%', fontSize: '13px' }}
              >
                {DEVICES.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                APP VERSION
              </label>
              <select
                value={appVersion}
                onChange={(e) => setAppVersion(e.target.value)}
                className="apple-input"
                style={{ width: '100%', fontSize: '13px' }}
              >
                {VERSIONS.map((v) => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              PROBLEM DESCRIPTION <span style={{ color: 'var(--apple-red)' }}>*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, steps to reproduce, error text on screen, and how it impacts store checkout..."
              className="apple-input"
              rows={4}
              style={{ width: '100%', fontSize: '13.5px', lineHeight: '1.5' }}
              required
            />
          </div>

          {/* Attachments Section (Section 5) */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                ATTACHMENTS (SCREENSHOTS, RECEIPTS, LOG FILES, PDF)
              </label>
              <button
                type="button"
                onClick={handleSimulateAttachment}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '4px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Upload size={13} />
                <span>Attach File / Screenshot</span>
              </button>
            </div>

            {/* Basic Sensitive Data Warning (Section 5) */}
            {showSensitiveWarning && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: 'rgba(255, 149, 0, 0.08)',
                border: '1px solid rgba(255, 149, 0, 0.25)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--apple-orange)' }}>
                  <ShieldAlert size={16} />
                  <span>
                    <strong>Security reminder:</strong> Please do not upload raw customer credit card numbers, debit PINs, or unmasked bank credentials.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSensitiveWarning(false)}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Attachments Preview List */}
            {attachments.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {attachments.map((att) => (
                  <div
                    key={att.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px'
                    }}
                  >
                    {att.file_type === 'image' ? <ImageIcon size={14} color="var(--apple-blue)" /> : <FileText size={14} color="var(--apple-orange)" />}
                    <span style={{ fontWeight: '500', color: 'var(--text-primary)' }}>{att.file_name}</span>
                    <span style={{ color: 'var(--text-tertiary)', fontSize: '11px' }}>({att.file_size})</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att.id)}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px' }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div
                onClick={handleSimulateAttachment}
                style={{
                  border: '1px dashed var(--border-card)',
                  borderRadius: 'var(--radius-md)',
                  padding: '18px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  backgroundColor: 'var(--bg-elevated)',
                  transition: 'background var(--transition-fast)'
                }}
              >
                <Upload size={22} color="var(--text-tertiary)" style={{ margin: '0 auto 6px' }} />
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  Click to select photos, screenshots, or POS error logs
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>
                  PNG, JPG, PDF, or TXT up to 10MB
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              TAGS (COMMA SEPARATED)
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="e.g. Billing, GST, Bug, Android, Sunmi"
              className="apple-input"
              style={{ width: '100%', fontSize: '13px' }}
            />
          </div>

          {/* Form Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
            marginTop: '8px'
          }}>
            <button
              type="button"
              onClick={onBack}
              className="apple-btn apple-btn-secondary"
              style={{ padding: '9px 18px', fontSize: '13px' }}
            >
              Cancel
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {similarMatches.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowSimilarModal(true)}
                  className="apple-btn apple-btn-secondary"
                  style={{ padding: '9px 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Sparkles size={14} color="var(--apple-blue)" />
                  <span>Check Similar ({similarMatches.length})</span>
                </button>
              )}

              <button
                type="submit"
                className="apple-btn apple-btn-primary"
                style={{ padding: '9px 24px', fontSize: '13px', fontWeight: '600' }}
              >
                Publish to Franchise Community
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* SIMILAR ISSUES MODAL (Section 10 & 28) */}
      {showSimilarModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
            maxWidth: '680px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.08) 0%, var(--bg-card-solid) 100%)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sparkles size={22} color="var(--apple-blue)" />
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    SIMILAR ISSUES FOUND
                  </h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0 }}>
                    We found existing resolved discussions matching your query. Check if these fix your problem!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSimilarModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Match List */}
            <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {similarMatches.map((match, idx) => (
                <div
                  key={match.id}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-card)',
                    backgroundColor: 'var(--bg-elevated)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: match.similarityScore >= 80 ? 'rgba(52, 199, 89, 0.18)' : 'rgba(0, 113, 227, 0.15)',
                        color: match.similarityScore >= 80 ? 'var(--apple-green)' : 'var(--apple-blue)'
                      }}>
                        {match.similarityScore}% similar
                      </span>

                      {match.isHQVerified && (
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
                          <Check size={12} />
                          HQ Verified
                        </span>
                      )}

                      {match.isAccepted && (
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
                          Accepted
                        </span>
                      )}
                    </div>

                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                      {match.sourceType === 'known_issue' ? 'Official Knowledge Base' : 'Community Discussion'}
                    </span>
                  </div>

                  <h4 style={{ fontSize: '14.5px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>
                    {match.ticket_id} {match.title}
                  </h4>

                  {match.solution && (
                    <div style={{
                      padding: '10px 12px',
                      backgroundColor: 'var(--bg-card-solid)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12.5px',
                      color: 'var(--text-secondary)'
                    }}>
                      <strong style={{ color: 'var(--apple-green)' }}>Solution: </strong>
                      {match.solution}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => onSelectExistingIssue(match.id)}
                      className="apple-btn apple-btn-primary"
                      style={{ padding: '6px 16px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <span>View Existing Solution</span>
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer (Section 10 buttons: [View Existing Solution] [Post Anyway]) */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                Is your issue different from the above matches?
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setHasDismissedSimilar(true);
                    setShowSimilarModal(false);
                    proceedSubmit();
                  }}
                  className="apple-btn apple-btn-secondary"
                  style={{ padding: '8px 18px', fontSize: '13px' }}
                >
                  Post Anyway
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
