import React, { useState } from 'react';
import { PhoneStatusBar } from '../components/PhoneStatusBar';
import { PhoneBottomNav } from '../components/PhoneBottomNav';
import { ScreenId, BottomTab } from '../types';
import { KNOWLEDGE_ARTICLES } from '../data/mockData';
import { 
  ArrowLeft, 
  Search, 
  ChevronRight, 
  FileText, 
  Mic, 
  Package, 
  RefreshCw, 
  CreditCard,
  BookOpen
} from 'lucide-react';

interface KnowledgeBaseScreenProps {
  onNavigate: (screen: ScreenId) => void;
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
}

export const KnowledgeBaseScreen: React.FC<KnowledgeBaseScreenProps> = ({
  onNavigate,
  activeTab,
  onTabChange,
}) => {
  const [filter, setFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const getArticleIcon = (name: string) => {
    switch (name) {
      case 'FileText': return <FileText size={16} />;
      case 'Mic': return <Mic size={16} />;
      case 'Package': return <Package size={16} />;
      case 'RefreshCw': return <RefreshCw size={16} />;
      case 'CreditCard': return <CreditCard size={16} />;
      default: return <BookOpen size={16} />;
    }
  };

  const filteredArticles = KNOWLEDGE_ARTICLES.filter(art => {
    if (filter !== 'All' && art.category !== filter) return false;
    if (searchQuery && !art.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] text-slate-900 select-none">
      {/* Top Status Bar */}
      <PhoneStatusBar theme="dark" />

      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-2 bg-white border-b border-slate-100">
        <button
          onClick={() => onNavigate('community')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-[16px] font-extrabold text-slate-900">
          Knowledge Base
        </h2>
      </div>

      {/* Screen Body */}
      <div className="screen-scroll-body px-4 py-3 pb-20 flex-1">
        {/* Search Bar */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search guides, tutorials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl bg-white border border-slate-200 text-[12px] font-medium placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-4">
          {(['All', 'Getting Started', 'Voice Entry', 'Inventory', 'GST & Tax'] as const).map((tab) => {
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Popular Articles Heading */}
        <div className="mb-2">
          <h3 className="text-[13px] font-extrabold text-slate-900 mb-2 pl-1">
            Popular Articles
          </h3>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
            {filteredArticles.map((article) => (
              <div
                key={article.id}
                onClick={() => onNavigate('question_detail')}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: article.iconBg, color: article.iconColor }}
                  >
                    {getArticleIcon(article.iconName)}
                  </div>

                  <div>
                    <h4 className="text-[12px] font-bold text-slate-900 leading-snug">
                      {article.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {article.subtitle}
                    </span>
                  </div>
                </div>

                <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Verified Knowledge Agent Card */}
        <div className="mt-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 text-emerald-950">
          <span className="text-[11px] font-extrabold uppercase tracking-wide text-emerald-700 block mb-1">
            Auto-Updated by Knowledge Agent
          </span>
          <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
            Articles are continuously synthesized from verified resolutions posted by franchise experts and HQ support.
          </p>
        </div>
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
