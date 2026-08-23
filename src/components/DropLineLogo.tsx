import React from 'react';
import droplineLogoImg from '../assets/images/dropline_official_logo_1787442134000.jpg';

interface DropLineLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'emblem' | 'full';
  showSubtext?: boolean;
}

export const DropLineLogo: React.FC<DropLineLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'emblem',
  showSubtext = true,
}) => {
  const sizeMap = {
    xs: { box: 'w-7 h-7', text: 'text-base', sub: 'text-[9px]' },
    sm: { box: 'w-9 h-9', text: 'text-lg', sub: 'text-[10px]' },
    md: { box: 'w-11 h-11', text: 'text-xl', sub: 'text-[11px]' },
    lg: { box: 'w-14 h-14', text: 'text-2xl', sub: 'text-xs' },
    xl: { box: 'w-20 h-20', text: 'text-3xl', sub: 'text-sm' },
  };

  const currentSize = sizeMap[size];

  if (variant === 'full') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className={`${currentSize.box} rounded-xl bg-[#091524] border border-slate-700/60 overflow-hidden shadow-sm shrink-0 flex items-center justify-center p-0.5`}>
          <img
            src={droplineLogoImg}
            alt="DropLine Logo"
            className="w-full h-full object-cover rounded-lg"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="text-right">
          <div className="flex items-center gap-1 leading-tight">
            <span className="font-black text-slate-900 tracking-tight text-xl">
              Drop<span className="text-red-600">Line</span>
            </span>
          </div>
          {showSubtext && (
            <p className="text-[11px] text-slate-500 font-semibold leading-none mt-0.5">
              منصة الشحن واللوجستيات المتكاملة
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div
        className={`${currentSize.box} rounded-xl bg-[#091524] border border-slate-700/60 overflow-hidden shadow-xs shrink-0 flex items-center justify-center p-0.5 group`}
      >
        <img
          src={droplineLogoImg}
          alt="DropLine Logo"
          className="w-full h-full object-cover rounded-lg"
          referrerPolicy="no-referrer"
        />
      </div>
      {showSubtext && (
        <div className="text-right">
          <div className="flex items-center gap-1 leading-tight">
            <span className={`font-black text-slate-900 tracking-tight ${currentSize.text}`}>
              Drop<span className="text-red-600">Line</span>
            </span>
          </div>
          <p className={`${currentSize.sub} text-slate-500 font-semibold leading-none mt-0.5`}>
            منصة الشحن واللوجستيات المتكاملة
          </p>
        </div>
      )}
    </div>
  );
};
