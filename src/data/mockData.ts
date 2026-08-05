import { GovernorateRate, HubInfo, CourierInfo, Shipment, MerchantWallet, UserSession, CompanyTransaction } from '../types';

export const EGYPT_GOVERNORATES: GovernorateRate[] = [
  {
    code: 'CAI',
    nameAr: 'القاهرة',
    nameEn: 'Cairo',
    baseRate: 45,
    additionalKgRate: 7,
    estDays: '24 ساعة',
    cities: ['مدينتي', 'بدر', 'الشروق', 'مؤسسة الزكاة (مؤسسة)', 'العاصمة الإدارية الجديدة', 'القاهرة الجديدة (التجمع)', 'مدينة نصر', 'المعادي', 'مصر الجديدة', 'الزمالك', 'شبرا', 'المقطم', 'حلوان', 'عين شمس', 'المرج']
  },
  {
    code: 'GZA',
    nameAr: 'الجيزة',
    nameEn: 'Giza',
    baseRate: 45,
    additionalKgRate: 7,
    estDays: '24 ساعة',
    cities: ['6 أكتوبر', 'الشيخ زايد', 'الدقي', 'المهندسين', 'الهرم', 'فيصل', 'حدائق الأهرام', 'العمرانية', 'البدرشين', 'العياط']
  },
  {
    code: 'QLB',
    nameAr: 'القليوبية',
    nameEn: 'Qalyubia',
    baseRate: 50,
    additionalKgRate: 8,
    estDays: '24-48 ساعة',
    cities: ['العبور', 'القلج', 'بنها', 'شبرا الخيمة', 'قاليوب', 'الخانكة', 'طوخ', 'شبين القناطر']
  },
  {
    code: 'ALX',
    nameAr: 'الإسكندرية',
    nameEn: 'Alexandria',
    baseRate: 55,
    additionalKgRate: 9,
    estDays: '24-48 ساعة',
    cities: ['سموحة', 'ميامي', 'المنتزه', 'العجمي', 'محرم بك', 'سيدي بشر', 'برج العرب', 'جليم']
  },
  {
    code: 'BHG',
    nameAr: 'البحيرة',
    nameEn: 'Beheira',
    baseRate: 60,
    additionalKgRate: 10,
    estDays: '2-3 أيام',
    cities: ['دمنهور', 'كفر الدوار', 'إيتاي البارود', 'كوم حمادة', 'رشيد', 'أبو حمص']
  },
  {
    code: 'MNS',
    nameAr: 'الدقهلية',
    nameEn: 'Dakahlia',
    baseRate: 60,
    additionalKgRate: 10,
    estDays: '2-3 أيام',
    cities: ['المنصورة', 'طلخا', 'ميت غمر', 'السنبلاوين', 'دكرنس', 'شربين', 'بلقاس']
  },
  {
    code: 'GHB',
    nameAr: 'الغربية',
    nameEn: 'Gharbia',
    baseRate: 60,
    additionalKgRate: 10,
    estDays: '2-3 أيام',
    cities: ['طنطا', 'المحلة الكبرى', 'زفتى', 'كفر الزيات', 'بسيون', 'سمنود']
  },
  {
    code: 'MNF',
    nameAr: 'المنوفية',
    nameEn: 'Monufia',
    baseRate: 60,
    additionalKgRate: 10,
    estDays: '2-3 أيام',
    cities: ['شبين الكوم', 'مدينة السادات', 'أشمون', 'منوف', 'قويسنا', 'تلا']
  },
  {
    code: 'SHR',
    nameAr: 'الشرقية',
    nameEn: 'Sharqia',
    baseRate: 60,
    additionalKgRate: 10,
    estDays: '2-3 أيام',
    cities: ['العاشر من رمضان', 'الزقازيق', 'بلبيس', 'أبو كبير', 'فاقوس', 'منيا القمح']
  },
  {
    code: 'SUZ',
    nameAr: 'السويس',
    nameEn: 'Suez',
    baseRate: 65,
    additionalKgRate: 11,
    estDays: '2-3 أيام',
    cities: ['السويس', 'الأربعين', 'عتاقة', 'فيصل (السويس)', 'العين السخنة']
  },
  {
    code: 'ISM',
    nameAr: 'الإسماعيلية',
    nameEn: 'Ismailia',
    baseRate: 65,
    additionalKgRate: 11,
    estDays: '2-3 أيام',
    cities: ['الإسماعيلية', 'القنطرة شرق', 'القنطرة غرب', 'التل الكبير', 'فايد']
  },
  {
    code: 'PTS',
    nameAr: 'بورسعيد',
    nameEn: 'Port Said',
    baseRate: 65,
    additionalKgRate: 11,
    estDays: '2-3 أيام',
    cities: ['بورسعيد', 'بورفؤاد', 'حي الزهور', 'حي المناخ', 'حي الشرق']
  },
  {
    code: 'DMT',
    nameAr: 'دمياط',
    nameEn: 'Damietta',
    baseRate: 60,
    additionalKgRate: 10,
    estDays: '2-3 أيام',
    cities: ['دمياط', 'دمياط الجديدة', 'رأس البر', 'فارسكور', 'الزرقا']
  },
  {
    code: 'KFS',
    nameAr: 'كفر الشيخ',
    nameEn: 'Kafr El Sheikh',
    baseRate: 60,
    additionalKgRate: 10,
    estDays: '2-3 أيام',
    cities: ['كفر الشيخ', 'دسوق', 'بيلا', 'بلطيم', 'سيدي سالم', 'قلين']
  },
  {
    code: 'FYM',
    nameAr: 'الفيوم',
    nameEn: 'Fayoum',
    baseRate: 70,
    additionalKgRate: 11,
    estDays: '2-3 أيام',
    cities: ['الفيوم', 'طامية', 'سنورس', 'إطسا', 'الفيوم الجديدة']
  },
  {
    code: 'BNS',
    nameAr: 'بني سويف',
    nameEn: 'Beni Suef',
    baseRate: 70,
    additionalKgRate: 11,
    estDays: '2-3 أيام',
    cities: ['بني سويف', 'بني سويف الجديدة', 'الواسطى', 'ببا', 'الفشن']
  },
  {
    code: 'MNY',
    nameAr: 'المنيا',
    nameEn: 'Minya',
    baseRate: 75,
    additionalKgRate: 12,
    estDays: '3-4 أيام',
    cities: ['المنيا', 'المنيا الجديدة', 'ملوي', 'سمالوط', 'بني مزار', 'مغاغة']
  },
  {
    code: 'ASY',
    nameAr: 'أسيوط',
    nameEn: 'Asyut',
    baseRate: 75,
    additionalKgRate: 12,
    estDays: '3-4 أيام',
    cities: ['أسيوط', 'أسيوط الجديدة', 'ديروط', 'القوصية', 'أبنوب', 'منفلوط']
  },
  {
    code: 'SHG',
    nameAr: 'سوهاج',
    nameEn: 'Sohag',
    baseRate: 75,
    additionalKgRate: 12,
    estDays: '3-4 أيام',
    cities: ['سوهاج', 'سوهاج الجديدة', 'طهطا', 'جرجا', 'أخميم', 'البلينا']
  },
  {
    code: 'QNA',
    nameAr: 'قنا',
    nameEn: 'Qena',
    baseRate: 80,
    additionalKgRate: 14,
    estDays: '3-4 أيام',
    cities: ['قنا', 'قنا الجديدة', 'نجع حمادي', 'دشنا', 'قوص']
  },
  {
    code: 'LXR',
    nameAr: 'الأقصر',
    nameEn: 'Luxor',
    baseRate: 85,
    additionalKgRate: 15,
    estDays: '3-5 أيام',
    cities: ['الأقصر', 'طيبة الجديدة', 'إسنا', 'أرمنت']
  },
  {
    code: 'ASW',
    nameAr: 'أسوان',
    nameEn: 'Aswan',
    baseRate: 90,
    additionalKgRate: 15,
    estDays: '3-5 أيام',
    cities: ['أسوان', 'أسوان الجديدة', 'كوم أمبو', 'إدفو', 'أبو سمبل']
  },
  {
    code: 'RSE',
    nameAr: 'البحر الأحمر',
    nameEn: 'Red Sea',
    baseRate: 95,
    additionalKgRate: 16,
    estDays: '3-5 أيام',
    cities: ['الغردقة', 'الجونة', 'سفاجا', 'القصير', 'مرسى علم']
  },
  {
    code: 'MTR',
    nameAr: 'مطروح والساحل الشمالي',
    nameEn: 'Matrouh',
    baseRate: 85,
    additionalKgRate: 14,
    estDays: '3-5 أيام',
    cities: ['مرسى مطروح', 'العلمين الجديدة', 'مارينا', 'سيدي عبد الرحمن', 'الضبعة']
  },
  {
    code: 'SSH',
    nameAr: 'جنوب سيناء',
    nameEn: 'South Sinai',
    baseRate: 95,
    additionalKgRate: 16,
    estDays: '3-5 أيام',
    cities: ['شرم الشيخ', 'دهب', 'نويبع', 'طور سيناء', 'رأس سدر', 'طابا']
  }
];

export const BOSTA_HUBS: HubInfo[] = [
  { id: 'hub-cairo-main', name: 'مستودع القاهرة الرئيسي - رمسيس', governorate: 'القاهرة', address: 'شارع جلال، غمرة، بالقرب من محطة رمسيس', managerName: 'مهندس / طارق جلال', phone: '01001234567' },
  { id: 'hub-giza-west', name: 'مستودع الجيزة والغرب - الدقي', governorate: 'الجيزة', address: 'شارع مصدق، الدقي، الجيزة', managerName: 'أستاذ / مصطفى سالم', phone: '01119876543' },
  { id: 'hub-alex', name: 'مستودع الإسكندرية - سموحة', governorate: 'الإسكندرية', address: 'منطقة سموحة الصناعية، الإسكندرية', managerName: 'كابتن / إسلام البحيري', phone: '01223334455' },
  { id: 'hub-delta', name: 'مستودع الدلتا - طنطا', governorate: 'الغربية', address: 'طريق مصر إسكندرية الزراعي، طنطا', managerName: 'أستاذ / خالد النجار', phone: '01009988776' },
];

export const BOSTA_COURIERS: CourierInfo[] = [
  {
    id: 'c1',
    name: 'كابتن / أحمد محمود',
    phone: '01001234567',
    vehicle: 'motocycle',
    assignedHub: 'مستودع القاهرة الرئيسي - رمسيس',
    rating: 4.9,
    activeShipmentsCount: 3,
    codCollectedToday: 1250,
    commissionType: 'fixed',
    commissionValue: 20,
    totalCommissionEarned: 260,
    photoUrl: 'https://ui-avatars.com/api/?name=%D8%A3%D8%AD%D9%85%D8%AF+%D9%85%D8%AD%D9%85%D9%88%D8%AF&background=0D8ABC&color=fff',
  },
  {
    id: 'c2',
    name: 'كابتن / محمود السيد',
    phone: '01112223334',
    vehicle: 'van',
    assignedHub: 'مستودع الجيزة والغرب - الدقي',
    rating: 4.8,
    activeShipmentsCount: 2,
    codCollectedToday: 850,
    commissionType: 'fixed',
    commissionValue: 25,
    totalCommissionEarned: 175,
    photoUrl: 'https://ui-avatars.com/api/?name=%D9%85%D8%AD%D9%85%D9%88%D8%AF+%D8%A7%D9%84%D8%B3%D9%8A%D8%AF&background=10B981&color=fff',
  },
  {
    id: 'c3',
    name: 'كابتن / إبراهيم حسن',
    phone: '01223334455',
    vehicle: 'van',
    assignedHub: 'مستودع الإسكندرية - سموحة',
    rating: 4.95,
    activeShipmentsCount: 1,
    codCollectedToday: 2100,
    commissionType: 'percentage',
    commissionValue: 15,
    totalCommissionEarned: 315,
    photoUrl: 'https://ui-avatars.com/api/?name=%D8%A5%D8%A8%D8%B1%D8%A7%D9%87%D9%8A%D9%85+%D8%AD%D8%B3%D9%86&background=F59E0B&color=fff',
  },
];

export const INITIAL_USERS: UserSession[] = [
  {
    id: 'USR-ADMIN-1',
    name: 'المدير العام',
    email: 'admin@am-shipping.eg',
    phone: '01000000000',
    role: 'admin',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D8%A7%D9%84%D9%85%D8%AF%D9%8A%D8%B1+%D8%A7%D9%84%D8%B9%D8%A7%D9%85&background=dc2626&color=ffffff',
  },
  {
    id: 'USR-MERCH-1',
    name: 'متجر التاجر المسجل',
    email: 'merchant@am-shipping.eg',
    phone: '01012345678',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D9%85%D8%AA%D8%AC%D8%B1+%D8%A7%D9%84%D8%AA%D8%A7%D8%AC%D8%B1&background=16a34a&color=ffffff',
    storeName: 'متجر التاجر المسجل',
  },
  {
    id: 'c1',
    name: 'كابتن / أحمد محمود',
    email: 'ahmed@am-shipping.eg',
    phone: '01001234567',
    role: 'courier',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D8%A3%D8%AD%D9%85%D8%AF+%D9%85%D8%AD%D9%85%D9%88%D8%AF&background=0D8ABC&color=fff',
    courierVehicle: 'دراجة نارية (موتوسيكل)',
    hubName: 'مستودع القاهرة الرئيسي - رمسيس',
  },
  {
    id: 'USR-HUB-1',
    name: 'مدير مستودع القاهرة',
    email: 'hub.cairo@am-shipping.eg',
    phone: '01001234567',
    role: 'hub_manager',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D9%85%D8%AF%D9%8A%D8%B1+%D9%85%D8%B3%D8%AA%D9%88%D8%AF%D8%B9&background=2563eb&color=ffffff',
    hubName: 'مستودع القاهرة الرئيسي - رمسيس',
  },
];

export const INITIAL_MERCHANT_WALLET: MerchantWallet = {
  merchantId: 'merch-admin-default',
  merchantName: 'متجر التاجر المسجل (إعدادات الأدمن)',
  availableBalance: 14250,
  pendingCod: 6800,
  totalPaidOut: 98500,
  bankAccount: {
    bankName: 'البنك الأهلي المصري',
    accountNumber: '1920384756102938',
    iban: 'EG940003019203847561029380123',
  },
  vodafoneCashNumber: '01012345678',
  instaPayHandle: 'merchant@instapay',
};

export const INITIAL_SHIPMENTS: Shipment[] = [];

export const INITIAL_COMPANY_TRANSACTIONS: CompanyTransaction[] = [
  {
    id: 'TXN-1001',
    type: 'income',
    title: 'تحصيل مصاريف شحن - شحنات القاهرة والجيزة',
    amount: 3850,
    category: 'إيرادات شحن',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    relatedCourier: 'كابتن / أحمد محمود',
    notes: 'تحصيل كاش من المندوب عن شحنات اليوم المكتملة',
    createdBy: 'المدير العام',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TXN-1002',
    type: 'expense',
    title: 'وقود وبنزين دراجات نارية وسيارات الشحن',
    amount: 650,
    category: 'وقود ومحروقات',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    relatedCourier: 'كابتن / أحمد محمود',
    notes: 'تمويل وقود المندوبين للرحلات اليومية',
    createdBy: 'المدير العام',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TXN-1003',
    type: 'income',
    title: 'عمولة تحصيل خدمات كاش عند الاستلام (COD)',
    amount: 1200,
    category: 'رسوم وخدمات',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    paymentMethod: 'instapay',
    notes: 'رسوم خدمة التحصيل للكاش من التجار',
    createdBy: 'المدير العام',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'TXN-1004',
    type: 'expense',
    title: 'شراء أكياس ومواد تغليف وبوالص للشركة',
    amount: 1450,
    category: 'مستلزمات وتغليف',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    paymentMethod: 'bank_transfer',
    notes: 'مستلزمات مخازن وطباعة',
    createdBy: 'المدير العام',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  }
];

