import React, { useState } from 'react';
import { PhoneStatusBar } from '../components/PhoneStatusBar';
import { PhoneBottomNav } from '../components/PhoneBottomNav';
import { ScreenId, BottomTab } from '../types';
import { CATEGORIES, INITIAL_QUESTIONS } from '../data/mockData';
import { 
  Bell, 
  Search, 
  Plus, 
  Megaphone, 
  X, 
  MessageSquare, 
  ThumbsUp, 
  Share2,
  Grid,
  Mic,
  FileText,
  Package,
  CreditCard,
  Smartphone,
  Wrench,
  TrendingUp
} from 'lucide-react';

interface CommunityScreenProps {
  onNavigate: (screen: ScreenId) => void;
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  onNavigate,
  activeTab,
  onTabChange,
}) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Unanswered' | 'Solved' | 'Following'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [questions, setQuestions] = useState(INITIAL_QUESTIONS);

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Grid': return <Grid size={15} />;
      case 'Mic': return <Mic size={15} />;
      case 'FileText': return <FileText size={15} />;
      case 'Package': return <Package size={15} />;
      case 'CreditCard': return <CreditCard size={15} />;
      case 'Smartphone': return <Smartphone size={15} />;
      case 'Wrench': return <Wrench size={15} />;
      case 'TrendingUp': return <TrendingUp size={15} />;
      default: return <Grid size={15} />;
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (activeFilter === 'Unanswered' && q.status !== 'Unanswered') return false;
    if (activeFilter === 'Solved' && q.status !== 'Solved') return false;
    if (searchQuery && !q.title.toLowerCase().includes(searchQuery.toLowerCase()) && !q.body.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, upvotesCount: q.upvotesCount + 1 } : q));
  };

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] text-slate-900 select-none relative">
      {/* Top Status Bar */}
      <PhoneStatusBar theme="dark" />

      {/* Screen Scrollable Body */}
      <div className="screen-scroll-body px-4 pt-1 pb-20">
        {/* Community Header */}
        <div className="flex items-center justify-between py-2">
          <div>
            <h2 className="text-[20px] font-extrabold text-slate-900 leading-tight">
              Community
            </h2>
            <p className="text-[11px] font-medium text-slate-500">
              Learn • Solve • Grow Together
            </p>
          </div>

          <button 
            onClick={() => onNavigate('knowledge')}
            className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-blue-600 relative transition-colors shadow-sm"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-2 mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions, solutions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-slate-200 text-[12px] font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-3">
          {(['All', 'Unanswered', 'Solved', 'Following'] as const).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Category Grid (8 items in 2 rows) */}
        <div className="grid grid-cols-4 gap-2 mb-3.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center justify-center p-2 rounded-2xl border transition-all text-center ${
                  isSelected 
                    ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-100 shadow-sm' 
                    : 'bg-white border-slate-100 hover:border-slate-200 shadow-xs'
                }`}
              >
                <div 
                  className="w-8 h-8 rounded-xl flex items-center justify-center mb-1"
                  style={{ backgroundColor: cat.bgColor, color: cat.color }}
                >
                  {getCategoryIcon(cat.icon)}
                </div>
                <span className="text-[10px] font-semibold text-slate-700 leading-tight">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Announcement Banner */}
        {showAnnouncement && (
          <div className="bg-[#fff1f2] border border-[#ffe4e6] rounded-2xl p-3 mb-3 relative text-slate-800">
            <button
              onClick={() => setShowAnnouncement(false)}
              className="absolute top-2 right-2 text-rose-400 hover:text-rose-600 p-0.5"
            >
              <X size={14} />
            </button>
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                <Megaphone size={14} />
              </div>
              <div className="pr-4">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wide text-rose-600 bg-rose-100/70 px-1.5 py-0.5 rounded">
                    Announcement
                  </span>
                </div>
                <h4 className="text-[12px] font-bold text-slate-900 leading-tight">
                  New Feature: Auto GST Report
                </h4>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                  GSTR-1 can now be generated directly from your sales. Watch tutorial here.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Question Feed */}
        <div className="space-y-3">
          {filteredQuestions.map((post) => (
            <div
              key={post.id}
              onClick={() => onNavigate('question_detail')}
              className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-[0_2px_12px_-2px_rgba(0,0,0,0.04)] hover:shadow-md transition-all cursor-pointer"
            >
              {/* Post Author Row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-slate-900">
                        {post.authorName}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {post.authorFranchise} • {post.authorLocation}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {post.timeAgo}
                    </span>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    post.status === 'Unanswered'
                      ? 'bg-rose-50 text-rose-600 border border-rose-100'
                      : post.status === 'Solved'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}
                >
                  {post.status}
                </span>
              </div>

              {/* Title & Body Preview */}
              <h3 className="text-[13px] font-bold text-slate-900 leading-snug mb-1">
                {post.title}
              </h3>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2.5">
                {post.body}
              </p>

              {/* Tags */}
              <div className="flex items-center gap-1.5 flex-wrap mb-2.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Interaction Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-slate-500 text-[11px] font-semibold">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 hover:text-blue-600">
                    <MessageSquare size={14} />
                    <span>{post.commentsCount}</span>
                  </div>
                  <button
                    onClick={(e) => handleLike(post.id, e)}
                    className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                  >
                    <ThumbsUp size={14} />
                    <span>{post.upvotesCount}</span>
                  </button>
                  <div className="flex items-center gap-1 hover:text-blue-600">
                    <Share2 size={14} />
                    <span>Share</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Action Button (+) */}
      <button
        onClick={() => onNavigate('ask')}
        className="community-fab"
        title="Ask a Question"
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>

      {/* Bottom Nav */}
      <PhoneBottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        onNavigate={onNavigate}
      />

      <div className="home-indicator-bar" />
    </div>
  );
};
