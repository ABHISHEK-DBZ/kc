import React, { useState, useEffect } from 'react';
import { PhoneStatusBar } from '../components/PhoneStatusBar';
import { ScreenId } from '../types';
import { SIMILAR_QUESTIONS } from '../data/mockData';
import { 
  X, 
  Sparkles, 
  FileText, 
  RefreshCw, 
  AlertCircle, 
  ChevronRight, 
  Check, 
  ArrowRight 
} from 'lucide-react';

interface AnalyzingQuestionScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const AnalyzingQuestionScreen: React.FC<AnalyzingQuestionScreenProps> = ({
  onNavigate,
}) => {
  const [progress, setProgress] = useState(30);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 15;
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case 'doc': return <FileText size={16} className="text-blue-600" />;
      case 'sync': return <RefreshCw size={16} className="text-emerald-600" />;
      case 'alert': return <AlertCircle size={16} className="text-amber-600" />;
      default: return <FileText size={16} className="text-blue-600" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] text-slate-900 select-none">
      {/* Top Status Bar */}
      <PhoneStatusBar theme="dark" />

      {/* Header with Close */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-white">
        <button
          onClick={() => onNavigate('ask')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>
        <span className="text-[12px] font-bold text-slate-400">Step 2 of 3</span>
      </div>

      {/* Main Analysis Content */}
      <div className="screen-scroll-body px-4 py-3 flex-1">
        {/* Sparkles & Progress header */}
        <div className="flex flex-col items-center text-center mt-1 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-2 shadow-sm">
            <Sparkles size={22} className="animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <h2 className="text-[16px] font-extrabold text-slate-900 leading-tight">
            Analyzing your question…
          </h2>

          {/* Animated Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 rounded-full shimmer-bar"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Section 1: Detected Category */}
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500">Detected Category</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check size={11} strokeWidth={3} /> 94% confidence
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <FileText size={18} />
            </div>
            <div>
              <h4 className="text-[13px] font-bold text-slate-900 leading-tight">
                GST & Tax
              </h4>
              <p className="text-[11px] text-slate-500 font-medium">
                Subcategory: GSTR-1 Reports
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Priority */}
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Priority</span>
          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
            Medium
          </span>
        </div>

        {/* Section 3: Related Tags */}
        <div className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm mb-3">
          <span className="block text-[11px] font-semibold text-slate-500 mb-2">
            Related Tags
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['GST', 'GSTR-1', 'Tax Filing', 'Report Issue'].map((tag) => (
              <span
                key={tag}
                className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Section 4: Similar Questions Found */}
        <div className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm mb-2">
          <span className="block text-[12px] font-extrabold text-slate-900 mb-2">
            Similar Questions Found
          </span>

          <div className="divide-y divide-slate-100">
            {SIMILAR_QUESTIONS.map((item) => (
              <div
                key={item.id}
                onClick={() => onNavigate('question_detail')}
                className="py-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 px-1 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                    {getQuestionIcon(item.iconType)}
                  </div>
                  <div>
                    <h5 className="text-[12px] font-bold text-slate-800 line-clamp-1 leading-snug">
                      {item.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {item.answersCount} answers • <span className="text-emerald-600 font-bold">{item.status}</span>
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0 space-y-2">
        <button
          onClick={() => onNavigate('question_sent')}
          className="w-full h-12 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all text-[13px]"
        >
          <span>Continue & Post Anyway</span>
          <ArrowRight size={16} />
        </button>

        <button
          onClick={() => onNavigate('question_detail')}
          className="w-full py-1 text-center text-[12px] font-bold text-blue-600 hover:text-blue-700"
        >
          View Similar Questions
        </button>

        <div className="home-indicator-bar mt-1" />
      </div>
    </div>
  );
};
