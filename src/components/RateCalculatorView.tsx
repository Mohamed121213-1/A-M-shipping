import React, { useState } from 'react';
import { EGYPT_GOVERNORATES } from '../data/mockData';
import { GovernorateRate } from '../types';
import { Calculator, DollarSign, Truck, MapPin, CheckCircle, Search, X } from 'lucide-react';

interface RateCalculatorViewProps {
  governorates?: GovernorateRate[];
}

export const RateCalculatorView: React.FC<RateCalculatorViewProps> = ({ governorates = EGYPT_GOVERNORATES }) => {
  const [selectedGovCode, setSelectedGovCode] = useState(governorates[0]?.code || 'CAI');
  const [citySearch, setCitySearch] = useState('');
  const [weightKg, setWeightKg] = useState<number>(2.5);
  const [isExpress, setIsExpress] = useState(false);
  const [codAmount, setCodAmount] = useState<number>(1500);

  const selectedGov = governorates.find((g) => g.code === selectedGovCode) || governorates[0] || EGYPT_GOVERNORATES[0];

  // Find cities matching search across all governorates
  const searchLower = citySearch.trim().toLowerCase();
  const matchingCitiesResult = searchLower
    ? governorates.flatMap((g) =>
        (g.cities || [])
          .filter((c) => c.toLowerCase().includes(searchLower))
          .map((c) => ({ city: c, gov: g }))
      )
    : [];

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
          <p className="text-xs text-red-100 mt-1">احسب تكلفة الشحن وصافي تحصيل الكاش لجميع محافظات ومدن جمهورية مصر العربية</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-6">
        {/* City & Region Search Bar */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
          <label className="block text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
            <Search className="w-4 h-4 text-red-600" />
            البحث والتصفية بالمدن والمناطق (مثال: فيصل، التجمع، إمبابة، المهندسين، طنطا...):
          </label>
          <div className="relative">
            <input
              type="text"
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              placeholder="اكتب اسم المدينة أو المنطقة للبحث الفوري..."
              className="w-full text-xs font-bold p-3 pr-10 bg-white border border-slate-300 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            {citySearch && (
              <button
                type="button"
                onClick={() => setCitySearch('')}
                className="absolute left-3 top-3 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Display Search Results for Cities */}
          {searchLower && (
            <div className="mt-2 space-y-2">
              {matchingCitiesResult.length > 0 ? (
                <div>
                  <span className="text-[11px] font-bold text-slate-600 block mb-1">
                    المدن والمناطق المطابقة ({matchingCitiesResult.length} نتيجة):
                  </span>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1">
                    {matchingCitiesResult.map(({ city, gov }) => (
                      <button
                        key={`${gov.code}-${city}`}
                        type="button"
                        onClick={() => {
                          setSelectedGovCode(gov.code);
                        }}
                        className={`text-xs font-extrabold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 cursor-pointer ${
                          selectedGov.code === gov.code
                            ? 'bg-red-600 text-white border-red-600 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-300 hover:border-red-500'
                        }`}
                      >
                        <MapPin className="w-3 h-3 text-current" />
                        <span>{city}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${selectedGov.code === gov.code ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                          {gov.nameAr} - {gov.baseRate} ج.م
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded-lg font-medium border border-amber-200">
                  لم يتم العثور على مدينة مطابقة لـ "{citySearch}". يمكنك الاختيار المباشر من قائمة المحافظات أدناه.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة المستهدفة:</label>
            <select
              value={selectedGovCode}
              onChange={(e) => setSelectedGovCode(e.target.value)}
              className="w-full text-xs font-bold p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500/20"
            >
              {governorates
                .filter((g) =>
                  searchLower
                    ? g.nameAr.toLowerCase().includes(searchLower) ||
                      g.cities?.some((c) => c.toLowerCase().includes(searchLower))
                    : true
                )
                .map((g) => (
                  <option key={g.code} value={g.code}>
                    {g.nameAr} - (سعر أساسي: {g.baseRate} ج.م)
                  </option>
                ))}
            </select>

            {/* Display automatic centers & cities inside selected governorate */}
            {selectedGov.cities && selectedGov.cities.length > 0 && (
              <div className="mt-2 p-3 bg-red-50/50 border border-red-100 rounded-xl space-y-1">
                <span className="text-[11px] font-extrabold text-red-950 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-600" />
                  المراكز والمدن المغطاة في {selectedGov.nameAr} ({selectedGov.cities.length} منطقة):
                </span>
                <div className="flex flex-wrap gap-1 pt-1">
                  {selectedGov.cities
                    .filter((c) => (searchLower ? c.toLowerCase().includes(searchLower) : true))
                    .map((c) => (
                      <span
                        key={c}
                        className={`text-[10px] border px-2 py-0.5 rounded-md font-bold ${
                          searchLower && c.toLowerCase().includes(searchLower)
                            ? 'bg-red-600 text-white border-red-600 font-black'
                            : 'bg-white text-slate-800 border-red-200'
                        }`}
                      >
                        {c}
                      </span>
                    ))}
                </div>
              </div>
            )}
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
