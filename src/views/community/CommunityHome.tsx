import React, { useState } from 'react';
import { 
  CommunityPost, 
  KnownIssue, 
  ITAnnouncement, 
  CommunityMetrics, 
  CommunityCategory,
  UserRole
} from '../../types/community';
import { 
  Plus, 
  Search, 
  CheckCircle2, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Users, 
  MessageSquare, 
  Eye, 
  TrendingUp, 
  Flame, 
  Tag, 
  ChevronRight, 
  Filter, 
  Bell, 
  Sparkles, 
  HelpCircle, 
  Store, 
  BookOpen, 
  Play
} from 'lucide-react';

interface CommunityHomeProps {
  posts: CommunityPost[];
  knownIssues: KnownIssue[];
  announcements: ITAnnouncement[];
  metrics: CommunityMetrics;
  currentRole: UserRole;
  currentShopId?: string;
  onNavigateCreate: () => void;
  onSelectPost: (postId: string) => void;
  onSelectKnownIssue: (kiId: string) => void;
  onSelectAnnouncement: (ann: ITAnnouncement) => void;
  onNavigateITSupport: () => void;
  onNavigateKB: () => void;
  onTriggerDemoStep: (stepNumber: number) => void;
  activeDemoStep: number | null;
}

type FeedFilterTab = 
  | 'all' 
  | 'my_posts' 
  | 'following' 
  | 'unresolved' 
  | 'solved' 
  | 'announcements' 
  | 'knowledge_base';

export const CommunityHome: React.FC<CommunityHomeProps> = ({
  posts,
  knownIssues,
  announcements,
  metrics,
  currentRole,
  currentShopId,
  onNavigateCreate,
  onSelectPost,
  onSelectKnownIssue,
  onSelectAnnouncement,
  onNavigateITSupport,
  onNavigateKB,
  onTriggerDemoStep,
  activeDemoStep
}) => {
  const [activeTab, setActiveTab] = useState<FeedFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('All');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');

  // Categories list
  const categories: CommunityCategory[] = [
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
    'How-To'
  ];

  // Pinned announcements (Section 20)
  const pinnedAnnouncements = announcements.filter((a) => a.is_pinned);

  // Trending & Common Issues calculations (Section 13)
  const mostDiscussed = [...posts].sort((a, b) => b.replies_count - a.replies_count).slice(0, 3);
  const mostCommon = [...posts].sort((a, b) => (b.affected_shops_count || 1) - (a.affected_shops_count || 1)).slice(0, 3);
  const recentlySolved = posts.filter((p) => p.status === 'RESOLVED' || p.status === 'CLOSED').slice(0, 3);

  // Filter posts
  const filteredPosts = posts.filter((p) => {
    // Tab filter
    if (activeTab === 'my_posts') {
      if (p.shop_id !== currentShopId && p.author_role !== currentRole) return false;
    } else if (activeTab === 'following') {
      if (!p.followed_by_user) return false;
    } else if (activeTab === 'unresolved') {
      if (p.status === 'RESOLVED' || p.status === 'CLOSED') return false;
    } else if (activeTab === 'solved') {
      if (p.status !== 'RESOLVED' && p.status !== 'CLOSED') return false;
    }

    // Category filter
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;

    // Severity filter
    if (selectedSeverity !== 'All' && p.severity !== selectedSeverity) return false;

    // Region filter
    if (selectedRegion !== 'All' && p.region !== selectedRegion) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = p.title.toLowerCase().includes(q) ||
                    p.description.toLowerCase().includes(q) ||
                    p.shop_name.toLowerCase().includes(q) ||
                    p.tags.some((t) => t.toLowerCase().includes(q)) ||
                    (p.ticket_id && p.ticket_id.toLowerCase().includes(q));
      if (!match) return false;
    }

    return true;
  });

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', paddingBottom: '40px', animation: 'fadeIn 0.2s ease-out' }}>
      
      {/* GUIDED LIVE DEMO BANNER (Section 28) */}
      <div style={{
        backgroundColor: 'var(--bg-elevated)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 18px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: 'var(--apple-blue-tint)',
            color: 'var(--apple-blue)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Play size={15} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>
              Interactive Section 28 Demonstration Walkthrough
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Click any step to experience the full franchise resolution feedback loop live.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { step: 1, label: '1. Community Overview' },
            { step: 2, label: '2. Billing Freeze Post' },
            { step: 3, label: '3. Multi-Store Thread' },
            { step: 4, label: '4. HQ Verified Fix' },
            { step: 5, label: '5. Similar Issue (94%)' },
            { step: 7, label: '7. IT Support Queue' }
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => onTriggerDemoStep(item.step)}
              className="apple-btn apple-btn-secondary"
              style={{
                fontSize: '11.5px',
                padding: '4px 10px',
                backgroundColor: activeDemoStep === item.step ? 'var(--apple-blue)' : undefined,
                color: activeDemoStep === item.step ? '#ffffff' : undefined,
                borderColor: activeDemoStep === item.step ? 'var(--apple-blue)' : undefined
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Header Banner (Section 2) */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.08) 0%, rgba(88, 86, 214, 0.05) 50%, var(--bg-card-solid) 100%)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '28px 32px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ maxWidth: '640px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              color: 'var(--apple-blue)',
              backgroundColor: 'var(--apple-blue-tint)',
              padding: '2px 8px',
              borderRadius: '9999px'
            }}>
              KhataCopilot NetworkOS
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
              • 48 Franchise Stores Active
            </span>
          </div>

          <h1 style={{ fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', color: 'var(--text-primary)', margin: '0 0 8px' }}>
            FRANCHISE COMMUNITY
          </h1>

          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: 0 }}>
            Learn from other franchisees, get help from HQ, and solve store problems faster.
          </p>
        </div>

        {/* Top Actions (Section 2) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* IT Support Queue button (visible to IT and Admin) */}
          {(currentRole === 'HQ_IT' || currentRole === 'HQ_OWNER') && (
            <button
              onClick={onNavigateITSupport}
              className="apple-btn apple-btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                fontSize: '13px',
                borderColor: 'var(--apple-purple)',
                color: 'var(--apple-purple)'
              }}
            >
              <ShieldCheck size={16} />
              <span>IT Support Queue ({posts.filter((p) => p.status === 'HQ REVIEWING' || p.severity === 'Critical').length})</span>
            </button>
          )}

          {/* Knowledge Base */}
          <button
            onClick={onNavigateKB}
            className="apple-btn apple-btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 18px', fontSize: '13px' }}
          >
            <BookOpen size={16} />
            <span>Knowledge Base ({knownIssues.length})</span>
          </button>

          {/* Create Post */}
          <button
            onClick={onNavigateCreate}
            className="apple-btn apple-btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '9px 20px',
              fontSize: '13px',
              fontWeight: '600'
            }}
          >
            <Plus size={16} />
            <span>Create Post</span>
          </button>
        </div>
      </div>

      {/* Pinned IT Announcements Banner (Section 20) */}
      {pinnedAnnouncements.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px' }}>
          {pinnedAnnouncements.map((ann) => (
            <div
              key={ann.id}
              onClick={() => onSelectAnnouncement(ann)}
              style={{
                background: 'linear-gradient(135deg, rgba(0, 113, 227, 0.09) 0%, var(--bg-card-solid) 100%)',
                border: '1px solid rgba(0, 113, 227, 0.35)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'transform var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--apple-blue)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Bell size={16} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: '800', color: 'var(--apple-blue)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      IMPORTANT HQ ANNOUNCEMENT
                    </span>
                    {ann.affected_stores_count && (
                      <span style={{ fontSize: '11px', color: 'var(--apple-orange)', fontWeight: '600' }}>
                        • Affected: {ann.affected_stores_count} stores
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', marginTop: '2px' }}>
                    {ann.title}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: 'var(--apple-blue)', fontWeight: '600' }}>
                <span>Read Announcement</span>
                <ChevronRight size={15} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DASHBOARD METRICS BAR (Section 24) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Open Issues
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--apple-blue)', marginTop: '4px' }}>
            {metrics.open_issues}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Active across network
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            HQ Attention
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--apple-red)', marginTop: '4px' }}>
            {metrics.issues_awaiting_hq}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Awaiting triage/escalated
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Resolved This Week
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--apple-green)', marginTop: '4px' }}>
            {metrics.resolved_this_week}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Verified solutions
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Avg Resolution
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', marginTop: '4px' }}>
            {metrics.average_resolution_time_hours}h
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Fast store recovery
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Known Issues
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--apple-purple)', marginTop: '4px' }}>
            {metrics.known_issues_count}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Documented in KB
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Affected Shops
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--apple-orange)', marginTop: '4px' }}>
            {metrics.total_affected_shops}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Stores reporting issues
          </div>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-card-solid)',
          border: '1px solid var(--border-card)',
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ fontSize: '11.5px', fontWeight: '600', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
            Community Rate
          </div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: 'var(--apple-teal)', marginTop: '4px' }}>
            {metrics.community_resolution_rate_pct}%
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            Franchise peer fixes
          </div>
        </div>
      </div>

      {/* Main Grid: Feed + Sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Column: Feed Sections, Search, Filters, Post Cards */}
        <div>
          {/* Main Sections Navigation Tabs (Section 2) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-card)',
            marginBottom: '16px',
            overflowX: 'auto',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[
                { id: 'all' as FeedFilterTab, label: 'All Discussions' },
                { id: 'my_posts' as FeedFilterTab, label: 'My Posts' },
                { id: 'following' as FeedFilterTab, label: 'Following' },
                { id: 'unresolved' as FeedFilterTab, label: 'Unresolved Issues' },
                { id: 'solved' as FeedFilterTab, label: 'Solved Issues' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '9px 14px',
                    border: 'none',
                    borderBottom: activeTab === tab.id ? '2px solid var(--apple-blue)' : '2px solid transparent',
                    background: 'transparent',
                    color: activeTab === tab.id ? 'var(--apple-blue)' : 'var(--text-secondary)',
                    fontWeight: activeTab === tab.id ? '600' : '500',
                    fontSize: '13px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'color var(--transition-fast)'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span style={{ fontSize: '12px', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
              Showing {filteredPosts.length} of {posts.length} discussions
            </span>
          </div>

          {/* Search & Filter Bar (Section 12) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '18px',
            flexWrap: 'wrap'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-tertiary)' }} />
              <input
                type="text"
                placeholder="Search issues, GST errors, printers, offline sync..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="apple-input"
                style={{ width: '100%', paddingLeft: '34px', fontSize: '13px', height: '36px' }}
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="apple-input"
              style={{ fontSize: '12.5px', height: '36px', padding: '0 10px' }}
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            {/* Severity Filter */}
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="apple-input"
              style={{ fontSize: '12.5px', height: '36px', padding: '0 10px' }}
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Region Filter */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="apple-input"
              style={{ fontSize: '12.5px', height: '36px', padding: '0 10px' }}
            >
              <option value="All">All Regions</option>
              <option value="West">West Region</option>
              <option value="North">North Region</option>
              <option value="South">South Region</option>
            </select>
          </div>

          {/* Posts Feed Cards List (Section 3) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredPosts.map((post) => {
              const hasAccepted = !!post.accepted_reply_id;
              const hasVerified = !!post.verified_reply_id;
              const isHigh = post.severity === 'High' || post.severity === 'Critical';

              const statusColor = {
                'OPEN': 'var(--apple-blue)',
                'IN DISCUSSION': 'var(--apple-purple)',
                'HQ REVIEWING': 'var(--apple-orange)',
                'KNOWN ISSUE': 'var(--apple-indigo)',
                'RESOLVED': 'var(--apple-green)',
                'CLOSED': 'var(--text-tertiary)'
              }[post.status];

              return (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post.id)}
                  style={{
                    background: 'var(--bg-card-solid)',
                    border: '1px solid var(--border-card)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '20px 22px',
                    cursor: 'pointer',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all var(--transition-fast)',
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)';
                    e.currentTarget.style.borderColor = 'rgba(0, 113, 227, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                    e.currentTarget.style.borderColor = 'var(--border-card)';
                  }}
                >
                  {/* Top line: Category, Status, Severity, Verification indicator */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Category Pill */}
                      <span style={{
                        fontSize: '11.5px',
                        fontWeight: '700',
                        color: 'var(--apple-blue)',
                        backgroundColor: 'var(--apple-blue-tint)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-xs)'
                      }}>
                        🔧 {post.category.toUpperCase()}
                      </span>

                      {/* Ticket */}
                      {post.ticket_id && (
                        <span style={{ fontSize: '11.5px', fontWeight: '700', color: 'var(--apple-purple)' }}>
                          {post.ticket_id}
                        </span>
                      )}

                      {/* Status */}
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        backgroundColor: `${statusColor}18`,
                        color: statusColor
                      }}>
                        {post.status}
                      </span>

                      {/* Affected stores count badge */}
                      {(post.affected_shops_count || 1) > 1 && (
                        <span style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '2px 7px',
                          borderRadius: '9999px',
                          backgroundColor: 'rgba(255, 149, 0, 0.12)',
                          color: 'var(--apple-orange)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Users size={12} />
                          {post.affected_shops_count} shops affected
                        </span>
                      )}
                    </div>

                    {/* Right indicators */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {hasVerified && (
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

                      {hasAccepted && !hasVerified && (
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
                          <CheckCircle2 size={12} />
                          Accepted Solution
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    margin: '0 0 8px',
                    lineHeight: '1.35'
                  }}>
                    {post.title}
                  </h3>

                  {/* Description preview */}
                  <p style={{
                    fontSize: '13px',
                    lineHeight: '1.5',
                    color: 'var(--text-secondary)',
                    margin: '0 0 12px',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical'
                  }}>
                    "{post.description}"
                  </p>

                  {/* Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                    {post.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: '11px',
                          color: 'var(--text-tertiary)',
                          backgroundColor: 'var(--bg-elevated)',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-subtle)'
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Footer Meta Row: Author, Shop, Time, Replies, Views */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>Posted by: <strong style={{ color: 'var(--text-primary)' }}>{post.author_name}</strong></span>
                      <span>•</span>
                      <span>{post.shop_name}</span>
                      <span>•</span>
                      <span>{post.region}</span>
                      <span>•</span>
                      <span style={{ color: 'var(--text-tertiary)' }}>{post.created_at}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MessageSquare size={13} color="var(--apple-blue)" />
                        <strong style={{ color: 'var(--text-primary)' }}>{post.replies_count}</strong> replies
                      </span>

                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-tertiary)' }}>
                        <Eye size={13} />
                        {post.views_count}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredPosts.length === 0 && (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                backgroundColor: 'var(--bg-card-solid)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-card)',
                color: 'var(--text-secondary)'
              }}>
                <Search size={32} color="var(--text-tertiary)" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontSize: '15px', fontWeight: '600' }}>No discussions found</div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                  Try changing your search keywords or filter selection.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Trending, Most Common, Recently Solved Widgets (Section 13) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Widget 1: MOST COMMON (Affecting the most branches) */}
          <div style={{
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Users size={16} color="var(--apple-orange)" />
              <h3 style={{ fontSize: '13.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-primary)', margin: 0 }}>
                MOST COMMON ISSUES
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mostCommon.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectPost(item.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--apple-orange)' }}>
                      Affected: {item.affected_shops_count || 1} shops
                    </span>

                    {item.verified_reply_id && (
                      <span style={{ fontSize: '10.5px', fontWeight: '700', color: 'var(--apple-blue)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <ShieldCheck size={11} />
                        HQ Verified
                      </span>
                    )}
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {item.title}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)' }}>
                    <span>v{item.app_version}</span>
                    <span style={{ color: 'var(--apple-blue)', fontWeight: '600' }}>View Solution →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 2: MOST DISCUSSED (Top issues this week) */}
          <div style={{
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Flame size={16} color="var(--apple-red)" />
              <h3 style={{ fontSize: '13.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-primary)', margin: 0 }}>
                MOST DISCUSSED THIS WEEK
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {mostDiscussed.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectPost(item.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {item.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>{item.category}</span>
                    <span style={{ color: 'var(--apple-blue)', fontWeight: '700' }}>{item.replies_count} replies</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: RECENTLY SOLVED (Verified Solutions) */}
          <div style={{
            background: 'var(--bg-card-solid)',
            border: '1px solid var(--border-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <CheckCircle2 size={16} color="var(--apple-green)" />
              <h3 style={{ fontSize: '13.5px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.4px', color: 'var(--text-primary)', margin: 0 }}>
                RECENTLY SOLVED
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentlySolved.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectPost(item.id)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-elevated)',
                    border: '1px solid var(--border-subtle)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <span style={{ color: 'var(--apple-green)', fontSize: '11px', fontWeight: '700' }}>✓ Resolved</span>
                    <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>• {item.shop_name}</span>
                  </div>
                  <div style={{ fontSize: '12.5px', fontWeight: '600', color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
