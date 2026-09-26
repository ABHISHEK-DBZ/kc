import React from 'react';

interface PhoneFrameProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  scale?: number;
  isActive?: boolean;
}

export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  title,
  subtitle,
  onClick,
  scale = 1,
  isActive = false,
}) => {
  return (
    <div className="flex flex-col items-center">
      {/* Optional Screen Label */}
      {title && (
        <div className="mb-3 text-center">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400 bg-blue-950/60 border border-blue-800/60 px-3 py-1 rounded-full shadow-sm">
            {title}
          </span>
          {subtitle && (
            <p className="text-[11px] text-slate-400 mt-1 font-medium">{subtitle}</p>
          )}
        </div>
      )}

      {/* Realistic Titanium / Graphite Phone Bezel */}
      <div 
        onClick={onClick}
        style={{ transform: scale !== 1 ? `scale(${scale})` : undefined, transformOrigin: 'top center' }}
        className={`mobile-device-shell ${onClick ? 'cursor-pointer hover:border-blue-500' : ''} ${
          isActive ? 'ring-4 ring-blue-500 shadow-blue-500/20' : ''
        }`}
      >
        {/* Dynamic Island Notch */}
        <div className="device-island">
          <div className="device-sensor" />
          <div className="device-camera-lens" />
        </div>

        {/* Screen Content Wrapper */}
        <div className="w-full h-full relative overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};
