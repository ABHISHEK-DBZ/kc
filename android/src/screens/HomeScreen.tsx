import React from 'react';
import { PhoneStatusBar } from '../components/PhoneStatusBar';
import { PhoneBottomNav } from '../components/PhoneBottomNav';
import { ScreenId, BottomTab } from '../types';
import { CURRENT_USER, BUSINESS_HEALTH } from '../data/mockData';
import { 
  Store, 
  Bell, 
  ArrowUpRight, 
  Users, 
  Wallet, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare, 
  X,
  ChevronRight
} from 'lucide-react';

interface HomeScreenProps {
  onNavigate: (screen: ScreenId) => void;
  activeTab: BottomTab;
  onTabChange: (tab: BottomTab) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  activeTab,
  onTabChange,
}) => {
  const [showBanner, setShowBanner] = React.useState(true);

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] text-slate-900 select-none">
      {/* Top Status Bar */}
      <PhoneStatusBar theme="dark" />

      {/* Screen Scrollable Body */}
      <div className="screen-scroll-body px-4 pt-1 pb-4">
        {/* Top App Header */}
        <div className="flex items-center justify-between py-2">
          {/* Franchise Identity Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
              <Store size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-[15px] text-slate-900 leading-tight">
                  KhataCopilot
                </span>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                {CURRENT_USER.franchiseCode} • {CURRENT_USER.city}
              </span>
            </div>
          </div>

          {/* Right Header Icons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => onNavigate('knowledge')}
              className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-600 hover:text-blue-600 relative transition-colors shadow-sm"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <button 
              onClick={() => onNavigate('profile')}
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-200/60 active:scale-95 transition-transform"
            >
              <img 
                src={CURRENT_USER.avatarUrl} 
                alt={CURRENT_USER.name} 
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        {/* Personalized Greeting */}
        <div className="mt-3 mb-4">
          <h2 className="text-[18px] font-extrabold text-slate-900 leading-snug">
            Good morning, <br />
            {CURRENT_USER.name} 👋
          </h2>
          <p className="text-[12px] text-slate-500 mt-0.5">
            Your business is running smoothly.<br />
            Here's today's overview.
          </p>
        </div>

        {/* Business Health Card */}
        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] mb-3.5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-bold text-slate-800">Business Health</span>
            <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
              Optimal
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Radial Gauge Simulation */}
            <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray="86, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-extrabold text-slate-900 leading-none">86</span>
                <span className="text-[10px] font-bold text-emerald-600">Good</span>
              </div>
            </div>

            {/* Health Highlights */}
            <div className="flex-1 space-y-2.5">
              <div>
                <div className="flex items-center gap-1 text-emerald-600 text-[12px] font-bold">
                  <ArrowUpRight size={14} strokeWidth={2.5} />
                  <span>124</span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Transactions today</p>
              </div>

              <div>
                <div className="text-[16px] font-extrabold text-slate-900">
                  ₹{BUSINESS_HEALTH.totalSalesToday.toLocaleString()}
                </div>
                <p className="text-[11px] text-slate-500 font-medium">Total sales</p>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Metric Stats Grid */}
        <div className="grid grid-cols-4 gap-2 mb-3.5">
          {/* Customers */}
          <div className="bg-white rounded-2xl p-2.5 border border-slate-100 flex flex-col items-center text-center shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
              <Users size={16} />
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Customers</span>
            <span className="text-[13px] font-bold text-slate-900 mt-0.5">
              {BUSINESS_HEALTH.customersCount}
            </span>
          </div>

          {/* Credit Given */}
          <div className="bg-white rounded-2xl p-2.5 border border-slate-100 flex flex-col items-center text-center shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
              <Wallet size={16} />
            </div>
            <span className="text-[10px] text-slate-500 font-medium leading-tight">Credit Given</span>
            <span className="text-[11px] font-bold text-slate-900 mt-0.5">
              ₹82,400
            </span>
          </div>

          {/* Inventory */}
          <div className="bg-white rounded-2xl p-2.5 border border-slate-100 flex flex-col items-center text-center shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center mb-1">
              <AlertTriangle size={16} />
            </div>
            <span className="text-[10px] text-slate-500 font-medium">Inventory</span>
            <span className="text-[11px] font-bold text-red-600 mt-0.5">
              7 alerts
            </span>
          </div>

          {/* GST */}
          <div className="bg-white rounded-2xl p-2.5 border border-slate-100 flex flex-col items-center text-center shadow-sm">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
              <CheckCircle2 size={16} />
            </div>
            <span className="text-[10px] text-slate-500 font-medium">GST</span>
            <span className="text-[11px] font-bold text-emerald-600 mt-0.5">
              Ready
            </span>
          </div>
        </div>

        {/* "Ask the Community" Banner Card */}
        {showBanner && (
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#6366f1] via-[#4f46e5] to-[#2563eb] text-white p-3.5 shadow-md shadow-indigo-500/20 mb-3">
            <button 
              onClick={() => setShowBanner(false)}
              className="absolute top-2 right-2 text-white/70 hover:text-white p-1"
            >
              <X size={14} />
            </button>

            <div 
              onClick={() => onNavigate('ask')}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white flex-shrink-0">
                <MessageSquare size={20} />
              </div>
              <div className="flex-1 pr-3">
                <h4 className="font-bold text-[13px] text-white">Ask the Community</h4>
                <p className="text-[11px] text-indigo-100 mt-0.5 leading-snug">
                  Get help from other franchisees and our support team
                </p>
              </div>
              <ChevronRight size={18} className="text-white/80" />
            </div>
          </div>
        )}

        {/* Quick Shortcut Pills */}
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
            <span>Recent Community Activity</span>
            <button onClick={() => onNavigate('community')} className="text-blue-600 hover:underline">
              View All
            </button>
          </div>
          <div 
            onClick={() => onNavigate('question_detail')}
            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-[12px] font-semibold text-slate-800 line-clamp-1">
                GSTR-1 report showing wrong total
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">#QC-8421</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Navigation */}
      <PhoneBottomNav
        activeTab={activeTab}
        onTabChange={onTabChange}
        onNavigate={onNavigate}
      />

      <div className="home-indicator-bar" />
    </div>
  );
};
