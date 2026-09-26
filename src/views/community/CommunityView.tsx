import React, { useState, useEffect, useMemo } from 'react';
import { 
  CommunityPost, 
  CommunityReply, 
  KnownIssue, 
  IssueLink, 
  ITAnnouncement, 
  CommunityNotification, 
  CommunityUser,
  UserRole,
  IssueStatus
} from '../../types/community';
import { Shop } from '../../types';
import { computeCommunityMetrics } from '../../services/communityEngine';
import { 
  INITIAL_COMMUNITY_POSTS, 
  INITIAL_COMMUNITY_REPLIES, 
  INITIAL_KNOWN_ISSUES, 
  INITIAL_ISSUE_LINKS, 
  INITIAL_IT_ANNOUNCEMENTS, 
  INITIAL_NOTIFICATIONS, 
  COMMUNITY_USERS 
} from '../../data/communitySeedData';
import { CommunityHome } from './CommunityHome';
import { CreatePostView } from './CreatePostView';
import { IssueDetailView } from './IssueDetailView';
import { ITSupportView } from './ITSupportView';
import { KnowledgeBaseView } from './KnowledgeBaseView';
import { UserProfileModal } from './UserProfileModal';
import { IssueLinkingModal } from './IssueLinkingModal';
import { ConvertKnownIssueModal } from './ConvertKnownIssueModal';

interface CommunityViewProps {
  currentRole: UserRole;
  currentShopId?: string;
  allShops: Shop[];
  onUpdateNotifications?: (notifs: CommunityNotification[]) => void;
}

type CommunitySubView = 
  | 'home' 
  | 'create' 
  | 'detail' 
  | 'it_support' 
  | 'knowledge_base';

export const CommunityView: React.FC<CommunityViewProps> = ({
  currentRole,
  currentShopId = 'shop-01',
  allShops,
  onUpdateNotifications
}) => {
  // Main State with full Seed Data
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [replies, setReplies] = useState<CommunityReply[]>(INITIAL_COMMUNITY_REPLIES);
  const [knownIssues, setKnownIssues] = useState<KnownIssue[]>(INITIAL_KNOWN_ISSUES);
  const [issueLinks, setIssueLinks] = useState<IssueLink[]>(INITIAL_ISSUE_LINKS);
  const [announcements, setAnnouncements] = useState<ITAnnouncement[]>(INITIAL_IT_ANNOUNCEMENTS);
  const [notifications, setNotifications] = useState<CommunityNotification[]>(INITIAL_NOTIFICATIONS);
  const [users, setUsers] = useState<CommunityUser[]>(COMMUNITY_USERS);

  // Sub-routing state
  const [subView, setSubView] = useState<CommunitySubView>(() => {
    const path = window.location.pathname;
    if (path.includes('/community/new')) return 'create';
    if (path.includes('/community/it-support')) return 'it_support';
    if (path.includes('/community/kb')) return 'knowledge_base';
    if (path.includes('/community/post/')) return 'detail';
    return 'home';
  });

  const [selectedPostId, setSelectedPostId] = useState<string | null>(() => {
    const path = window.location.pathname;
    const match = path.match(/\/community\/post\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : 'post-01';
  });

  // Modals state
  const [selectedProfileUser, setSelectedProfileUser] = useState<CommunityUser | null>(null);
  const [linkingPost, setLinkingPost] = useState<CommunityPost | null>(null);
  const [convertingPost, setConvertingPost] = useState<CommunityPost | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<ITAnnouncement | null>(null);

  // Demo Scenario tracking state (Section 28)
  const [activeDemoStep, setActiveDemoStep] = useState<number | null>(null);
  const [demoBannerMessage, setDemoBannerMessage] = useState<string | null>(null);

  // Sync notifications to parent Header badge
  useEffect(() => {
    if (onUpdateNotifications) {
      onUpdateNotifications(notifications);
    }
  }, [notifications, onUpdateNotifications]);

  // URL sync helper
  const navigateToSubView = (view: CommunitySubView, postId?: string) => {
    setSubView(view);
    if (postId) setSelectedPostId(postId);

    let path = '/community';
    if (view === 'create') path = '/community/new';
    else if (view === 'it_support') path = '/community/it-support';
    else if (view === 'knowledge_base') path = '/community/kb';
    else if (view === 'detail' && (postId || selectedPostId)) {
      path = `/community/post/${postId || selectedPostId}`;
    }

    if (window.location.pathname !== path) {
      window.history.pushState({ communityView: view, postId }, '', path);
    }
  };

  // Browser history popstate sync
  useEffect(() => {
    const handlePop = () => {
      const path = window.location.pathname;
      if (path.includes('/community/new')) {
        setSubView('create');
      } else if (path.includes('/community/it-support')) {
        setSubView('it_support');
      } else if (path.includes('/community/kb')) {
        setSubView('knowledge_base');
      } else if (path.includes('/community/post/')) {
        const match = path.match(/\/community\/post\/([a-zA-Z0-9_-]+)/);
        if (match) setSelectedPostId(match[1]);
        setSubView('detail');
      } else {
        setSubView('home');
      }
    };
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  // Compute live community dashboard metrics
  const metrics = useMemo(() => {
    return computeCommunityMetrics(posts, knownIssues);
  }, [posts, knownIssues]);

  // Active Post for Detail View
  const currentPost = useMemo(() => {
    return posts.find((p) => p.id === selectedPostId) || posts[0];
  }, [posts, selectedPostId]);

  const currentReplies = useMemo(() => {
    return replies.filter((r) => r.post_id === currentPost?.id);
  }, [replies, currentPost]);

  // Current User ID mapped from active role
  const currentUserId = useMemo(() => {
    if (currentRole === 'HQ_OWNER') return 'user-01';
    if (currentRole === 'HQ_IT') return 'user-02';
    if (currentRole === 'REGIONAL_MANAGER') return 'user-04';
    if (currentRole === 'FRANCHISE_OWNER') return 'user-06';
    return 'user-05'; // STORE_MANAGER Ramesh Sharma
  }, [currentRole]);

  // ==========================================
  // HANDLERS
  // ==========================================

  const handleCreatePost = (newPost: CommunityPost) => {
    setPosts([newPost, ...posts]);

    // Add notification for HQ IT
    const newNotif: CommunityNotification = {
      id: `notif-${Date.now()}`,
      user_id: 'user-02',
      type: 'escalation',
      post_id: newPost.id,
      message: `New franchise issue reported by ${newPost.shop_name}: "${newPost.title}".`,
      read: false,
      created_at: 'Just now'
    };
    setNotifications([newNotif, ...notifications]);

    navigateToSubView('detail', newPost.id);
  };

  const handleAddReply = (replyData: Omit<CommunityReply, 'id' | 'created_at'>) => {
    const newReply: CommunityReply = {
      ...replyData,
      id: `reply-${Date.now()}`,
      created_at: 'Just now'
    };

    setReplies([...replies, newReply]);

    // Update post reply count & status
    setPosts(posts.map((p) => {
      if (p.id === replyData.post_id) {
        return {
          ...p,
          replies_count: p.replies_count + 1,
          status: p.status === 'OPEN' ? 'IN DISCUSSION' : p.status,
          verified_reply_id: replyData.is_verified ? newReply.id : p.verified_reply_id
        };
      }
      return p;
    }));

    // Notify post author if different
    if (currentPost && currentPost.author_id !== replyData.author_id) {
      const newNotif: CommunityNotification = {
        id: `notif-${Date.now()}`,
        user_id: currentPost.author_id,
        type: replyData.is_verified ? 'verified' : 'reply',
        post_id: currentPost.id,
        message: `${replyData.author_name} (${replyData.author_role.replace(/_/g, ' ')}) replied to your post: "${replyData.body.slice(0, 70)}..."`,
        read: false,
        created_at: 'Just now'
      };
      setNotifications([newNotif, ...notifications]);
    }
  };

  const handleAcceptReply = (replyId: string) => {
    setReplies(replies.map((r) => {
      if (r.post_id === currentPost?.id) {
        return { ...r, is_accepted: r.id === replyId };
      }
      return r;
    }));

    setPosts(posts.map((p) => {
      if (p.id === currentPost?.id) {
        return {
          ...p,
          accepted_reply_id: replyId,
          status: 'RESOLVED',
          updated_at: 'Just now'
        };
      }
      return p;
    }));

    // Notification to reply author
    const targetReply = replies.find((r) => r.id === replyId);
    if (targetReply) {
      const newNotif: CommunityNotification = {
        id: `notif-${Date.now()}`,
        user_id: targetReply.author_id,
        type: 'accepted',
        post_id: currentPost.id,
        message: `Your answer was marked as accepted solution by ${currentPost.author_name}!`,
        read: false,
        created_at: 'Just now'
      };
      setNotifications([newNotif, ...notifications]);
    }
  };

  const handleVerifyReply = (replyId: string) => {
    const verifiedBy = currentRole === 'HQ_IT' ? 'HQ IT Support Engineer' : 'HQ Admin';
    setReplies(replies.map((r) => {
      if (r.id === replyId) {
        return {
          ...r,
          is_verified: true,
          verified_by: verifiedBy,
          verified_at: 'Just now'
        };
      }
      return r;
    }));

    setPosts(posts.map((p) => {
      if (p.id === currentPost?.id) {
        return {
          ...p,
          verified_reply_id: replyId,
          status: 'RESOLVED',
          updated_at: 'Just now'
        };
      }
      return p;
    }));

    // Broadcast notification to all franchise followers
    const newNotif: CommunityNotification = {
      id: `notif-${Date.now()}`,
      user_id: currentPost.author_id,
      type: 'verified',
      post_id: currentPost.id,
      message: `HQ IT officially verified the solution for "${currentPost.title}".`,
      read: false,
      created_at: 'Just now'
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleVoteHelpful = (replyId: string) => {
    setReplies(replies.map((r) => {
      if (r.id === replyId) {
        const isVoted = r.user_voted_helpful;
        return {
          ...r,
          helpful_count: isVoted ? r.helpful_count - 1 : r.helpful_count + 1,
          user_voted_helpful: !isVoted
        };
      }
      return r;
    }));
  };

  const handleConfirmSolutionWorked = (replyId: string, shopId: string) => {
    setReplies(replies.map((r) => {
      if (r.id === replyId) {
        const confirmed = new Set(r.confirmed_shop_ids || []);
        confirmed.add(shopId);
        return {
          ...r,
          is_community_confirmed: true,
          confirmed_shop_ids: Array.from(confirmed),
          helpful_count: r.helpful_count + 1
        };
      }
      return r;
    }));

    // Increment affected franchise success counter
    setPosts(posts.map((p) => {
      if (p.id === currentPost?.id) {
        return {
          ...p,
          affected_shops_count: (p.affected_shops_count || 1) + 1
        };
      }
      return p;
    }));
  };

  const handleChangeStatus = (postId: string, newStatus: IssueStatus) => {
    setPosts(posts.map((p) => {
      if (p.id === postId) {
        return { ...p, status: newStatus, updated_at: 'Just now' };
      }
      return p;
    }));
  };

  const handleEscalate = () => {
    if (!currentPost) return;
    setPosts(posts.map((p) => {
      if (p.id === currentPost.id) {
        return {
          ...p,
          escalation_status: 'NEEDS_HQ_ATTENTION',
          status: 'HQ REVIEWING',
          updated_at: 'Just now'
        };
      }
      return p;
    }));

    const newNotif: CommunityNotification = {
      id: `notif-${Date.now()}`,
      user_id: 'user-02',
      type: 'escalation',
      post_id: currentPost.id,
      message: `Priority Escalation: "${currentPost.title}" flagged with Needs HQ Attention.`,
      read: false,
      created_at: 'Just now'
    };
    setNotifications([newNotif, ...notifications]);
  };

  const handleToggleFollow = () => {
    if (!currentPost) return;
    setPosts(posts.map((p) => {
      if (p.id === currentPost.id) {
        return { ...p, followed_by_user: !p.followed_by_user };
      }
      return p;
    }));
  };

  const handleAddLink = (linkData: Omit<IssueLink, 'id'>) => {
    const newLink: IssueLink = {
      ...linkData,
      id: `link-${Date.now()}`
    };
    setIssueLinks([...issueLinks, newLink]);
  };

  const handleConvertKnownIssue = (newKi: KnownIssue) => {
    setKnownIssues([newKi, ...knownIssues]);

    // Update the post with linked known issue id
    if (convertingPost) {
      setPosts(posts.map((p) => {
        if (p.id === convertingPost.id) {
          return {
            ...p,
            linked_known_issue_id: newKi.id,
            status: 'KNOWN ISSUE',
            ticket_id: newKi.ticket_id || p.ticket_id
          };
        }
        return p;
      }));
    }

    // Add announcement or notification
    const newNotif: CommunityNotification = {
      id: `notif-${Date.now()}`,
      user_id: 'user-05',
      type: 'known_issue_match',
      message: `Known Issue ${newKi.id} (${newKi.ticket_id}) published to Knowledge Base.`,
      read: false,
      created_at: 'Just now'
    };
    setNotifications([newNotif, ...notifications]);
  };

  // ==========================================
  // INTERACTIVE DEMO SCENARIO RUNNER (Section 28)
  // ==========================================
  const triggerDemoStep = (stepNumber: number) => {
    setActiveDemoStep(stepNumber);

    switch (stepNumber) {
      case 1:
        // Step 1: Open Franchise Community Home with 23 open, 5 awaiting HQ, 12 resolved, 4 known issues
        navigateToSubView('home');
        setDemoBannerMessage('Step 1: Opened Franchise Community. Displaying 23 open discussions, 5 awaiting HQ, 12 resolved this week, and known issues.');
        break;

      case 2:
        // Step 2: Click "Billing screen freezes after GST update"
        navigateToSubView('detail', 'post-01');
        setDemoBannerMessage('Step 2: Opened post-01 "Billing screen freezes after GST update". Inspecting thread workspace.');
        break;

      case 3:
        // Step 3: Show discussion between Pune franchise, Mumbai franchise, HQ IT
        navigateToSubView('detail', 'post-01');
        setDemoBannerMessage('Step 3: Viewing peer discussion between Ramesh Sharma (Pune), Bhavesh Patel (Mumbai), and Priya Nair (HQ IT).');
        break;

      case 4:
        // Step 4: Show HQ Verified official solution: Update app to v2.8.2
        navigateToSubView('detail', 'post-01');
        setDemoBannerMessage('Step 4: Inspected ✓ HQ Verified badge and official solution: "Update KhataCopilot to v2.8.2 and re-sync GST configuration".');
        break;

      case 5:
        // Step 5: Simulate creating another post: "GST invoice page freezing after update"
        navigateToSubView('create');
        setDemoBannerMessage('Step 5: Testing Similar Issues Finder with query: "GST invoice page freezing after update" -> 94% match detected against #BUG-1821 / post-01!');
        break;

      case 7:
        // Step 7: HQ IT receives the issue in IT Support Queue
        navigateToSubView('it_support');
        setDemoBannerMessage('Step 7: Opened HQ IT Support Queue (/community/it-support). Engineering triage desk showing 23 affected stores.');
        break;

      case 8:
        // Step 8: IT resolves it
        handleChangeStatus('post-01', 'RESOLVED');
        navigateToSubView('detail', 'post-01');
        setDemoBannerMessage('Step 8: IT resolved the issue and pushed release v2.8.2.');
        break;

      case 9:
        // Step 9: All affected franchises receive a notification
        const demoNotif: CommunityNotification = {
          id: `demo-notif-${Date.now()}`,
          user_id: currentUserId,
          type: 'bug_resolved',
          post_id: 'post-01',
          message: '🔔 Known Issue #BUG-1821 affecting your store terminal was resolved in v2.8.2. Tap to apply update.',
          read: false,
          created_at: 'Just now'
        };
        setNotifications([demoNotif, ...notifications]);
        setDemoBannerMessage('Step 9: Broadcast notification sent to all 23 affected franchise branches.');
        break;

      default:
        navigateToSubView('home');
    }
  };

  return (
    <div style={{ padding: '24px 28px', backgroundColor: 'var(--bg-system)', minHeight: '100%' }}>
      
      {/* Demo message toast */}
      {demoBannerMessage && (
        <div style={{
          backgroundColor: 'var(--apple-blue)',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '13px',
          fontWeight: '500',
          boxShadow: '0 4px 12px rgba(0, 113, 227, 0.3)'
        }}>
          <span>{demoBannerMessage}</span>
          <button
            onClick={() => setDemoBannerMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', fontWeight: '700' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Sub-view Rendering */}
      {subView === 'home' && (
        <CommunityHome
          posts={posts}
          knownIssues={knownIssues}
          announcements={announcements}
          metrics={metrics}
          currentRole={currentRole}
          currentShopId={currentShopId}
          onNavigateCreate={() => navigateToSubView('create')}
          onSelectPost={(id) => navigateToSubView('detail', id)}
          onSelectKnownIssue={(id) => {
            const linked = posts.find((p) => p.linked_known_issue_id === id);
            if (linked) navigateToSubView('detail', linked.id);
            else navigateToSubView('knowledge_base');
          }}
          onSelectAnnouncement={(ann) => setSelectedAnnouncement(ann)}
          onNavigateITSupport={() => navigateToSubView('it_support')}
          onNavigateKB={() => navigateToSubView('knowledge_base')}
          onTriggerDemoStep={triggerDemoStep}
          activeDemoStep={activeDemoStep}
        />
      )}

      {subView === 'create' && (
        <CreatePostView
          currentRole={currentRole}
          currentShopId={currentShopId}
          allShops={allShops}
          knownIssues={knownIssues}
          allPosts={posts}
          allReplies={replies}
          onBack={() => navigateToSubView('home')}
          onSubmitPost={handleCreatePost}
          onSelectExistingIssue={(id) => {
            const isKi = knownIssues.some((k) => k.id === id);
            if (isKi) {
              const matchingPost = posts.find((p) => p.linked_known_issue_id === id);
              if (matchingPost) navigateToSubView('detail', matchingPost.id);
              else navigateToSubView('knowledge_base');
            } else {
              navigateToSubView('detail', id);
            }
          }}
        />
      )}

      {subView === 'detail' && (
        <IssueDetailView
          post={currentPost}
          replies={currentReplies}
          knownIssues={knownIssues}
          issueLinks={issueLinks}
          allUsers={users}
          allShops={allShops}
          currentRole={currentRole}
          currentUserId={currentUserId}
          onBack={() => navigateToSubView('home')}
          onAddReply={handleAddReply}
          onAcceptReply={handleAcceptReply}
          onVerifyReply={handleVerifyReply}
          onVoteHelpful={handleVoteHelpful}
          onConfirmSolutionWorked={handleConfirmSolutionWorked}
          onChangeStatus={(status) => handleChangeStatus(currentPost.id, status)}
          onEscalate={handleEscalate}
          onToggleFollow={handleToggleFollow}
          onOpenUserProfile={(user) => setSelectedProfileUser(user)}
          onOpenLinkModal={() => setLinkingPost(currentPost)}
          onOpenConvertModal={() => setConvertingPost(currentPost)}
        />
      )}

      {subView === 'it_support' && (
        <div>
          <div style={{ marginBottom: '14px' }}>
            <button
              onClick={() => navigateToSubView('home')}
              className="apple-btn apple-btn-secondary"
              style={{ padding: '6px 14px', fontSize: '12.5px' }}
            >
              ← Back to Community Home
            </button>
          </div>
          <ITSupportView
            posts={posts}
            knownIssues={knownIssues}
            onSelectPost={(id) => navigateToSubView('detail', id)}
            onOpenConvertModal={(post) => setConvertingPost(post)}
            onChangeStatus={handleChangeStatus}
          />
        </div>
      )}

      {subView === 'knowledge_base' && (
        <div>
          <div style={{ marginBottom: '14px' }}>
            <button
              onClick={() => navigateToSubView('home')}
              className="apple-btn apple-btn-secondary"
              style={{ padding: '6px 14px', fontSize: '12.5px' }}
            >
              ← Back to Community Home
            </button>
          </div>
          <KnowledgeBaseView
            knownIssues={knownIssues}
            onSelectKnownIssue={(ki) => {
              const post = posts.find((p) => p.linked_known_issue_id === ki.id);
              if (post) navigateToSubView('detail', post.id);
            }}
          />
        </div>
      )}

      {/* MODALS */}
      {selectedProfileUser && (
        <UserProfileModal
          user={selectedProfileUser}
          onClose={() => setSelectedProfileUser(null)}
        />
      )}

      {linkingPost && (
        <IssueLinkingModal
          currentIssue={{
            id: linkingPost.id,
            ticket_id: linkingPost.ticket_id,
            title: linkingPost.title
          }}
          allKnownIssues={knownIssues}
          allPosts={posts}
          existingLinks={issueLinks}
          onAddLink={handleAddLink}
          onClose={() => setLinkingPost(null)}
        />
      )}

      {convertingPost && (
        <ConvertKnownIssueModal
          post={convertingPost}
          replies={replies.filter((r) => r.post_id === convertingPost.id)}
          onConvert={handleConvertKnownIssue}
          onClose={() => setConvertingPost(null)}
        />
      )}

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
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
            padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: 'var(--apple-blue)', textTransform: 'uppercase' }}>
                Official IT Announcement
              </span>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                className="apple-btn apple-btn-secondary"
                style={{ padding: '3px 10px', fontSize: '12px' }}
              >
                Close
              </button>
            </div>

            <h3 style={{ fontSize: '17px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 10px' }}>
              {selectedAnnouncement.title}
            </h3>

            <p style={{ fontSize: '13.5px', lineHeight: '1.6', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
              {selectedAnnouncement.body}
            </p>

            {selectedAnnouncement.fixes && (
              <div style={{
                backgroundColor: 'var(--bg-elevated)',
                padding: '14px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '16px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: '8px' }}>
                  Release Highlights
                </div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: 'var(--text-primary)' }}>
                  {selectedAnnouncement.fixes.map((f, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{f}</li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--text-tertiary)' }}>
              <span>Published by: {selectedAnnouncement.published_by} ({selectedAnnouncement.published_role})</span>
              <span>{selectedAnnouncement.created_at}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
