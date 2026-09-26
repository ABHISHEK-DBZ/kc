import React from 'react';
import { PhoneStatusBar } from '../components/PhoneStatusBar';
import { PhoneBottomNav } from '../components/PhoneBottomNav';
import { ScreenId, BottomTab } from '../types';
import { CURRENT_USER } from '../data/mockData';
import { 
  Settings, 
  User, 
  Store, 
  HelpCircle, 
  MessageSquare, 
  Bookmark, 
  Bell, 
  MapPin, 
  CheckCircle, 
  Megaphone, 
  Lightbulb, 
  ChevronRight,
  Award
} from 'lucide-react';

interface ProfileScreenProps {
  onNavigate: (screen: ScreenId) => void;
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onNavigate,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="h-full flex flex-col bg-[#f8fafc] text-slate-900 select-none">
      {/* Top Status Bar */}
      <PhoneStatusBar theme="dark" />

      {/* Screen Scrollable Body */}
      <div className="screen-scroll-body px-4 pt-1 pb-4">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm mb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                src={CURRENT_USER.avatarUrl}
                alt={CURRENT_USER.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-blue-100"
              />
              <div>
                <h2 className="text-[16px] font-extrabold text-slate-900 leading-tight">
                  {CURRENT_USER.name}
                </h2>
                <p className="text-[12px] font-semibold text-slate-400 mt-0.5">
                  {CURRENT_USER.franchiseCode} • {CURRENT_USER.city}
                </p>
                <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full inline-flex">
                  <Award size={11} /> Verified Franchisee
                </div>
              </div>
            </div>

            <button 
              onClick={() => alert("Settings opened")}
              className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-blue-600 transition-colors"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>

        {/* Section 1: Main Account Items */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs mb-3.5 divide-y divide-slate-50 overflow-hidden">
          {/* My Profile */}
          <button 
            onClick={() => onNavigate('leaders')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <User size={16} />
              </div>
              <span className="text-[13px] font-bold text-slate-800">My Profile</span>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </button>

          {/* My Business */}
          <button 
            onClick={() => onNavigate('home')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Store size={16} />
              </div>
              <span className="text-[13px] font-bold text-slate-800">My Business</span>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </button>

          {/* My Questions */}
          <button 
            onClick={() => onNavigate('question_detail')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <HelpCircle size={16} />
              </div>
              <span className="text-[13px] font-bold text-slate-800">My Questions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold flex items-center justify-center">
                12
              </span>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          </button>

          {/* My Answers */}
          <button 
            onClick={() => onNavigate('leaders')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <MessageSquare size={16} />
              </div>
              <span className="text-[13px] font-bold text-slate-800">My Answers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-extrabold flex items-center justify-center">
                5
              </span>
              <ChevronRight size={16} className="text-slate-400" />
            </div>
          </button>

          {/* Saved Posts */}
          <button 
            onClick={() => onNavigate('community')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Bookmark size={16} />
              </div>
              <span className="text-[13px] font-bold text-slate-800">Saved Posts</span>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </button>

          {/* Notifications */}
          <button 
            onClick={() => onNavigate('knowledge')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Bell size={16} />
              </div>
              <span className="text-[13px] font-bold text-slate-800">Notifications</span>
            </div>
            <ChevronRight size={16} className="text-slate-400" />
          </button>
        </div>

        {/* Section 2: Community Navigation Group */}
        <div className="mb-2">
          <span className="block text-[12px] font-extrabold text-slate-500 uppercase tracking-wider mb-2 pl-1">
            Community
          </span>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-50 overflow-hidden">
            {/* All Discussions */}
            <button 
              onClick={() => onNavigate('community')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <MessageSquare size={16} />
                </div>
                <span className="text-[13px] font-bold text-slate-800">All Discussions</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            {/* My Region */}
            <button 
              onClick={() => onNavigate('leaders')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <MapPin size={16} />
                </div>
                <span className="text-[13px] font-bold text-slate-800">My Region (Mumbai)</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            {/* Unanswered */}
            <button 
              onClick={() => onNavigate('community')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                  <HelpCircle size={16} />
                </div>
                <span className="text-[13px] font-bold text-slate-800">Unanswered</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            {/* Solved */}
            <button 
              onClick={() => onNavigate('knowledge')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle size={16} />
                </div>
                <span className="text-[13px] font-bold text-slate-800">Solved</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            {/* Announcements */}
            <button 
              onClick={() => onNavigate('community')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Megaphone size={16} />
                </div>
                <span className="text-[13px] font-bold text-slate-800">Announcements</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            {/* Feature Requests */}
            <button 
              onClick={() => onNavigate('ask')}
              className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Lightbulb size={16} />
                </div>
                <span className="text-[13px] font-bold text-slate-800">Feature Requests</span>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>
          </div>
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
