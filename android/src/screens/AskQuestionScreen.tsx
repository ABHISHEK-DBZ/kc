import React, { useState } from 'react';
import { PhoneStatusBar } from '../components/PhoneStatusBar';
import { ScreenId } from '../types';
import { 
  ArrowLeft, 
  Sparkles, 
  Camera, 
  Video, 
  FileText, 
  Send 
} from 'lucide-react';

interface AskQuestionScreenProps {
  onNavigate: (screen: ScreenId) => void;
  questionText: string;
  setQuestionText: (text: string) => void;
}

export const AskQuestionScreen: React.FC<AskQuestionScreenProps> = ({
  onNavigate,
  questionText,
  setQuestionText,
}) => {
  const [attachments, setAttachments] = useState<{ [key: string]: boolean }>({
    screenshot: false,
    video: false,
    file: false,
  });

  const toggleAttachment = (key: string) => {
    setAttachments(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    onNavigate('analyzing');
  };

  return (
    <div className="h-full flex flex-col bg-[#f8fafc] text-slate-900 select-none">
      {/* Top Status Bar */}
      <PhoneStatusBar theme="dark" />

      {/* Top Nav Header */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-slate-100 bg-white">
        <button
          onClick={() => onNavigate('community')}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-[16px] font-extrabold text-slate-900">
          Ask a Question
        </h2>
      </div>

      {/* Form Body */}
      <div className="screen-scroll-body px-4 py-3.5 flex-1">
        {/* Section 1: Describe issue */}
        <div className="mb-4">
          <label className="block text-[14px] font-extrabold text-slate-900 mb-0.5">
            Describe your issue
          </label>
          <p className="text-[11px] text-slate-500 mb-2 leading-tight">
            Our AI will automatically categorize and send it to the right experts.
          </p>

          <div className="relative">
            <textarea
              rows={4}
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. My voice entry stops recording after 2 seconds..."
              maxLength={500}
              className="w-full p-3 rounded-2xl bg-white border border-slate-200 text-[13px] leading-relaxed text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all resize-none shadow-sm font-medium"
            />
            <div className="text-right text-[10px] text-slate-400 font-semibold pr-1 mt-1">
              {questionText.length}/500
            </div>
          </div>
        </div>

        {/* Section 2: Add details (optional) */}
        <div className="mb-4">
          <label className="block text-[13px] font-bold text-slate-900 mb-2">
            Add details (optional)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {/* Add Screenshot */}
            <button
              type="button"
              onClick={() => toggleAttachment('screenshot')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                attachments.screenshot
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center mb-1 text-slate-700">
                <Camera size={16} />
              </div>
              <span className="text-[11px] font-bold">
                {attachments.screenshot ? 'Added' : 'Add Screenshot'}
              </span>
            </button>

            {/* Add Video */}
            <button
              type="button"
              onClick={() => toggleAttachment('video')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                attachments.video
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center mb-1 text-slate-700">
                <Video size={16} />
              </div>
              <span className="text-[11px] font-bold">
                {attachments.video ? 'Added' : 'Add Video'}
              </span>
            </button>

            {/* Add File */}
            <button
              type="button"
              onClick={() => toggleAttachment('file')}
              className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all text-center ${
                attachments.file
                  ? 'bg-blue-50 border-blue-400 text-blue-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center mb-1 text-slate-700">
                <FileText size={16} />
              </div>
              <span className="text-[11px] font-bold">
                {attachments.file ? 'Added' : 'Add File'}
              </span>
            </button>
          </div>
        </div>

        {/* Section 3: AI Feature highlight box */}
        <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3.5 mb-4">
          <div className="flex items-center gap-1.5 text-blue-800 font-bold text-[12px] mb-2">
            <Sparkles size={16} className="text-blue-600 animate-pulse" />
            <span>AI will automatically detect</span>
          </div>

          <ul className="space-y-1.5 text-[11px] text-slate-600 font-medium pl-1">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Category
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Priority
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Relevant experts
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Similar solved questions
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Sticky Action Button */}
      <div className="p-4 bg-white border-t border-slate-100 flex-shrink-0">
        <button
          onClick={handleSubmit}
          className="w-full h-12 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all text-[13px]"
        >
          <Send size={15} />
          <span>Post Question</span>
        </button>
        <div className="home-indicator-bar mt-2" />
      </div>
    </div>
  );
};
