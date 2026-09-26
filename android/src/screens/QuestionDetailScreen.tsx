import React, { useState } from 'react';
import { PhoneStatusBar } from '../components/PhoneStatusBar';
import { PhoneBottomNav } from '../components/PhoneBottomNav';
import { ScreenId, BottomTab } from '../types';
import { CURRENT_USER } from '../data/mockData';
import { 
  ArrowLeft, 
  Sparkles, 
  MessageSquare, 
  ThumbsUp, 
  Share2, 
  Send, 
  Check, 
  Star
} from 'lucide-react';

interface QuestionDetailScreenProps {
  onNavigate: (screen: ScreenId) => void;
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
}

export const QuestionDetailScreen: React.FC<QuestionDetailScreenProps> = ({
  onNavigate,
  activeTab,
  onTabChange,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [likes, setLikes] = useState(3);
  const [hasLiked, setHasLiked] = useState(false);
  const [solutionApplied, setSolutionApplied] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState<{
    id: string;
    author: string;
    franchise: string;
    city: string;
    timeAgo: string;
    badge?: string;
    avatar: string;
    text: string;
    likes: number;
  }[]>([
    {
      id: 'rep-1',
      author: 'Priya Gupta',
      franchise: 'FR-1185',
      city: 'Delhi',
      timeAgo: '1 hour ago',
      badge: 'Top Helper',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
      text: "I had the same issue. The problem was that my purchase entries were not marked as 'Include in GSTR-1'. Check this setting under Settings → Tax Prefs.",
      likes: 4,
    }
  ]);

  const handleApplySolution = () => {
    setSolutionApplied(true);
    setTimeout(() => {
      alert("Resolution Verified! KhataCopilot Knowledge Agent has marked step as verified.");
    }, 250);
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    setReplies(prev => [
      ...prev,
      {
        id: `rep-${Date.now()}`,
        author: CURRENT_USER.name,
        franchise: CURRENT_USER.franchiseCode,
        city: CURRENT_USER.city,
        timeAgo: 'Just now',
        avatar: CURRENT_USER.avatarUrl,
        text: replyText,
        likes: 0,
      }
    ]);
    setReplyText('');
  };

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] text-slate-900 select-none">
      {/* Top Status Bar */}
      <PhoneStatusBar theme="dark" />

      {/* Top Header */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-slate-100">
        <button
          onClick={() => onNavigate('community')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-[15px] font-extrabold text-slate-900">
          Question #QC-8421
        </h2>
      </div>

      {/* Scrollable Discussion Body */}
      <div className="screen-scroll-body px-4 py-3.5 pb-20 flex-1 space-y-3.5">
        {/* Main Question Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm">
          {/* Title */}
          <h1 className="text-[15px] font-extrabold text-slate-900 leading-snug mb-2.5">
            I entered all sales but my GSTR-1 report is showing wrong total. How can I fix this?
          </h1>

          {/* Author Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img
                src={CURRENT_USER.avatarUrl}
                alt={CURRENT_USER.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
              <div>
                <span className="text-[12px] font-bold text-slate-900 block leading-tight">
                  {CURRENT_USER.name}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  {CURRENT_USER.franchiseCode} • {CURRENT_USER.city} • 2 hours ago
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                isFollowing
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-600 border border-blue-200'
              }`}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap mb-3">
            {['GST & Tax', 'GSTR-1', 'Report Issue'].map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Interaction Row */}
          <div className="flex items-center gap-4 pt-2.5 border-t border-slate-50 text-slate-500 text-[11px] font-semibold">
            <div className="flex items-center gap-1">
              <MessageSquare size={14} />
              <span>12</span>
            </div>
            <button
              onClick={() => {
                setLikes(prev => hasLiked ? prev - 1 : prev + 1);
                setHasLiked(!hasLiked);
              }}
              className={`flex items-center gap-1 transition-colors ${
                hasLiked ? 'text-blue-600 font-bold' : ''
              }`}
            >
              <ThumbsUp size={14} />
              <span>{likes}</span>
            </button>
            <div className="flex items-center gap-1">
              <Share2 size={14} />
              <span>Share</span>
            </div>
          </div>
        </div>

        {/* KhataCopilot AI Suggested Solution Card */}
        <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white rounded-3xl p-4 border border-blue-200/80 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-blue-700 font-extrabold text-[12px]">
              <Sparkles size={16} className="text-blue-600 animate-pulse" />
              <span>KhataCopilot AI</span>
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100/70 border border-blue-200 px-2 py-0.5 rounded-full">
              AI suggested answer • 92% confidence
            </span>
          </div>

          <p className="text-[12px] font-extrabold text-slate-900 mb-2">
            Try this solution first:
          </p>

          <ol className="space-y-1.5 text-[11px] text-slate-700 font-medium pl-4 list-decimal leading-relaxed mb-3">
            <li>Go to Reports → GST Reports</li>
            <li>Click on "Re-sync Data"</li>
            <li>Select correct financial year</li>
            <li>Generate GSTR-1 again</li>
          </ol>

          <button
            onClick={handleApplySolution}
            className={`w-full py-2.5 rounded-xl font-bold text-[12px] flex items-center justify-center gap-1.5 transition-all ${
              solutionApplied
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-500/20'
            }`}
          >
            {solutionApplied ? (
              <>
                <Check size={14} strokeWidth={3} />
                <span>Solution Verified & Applied</span>
              </>
            ) : (
              <span>Try This Solution</span>
            )}
          </button>
        </div>

        {/* Community Answers List */}
        <div className="space-y-2.5">
          <h3 className="text-[12px] font-extrabold text-slate-700 uppercase tracking-wider pl-1">
            Community Replies ({replies.length})
          </h3>

          {replies.map((reply) => (
            <div
              key={reply.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <img
                    src={reply.avatar}
                    alt={reply.author}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[12px] font-bold text-slate-900">
                        {reply.author}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {reply.franchise} • {reply.city}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {reply.timeAgo}
                    </span>
                  </div>
                </div>

                {reply.badge && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Star size={10} className="fill-amber-500 text-amber-500" />
                    {reply.badge}
                  </span>
                )}
              </div>

              <p className="text-[12px] text-slate-700 leading-relaxed font-normal">
                {reply.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Reply Composer */}
      <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 z-20">
        <input
          type="text"
          placeholder="Write your answer or suggestion..."
          value={replyText}
          onChange={(e) => setReplyText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
          className="flex-1 h-10 px-3.5 rounded-full bg-slate-100 border border-transparent text-[12px] focus:bg-white focus:border-blue-500 focus:outline-none transition-all"
        />
        <button
          onClick={handleSendReply}
          className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center flex-shrink-0 active:scale-95 transition-all shadow-sm"
        >
          <Send size={15} />
        </button>
      </div>

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
