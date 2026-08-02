import React, { useState } from 'react';
import { EGYPT_GOVERNORATES } from '../data/mockData';
import { GovernorateRate } from '../types';
import { Calculator, DollarSign, Truck, MapPin, CheckCircle } from 'lucide-react';

interface RateCalculatorViewProps {
  governorates?: GovernorateRate[];
}

export const RateCalculatorView: React.FC<RateCalculatorViewProps> = ({ governorates = EGYPT_GOVERNORATES }) => {
  const [selectedGovCode, setSelectedGovCode] = useState(governorates[0]?.code || 'CAI');
  const [weightKg, setWeightKg] = useState<number>(2.5);
  const [isExpress, setIsExpress] = useState(false);
  const [codAmount, setCodAmount] = useState<number>(1500);

  const selectedGov = governorates.find((g) => g.code === selectedGovCode) || governorates[0] || EGYPT_GOVERNORATES[0];

  const baseRate = selectedGov.baseRate;
  const extraWeightFee = Math.max(0, weightKg - 3) * selectedGov.additionalKgRate;
  const expressFee = isExpress ? 25 : 0;
  const totalShippingFee = Math.round(baseRate + extraWeightFee + expressFee);

  const netMerchantPayout = Math.max(0, codAmount - totalShippingFee);

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 rounded-2xl shadow-md flex items-center justify-between">
        <div>
          <h3 className="font-black text-xl flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            حاسبة أسعار A&Mshipping الرسمية (A&Mshipping Calculator)
          </h3>
          <p className="text-xs text-red-100 mt-1">احسب تكلفة الشحن وصافي تحصيل الكاش لجميع محافظات جمهورية مصر العربية</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة المستهدفة:</label>
            <select
              value={selectedGovCode}
              onChange={(e) => setSelectedGovCode(e.target.value)}
              className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500/20"
            >
              {governorates.map((g) => (
                <option key={g.code} value={g.code}>
                  {g.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">وزن الطرد (كجم):</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={weightKg}
              onChange={(e) => setWeightKg(parseFloat(e.target.value) || 1)}
              className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ التحصيل (COD):</label>
            <input
              type="number"
              value={codAmount}
              onChange={(e) => setCodAmount(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-start pt-6">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-900">
              <input
                type="checkbox"
                checked={isExpress}
                onChange={(e) => setIsExpress(e.target.checked)}
                className="w-4 h-4 text-red-600 rounded border-slate-300"
              />
              تفعيل الشحن السريع (Express Delivery) +25 ج.م
            </label>
          </div>
        </div>

        {/* Breakdown Card */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            تفاصيل التكلفة والتسوية:
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block">السعر الأساسي (حتى 3 كجم):</span>
              <span className="text-base font-extrabold text-white">{baseRate} ج.م</span>
            </div>

            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block">تكلفة الوزن الزائد:</span>
              <span className="text-base font-extrabold text-amber-400">{extraWeightFee} ج.م</span>
            </div>

            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
              <span className="text-[10px] text-slate-400 block">إجمالي الشحن:</span>
              <span className="text-base font-extrabold text-red-400">{totalShippingFee} ج.م</span>
            </div>

            <div className="bg-emerald-950/80 border border-emerald-500/40 p-3 rounded-xl">
              <span className="text-[10px] text-emerald-300 block">الصافي المحول للتاجر:</span>
              <span className="text-lg font-black text-emerald-400">{netMerchantPayout} ج.م</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
