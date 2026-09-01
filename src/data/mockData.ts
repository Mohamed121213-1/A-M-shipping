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
    id: '10fdf171-fb33-4ede-9d27-2fae8a2c2d4b',
    name: 'محمد صلاح (أدمن الرئيسية)',
    email: 'mohamedsalah565657@icloud.com',
    phone: '01000000001',
    role: 'admin',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D9%85%D8%AD%D9%85%D8%AF+%D8%B5%D9%84%D8%A7%D8%AD&background=dc2626&color=ffffff',
    isConfirmed: true,
    registeredAt: '2026-08-30T00:00:00.000Z',
  },
  {
    id: '15c6e6d1-df23-4e20-a464-e4df09590e4d',
    name: 'Amr',
    email: '01015674681@am-shipping.eg',
    phone: '01015674681',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=Amr&background=dc2626&color=ffffff',
    storeName: 'متجر Amr',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:00:00.000Z',
  },
  {
    id: 'b009b128-b1f5-4c03-b6ec-842d35cca9b0',
    name: 'ام فاتن',
    email: '01017266727@am-shipping.eg',
    phone: '01017266727',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D8%A7%D9%85+%D9%81%D8%A7%D8%AA%D9%86&background=dc2626&color=ffffff',
    storeName: 'متجر ام فاتن',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:05:00.000Z',
  },
  {
    id: '16cfabd6-f309-4c09-ad2e-3ddc10338d67',
    name: 'حسن علي',
    email: '01093383328@am-shipping.eg',
    phone: '01093383328',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86+%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff',
    storeName: 'متجر حسن علي',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:10:00.000Z',
  },
  {
    id: '8b151dbb-660d-4169-903a-647c12967504',
    name: 'Oo',
    email: '01121212121@am-shipping.eg',
    phone: '01121212121',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=Oo&background=dc2626&color=ffffff',
    storeName: 'متجر Oo',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:15:00.000Z',
  },
  {
    id: '169880e0-ba38-416e-ab42-9ae66d67b5c3',
    name: 'محمد',
    email: '01125465248@am-shipping.eg',
    phone: '01125465248',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D9%85%D8%AD%D9%85%D8%AF&background=dc2626&color=ffffff',
    storeName: 'متجر محمد',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:20:00.000Z',
  },
  {
    id: 'd5892b9e-760c-4a7b-a428-04916faf5513',
    name: 'Pp',
    email: '01125465676@am-shipping.eg',
    phone: '01125465676',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=Pp&background=dc2626&color=ffffff',
    storeName: 'متجر Pp',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:25:00.000Z',
  },
  {
    id: '16256cfa-8044-4607-abce-9de1335f311a',
    name: 'ابراهيم شريف',
    email: '01155219660@am-shipping.eg',
    phone: '01155219660',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D8%A7%D8%A8%D8%B1%D8%A7%D9%87%D9%8A%D9%85+%D8%B4%D8%B1%D9%8A%D9%81&background=dc2626&color=ffffff',
    storeName: 'متجر ابراهيم شريف',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:30:00.000Z',
  },
  {
    id: '234aa881-d193-42a3-b86a-5408ba92146e',
    name: 'ام فاتن',
    email: '01234567891@am-shipping.eg',
    phone: '01234567891',
    role: 'merchant',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D8%A7%D9%85+%D9%81%D8%A7%D8%AA%D9%86&background=dc2626&color=ffffff',
    storeName: 'متجر ام فاتن 2',
    isConfirmed: false,
    registeredAt: '2026-08-30T10:35:00.000Z',
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

