import React, { useState } from 'react';
import { PhoneStatusBar } from '../components/PhoneStatusBar';
import { PhoneBottomNav } from '../components/PhoneBottomNav';
import { ScreenId, BottomTab } from '../types';
import { LEADERBOARD_USERS } from '../data/mockData';
import { 
  ArrowLeft, 
  Crown, 
  ChevronDown 
} from 'lucide-react';

interface CommunityLeadersScreenProps {
  onNavigate: (screen: ScreenId) => void;
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
}

export const CommunityLeadersScreen: React.FC<CommunityLeadersScreenProps> = ({
  onNavigate,
  activeTab,
  onTabChange,
}) => {
  const [filter, setFilter] = useState<'All' | 'Mumbai' | 'Top Helpers' | 'HQ Support'>('All');
  const [timePeriod, setTimePeriod] = useState('This Month');

  const top1 = LEADERBOARD_USERS[0];
  const top2 = LEADERBOARD_USERS[1];
  const top3 = LEADERBOARD_USERS[2];
  const runnersUp = LEADERBOARD_USERS.slice(3);

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] text-slate-900 select-none">
      {/* Top Status Bar */}
      <PhoneStatusBar theme="dark" />

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('community')}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-[16px] font-extrabold text-slate-900">
            Community Leaders
          </h2>
        </div>

        {/* Time Selector Dropdown */}
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200/70 px-2.5 py-1 rounded-full cursor-pointer transition-colors">
          <span>{timePeriod}</span>
          <ChevronDown size={13} />
        </div>
      </div>

      {/* Screen Body */}
      <div className="screen-scroll-body px-4 py-3 pb-20 flex-1">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-4">
          {(['All', 'Mumbai', 'Top Helpers', 'HQ Support'] as const).map((tab) => {
            const isActive = filter === tab;
            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all flex-shrink-0 ${
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

        {/* Podium Top 3 Leaders (2 - 1 - 3 layout) */}
        <div className="grid grid-cols-3 gap-2 items-end mb-4 pt-4 px-1">
          {/* #2 Rank (Left - Silver) */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-1">
              <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-slate-300 shadow-md">
                <img src={top2.avatarUrl} alt={top2.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-slate-400">
                <Crown size={16} className="fill-slate-300 text-slate-400" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-200 text-slate-700 text-[10px] font-extrabold flex items-center justify-center border border-white">
                2
              </div>
            </div>

            <h4 className="text-[11px] font-bold text-slate-900 line-clamp-1 mt-1">
              {top2.name}
            </h4>
            <span className="text-[9px] text-slate-400 font-medium">
              {top2.franchiseCode}
            </span>
            <span className="text-[10px] font-extrabold text-blue-600 mt-0.5">
              {top2.answersCount} answers
            </span>
          </div>

          {/* #1 Rank (Center - Gold) */}
          <div className="flex flex-col items-center text-center -mt-3">
            <div className="relative mb-1">
              <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-amber-400 shadow-lg ring-2 ring-amber-200">
                <img src={top1.avatarUrl} alt={top1.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-amber-500 animate-bounce">
                <Crown size={22} className="fill-amber-400 text-amber-500" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-amber-400 text-amber-950 text-[11px] font-black flex items-center justify-center border-2 border-white shadow-sm">
                1
              </div>
            </div>

            <h4 className="text-[12px] font-extrabold text-slate-900 line-clamp-1 mt-1">
              {top1.name}
            </h4>
            <span className="text-[9px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded font-bold">
              {top1.badge}
            </span>
            <span className="text-[11px] font-black text-amber-600 mt-0.5">
              {top1.answersCount} answers
            </span>
          </div>

          {/* #3 Rank (Right - Bronze) */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-1">
              <div className="w-13 h-13 rounded-full overflow-hidden border-2 border-amber-600/60 shadow-md">
                <img src={top3.avatarUrl} alt={top3.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-amber-700">
                <Crown size={16} className="fill-amber-600 text-amber-700" />
              </div>
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-700 text-white text-[10px] font-extrabold flex items-center justify-center border border-white">
                3
              </div>
            </div>

            <h4 className="text-[11px] font-bold text-slate-900 line-clamp-1 mt-1">
              {top3.name}
            </h4>
            <span className="text-[9px] text-slate-400 font-medium">
              {top3.franchiseCode}
            </span>
            <span className="text-[10px] font-extrabold text-blue-600 mt-0.5">
              {top3.answersCount} answers
            </span>
          </div>
        </div>

        {/* Ranked Runners-up List (#4 to #8) */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
          {runnersUp.map((user) => (
            <div
              key={user.rank}
              className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="w-5 text-center font-extrabold text-[12px] text-slate-400">
                  {user.rank}
                </span>

                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                />

                <div>
                  <h5 className="text-[12px] font-bold text-slate-900 leading-tight">
                    {user.name}
                  </h5>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {user.franchiseCode} • {user.city}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[12px] font-bold text-slate-800 block">
                  {user.answersCount}
                </span>
                <span className="text-[9px] text-slate-400 font-medium">
                  answers
                </span>
              </div>
            </div>
          ))}
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
