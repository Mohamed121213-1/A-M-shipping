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
  availableBalance: 11105,
  pendingCod: 3085,
  totalPaidOut: 0,
};

export const INITIAL_SHIPMENTS: Shipment[] = [
  {
    "id": "BST-591674",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "To you",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790543452586-0-hmda",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "١٢:١٠ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790543459921",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٢:١٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T21:10:52.586+00:00",
    "recipient": {
      "city": "حدائق القبة",
      "name": "ًً",
      "notes": "",
      "phone": "01021151142",
      "district": "",
      "buildingNo": "4",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "علي كرم بجوار مترو منشيه الصدر اتجاه شارع ترعه الجبل ",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 400,
      "netPayout": 400,
      "paidStatus": "pending",
      "shippingFee": 0,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "اله حاسبه ",
      "allowOpening": true
    },
    "trackingNumber": "BST-591674",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-259787",
    "sender": {
      "id": "USR-1790529528973-1401",
      "city": "مدينة نصر",
      "phone": "01006717644",
      "storeName": "Magic",
      "contactName": "Magic",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790533994088-0-cgnk",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٩:٣٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790539341410",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٠٢ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T18:33:14.087+00:00",
    "recipient": {
      "city": "المعادي",
      "name": "ابو قناوي",
      "notes": "",
      "phone": "01127996303",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "عرب المعادي ",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 430,
      "netPayout": 350,
      "paidStatus": "pending",
      "shippingFee": 80,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "قطعه ليد كريستاله ٢",
      "allowOpening": true
    },
    "trackingNumber": "BST-259787",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-711253",
    "sender": {
      "id": "USR-1790529528973-1401",
      "city": "مدينة نصر",
      "phone": "01006717644",
      "storeName": "Magic",
      "contactName": "Magic",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790533924611-0-j2i2",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٩:٣٢ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790539341410",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٠٢ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T18:32:04.611+00:00",
    "recipient": {
      "city": "المعادي",
      "name": "محمد احمد عبد المغني",
      "notes": "",
      "phone": "01117419675",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "ميدان الجزاير ٢٦٣",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 380,
      "netPayout": 300,
      "paidStatus": "pending",
      "shippingFee": 80,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "طقم كشاف شبوره ٢ عدسه ",
      "allowOpening": true
    },
    "trackingNumber": "BST-711253",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-864366",
    "sender": {
      "id": "USR-1790529528973-1401",
      "city": "مدينة نصر",
      "phone": "01006717644",
      "storeName": "Magic",
      "contactName": "Magic",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790533837552-0-nimq",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٩:٣٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790539341410",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٠٢ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T18:30:37.551+00:00",
    "recipient": {
      "city": "المعادي",
      "name": "عبد الرحمن جمال",
      "notes": "",
      "phone": "01010766656",
      "district": "",
      "buildingNo": "41",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "احمد ذكي ",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 730,
      "netPayout": 650,
      "paidStatus": "pending",
      "shippingFee": 80,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "طقم ٢ كشاف ليزر ٥ عدسه ",
      "allowOpening": true
    },
    "trackingNumber": "BST-864366",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-515690",
    "sender": {
      "id": "USR-1790529528973-1401",
      "city": "مدينة نصر",
      "phone": "01006717644",
      "storeName": "Magic",
      "contactName": "Magic",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790533729603-0-4c6n",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٩:٢٨ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790539341411",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٠٢ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T18:28:49.602+00:00",
    "recipient": {
      "city": "المعادي",
      "name": "باهر عبد المالك",
      "notes": "",
      "phone": "01177729367",
      "district": "",
      "buildingNo": "57",
      "apartmentNo": "6",
      "governorate": "القاهرة",
      "streetAddress": "مصر حلوان الزراعي بجوار لابوار ",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 730,
      "netPayout": 650,
      "paidStatus": "pending",
      "shippingFee": 80,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "طقم ٢ كشاف ليزر ٥ عدسه ",
      "allowOpening": true
    },
    "trackingNumber": "BST-515690",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-190414",
    "sender": {
      "id": "USR-1790529528973-1401",
      "city": "مدينة نصر",
      "phone": "01006717644",
      "storeName": "Magic",
      "contactName": "Magic",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790533620281-0-1ddb",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٩:٢٧ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790539341411",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٠٢ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T18:27:00.281+00:00",
    "recipient": {
      "city": "حلوان",
      "name": "توته محمد",
      "notes": "",
      "phone": "01141062158",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "منشيه اطلس شارع سعد الدسوقي ",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 580,
      "netPayout": 500,
      "paidStatus": "pending",
      "shippingFee": 80,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "طقم كشاف شبوته ٢ عدسه ",
      "allowOpening": true
    },
    "trackingNumber": "BST-190414",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-606445",
    "sender": {
      "id": "USR-1790529528973-1401",
      "city": "مدينة نصر",
      "phone": "01006717644",
      "storeName": "Magic",
      "contactName": "Magic",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790533525145-0-rr4c",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٩:٢٥ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790539341411",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٠٢ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T18:25:25.145+00:00",
    "recipient": {
      "city": "حلوان",
      "name": "عمر عبده",
      "notes": "",
      "phone": "01035080308",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "شارع الجيش حدايق حلوان ",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 430,
      "netPayout": 350,
      "paidStatus": "pending",
      "shippingFee": 80,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "قطعه ليد الكريستاله ٢ ",
      "allowOpening": true
    },
    "trackingNumber": "BST-606445",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-631173",
    "sender": {
      "id": "USR-1790529528973-1401",
      "city": "مدينة نصر",
      "phone": "01006717644",
      "storeName": "Magic",
      "contactName": "Magic",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790533366088-0-grsw",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٩:٢٢ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790539341411",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٠٢ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T18:22:46.088+00:00",
    "recipient": {
      "city": "الشرابية",
      "name": "السيد محمد سويلم",
      "notes": "",
      "phone": "01024146529",
      "district": "",
      "buildingNo": "170",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "شارع شركات البترول خلف المطافي الزاويه الحمراء مشويات ابو سويلم ",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 730,
      "netPayout": 650,
      "paidStatus": "pending",
      "shippingFee": 80,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "طقم كشاف ليزر ٢ عدسه ٥ ليزر ",
      "allowOpening": true
    },
    "trackingNumber": "BST-631173",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-611161",
    "sender": {
      "id": "USR-1790529528973-1401",
      "city": "مدينة نصر",
      "phone": "01006717644",
      "storeName": "Magic",
      "contactName": "Magic",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790533219830-0-7nkk",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٩:٢٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790539341411",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٠٢ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T18:20:19.83+00:00",
    "recipient": {
      "city": "عين شمس",
      "name": "محمد",
      "notes": "",
      "phone": "01035190696",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "جسر السويس بيرتي عماره سكر مكه الجديدة",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 730,
      "netPayout": 650,
      "paidStatus": "pending",
      "shippingFee": 80,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "طقم ٢ كشاف ليزر ٥ عدسه",
      "allowOpening": true
    },
    "trackingNumber": "BST-611161",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-184376",
    "sender": {
      "id": "USR-1790529528973-1401",
      "city": "مدينة نصر",
      "phone": "01006717644",
      "storeName": "Magic",
      "contactName": "Magic",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790530447692",
        "date": "2026-09-27",
        "note": "تم تعديل بيانات الشحنة بنجاح بواسطة مصطفي النوبي",
        "title": "تعديل بيانات الشحنة",
        "status": "pending_approval",
        "location": "القاهرة",
        "timestamp": "١٠:٣٤ ص"
      },
      {
        "id": "tl-1790530416772-0-6tyo",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "١٠:٣٣ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790530595915",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "١٠:٣٦ ص",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T17:33:36.771+00:00",
    "recipient": {
      "city": "عين شمس",
      "name": "محمود النجار",
      "phone": "01005889449",
      "district": "عين شمس",
      "governorate": "القاهرة",
      "streetAddress": "منطقه المصانع جسر السويس شركه اباظة",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 380,
      "netPayout": 300,
      "paidStatus": "pending",
      "shippingFee": 80,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "طقم كشاف شبوره. ٢عدسه",
      "allowOpening": true
    },
    "trackingNumber": "BST-184376",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-528501",
    "sender": {
      "id": "USR-1790529528973-1401",
      "city": "مدينة نصر",
      "phone": "01006717644",
      "storeName": "Magic",
      "contactName": "Magic",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790530461541",
        "date": "2026-09-27",
        "note": "تم تعديل بيانات الشحنة بنجاح بواسطة مصطفي النوبي",
        "title": "تعديل بيانات الشحنة",
        "status": "pending_approval",
        "location": "القاهرة",
        "timestamp": "١٠:٣٤ ص"
      },
      {
        "id": "tl-1790530323971-0-7hmk",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "١٠:٣٢ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790530595916",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "١٠:٣٦ ص",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T17:32:03.971+00:00",
    "recipient": {
      "city": "المرج",
      "name": "عبده مصطفي",
      "phone": "01270318503",
      "district": "المرج",
      "buildingNo": "16",
      "governorate": "القاهرة",
      "streetAddress": "احمد عويس من سيد حماده",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 730,
      "netPayout": 650,
      "paidStatus": "pending",
      "shippingFee": 80,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "طقم ٢ كشاف ليزر ٥ عدسه",
      "allowOpening": true
    },
    "trackingNumber": "BST-528501",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-181089",
    "sender": {
      "id": "USR-1790529528973-1401",
      "city": "مدينة نصر",
      "phone": "01006717644",
      "storeName": "Magic",
      "contactName": "Magic",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790530216491-0-dhzx",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "١٠:٣٠ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790530552962",
        "date": "2026-09-27",
        "note": "تم تعديل بيانات الشحنة بنجاح بواسطة محمد صلاح (أدمن الرئيسية)",
        "title": "تعديل بيانات الشحنة",
        "status": "pending_approval",
        "location": "القاهرة",
        "timestamp": "١٠:٣٥ ص"
      },
      {
        "id": "tl-1790530595916",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "١٠:٣٦ ص",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T17:30:16.491+00:00",
    "recipient": {
      "city": "المقطم",
      "name": "هاني محمود",
      "phone": "01005358282",
      "district": "المقطم",
      "buildingNo": "7163",
      "governorate": "القاهرة",
      "streetAddress": "شارع ١٧ الهضبه العليا",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 380,
      "netPayout": 300,
      "paidStatus": "pending",
      "shippingFee": 80,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "طقم ٢ كشاف شبوره ٤ عدسه",
      "allowOpening": true
    },
    "trackingNumber": "BST-181089",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-875749",
    "sender": {
      "id": "USR-1790529528973-1401",
      "city": "مدينة نصر",
      "phone": "01006717644",
      "storeName": "Magic",
      "contactName": "Magic",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790530101147-0-c5m5",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "١٠:٢٨ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790530566653",
        "date": "2026-09-27",
        "note": "تم تعديل بيانات الشحنة بنجاح بواسطة محمد صلاح (أدمن الرئيسية)",
        "title": "تعديل بيانات الشحنة",
        "status": "pending_approval",
        "location": "القاهرة",
        "timestamp": "١٠:٣٦ ص"
      },
      {
        "id": "tl-1790530595916",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "١٠:٣٦ ص",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T17:28:21.146+00:00",
    "recipient": {
      "city": "مدينة نصر",
      "name": "محمد ابو زيد",
      "phone": "01112906176",
      "district": "مدينة نصر",
      "buildingNo": "9",
      "governorate": "القاهرة",
      "streetAddress": "شارع محمد مندور من الطيران",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 730,
      "netPayout": 650,
      "paidStatus": "pending",
      "shippingFee": 80,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "طقم ٢ كشاف ليزر ٥ عدسه",
      "allowOpening": true
    },
    "trackingNumber": "BST-875749",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-347059",
    "sender": {
      "id": "USR-1790529528973-1401",
      "city": "مدينة نصر",
      "phone": "01006717644",
      "storeName": "Magic",
      "contactName": "Magic",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790529980337-0-ovc7",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "١٠:٢٦ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790530576204",
        "date": "2026-09-27",
        "note": "تم تعديل بيانات الشحنة بنجاح بواسطة محمد صلاح (أدمن الرئيسية)",
        "title": "تعديل بيانات الشحنة",
        "status": "pending_approval",
        "location": "القاهرة",
        "timestamp": "١٠:٣٦ ص"
      },
      {
        "id": "tl-1790530595916",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "١٠:٣٦ ص",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T17:26:20.337+00:00",
    "recipient": {
      "city": "المنيب",
      "name": "محمد زينهم",
      "phone": "01121716171",
      "district": "المنيب",
      "governorate": "القاهرة",
      "streetAddress": "عند جامع السلام",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 380,
      "netPayout": 300,
      "paidStatus": "pending",
      "shippingFee": 80,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "طقم كشاف بشوره ٢ عدسه",
      "allowOpening": true
    },
    "trackingNumber": "BST-347059",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-988467",
    "sender": {
      "id": "USR-1790529528973-1401",
      "city": "مدينة نصر",
      "phone": "01006717644",
      "storeName": "Magic",
      "contactName": "Magic",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790529809768",
        "date": "2026-09-27",
        "note": "تم تعديل بيانات الشحنة بنجاح بواسطة مصطفي النوبي",
        "title": "تعديل بيانات الشحنة",
        "status": "pending_approval",
        "location": "القاهرة",
        "timestamp": "١٠:٢٣ ص"
      },
      {
        "id": "tl-1790529743037-0-uni7",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "١٠:٢٢ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790530583719",
        "date": "2026-09-27",
        "note": "تم تعديل بيانات الشحنة بنجاح بواسطة محمد صلاح (أدمن الرئيسية)",
        "title": "تعديل بيانات الشحنة",
        "status": "pending_approval",
        "location": "القاهرة",
        "timestamp": "١٠:٣٦ ص"
      },
      {
        "id": "tl-1790530595917",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "١٠:٣٦ ص",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T17:22:23.037+00:00",
    "recipient": {
      "city": "شبرا",
      "name": "مصطفي رواش",
      "phone": "01145167058",
      "district": "شبرا",
      "buildingNo": "14",
      "governorate": "القاهرة",
      "streetAddress": "شارع ضيطف الله روض الفرج",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 730,
      "netPayout": 650,
      "paidStatus": "pending",
      "shippingFee": 80,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "طقم ٢ كشاف ليزر ٥ عدسه",
      "allowOpening": true
    },
    "trackingNumber": "BST-988467",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-292967",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-0-jm7j",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408378",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "سما نصرالدين",
      "notes": "",
      "phone": "01118104126",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "المرج ١١ محمد عبد الغنيخلف مسجد عبد العظيم عرابي",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 1685,
      "netPayout": 1595,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "3 سلوبته",
      "allowOpening": true
    },
    "trackingNumber": "BST-292967",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-304645",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-1-i6gx",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408379",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "ملك احمد",
      "notes": "",
      "phone": "01063128647",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "التجمع الأول",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 1000,
      "netPayout": 910,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "2 سلوبته",
      "allowOpening": true
    },
    "trackingNumber": "BST-304645",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-483979",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-2-l6b5",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408379",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "رونزى كريم",
      "notes": "",
      "phone": "01070010511",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "شارع المركز الاجتماعي من عبدالله رفاعي اول المفارق امام مسجد القاضي",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 1000,
      "netPayout": 910,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "2 سلوبته",
      "allowOpening": true
    },
    "trackingNumber": "BST-483979",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-658308",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-3-uh2c",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408379",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "رانيا محمد",
      "notes": "",
      "phone": "01275859464",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "دار السلام ٣٦ محمود علي من المحجر شقه رقم ٢",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 585,
      "netPayout": 495,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "سلوبته",
      "allowOpening": true
    },
    "trackingNumber": "BST-658308",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-752582",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-4-xb58",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408379",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "نادية حسن",
      "notes": "",
      "phone": "01065703683",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "التجمع الخامس مستشفي نسايم باب العيادات الخارجيه بجوار مستشفي الجوي",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 585,
      "netPayout": 495,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "سلوبته",
      "allowOpening": true
    },
    "trackingNumber": "BST-752582",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-525565",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-5-aa6e",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408380",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "دينا احمد",
      "notes": "",
      "phone": "01095735589",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "عزبة خيرالله عند مدرسه تواصل",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 1035,
      "netPayout": 945,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "2 سلوبته",
      "allowOpening": true
    },
    "trackingNumber": "BST-525565",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-577170",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-6-krnz",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408380",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "مستورة ادم",
      "notes": "",
      "phone": "01127377543",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "عين شمس شارع السلام تقاطع إبراهيم عبد الرازق جنب صيدليه امل",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 570,
      "netPayout": 480,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "جيبة",
      "allowOpening": true
    },
    "trackingNumber": "BST-577170",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-247986",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-7-ul5q",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408380",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "ندى محمد",
      "notes": "",
      "phone": "01109135588",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "كوبري محمد نجيب شارع الانابيب المرج",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 570,
      "netPayout": 480,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "جيبة",
      "allowOpening": true
    },
    "trackingNumber": "BST-247986",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-615491",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-8-rndr",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408380",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "ايمان محمد",
      "notes": "",
      "phone": "01156060712",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "جسر السويس شارع عبد المحسن الوسيمي ممر ٣ من شارع الزعيم",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 585,
      "netPayout": 495,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "سلوبته",
      "allowOpening": true
    },
    "trackingNumber": "BST-615491",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-994632",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-9-ouvc",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408381",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "سماح حمدى",
      "notes": "",
      "phone": "01029827093",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "مدينة نصر الحي العاشر بلوك ١٣ خلف المحلاوي",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 570,
      "netPayout": 480,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "جيبة",
      "allowOpening": true
    },
    "trackingNumber": "BST-994632",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-217936",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-10-ooe4",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408381",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "مى رمضان",
      "notes": "",
      "phone": "0106076029",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "التجمع التالت ١٤ مساكن الجيزة القطاميه",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 1145,
      "netPayout": 1055,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "2 سلوبته",
      "allowOpening": true
    },
    "trackingNumber": "BST-217936",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-456067",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-11-1cgd",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408381",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "احلام",
      "notes": "",
      "phone": "01096452574",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "زهراء المعادى الشطر العاشر كمبوند ايميرالد القديم عماره ١ مدخل أ الدور ٣ شقه ٣٦",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 570,
      "netPayout": 480,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "جيبة",
      "allowOpening": true
    },
    "trackingNumber": "BST-456067",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-150405",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-12-aiiv",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408382",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "هناء",
      "notes": "",
      "phone": "01099288656",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "مساكن شيراتون ٢ الاديب علي ادهم بجوار النساجون الدور  ٢ شقه  ٣٠٢",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 1035,
      "netPayout": 945,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "2 سلوبته",
      "allowOpening": true
    },
    "trackingNumber": "BST-150405",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-445624",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-13-7pe0",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408382",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "ايه امام",
      "notes": "",
      "phone": "01127535191",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "البساتين ٥ علي أبو الدهب من سوق الزهور",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 585,
      "netPayout": 495,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "سلوبته",
      "allowOpening": true
    },
    "trackingNumber": "BST-445624",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-927509",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-14-ymup",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408382",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "ام ايتن",
      "notes": "",
      "phone": "01220540820",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "عين شمس ١٤ جمال عبد المنعم قريب من مترو عين شمس",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 585,
      "netPayout": 495,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "سلوبته",
      "allowOpening": true
    },
    "trackingNumber": "BST-927509",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-977459",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-15-t6hp",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408383",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "هدى ايمن",
      "notes": "",
      "phone": "01221819546",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "الخصوص شارع عباد الرحمن",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 585,
      "netPayout": 495,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "سلوبته",
      "allowOpening": true
    },
    "trackingNumber": "BST-977459",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-599703",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-16-8ez9",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408383",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "وائل صالح",
      "notes": "",
      "phone": "01119380952",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "المرج القديمة  ٤٣ عبد العزيز القاضي من شارع البترول الناحيه الغربيه",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 585,
      "netPayout": 495,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "سلوبته",
      "allowOpening": true
    },
    "trackingNumber": "BST-599703",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-626698",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-17-hrpj",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408383",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "فاطمة مصطفى",
      "notes": "",
      "phone": "01070018501",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "مصر القديمة ٣٠ علي سالم امام جامع عمرو بن العاص",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 1145,
      "netPayout": 1055,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "2 جيبة",
      "allowOpening": true
    },
    "trackingNumber": "BST-626698",
    "estimatedDeliveryDate": "2026-09-29"
  },
  {
    "id": "BST-428776",
    "sender": {
      "id": "USR-1790529373789-4626",
      "city": "مدينة نصر",
      "phone": "01061340742",
      "storeName": "Yoyo store",
      "contactName": "Yoyo store",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1790542387932-18-7h76",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٥٣ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1790542408384",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٥٣ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-27T20:53:07.932+00:00",
    "recipient": {
      "city": "القاهرة",
      "name": "خلود محمود",
      "notes": "",
      "phone": "01155561599",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "بولاق الدكرور صفط اللبن ترعه عبد العال ٢ فرن أبو  حديدة",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-27T22:31:52.72+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 590,
      "netPayout": 500,
      "paidStatus": "pending",
      "shippingFee": 90,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "جيبة",
      "allowOpening": true
    },
    "trackingNumber": "BST-428776",
    "estimatedDeliveryDate": "2026-09-29"
  }
];

export const INITIAL_COMPANY_TRANSACTIONS: CompanyTransaction[] = [];

