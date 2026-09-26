import { Region, UserRole as CoreUserRole } from './index';

export type UserRole = 
  | 'HQ_OWNER' 
  | 'AREA_MANAGER'
  | 'REGIONAL_MANAGER' 
  | 'STORE_MANAGER' 
  | 'HQ_IT' 
  | 'FRANCHISE_OWNER';

export type CommunityCategory = 
  | 'Technical Issue'
  | 'Billing'
  | 'GST'
  | 'Udhaar'
  | 'Inventory'
  | 'Payments'
  | 'Voice Orders'
  | 'Login / Account'
  | 'Hardware'
  | 'Sync / Offline Mode'
  | 'Feature Request'
  | 'How-To'
  | 'Other';

export type CommunitySeverity = 'Low' | 'Medium' | 'High' | 'Critical';

export type IssueStatus = 
  | 'OPEN' 
  | 'IN DISCUSSION' 
  | 'HQ REVIEWING' 
  | 'KNOWN ISSUE' 
  | 'RESOLVED' 
  | 'CLOSED';

export type EscalationStatus = 'NORMAL' | 'NEEDS_HQ_ATTENTION' | 'ESCALATED';

export type IssueRelationshipType = 
  | 'RELATED' 
  | 'SAME_ROOT_CAUSE' 
  | 'FIXED_BY' 
  | 'DUPLICATE';

export interface CommunityAttachment {
  id: string;
  post_id?: string;
  reply_id?: string;
  file_url: string;
  file_name: string;
  file_type: 'image' | 'pdf' | 'log' | 'video' | 'file';
  file_size?: string;
  created_at: string;
}

export interface CommunityReply {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  author_shop_id?: string;
  author_shop_name?: string;
  author_region?: Region;
  body: string;
  created_at: string;
  is_accepted: boolean;
  is_verified: boolean;
  is_community_confirmed?: boolean;
  confirmed_shop_ids?: string[];
  helpful_count: number;
  user_voted_helpful?: boolean;
  verified_by?: string;
  verified_at?: string;
  official_it_response?: boolean;
  attachments?: CommunityAttachment[];
}

export interface CommunityPost {
  id: string;
  ticket_id?: string; // e.g. #BUG-1821
  author_id: string;
  author_name: string;
  author_role: UserRole;
  shop_id: string;
  shop_name: string;
  region: Region;
  title: string;
  description: string;
  category: CommunityCategory;
  subcategory?: string;
  severity: CommunitySeverity;
  status: IssueStatus;
  escalation_status?: EscalationStatus;
  device: string;
  app_version: string;
  created_at: string;
  updated_at: string;
  accepted_reply_id?: string;
  verified_reply_id?: string;
  views_count: number;
  replies_count: number;
  affected_shops_count: number;
  affected_shop_ids?: string[];
  affected_regions?: Region[];
  tags: string[];
  is_pinned?: boolean;
  linked_known_issue_id?: string;
  assigned_to_it?: string;
  internal_it_notes?: string;
  attachments?: CommunityAttachment[];
  followed_by_user?: boolean;
}

export interface KnownIssue {
  id: string; // e.g. "KB-1042"
  ticket_id?: string; // e.g. "#BUG-1821"
  title: string;
  problem: string;
  root_cause: string;
  solution: string;
  affected_version: string;
  fixed_version: string;
  category: CommunityCategory;
  severity: CommunitySeverity;
  status: 'INVESTIGATING' | 'CONFIRMED' | 'FIX_IN_PROGRESS' | 'RESOLVED_IN_RELEASE' | 'CLOSED';
  verified_by: string;
  success_reports_count: number;
  affected_shops_count: number;
  affected_regions: Region[];
  affected_shop_ids: string[];
  created_at: string;
  updated_at: string;
  last_verified_at: string;
  linked_post_ids?: string[];
}

export interface IssueLink {
  id: string;
  source_issue_id: string;
  source_title: string;
  target_issue_id: string;
  target_title: string;
  relationship: IssueRelationshipType;
  details?: string;
}

export interface CommunityNotification {
  id: string;
  user_id: string;
  type: 
    | 'reply' 
    | 'mention' 
    | 'accepted' 
    | 'verified' 
    | 'escalation' 
    | 'known_issue_match' 
    | 'bug_resolved' 
    | 'announcement';
  post_id?: string;
  message: string;
  read: boolean;
  created_at: string;
  meta?: {
    shop_count?: number;
    app_version?: string;
  };
}

export interface ITAnnouncement {
  id: string;
  title: string;
  body: string;
  severity: CommunitySeverity;
  published_by: string;
  published_role: string;
  created_at: string;
  is_pinned: boolean;
  affected_stores_count?: number;
  affected_version?: string;
  fixed_version?: string;
  fixes?: string[];
  read?: boolean;
}

export interface CommunityUser {
  id: string;
  name: string;
  role: UserRole;
  shop_id?: string;
  shop_name?: string;
  region?: Region;
  email: string;
  phone: string;
  member_since: string;
  posts_count: number;
  answers_count: number;
  accepted_count: number;
  verified_count: number;
  avatar_color?: string;
}

export interface CommunityMetrics {
  open_issues: number;
  issues_awaiting_hq: number;
  resolved_this_week: number;
  average_resolution_time_hours: number;
  known_issues_count: number;
  total_affected_shops: number;
  community_resolution_rate_pct: number;
}
