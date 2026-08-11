import { GovernorateRate, HubInfo, CourierInfo, Shipment, MerchantWallet, UserSession, CompanyTransaction } from '../types';

export const EGYPT_GOVERNORATES: GovernorateRate[] = [
  {
    code: 'CAI',
    nameAr: 'القاهرة',
    nameEn: 'Cairo',
    baseRate: 45,
    additionalKgRate: 7,
    estDays: '24 ساعة',
    cities: [
      'القاهرة الجديدة (التجمع)',
      'التجمع الخامس',
      'التجمع الأول',
      'التجمع الثالث',
      'وسط البلد',
      'الشرابية',
      'بولاق',
      'إمبابة',
      'الوراق',
      'المهندسين',
      'هرم',
      'فيصل',
      'حدائق الأهرام',
      'أكتوبر',
      'مصر القديمة',
      'الأباجية',
      'المنيب',
      'البحر الأعظم',
      'حدائق القبة',
      'مدينة نصر',
      'المعادي',
      'مصر الجديدة',
      'الزمالك',
      'شبرا',
      'المقطم',
      'حلوان',
      'عين شمس',
      'المرج',
      'مؤسسة الزكاة (مؤسسة)',
      'العباسية',
      'الزيتون',
      'المطرية'
    ]
  },
  {
    code: 'NCW',
    nameAr: 'المدن الجديدة',
    nameEn: 'New Cities',
    baseRate: 50,
    additionalKgRate: 8,
    estDays: '24-48 ساعة',
    cities: ['العاصمة الإدارية الجديدة', 'مدينتي', 'الشروق', 'بدر', 'مدينة المستقبل', 'الرحاب', 'حدائق العاصمة']
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

export const BOSTA_COURIERS: CourierInfo[] = [];

export const INITIAL_USERS: UserSession[] = [
  {
    id: 'USR-ADMIN-2',
    name: 'محمد صلاح (أدمن الرئيسية)',
    email: 'mohamedsalah565657@icloud.com',
    phone: '01000000001',
    role: 'admin',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D9%85%D8%AD%D9%85%D8%AF+%D8%B5%D9%84%D8%A7%D8%AD&background=dc2626&color=ffffff',
    isConfirmed: true,
  },
];

export const INITIAL_MERCHANT_WALLET: MerchantWallet = {
  merchantId: 'merch-admin-default',
  merchantName: 'المحفظة الرئيسية',
  availableBalance: 0,
  pendingCod: 0,
  totalPaidOut: 0,
};

export const INITIAL_SHIPMENTS: Shipment[] = [];

export const INITIAL_COMPANY_TRANSACTIONS: CompanyTransaction[] = [];

