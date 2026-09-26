import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface PhoneStatusBarProps {
  theme?: 'dark' | 'light';
  time?: string;
}

export const PhoneStatusBar: React.FC<PhoneStatusBarProps> = ({ 
  theme = 'dark',
  time = '9:41' 
}) => {
  const isLight = theme === 'light';
  const textColor = isLight ? 'text-white' : 'text-slate-900';

  return (
    <div className={`status-bar-container ${textColor}`}>
      <span className="font-bold tracking-tight text-[13px]">{time}</span>
      <div className="flex items-center gap-1.5">
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 18.25A10.93 10.93 0 0 1 2 12C2 6.48 6.48 2 12 2s10 4.48 10 10c0 2.32-.72 4.47-1.94 6.25l-.62-.64C20.47 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9zm0 4c-2.76 0-5 2.24-5 5 0 1.28.48 2.45 1.27 3.34l.71-.71C8.35 14.05 8 13.08 8 12c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.08-.35 2.05-.98 2.63l.71.71C16.52 14.45 17 13.28 17 12c0-2.76-2.24-5-5-5zm0 4c-.55 0-1 .45-1 1 0 .28.11.53.29.71l.71.71.71-.71c.18-.18.29-.43.29-.71 0-.55-.45-1-1-1z" />
        </svg>
        <Wifi size={13} strokeWidth={2.5} />
        <div className="flex items-center">
          <Battery size={16} strokeWidth={2.5} className="rotate-90" />
        </div>
      </div>
    </div>
  );
};
