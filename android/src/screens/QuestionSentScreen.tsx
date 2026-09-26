import React from 'react';
import { PhoneStatusBar } from '../components/PhoneStatusBar';
import { ScreenId } from '../types';
import { QUESTION_STATUS_STEPS } from '../data/mockData';
import { ArrowLeft, Check } from 'lucide-react';

interface QuestionSentScreenProps {
  onNavigate: (screen: ScreenId) => void;
}

export const QuestionSentScreen: React.FC<QuestionSentScreenProps> = ({
  onNavigate,
}) => {
  return (
    <div className="h-full flex flex-col bg-[#f8fafc] text-slate-900 select-none">
      {/* Top Status Bar */}
      <PhoneStatusBar theme="dark" />

      {/* Top Back Nav */}
      <div className="flex items-center px-4 py-2 bg-white border-b border-slate-100">
        <button
          onClick={() => onNavigate('community')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="screen-scroll-body px-5 py-4 flex-1">
        {/* Success Icon & Heading */}
        <div className="flex flex-col items-center text-center mt-2 mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-3 animate-bounce" style={{ animationDuration: '2s' }}>
            <Check size={36} strokeWidth={3} />
          </div>

          <h2 className="text-[18px] font-extrabold text-slate-900 leading-tight">
            Your question has been posted!
          </h2>
          <span className="text-[12px] font-bold text-slate-400 mt-1">
            Question #QC-8421
          </span>
        </div>

        {/* Real-time Pipeline Stepper */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm mb-4">
          <div className="space-y-4 relative">
            {/* Connecting Vertical Line */}
            <div className="absolute left-[13px] top-2 bottom-2 w-0.5 bg-slate-100" />

            {QUESTION_STATUS_STEPS.map((step) => {
              const isCompleted = step.status === 'completed';
              const isInProgress = step.status === 'in_progress';

              return (
                <div key={step.id} className="flex items-start gap-3.5 relative z-10">
                  {/* Step Node Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                        <Check size={14} strokeWidth={3} />
                      </div>
                    ) : isInProgress ? (
                      <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center pulse-active">
                        <div className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <h4 className={`text-[12px] font-bold leading-tight ${
                        isCompleted ? 'text-slate-800' : isInProgress ? 'text-blue-600' : 'text-slate-400'
                      }`}>
                        {step.label}
                      </h4>
                    </div>

                    <span className={`text-[10px] font-semibold ${
                      isCompleted ? 'text-slate-400' : isInProgress ? 'text-blue-600 font-bold' : 'text-slate-400'
                    }`}>
                      {step.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Sticky Action Buttons */}
      <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0 space-y-2">
        <button
          onClick={() => onNavigate('question_detail')}
          className="w-full h-12 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all text-[13px]"
        >
          <span>View Question</span>
        </button>

        <button
          onClick={() => onNavigate('community')}
          className="w-full h-11 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-2xl flex items-center justify-center transition-all text-[13px]"
        >
          Back to Community
        </button>

        <div className="home-indicator-bar mt-1" />
      </div>
    </div>
  );
};
