import React, { useState } from 'react';

interface DropLineLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
}

export const DropLineLogo: React.FC<DropLineLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-xl bg-slate-900 border border-slate-700/60 overflow-hidden shadow-xs flex items-center justify-center relative p-1 shrink-0 group`}
      >
        {!imageError ? (
          <img
            src="/dropline-logo.jpg"
            alt="DropLine Logo"
            className="w-full h-full object-cover rounded-lg"
            onError={() => setImageError(true)}
            referrerPolicy="no-referrer"
          />
        ) : (
          /* High-res stylish fallback vector if image file is not accessible */
          <div className="w-full h-full rounded-lg bg-gradient-to-br from-slate-900 via-slate-950 to-red-950 flex items-center justify-center relative overflow-hidden">
            {/* Speed accent lines */}
            <div className="absolute -right-1 top-1 w-6 h-0.5 bg-red-500/80 rounded-full"></div>
            <div className="absolute -right-2 top-2.5 w-4 h-0.5 bg-red-400/60 rounded-full"></div>
            
            {/* Geometric D + Pin icon */}
            <svg
              className="w-4/5 h-4/5 text-white drop-shadow-sm"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                className="stroke-red-500 fill-red-500/20"
              />
              <path d="M10 6h2.5a3 3 0 0 1 0 6H10V6z" className="stroke-white fill-white" strokeWidth="1.5" />
            </svg>
          </div>
        )}
      </div>

      {showText && (
        <div className="text-right">
          <div className="flex items-center gap-1">
            <span className="font-black text-xl tracking-tight text-slate-900">
              Drop<span className="text-red-600">Line</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-none mt-0.5">
            منصة الشحن واللوجستيات المتكاملة
          </p>
        </div>
      )}
    </div>
  );
};
