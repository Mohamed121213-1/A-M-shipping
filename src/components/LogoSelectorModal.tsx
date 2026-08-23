import React from 'react';
import { Sparkles, Check, X, Palette, Image as ImageIcon } from 'lucide-react';

export interface LogoOption {
  id: string;
  title: string;
  description: string;
  styleTag: string;
  src: string;
}

export const LOGO_OPTIONS: LogoOption[] = [
  {
    id: 'opt_official',
    title: 'شعار DropLine الرسمي (مسار الطريق وطريق الثقة)',
    description: 'التصميم المعتمد: حرف D الأحمر والأبيض مع مسار الطريق السريع وعبارة Delivering Trust على خلفية كحلية داكنة فاخرة.',
    styleTag: 'الشعار الرسمي المعتمد Official',
    src: '/dropline-official.jpg',
  },
  {
    id: 'opt_badge',
    title: 'أيقونة حرف D اللوجستية (App Icon)',
    description: 'شارة مركزة لحرف D المدمج بمسار الطريق السريع مخصصة لأيقونة التطبيقات والبوالص.',
    styleTag: 'أيقونة مركزة Icon Badge',
    src: '/dropline-badge.jpg',
  },
  {
    id: 'opt2',
    title: 'الخيار 2: طرد المكعب الذكي 3D Cube',
    description: 'مكعب شحن ثلاثي الأبعاد بتأثير الإضاءة العصرية ومسار سرعة ضوئي للدلالة على الشحنات الذكية.',
    styleTag: 'تقني ثلاثي الأبعاد 3D Tech',
    src: '/dropline-opt2.jpg',
  },
  {
    id: 'opt3',
    title: 'الخيار 3: مونوغرام الشحن السريع والأجنحة',
    description: 'شعار انسيابي ديناميكي يرمز للسرعة الفائقة والشحن في نفس اليوم مع تدرج أنيق ومميز.',
    styleTag: 'أجنحة وديناميكية Express',
    src: '/dropline-opt3.jpg',
  },
];

interface LogoSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLogo: string;
  onSelectLogo: (logoSrc: string) => void;
}

export const LogoSelectorModal: React.FC<LogoSelectorModalProps> = ({
  isOpen,
  onClose,
  currentLogo,
  onSelectLogo,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">معرض واختيار شعار DropLine</h3>
              <p className="text-xs text-slate-400">اختر التصميم الذي يناسبك وسيتم تطبيقه فوراً في كامل النظام</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LOGO_OPTIONS.map((opt) => {
              const isSelected = currentLogo === opt.src || (currentLogo === '/dropline-logo.jpg' && opt.id === 'opt1');
              return (
                <div
                  key={opt.id}
                  onClick={() => onSelectLogo(opt.src)}
                  className={`group relative rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-red-600 bg-red-50/40 shadow-md ring-2 ring-red-500/20'
                      : 'border-slate-200 hover:border-red-300 hover:bg-slate-50/80 bg-white shadow-xs'
                  }`}
                >
                  {/* Top Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {opt.styleTag}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-md">
                        <Check className="w-3.5 h-3.5" />
                        الشعار النشط
                      </span>
                    )}
                  </div>

                  {/* Logo Preview Showcase */}
                  <div className="flex items-center gap-4 my-2">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 p-1 shadow-sm shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                      <img
                        src={opt.src}
                        alt={opt.title}
                        className="w-full h-full object-cover rounded-xl"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm leading-snug">{opt.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed">{opt.description}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                      <ImageIcon className="w-3.5 h-3.5" />
                      معاينة في شريط المهام
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectLogo(opt.src);
                      }}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-slate-900 hover:bg-red-600 text-white'
                      }`}
                    >
                      {isSelected ? 'مُفعّل حالياً' : 'اعتماد هذا اللوجو'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-red-600" />
            يمكنك تغيير الشعار في أي وقت وحفظ الاختيار تلقائياً
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
