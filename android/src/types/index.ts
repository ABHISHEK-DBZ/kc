export type ScreenId = 
  | 'splash'
  | 'home'
  | 'community'
  | 'ask'
  | 'analyzing'
  | 'question_sent'
  | 'question_detail'
  | 'profile'
  | 'leaders'
  | 'knowledge';

export type BottomTab = 'home' | 'khata' | 'community' | 'reports' | 'more';

export interface UserProfile {
  id: string;
  name: string;
  franchiseCode: string;
  city: string;
  avatarUrl: string;
  role: string;
  questionsCount: number;
  answersCount: number;
  savedPostsCount: number;
}

export interface BusinessHealthStats {
  score: number;
  status: 'Good' | 'Needs Attention' | 'Critical';
  transactionsToday: number;
  totalSalesToday: number;
  customersCount: number;
  creditGiven: number;
  inventoryAlertsCount: number;
  gstStatus: 'Ready' | 'Pending' | 'Action Needed';
}

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgColor: string;
}

export interface QuestionPost {
  id: string;
  title: string;
  body: string;
  authorName: string;
  authorFranchise: string;
  authorLocation: string;
  authorAvatar: string;
  authorBadge?: string;
  timeAgo: string;
  status: 'Unanswered' | 'Solved' | 'In Progress';
  tags: string[];
  commentsCount: number;
  upvotesCount: number;
  aiCategory?: string;
  aiConfidence?: number;
  hasAISolution?: boolean;
}

export interface AISimilarQuestion {
  id: string;
  title: string;
  answersCount: number;
  status: 'Solved' | 'In Progress';
  iconType: 'doc' | 'sync' | 'alert';
}

export interface StepperStep {
  id: number;
  label: string;
  status: 'completed' | 'in_progress' | 'pending';
  timestamp?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  franchiseCode: string;
  city: string;
  answersCount: number;
  avatarUrl: string;
  badge?: string;
  isCurrentUser?: boolean;
}

export interface KnowledgeArticleItem {
  id: string;
  title: string;
  category: string;
  subtitle: string;
  iconBg: string;
  iconColor: string;
  iconName: string;
  readsCount?: number;
}
