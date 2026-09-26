import React from 'react';
import { PhoneStatusBar } from '../components/PhoneStatusBar';
import { ScreenId } from '../types';
import { Store, TrendingUp, MessageCircle, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onNavigate }) => {
  return (
    <div className="h-full flex flex-col justify-between bg-gradient-to-b from-[#090d16] via-[#0f172a] to-[#070b14] text-white relative overflow-hidden select-none">
      {/* Glow backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-48 h-48 bg-indigo-600/15 rounded-full blur-2xl pointer-events-none" />

      {/* Top Status Bar */}
      <PhoneStatusBar theme="light" />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center z-10 -mt-2">
        {/* Brand Icon Badge */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg shadow-blue-500/30 flex items-center justify-center mb-3">
          <div className="w-full h-full bg-[#0f172a] rounded-[14px] flex items-center justify-center">
            <Store size={28} className="text-blue-400" />
          </div>
        </div>

        {/* Brand Titles */}
        <h1 className="text-2xl font-extrabold tracking-tight text-white mb-0.5">
          KhataCopilot
        </h1>
        <p className="text-sm font-semibold tracking-wide text-blue-400 uppercase mb-1">
          FranchiseOS
        </p>
        <p className="text-[12px] text-slate-400 font-medium">
          Manage • Support • Grow Together
        </p>

        {/* 3D Isometric Illustration Graphic */}
        <div className="w-full max-w-[260px] aspect-square my-4 relative flex items-center justify-center float-animation">
          <svg viewBox="0 0 320 280" className="w-full h-full drop-shadow-2xl">
            <defs>
              <linearGradient id="wallGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e3a8a" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
              <linearGradient id="glowG" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </linearGradient>
            </defs>

            {/* Base platform */}
            <polygon points="160,260 290,195 160,130 30,195" fill="#1e293b" opacity="0.6" />
            <polygon points="160,270 290,205 290,195 160,260" fill="#0f172a" />
            <polygon points="160,270 30,205 30,195 160,260" fill="#0b0f19" />

            {/* Isometric Store Building */}
            {/* Left Wall */}
            <polygon points="90,140 160,180 160,100 90,60" fill="url(#wallGrad)" />
            {/* Right Wall */}
            <polygon points="160,180 230,140 230,60 160,100" fill="#1e293b" />
            {/* Store Awning / Roof */}
            <polygon points="80,60 160,20 240,60 160,100" fill="url(#roofGrad)" />
            <polygon points="80,60 160,100 160,110 80,70" fill="#2563eb" />
            <polygon points="240,60 160,100 160,110 240,70" fill="#1e40af" />

            {/* Storefront Interior Glow / Window */}
            <polygon points="110,145 150,168 150,120 110,95" fill="url(#glowG)" />
            <polygon points="170,168 210,145 210,95 170,120" fill="#3b82f6" opacity="0.2" />

            {/* Door & Counter */}
            <polygon points="120,150 145,165 145,125 120,110" fill="#60a5fa" opacity="0.4" />

            {/* Floating Rupee Symbol Card */}
            <g transform="translate(210, 80)">
              <rect x="0" y="0" width="34" height="34" rx="8" fill="#1e293b" stroke="#3b82f6" strokeWidth="1.5" />
              <text x="17" y="23" textAnchor="middle" fill="#60a5fa" fontSize="18" fontWeight="bold">₹</text>
            </g>

            {/* Floating Growth Chart Card */}
            <g transform="translate(45, 95)">
              <rect x="0" y="0" width="38" height="42" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
              <path d="M6 34 L14 26 L22 30 L32 10" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" />
            </g>

            {/* Floating Chat Bubble */}
            <g transform="translate(45, 160)">
              <circle cx="16" cy="16" r="16" fill="#2563eb" />
              <path d="M11 13 h10 v6 h-7 l-3 3 z" fill="#ffffff" />
            </g>

            {/* Kirana Items / Shelves */}
            <rect x="180" y="165" width="22" height="14" rx="2" fill="#f59e0b" opacity="0.9" />
            <rect x="184" y="152" width="14" height="10" rx="2" fill="#10b981" opacity="0.9" />
          </svg>
        </div>

        {/* Feature Highlights Pills */}
        <div className="flex items-center justify-center gap-2 mb-2 text-[11px] text-slate-300">
          <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
            <Store size={12} className="text-blue-400" /> Multi-Shop
          </span>
          <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
            <MessageCircle size={12} className="text-emerald-400" /> AI Solver
          </span>
          <span className="flex items-center gap-1 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
            <TrendingUp size={12} className="text-purple-400" /> Growth
          </span>
        </div>
      </div>

      {/* Bottom Action Buttons */}
      <div className="px-6 pb-6 pt-2 z-10 w-full flex flex-col gap-2.5">
        <button
          onClick={() => onNavigate('home')}
          className="w-full h-12 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all text-sm"
        >
          <span>Sign In</span>
          <ArrowRight size={16} />
        </button>

        <button
          onClick={() => onNavigate('home')}
          className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/20 active:scale-[0.98] text-white font-semibold rounded-2xl flex items-center justify-center transition-all text-sm"
        >
          Create Account
        </button>

        <p className="text-[11px] text-slate-500 text-center font-medium mt-1">
          KhataCopilot Community • Support • Growth
        </p>

        <div className="home-indicator-bar !bg-slate-700" />
      </div>
    </div>
  );
};
