import { GovernorateRate, HubInfo, CourierInfo, Shipment, MerchantWallet, UserSession, CompanyTransaction } from '../types';

export const EGYPT_GOVERNORATES: GovernorateRate[] = [
  {
    code: 'CAI',
    nameAr: 'القاهرة',
    nameEn: 'Cairo',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '24 ساعة',
    cities: [
      'مدينة نصر',
      'مصر الجديدة',
      'التجمع الخامس',
      'القاهرة الجديدة (التجمع)',
      'التجمع الأول',
      'التجمع الثالث',
      'المعادي',
      'زهراء المعادي',
      'المقطم',
      'الهضبة الوسطى',
      'وسط البلد',
      'الزمالك',
      'جاردن سيتي',
      'شبرا مصر',
      'العباسية',
      'عين شمس',
      'المرج',
      'الزيتون',
      'حدائق القبة',
      'المطرية',
      'حلمية الزيتون',
      'مساكن شيراتون',
      'النزهة',
      'جسر السويس',
      'حلوان',
      'المعصرة',
      '15 مايو',
      'التبين',
      'مصر القديمة',
      'المنيل',
      'السيدة زينب',
      'دار السلام',
      'البساتين',
      'الشرابية',
      'الوايلي',
      'الظاهر',
      'باب الشعرية',
      'الموسكي',
      'روض الفرج',
      'الساحل',
      'مدينة السلام',
      'الحرفيين',
      'عزبة النخل',
      'مؤسسة الزكاة'
    ]
  },
  {
    code: 'NCW',
    nameAr: 'المدن الجديدة',
    nameEn: 'New Cities',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '24-48 ساعة',
    cities: [
      'العاصمة الإدارية الجديدة',
      'مدينتي',
      'الشروق',
      'الرحاب',
      'بدر',
      'مدينة المستقبل',
      'حدائق العاصمة',
      'هليوبوليس الجديدة'
    ]
  },
  {
    code: 'GZA',
    nameAr: 'الجيزة',
    nameEn: 'Giza',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '24 ساعة',
    cities: [
      'الدقي',
      'المهندسين',
      'العجوزة',
      'الهرم',
      'فيصل',
      'حدائق الأهرام',
      '6 أكتوبر',
      'الشيخ زايد',
      'العمرانية',
      'الطالبية',
      'إمبابة',
      'الوراق',
      'بشتيل',
      'المنيب',
      'البحر الأعظم',
      'ساقية مكي',
      'الحوامدية',
      'البدرشين',
      'العياط',
      'كرداسة',
      'أوسيم',
      'أبو النمرس',
      'منشأة القناطر',
      'الصف',
      'أطفيح'
    ]
  },
  {
    code: 'QLB',
    nameAr: 'القليوبية',
    nameEn: 'Qalyubia',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '24-48 ساعة',
    cities: [
      'العبور',
      'شبرا الخيمة',
      'بنها',
      'قليوب',
      'القناطر الخيرية',
      'الخانكة',
      'الخصوص',
      'القلج',
      'طوخ',
      'قها',
      'كفر شكر',
      'شبين القناطر',
      'بهتيم',
      'مسطرد'
    ]
  },
  {
    code: 'ALX',
    nameAr: 'الإسكندرية',
    nameEn: 'Alexandria',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '24-48 ساعة',
    cities: [
      'سموحة',
      'سيدي جابر',
      'سيدي بشر',
      'ميامي',
      'العصافرة',
      'المندرة',
      'المنتزه',
      'المعمورة',
      'أبو قير',
      'محرم بك',
      'كرموز',
      'المنشية',
      'بحري والأنفوشي',
      'جليم',
      'ستانلي',
      'رشدي',
      'سان ستيفانو',
      'لوران',
      'سبورتنج',
      'كليوباترا',
      'الإبراهيمية',
      'الشاطبي',
      'العجمي',
      'البيطاش',
      'الهانوفيل',
      'الدخيلة',
      'برج العرب',
      'برج العرب الجديدة',
      'العامرية',
      'كينج مريوط'
    ]
  },
  {
    code: 'BHG',
    nameAr: 'البحيرة',
    nameEn: 'Beheira',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '2-3 أيام',
    cities: ['دمنهور', 'كفر الدوار', 'إيتاي البارود', 'كوم حمادة', 'رشيد', 'أبو حمص']
  },
  {
    code: 'MNS',
    nameAr: 'الدقهلية',
    nameEn: 'Dakahlia',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '2-3 أيام',
    cities: ['المنصورة', 'طلخا', 'ميت غمر', 'السنبلاوين', 'دكرنس', 'شربين', 'بلقاس']
  },
  {
    code: 'GHB',
    nameAr: 'الغربية',
    nameEn: 'Gharbia',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '2-3 أيام',
    cities: ['طنطا', 'المحلة الكبرى', 'زفتى', 'كفر الزيات', 'بسيون', 'سمنود']
  },
  {
    code: 'MNF',
    nameAr: 'المنوفية',
    nameEn: 'Monufia',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '2-3 أيام',
    cities: ['شبين الكوم', 'مدينة السادات', 'أشمون', 'منوف', 'قويسنا', 'تلا']
  },
  {
    code: 'SHR',
    nameAr: 'الشرقية',
    nameEn: 'Sharqia',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '2-3 أيام',
    cities: ['العاشر من رمضان', 'الزقازيق', 'بلبيس', 'أبو كبير', 'فاقوس', 'منيا القمح']
  },
  {
    code: 'SUZ',
    nameAr: 'السويس',
    nameEn: 'Suez',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '2-3 أيام',
    cities: ['السويس', 'الأربعين', 'عتاقة', 'فيصل (السويس)', 'العين السخنة']
  },
  {
    code: 'ISM',
    nameAr: 'الإسماعيلية',
    nameEn: 'Ismailia',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '2-3 أيام',
    cities: ['الإسماعيلية', 'القنطرة شرق', 'القنطرة غرب', 'التل الكبير', 'فايد']
  },
  {
    code: 'PTS',
    nameAr: 'بورسعيد',
    nameEn: 'Port Said',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '2-3 أيام',
    cities: ['بورسعيد', 'بورفؤاد', 'حي الزهور', 'حي المناخ', 'حي الشرق']
  },
  {
    code: 'DMT',
    nameAr: 'دمياط',
    nameEn: 'Damietta',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '2-3 أيام',
    cities: ['دمياط', 'دمياط الجديدة', 'رأس البر', 'فارسكور', 'الزرقا']
  },
  {
    code: 'KFS',
    nameAr: 'كفر الشيخ',
    nameEn: 'Kafr El Sheikh',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '2-3 أيام',
    cities: ['كفر الشيخ', 'دسوق', 'بيلا', 'بلطيم', 'سيدي سالم', 'قلين']
  },
  {
    code: 'FYM',
    nameAr: 'الفيوم',
    nameEn: 'Fayoum',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '2-3 أيام',
    cities: ['الفيوم', 'طامية', 'سنورس', 'إطسا', 'الفيوم الجديدة']
  },
  {
    code: 'BNS',
    nameAr: 'بني سويف',
    nameEn: 'Beni Suef',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '2-3 أيام',
    cities: ['بني سويف', 'بني سويف الجديدة', 'الواسطى', 'ببا', 'الفشن']
  },
  {
    code: 'MNY',
    nameAr: 'المنيا',
    nameEn: 'Minya',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '3-4 أيام',
    cities: ['المنيا', 'المنيا الجديدة', 'ملوي', 'سمالوط', 'بني مزار', 'مغاغة']
  },
  {
    code: 'ASY',
    nameAr: 'أسيوط',
    nameEn: 'Asyut',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '3-4 أيام',
    cities: ['أسيوط', 'أسيوط الجديدة', 'ديروط', 'القوصية', 'أبنوب', 'منفلوط']
  },
  {
    code: 'SHG',
    nameAr: 'سوهاج',
    nameEn: 'Sohag',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '3-4 أيام',
    cities: ['سوهاج', 'سوهاج الجديدة', 'طهطا', 'جرجا', 'أخميم', 'البلينا']
  },
  {
    code: 'QNA',
    nameAr: 'قنا',
    nameEn: 'Qena',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '3-4 أيام',
    cities: ['قنا', 'قنا الجديدة', 'نجع حمادي', 'دشنا', 'قوص']
  },
  {
    code: 'LXR',
    nameAr: 'الأقصر',
    nameEn: 'Luxor',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '3-5 أيام',
    cities: ['الأقصر', 'طيبة الجديدة', 'إسنا', 'أرمنت']
  },
  {
    code: 'ASW',
    nameAr: 'أسوان',
    nameEn: 'Aswan',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '3-5 أيام',
    cities: ['أسوان', 'أسوان الجديدة', 'كوم أمبو', 'إدفو', 'أبو سمبل']
  },
  {
    code: 'RSE',
    nameAr: 'البحر الأحمر',
    nameEn: 'Red Sea',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '3-5 أيام',
    cities: ['الغردقة', 'الجونة', 'سفاجا', 'القصير', 'مرسى علم']
  },
  {
    code: 'MTR',
    nameAr: 'مطروح والساحل الشمالي',
    nameEn: 'Matrouh',
    baseRate: 0,
    additionalKgRate: 0,
    estDays: '3-5 أيام',
    cities: ['مرسى مطروح', 'العلمين الجديدة', 'مارينا', 'سيدي عبد الرحمن', 'الضبعة']
  },
  {
    code: 'SSH',
    nameAr: 'جنوب سيناء',
    nameEn: 'South Sinai',
    baseRate: 0,
    additionalKgRate: 0,
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
    id: 'admin_root',
    name: 'محمد صلاح (أدمن الرئيسية)',
    email: 'mohamedsalah565657@icloud.com',
    phone: '01000000001',
    role: 'admin',
    avatarUrl: 'https://ui-avatars.com/api/?name=%D9%85%D8%AD%D9%85%D8%AF+%D8%B5%D9%84%D8%A7%D8%AD&background=dc2626&color=ffffff',
    isConfirmed: true,
    registeredAt: '2026-08-30T00:00:00.000Z',
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

