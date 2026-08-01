import React from 'react';
import { Shipment } from '../types';
import { BOSTA_COURIERS } from '../data/mockData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  Truck, 
  PackageX, 
  DollarSign,
  UserCheck,
  Star,
  Award,
  Percent,
  CheckCircle2,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface AnalyticsViewProps {
  shipments: Shipment[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ shipments }) => {
  // Aggregate status distribution
  const statusCounts = shipments.reduce((acc: Record<string, number>, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = [
    { name: 'تم التسليم', value: statusCounts['delivered'] || 0, color: '#10B981' },
    { name: 'استلام جزئي', value: statusCounts['partial_delivery'] || 0, color: '#D97706' },
    { name: 'مع المندوب', value: statusCounts['out_for_delivery'] || 0, color: '#F59E0B' },
    { name: 'في المستودع', value: statusCounts['in_hub'] || 0, color: '#3B82F6' },
    { name: 'جديدة', value: statusCounts['created'] || 0, color: '#8B5CF6' },
    { name: 'رفض الاستلام', value: statusCounts['refused'] || 0, color: '#DC2626' },
    { name: 'محاولة فاشلة', value: statusCounts['failed_attempt'] || 0, color: '#F43F5E' },
    { name: 'مرتجع', value: statusCounts['returned'] || 0, color: '#EF4444' },
  ].filter(item => item.value > 0 || item.name === 'تم التسليم' || item.name === 'مع المندوب');

  // Aggregate by Governorate
  const govCounts = shipments.reduce((acc: Record<string, number>, s) => {
    const gov = s.recipient.governorate || 'القاهرة';
    acc[gov] = (acc[gov] || 0) + 1;
    return acc;
  }, {});

  const barData = Object.keys(govCounts).map((gov) => ({
    governorate: gov,
    shipmentsCount: govCounts[gov],
  }));

  // Courier Analytics Aggregation
  const courierMap = new Map();
  BOSTA_COURIERS.forEach(c => courierMap.set(c.id, c));

  shipments.forEach(s => {
    if (s.assignedCourier) {
      courierMap.set(s.assignedCourier.id, s.assignedCourier);
    }
  });

  const allCouriers = Array.from(courierMap.values());

  const courierPerformance = allCouriers.map(courier => {
    const courierShipments = shipments.filter(s => s.assignedCourier?.id === courier.id);
    
    const delivered = courierShipments.filter(s => s.status === 'delivered' || s.status === 'partial_delivery').length;
    const failedOrReturned = courierShipments.filter(s => s.status === 'failed_attempt' || s.status === 'refused' || s.status === 'returned').length;
    const inProgress = courierShipments.filter(s => s.status === 'out_for_delivery' || s.status === 'picked_up' || s.status === 'in_hub').length;
    const totalAssigned = courierShipments.length;

    const actualCod = courierShipments
      .filter(s => s.status === 'delivered' || s.status === 'partial_delivery')
      .reduce((sum, s) => sum + (s.financials?.codAmount || 0), 0);

    const codCollected = actualCod > 0 ? actualCod : courier.codCollectedToday;

    // Success rate calculation
    let successRate = 100;
    if (totalAssigned > 0) {
      successRate = Math.round((delivered / (delivered + failedOrReturned || 1)) * 100);
      if (delivered === 0 && failedOrReturned === 0) successRate = 100;
    } else {
      successRate = Math.round(courier.rating * 20); // Fallback estimate based on rating
    }

    return {
      ...courier,
      totalAssigned: totalAssigned || courier.activeShipmentsCount,
      delivered,
      failedOrReturned,
      inProgress,
      successRate,
      codCollected,
    };
  });

  // Courier KPIs
  const totalCouriers = courierPerformance.length;
  const avgSuccessRate = Math.round(
    courierPerformance.reduce((acc, c) => acc + c.successRate, 0) / (totalCouriers || 1)
  );
  const totalCodCollectedToday = courierPerformance.reduce((acc, c) => acc + c.codCollected, 0);
  const totalCourierFailed = courierPerformance.reduce((acc, c) => acc + c.failedOrReturned, 0);

  // Data for Courier Performance Chart
  const courierChartData = courierPerformance.map(c => ({
    name: c.name.split(' ')[0] + ' ' + (c.name.split(' ')[1] || ''),
    'ناجح (تسليم)': c.delivered,
    'مرتجع / فاشل': c.failedOrReturned,
    'قيد التسليم': c.inProgress,
  }));

  return (
    <div className="space-y-8">
      {/* Analytics Header Banner */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            منظومة متابعة الأداء والعمليات
          </div>
          <h3 className="font-black text-xl sm:text-2xl flex items-center gap-2.5 text-white">
            <BarChart3 className="w-7 h-7 text-red-500 shrink-0" />
            تحليلات الأداء واللوجستيات المباشرة
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
            مؤشرات إنجاز العمليات وتوزيع الشحنات عبر المحافظات وتقارير كفاءة المناديب الميدانية.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right font-mono text-xs text-red-400 font-bold bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/80 shadow-xs">
            ⚡ تحديث كلي فوري
          </div>
        </div>
      </div>

      {/* Main Logistics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Governorate Distribution Bar Chart */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-red-600" />
              توزيع الشحنات حسب المحافظات المصرية
            </h4>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              {barData.length} محافظة
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="governorate" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="shipmentsCount" fill="#DC2626" radius={[6, 6, 0, 0]} name="عدد الشحنات" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              نسب توزيع حالات الشحنات
            </h4>
            <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
              إجمالي {shipments.length} شحنة
            </span>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* NEW SECTION: Couriers Performance & Delivery Reports */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Section Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 px-3 py-1 rounded-lg text-xs font-bold border border-red-100">
              <UserCheck className="w-3.5 h-3.5" />
              تقارير أداء المناديب الميدانية
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-red-600" />
              مؤشرات كفاءة المندوبين ونسب التسليم الناجح
            </h3>
            <p className="text-xs text-slate-500">
              تحليل دقيق لنسب التسليم الناجح مقابل المرتجعات والمبالغ المحصلة لكل كابتن توصيل.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="bg-slate-100 text-slate-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              تغطية 4 مستودعات رئيسية
            </span>
          </div>
        </div>

        {/* Courier KPI Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">إجمالي المناديب</span>
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <UserCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">
              {totalCouriers} <span className="text-xs font-normal text-slate-500">كابتن</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> نشطون في الخدمة
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">متوسط نسبة النجاح</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-700">
              %{avgSuccessRate}
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(0, avgSuccessRate))}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">المرتجعات والتأجيلات</span>
              <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <PackageX className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-600">
              {totalCourierFailed} <span className="text-xs font-normal text-slate-500">طرد</span>
            </div>
            <p className="text-[11px] text-slate-500">محاولات غير مكتملة</p>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold">الكاش المحصل اليوم</span>
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-lg sm:text-2xl font-black text-slate-900">
              {totalCodCollectedToday.toLocaleString()} <span className="text-xs font-normal text-slate-500">ج.م</span>
            </div>
            <p className="text-[11px] text-amber-600 font-bold">جاهز للتسوية بالعهد المالية</p>
          </div>
        </div>

        {/* Courier Comparison Bar Chart */}
        <div className="bg-slate-50/60 border border-slate-200/80 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-red-600" />
              مقارنة أداء التسليم المباشر للمندوبين (ناجح vs مرتجع vs قيد التسليم)
            </h4>
            <span className="text-[11px] font-bold text-slate-500">معدل الإنجاز الميداني</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courierChartData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#475569' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#475569' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="ناجح (تسليم)" fill="#10B981" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="قيد التسليم" fill="#F59E0B" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="مرتجع / فاشل" fill="#F43F5E" radius={[4, 4, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Couriers Performance Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-slate-700" />
              جدول التفاصيل والتقييم التفصيلي لكل مندوب
            </h4>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">المندوب (الكابتن)</th>
                  <th className="p-3.5">المستودع التابع</th>
                  <th className="p-3.5 text-center">الشحنات المسندة</th>
                  <th className="p-3.5 text-center">التسليم الناجح</th>
                  <th className="p-3.5 text-center">مرتجع / فاشل</th>
                  <th className="p-3.5 text-center">نسبة النجاح</th>
                  <th className="p-3.5">الكاش المحصل</th>
                  <th className="p-3.5 text-center">التقييم</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white font-medium">
                {courierPerformance.map((courier) => (
                  <tr key={courier.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={courier.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'} 
                          alt={courier.name} 
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-extrabold text-slate-900 text-xs">{courier.name}</div>
                          <div className="text-[11px] text-slate-500 dir-ltr text-right">{courier.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 text-slate-600 text-xs">{courier.assignedHub}</td>
                    <td className="p-3.5 text-center font-bold text-slate-800">{courier.totalAssigned}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-600 bg-emerald-50/30 rounded-lg">
                      {courier.delivered}
                    </td>
                    <td className="p-3.5 text-center font-bold text-rose-600 bg-rose-50/30 rounded-lg">
                      {courier.failedOrReturned}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                          courier.successRate >= 90 
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                            : courier.successRate >= 70
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          %{courier.successRate}
                        </span>
                        <div className="w-16 bg-slate-100 h-1 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${courier.successRate >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${Math.min(100, Math.max(0, courier.successRate))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">
                      {courier.codCollected.toLocaleString()} ج.م
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="inline-flex items-center gap-1 font-bold text-slate-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {courier.rating}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

