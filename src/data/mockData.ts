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
    "id": "BST-710061",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-0-lqty",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814773",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788400826634",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788365167410",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "courier",
        "timestamp": "٠٧:٠٦ م",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 270 ج.م"
      },
      {
        "id": "tl-1788423308641-hclt",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423339099-n09m",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "ام محمد",
      "notes": "",
      "phone": "1065952786",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "القاهره السيده زينب شارع بورسعيد فوق صيدليه الجمهوريه امام بنزينه التعاون عماره 17 شقه 8 الدور الرابع",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:39.099Z",
    "financials": {
      "codFee": 0,
      "codAmount": 270,
      "netPayout": 200,
      "paidStatus": "settled",
      "shippingFee": 70,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 3,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-710061",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 270 ج.م",
      "verifiedPin": "8492",
      "recipientName": "ام محمد",
      "signatureDate": "٢‏/٩‏/٢٠٢٦، ٧:٠٦:٠٧ م"
    },
    "estimatedDeliveryDate": "2026-09-04",
    "courierSettledAt": "2026-09-03T08:15:39.099Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z"
  },
  {
    "id": "BST-596169",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-1-f74c",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814773",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788400830899",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788365178112",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "courier",
        "timestamp": "٠٧:٠٦ م",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 530 ج.م"
      },
      {
        "id": "tl-1788423308641-um93",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423339099-7uxr",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "اشرف",
      "notes": "",
      "phone": "1224452169",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "٩٢ شارع المنيل محطه الغمراوي القاهرة",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:39.099Z",
    "financials": {
      "codFee": 0,
      "codAmount": 530,
      "netPayout": 470,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-596169",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 530 ج.م",
      "verifiedPin": "8492",
      "recipientName": "اشرف",
      "signatureDate": "٢‏/٩‏/٢٠٢٦، ٧:٠٦:١٨ م"
    },
    "estimatedDeliveryDate": "2026-09-04",
    "courierSettledAt": "2026-09-03T08:15:39.099Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z"
  },
  {
    "id": "BST-824992",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-2-sq2g",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814773",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788400833696",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788365189347",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "courier",
        "timestamp": "٠٧:٠٦ م",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 330 ج.م"
      },
      {
        "id": "tl-1788386043638",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠٩:٥٤ م",
        "description": "test"
      },
      {
        "id": "tl-1788423308641-iyyo",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423339099-wgms",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "عبدالله سيد محمد",
      "notes": "",
      "phone": "1128436282",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "١٩محمد عبد ربه ارض الشركه الشرابيه \\امام الشارع مسجد الصحابه",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:39.099Z",
    "financials": {
      "codFee": 0,
      "codAmount": 330,
      "netPayout": 270,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-824992",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 330 ج.م",
      "verifiedPin": "8492",
      "recipientName": "عبدالله سيد محمد",
      "signatureDate": "٢‏/٩‏/٢٠٢٦، ٧:٠٦:٢٩ م"
    },
    "estimatedDeliveryDate": "2026-09-04",
    "courierSettledAt": "2026-09-03T08:15:39.099Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z"
  },
  {
    "id": "BST-924803",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-3-h5bt",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814774",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788400873613",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٧:٠١ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788365200783",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "courier",
        "timestamp": "٠٧:٠٦ م",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 450 ج.م"
      },
      {
        "id": "tl-1788423308641-6ubr",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423339099-6yu7",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "جنه شادي",
      "notes": "",
      "phone": "1121712100",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "القأهرة الزوياء الحمراء اخر شارع سيد درويش بوابه الفرز",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:39.099Z",
    "financials": {
      "codFee": 0,
      "codAmount": 450,
      "netPayout": 390,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-924803",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 450 ج.م",
      "verifiedPin": "8492",
      "recipientName": "جنه شادي",
      "signatureDate": "٢‏/٩‏/٢٠٢٦، ٧:٠٦:٤٠ م"
    },
    "estimatedDeliveryDate": "2026-09-04",
    "courierSettledAt": "2026-09-03T08:15:39.099Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z"
  },
  {
    "id": "BST-747443",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-4-4tca",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814774",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788400882580",
        "title": "تم تعيين المندوب احمد رشاد",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٧:٠١ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب احمد رشاد (01033011862) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788365245533",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "courier",
        "timestamp": "٠٧:٠٧ م",
        "description": "تم التسليم بنجاح بواسطة المندوب احمد رشاد وتحصيل المبلغ 580 ج.م"
      },
      {
        "id": "tl-1788365307147",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "courier",
        "timestamp": "٠٧:٠٨ م",
        "description": "تم التسليم بنجاح بواسطة المندوب احمد رشاد وتحصيل المبلغ 580 ج.م"
      },
      {
        "id": "tl-1788423308641-9vkd",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423352286-dtsk",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "عماد عطيه",
      "notes": "",
      "phone": "1145344833",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "القاهره عنوان 7شارع كمال الشريف ارض الشركه في دخله التعاون عند محل اولاد شربات",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:52.286Z",
    "financials": {
      "codFee": 0,
      "codAmount": 580,
      "netPayout": 520,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-747443",
    "assignedCourier": {
      "id": "USR-1788364520004-8809",
      "name": "احمد رشاد",
      "phone": "01033011862",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%A7%D8%AD%D9%85%D8%AF%20%D8%B1%D8%B4%D8%A7%D8%AF%20&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 580 ج.م",
      "verifiedPin": "8492",
      "recipientName": "عماد عطيه",
      "signatureDate": "٢‏/٩‏/٢٠٢٦، ٧:٠٨:٢٧ م"
    },
    "estimatedDeliveryDate": "2026-09-04",
    "courierSettledAt": "2026-09-03T08:15:52.286Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z"
  },
  {
    "id": "BST-331929",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-5-2ms6",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814774",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788401299037",
        "title": "تم تعيين المندوب احمد رشاد",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٧:٠٨ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب احمد رشاد (01033011862) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788401234740",
        "title": "تم تعيين المندوب احمد رشاد",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٧:٠٧ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب احمد رشاد (01033011862) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788366466139",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠٧:٢٧ م",
        "description": "تم التسليم بنجاح بواسطة المندوب احمد رشاد وتحصيل المبلغ 840 ج.م"
      },
      {
        "id": "tl-1788423308641-aunt",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423352286-cbla",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "حنان السيد حنفي",
      "notes": "",
      "phone": "1005675625",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "104ش كسارات البلاديه أمام مصنع البيبسي كولا القصيرين الزاويه الحمراء القاهره",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:52.286Z",
    "financials": {
      "codFee": 0,
      "codAmount": 840,
      "netPayout": 780,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-331929",
    "assignedCourier": {
      "id": "USR-1788364520004-8809",
      "name": "احمد رشاد",
      "phone": "01033011862",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%A7%D8%AD%D9%85%D8%AF%20%D8%B1%D8%B4%D8%A7%D8%AF&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 840 ج.م",
      "verifiedPin": "8492",
      "recipientName": "حنان السيد حنفي",
      "signatureDate": "٢‏/٩‏/٢٠٢٦، ٧:٢٧:٤٦ م"
    },
    "estimatedDeliveryDate": "2026-09-04",
    "courierSettledAt": "2026-09-03T08:15:52.286Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z"
  },
  {
    "id": "BST-829765",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-6-aoye",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814774",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788402378255",
        "title": "تم تعيين المندوب احمد رشاد",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٧:٢٦ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب احمد رشاد (01033011862) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788386803732",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:٠٦ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب احمد رشاد وتحصيل المبلغ 330 ج.م"
      },
      {
        "id": "tl-1788423308641-f9p2",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423352286-c8wo",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "محمد حسين",
      "notes": "",
      "phone": "1004047460",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "ش العروبه دار السلام عند مدرسه الفردوس",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:52.286Z",
    "financials": {
      "codFee": 0,
      "codAmount": 330,
      "netPayout": 270,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-829765",
    "assignedCourier": {
      "id": "USR-1788364520004-8809",
      "name": "احمد رشاد",
      "phone": "01033011862",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%A7%D8%AD%D9%85%D8%AF%20%D8%B1%D8%B4%D8%A7%D8%AF&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "estimatedDeliveryDate": "2026-09-04",
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 330 ج.م",
      "verifiedPin": "8492",
      "recipientName": "محمد حسين",
      "signatureDate": "٣‏/٩‏/٢٠٢٦، ١:٠٦:٤٣ ص"
    },
    "courierSettledAt": "2026-09-03T08:15:52.286Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z"
  },
  {
    "id": "BST-244095",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-7-20lc",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814774",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788402383170",
        "title": "تم تعيين المندوب احمد رشاد",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٧:٢٦ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب احمد رشاد (01033011862) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788366508725",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠٧:٢٨ م",
        "description": "تم التسليم بنجاح بواسطة المندوب احمد رشاد وتحصيل المبلغ 330 ج.م"
      },
      {
        "id": "tl-1788423308641-7m08",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423352286-ctu9",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "فاطمه ابو المجد",
      "notes": "",
      "phone": "1023394209",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "القاهرة ٢ش عبدالغفار عزير من ش الفيوم دار السلام",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:52.286Z",
    "financials": {
      "codFee": 0,
      "codAmount": 330,
      "netPayout": 270,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-244095",
    "assignedCourier": {
      "id": "USR-1788364520004-8809",
      "name": "احمد رشاد",
      "phone": "01033011862",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%A7%D8%AD%D9%85%D8%AF%20%D8%B1%D8%B4%D8%A7%D8%AF&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "estimatedDeliveryDate": "2026-09-04",
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 330 ج.م",
      "verifiedPin": "8492",
      "recipientName": "فاطمه ابو المجد",
      "signatureDate": "٢‏/٩‏/٢٠٢٦، ٧:٢٨:٢٨ م"
    },
    "courierSettledAt": "2026-09-03T08:15:52.286Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z"
  },
  {
    "id": "BST-339834",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-8-eypc",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814774",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788402394053",
        "title": "تم تعيين المندوب احمد رشاد",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٧:٢٦ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب احمد رشاد (01033011862) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788386824680",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:٠٧ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب احمد رشاد وتحصيل المبلغ 330 ج.م"
      },
      {
        "id": "tl-1788423308641-e3yt",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423352286-wuf9",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "الاسم احمد السني",
      "notes": "",
      "phone": "1066844712",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "االمحافظه القاهره العنوان دار السلام سور الشركه صيدليه حاتم",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:52.286Z",
    "financials": {
      "codFee": 0,
      "codAmount": 330,
      "netPayout": 270,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-339834",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364520004-8809",
      "name": "احمد رشاد",
      "phone": "01033011862",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%A7%D8%AD%D9%85%D8%AF%20%D8%B1%D8%B4%D8%A7%D8%AF&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 330 ج.م",
      "verifiedPin": "8492",
      "recipientName": "الاسم احمد السني",
      "signatureDate": "٣‏/٩‏/٢٠٢٦، ١:٠٧:٠٤ ص"
    },
    "courierSettledAt": "2026-09-03T08:15:52.286Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z"
  },
  {
    "id": "BST-898354",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "partial_delivery",
    "timeline": [
      {
        "id": "tl-1788364815882-9-21um",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814774",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788422762465",
        "title": "تم تعيين المندوب احمد رشاد",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٠٦ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب احمد رشاد (01033011862) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788386944770",
        "title": "استلام جزئي من العميل وتحصيل المبلغ",
        "status": "partial_delivery",
        "actorRole": "system",
        "timestamp": "٠١:٠٩ ص",
        "description": "استلام جزئي بواسطة المندوب احمد رشاد: تسليم 1 قطعة واصل (400 ج.م) وارتجاع 1 قطعة بقيمة (450 ج.م). (تم استلام جزء من المحتويات وإرجاع المتبقي)"
      },
      {
        "id": "tl-1788423308641-58xv",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "partial_delivery",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423352286-jwlk",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "partial_delivery",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "جومانا ياسر",
      "notes": "",
      "phone": "1157437915",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "عمارة1000077 القاهره زهراء المعادي المعراج العلوي المجاوره العاشره",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:52.286Z",
    "financials": {
      "codFee": 0,
      "codAmount": 400,
      "netPayout": 340,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-898354",
    "estimatedDeliveryDate": "2026-09-04",
    "partialDetails": {
      "notes": "تم استلام جزء من المحتويات وإرجاع المتبقي",
      "partialCodAmount": 400,
      "originalCodAmount": 850,
      "acceptedItemsCount": 1,
      "remainingCodAmount": 450,
      "returnedItemsCount": 1
    },
    "assignedCourier": {
      "id": "USR-1788364520004-8809",
      "name": "احمد رشاد",
      "phone": "01033011862",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%A7%D8%AD%D9%85%D8%AF%20%D8%B1%D8%B4%D8%A7%D8%AF&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "courierSettledAt": "2026-09-03T08:15:52.286Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z",
    "isReturnedToMerchant": true,
    "returnedToMerchantAt": "2026-09-03T08:20:08.340Z"
  },
  {
    "id": "BST-592398",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-10-6t3b",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814774",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788422767498",
        "title": "تم تعيين المندوب احمد رشاد",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٠٦ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب احمد رشاد (01033011862) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788386840471",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:٠٧ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب احمد رشاد وتحصيل المبلغ 260 ج.م"
      },
      {
        "id": "tl-1788423308641-zr9w",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423352286-lux2",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "مدام دعاء",
      "notes": "",
      "phone": "1274916891",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "العنوان/35ش علي بن ابي طالب الاميرية ـ القاهره",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:52.286Z",
    "financials": {
      "codFee": 0,
      "codAmount": 260,
      "netPayout": 200,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-592398",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364520004-8809",
      "name": "احمد رشاد",
      "phone": "01033011862",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%A7%D8%AD%D9%85%D8%AF%20%D8%B1%D8%B4%D8%A7%D8%AF&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 260 ج.م",
      "verifiedPin": "8492",
      "recipientName": "مدام دعاء",
      "signatureDate": "٣‏/٩‏/٢٠٢٦، ١:٠٧:٢٠ ص"
    },
    "courierSettledAt": "2026-09-03T08:15:52.286Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z"
  },
  {
    "id": "BST-929361",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "returned",
    "timeline": [
      {
        "id": "tl-1788364815882-11-jrzb",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814774",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788422853910",
        "title": "تم تعيين المندوب احمد رشاد",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٠٧ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب احمد رشاد (01033011862) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788386927827",
        "title": "مرتجع للتاجر (مستحقات التاجر 0 ج.م)",
        "status": "returned",
        "actorRole": "system",
        "timestamp": "٠١:٠٨ ص",
        "description": "مرتجع بواسطة احمد رشاد (دفع كامل الشحن 60 ج.م - الخصم من التاجر 0 ج.م): رفض العميل المعاينة / غير مطابق للمواصفات"
      },
      {
        "id": "tl-1788423308641-r3j3",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "returned",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423352286-t98g",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "returned",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "سعد رؤوف سعد",
      "notes": "",
      "phone": "1288482662",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "30 محمد بخيت القاهره زيتون",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:52.286Z",
    "financials": {
      "codFee": 0,
      "codAmount": 60,
      "netPayout": 0,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-929361",
    "estimatedDeliveryDate": "2026-09-04",
    "refusedDetails": {
      "reason": "رفض العميل المعاينة / غير مطابق للمواصفات",
      "amountCollected": 60,
      "shippingFeePaid": true,
      "merchantDeductedAmount": 0,
      "partialShippingFeePaid": false
    },
    "assignedCourier": {
      "id": "USR-1788364520004-8809",
      "name": "احمد رشاد",
      "phone": "01033011862",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%A7%D8%AD%D9%85%D8%AF%20%D8%B1%D8%B4%D8%A7%D8%AF&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "courierSettledAt": "2026-09-03T08:15:52.286Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z",
    "isReturnedToMerchant": true,
    "returnedToMerchantAt": "2026-09-03T08:17:00.242Z"
  },
  {
    "id": "BST-200893",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "returned",
    "timeline": [
      {
        "id": "tl-1788364815882-12-ukuk",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814775",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788422866913",
        "title": "تم تعيين المندوب احمد رشاد",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٠٧ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب احمد رشاد (01033011862) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788386956777",
        "title": "مرتجع للتاجر (مستحقات التاجر 0 ج.م)",
        "status": "returned",
        "actorRole": "system",
        "timestamp": "٠١:٠٩ ص",
        "description": "مرتجع بواسطة احمد رشاد (لم يدفع شحن - خصم كامل الشحن 60 ج.م من التاجر): رفض العميل المعاينة / غير مطابق للمواصفات"
      },
      {
        "id": "tl-1788423308641-r9ly",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "returned",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423352287-qwrc",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "returned",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (0 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "مدام نيفين",
      "notes": "",
      "phone": "1115552992",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "فندق منتزه الحلميه داخل الفندق نفسه بيوتي سنتر نيفين القاهره",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:52.287Z",
    "financials": {
      "codFee": 0,
      "codAmount": 0,
      "netPayout": -60,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-200893",
    "estimatedDeliveryDate": "2026-09-04",
    "refusedDetails": {
      "reason": "رفض العميل المعاينة / غير مطابق للمواصفات",
      "amountCollected": 0,
      "shippingFeePaid": false,
      "merchantDeductedAmount": 60,
      "partialShippingFeePaid": false
    },
    "assignedCourier": {
      "id": "USR-1788364520004-8809",
      "name": "احمد رشاد",
      "phone": "01033011862",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%A7%D8%AD%D9%85%D8%AF%20%D8%B1%D8%B4%D8%A7%D8%AF&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "courierSettledAt": "2026-09-03T08:15:52.287Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z",
    "isReturnedToMerchant": true,
    "returnedToMerchantAt": "2026-09-03T08:17:05.072Z"
  },
  {
    "id": "BST-585071",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-13-5ofi",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814775",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788422884930",
        "title": "تم تعيين المندوب احمد رشاد",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٠٨ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب احمد رشاد (01033011862) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788386922738",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:٠٨ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب احمد رشاد وتحصيل المبلغ 270 ج.م"
      },
      {
        "id": "tl-1788423308641-t4cq",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423352287-iukz",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "احلام يوسف",
      "notes": "",
      "phone": "1003979559",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "مدينه الرحاب",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:52.287Z",
    "financials": {
      "codFee": 0,
      "codAmount": 270,
      "netPayout": 200,
      "paidStatus": "settled",
      "shippingFee": 70,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-585071",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364520004-8809",
      "name": "احمد رشاد",
      "phone": "01033011862",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%A7%D8%AD%D9%85%D8%AF%20%D8%B1%D8%B4%D8%A7%D8%AF&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 270 ج.م",
      "verifiedPin": "8492",
      "recipientName": "احلام يوسف",
      "signatureDate": "٣‏/٩‏/٢٠٢٦، ١:٠٨:٤٢ ص"
    },
    "courierSettledAt": "2026-09-03T08:15:52.287Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z"
  },
  {
    "id": "BST-431846",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-14-9qtv",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814775",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788422896563",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٠٨ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788387078476",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١١ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 340 ج.م"
      },
      {
        "id": "tl-1788423308641-me4x",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423339099-gocn",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "ام زياد",
      "notes": "",
      "phone": "1121919421",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "القطاميه التجمع الثالث مستقبل ثلاثه عماره ٢١ شقه ٥",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:39.099Z",
    "financials": {
      "codFee": 0,
      "codAmount": 340,
      "netPayout": 270,
      "paidStatus": "settled",
      "shippingFee": 70,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-431846",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 340 ج.م",
      "verifiedPin": "8492",
      "recipientName": "ام زياد",
      "signatureDate": "٣‏/٩‏/٢٠٢٦، ١:١١:١٨ ص"
    },
    "courierSettledAt": "2026-09-03T08:15:39.099Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z"
  },
  {
    "id": "BST-480234",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "partial_delivery",
    "timeline": [
      {
        "id": "tl-1788364815882-15-8u1u",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814775",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788422898711",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٠٨ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788387109059",
        "title": "استلام جزئي من العميل وتحصيل المبلغ",
        "status": "partial_delivery",
        "actorRole": "system",
        "timestamp": "٠١:١١ ص",
        "description": "استلام جزئي بواسطة المندوب حسن علي: تسليم 1 قطعة واصل (300 ج.م) وارتجاع 1 قطعة بقيمة (290 ج.م). (تم استلام جزء من المحتويات وإرجاع المتبقي)"
      },
      {
        "id": "tl-1788423308641-ufff",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "partial_delivery",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423339099-ojny",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "partial_delivery",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "محمد حسن عبد الشافي",
      "notes": "",
      "phone": "1023376064",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "القاهره التجمع الخامس التسعين الجنوبي حي اول فلا 9",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:39.099Z",
    "financials": {
      "codFee": 0,
      "codAmount": 300,
      "netPayout": 230,
      "paidStatus": "settled",
      "shippingFee": 70,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-480234",
    "estimatedDeliveryDate": "2026-09-04",
    "partialDetails": {
      "notes": "تم استلام جزء من المحتويات وإرجاع المتبقي",
      "partialCodAmount": 300,
      "originalCodAmount": 590,
      "acceptedItemsCount": 1,
      "remainingCodAmount": 290,
      "returnedItemsCount": 1
    },
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "courierSettledAt": "2026-09-03T08:15:39.099Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z",
    "isReturnedToMerchant": true,
    "returnedToMerchantAt": "2026-09-03T08:20:09.205Z"
  },
  {
    "id": "BST-862573",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-16-exh7",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814775",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788422901528",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٠٨ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788387115541",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١١ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 450 ج.م"
      },
      {
        "id": "tl-1788423308641-w2x6",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر بنجاح وتصفية الحساب."
      },
      {
        "id": "tl-1788423339099-udme",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٥ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "محمد رجب",
      "notes": "",
      "phone": "1142206425",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "25 شارع الخليفه المامون روكسي مصر الجديده البنك الاهلي نفسه",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:15:39.099Z",
    "financials": {
      "codFee": 0,
      "codAmount": 450,
      "netPayout": 390,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:15:08.641Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-862573",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 450 ج.م",
      "verifiedPin": "8492",
      "recipientName": "محمد رجب",
      "signatureDate": "٣‏/٩‏/٢٠٢٦، ١:١١:٥٥ ص"
    },
    "courierSettledAt": "2026-09-03T08:15:39.099Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:15:08.641Z"
  },
  {
    "id": "BST-893139",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-17-a3uv",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814775",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788423377660",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:١٦ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788387411286",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٦ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 970 ج.م"
      },
      {
        "id": "tl-1788423500088-cfmr",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٨ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      },
      {
        "id": "tl-1788423523592-j0dp",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٨ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر يدوياً وتصفية الحساب."
      },
      {
        "id": "tl-1788424056725-q41i",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:٢٧ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر يدوياً وتصفية الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "البرنس أحمد حسن",
      "notes": "",
      "phone": "1067767955",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "محافظة القاهرة السيدة زينب جامع أحمد بن طولون",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:27:36.725Z",
    "financials": {
      "codFee": 0,
      "codAmount": 970,
      "netPayout": 910,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:27:36.725Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-893139",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 970 ج.م",
      "verifiedPin": "8492",
      "recipientName": "البرنس أحمد حسن",
      "signatureDate": "٣‏/٩‏/٢٠٢٦، ١:١٦:٥١ ص"
    },
    "courierSettledAt": "2026-09-03T08:18:20.088Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:27:36.725Z"
  },
  {
    "id": "BST-281073",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-18-fwmv",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814775",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788423384321",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:١٦ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788387444941",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٧ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 790 ج.م"
      },
      {
        "id": "tl-1788423500088-l45l",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٨ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      },
      {
        "id": "tl-1788423523599-tf0i",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٨ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر يدوياً وتصفية الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "بسمة فتحى",
      "notes": "",
      "phone": "1009684828",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "86 ش سعيد الجمال بجوار مسجد نبى الهدى وورشة على الجعلى حدائق القبة القاهرة",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:18:43.599Z",
    "financials": {
      "codFee": 0,
      "codAmount": 790,
      "netPayout": 720,
      "paidStatus": "settled",
      "shippingFee": 70,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:18:43.599Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-281073",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 790 ج.م",
      "verifiedPin": "8492",
      "recipientName": "بسمة فتحى",
      "signatureDate": "٣‏/٩‏/٢٠٢٦، ١:١٧:٢٤ ص"
    },
    "courierSettledAt": "2026-09-03T08:18:20.088Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:18:43.599Z"
  },
  {
    "id": "BST-212631",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-19-4izr",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814775",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788423388709",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:١٦ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788387455975",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٧ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 580 ج.م"
      },
      {
        "id": "tl-1788423500088-vx5v",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٨ ص",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      },
      {
        "id": "tl-1788423523604-v217",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠١:١٨ ص",
        "description": "تم تأكيد صرف وتسليم مستحقات الشحنة للتاجر يدوياً وتصفية الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "احمد هاشم",
      "notes": "",
      "phone": "1100733440",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "حدائق المعادي القاهره ش عبد الحميد مكي فايده كامل بجوار مطعم حكايه عماره 17",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T08:18:43.604Z",
    "financials": {
      "codFee": 0,
      "codAmount": 580,
      "netPayout": 520,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-03T08:18:43.604Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-212631",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 580 ج.م",
      "verifiedPin": "8492",
      "recipientName": "احمد هاشم",
      "signatureDate": "٣‏/٩‏/٢٠٢٦، ١:١٧:٣٥ ص"
    },
    "courierSettledAt": "2026-09-03T08:18:20.088Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-03T08:18:43.604Z"
  },
  {
    "id": "BST-722692",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-20-7ard",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814776",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788573640994",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788537812132",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠٧:٠٣ م",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 580 ج.م"
      },
      {
        "id": "tl-1788573847549-sc8e",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠٧:٠٤ م",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      },
      {
        "id": "tl-1788573898704-r65w",
        "title": "💸 تم تسليم وصرف المستحقات للتاجر",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠٧:٠٤ م",
        "description": "تم تحويل وصرف مستحقات الشحنة للتاجر بنجاح عبر INSTAPAY وتصفية الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "اسلام فتحي فرج الله",
      "notes": "",
      "phone": "1001143200",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "القاهره عماره 34B كمبوند المعادى فيو - الشروق",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-05T02:04:58.704Z",
    "financials": {
      "codFee": 0,
      "codAmount": 580,
      "netPayout": 520,
      "paidStatus": "settled",
      "shippingFee": 60,
      "insuranceFee": 0,
      "settlementDate": "2026-09-05T02:04:58.704Z"
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-722692",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 580 ج.م",
      "verifiedPin": "8492",
      "recipientName": "اسلام فتحي فرج الله",
      "signatureDate": "٤‏/٩‏/٢٠٢٦، ٧:٠٣:٣٢ م"
    },
    "courierSettledAt": "2026-09-05T02:04:07.549Z",
    "isCourierSettled": true,
    "isMerchantSettled": true,
    "merchantSettledAt": "2026-09-05T02:04:58.704Z"
  },
  {
    "id": "BST-633295",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788364815882-21-xq7w",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814776",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788573658936",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788541802011",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠٨:١٠ م",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 970 ج.م"
      },
      {
        "id": "tl-1788577845242-a1n9",
        "title": "💰 تم تسوية وتوريد العهدة كاش للشركة",
        "status": "delivered",
        "actorRole": "system",
        "timestamp": "٠٨:١٠ م",
        "description": "تم استلام وتوريد صافي العهدة النقدية وتصفية عمولة المندوب (20 ج.م) وتوريد الكاش للخزينة وتصفير الحساب."
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "ياسين محمد",
      "notes": "",
      "phone": "1032102375",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "القاهره دار السلام امام سنتر شهين",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-05T03:10:45.242Z",
    "financials": {
      "codFee": 0,
      "codAmount": 970,
      "netPayout": 910,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-633295",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 970 ج.م",
      "verifiedPin": "8492",
      "recipientName": "ياسين محمد",
      "signatureDate": "٤‏/٩‏/٢٠٢٦، ٨:١٠:٠٢ م"
    },
    "courierSettledAt": "2026-09-05T03:10:45.242Z",
    "isCourierSettled": true
  },
  {
    "id": "BST-313166",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "out_for_delivery",
    "timeline": [
      {
        "id": "tl-1788364815882-22-lh9c",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814776",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788573663972",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٧:٠١ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "الاسم سامح",
      "notes": "",
      "phone": "1119964440",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "عنوان كمبوند المعادي جاردنز بجوار نادي الصيد عماره ٦ د المرحلة الأولى",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-05T02:01:03.972Z",
    "financials": {
      "codFee": 0,
      "codAmount": 920,
      "netPayout": 860,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-313166",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    }
  },
  {
    "id": "BST-543443",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "out_for_delivery",
    "timeline": [
      {
        "id": "tl-1788364815882-23-0f2a",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814776",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788578038872",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٨:١٣ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "Dina Basuony",
      "notes": "",
      "phone": "1002274385",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "دار السلام القاهره عند جامع مهوس",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-05T03:13:58.872Z",
    "financials": {
      "codFee": 0,
      "codAmount": 840,
      "netPayout": 780,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-543443",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    }
  },
  {
    "id": "BST-559796",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "out_for_delivery",
    "timeline": [
      {
        "id": "tl-1788364815882-24-7vpp",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814776",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788578042934",
        "title": "تم تعيين المندوب احمد رشاد",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٨:١٤ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب احمد رشاد (01033011862) للمتابعة والتسليم"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "..",
      "notes": "",
      "phone": "1023392386",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "العنوان 37مساكن الخيالة البساتين القاهره الدور الرابع شقة 44",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-05T03:14:02.934Z",
    "financials": {
      "codFee": 0,
      "codAmount": 840,
      "netPayout": 780,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-559796",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364520004-8809",
      "name": "احمد رشاد",
      "phone": "01033011862",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%A7%D8%AD%D9%85%D8%AF%20%D8%B1%D8%B4%D8%A7%D8%AF&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    }
  },
  {
    "id": "BST-619707",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "out_for_delivery",
    "timeline": [
      {
        "id": "tl-1788364815882-25-bsf1",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814776",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788578046201",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٨:١٤ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "مدام هويدا",
      "notes": "",
      "phone": "1123026542",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "القاهره حدائق المعادي شارع 9 اول ناصية حسنين دسوقي برج الرحمه فوق محل ملابس روائع الدور الثالث شقه رقم 4",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-05T03:14:06.201Z",
    "financials": {
      "codFee": 0,
      "codAmount": 580,
      "netPayout": 520,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-619707",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    }
  },
  {
    "id": "BST-152528",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "out_for_delivery",
    "timeline": [
      {
        "id": "tl-1788364815882-26-5ba8",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814776",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788578049734",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٨:١٤ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "فاطمة كرم",
      "notes": "",
      "phone": "1092901392",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "23محمد خليل منشية المصرى ثكنات المعادى",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-05T03:14:09.734Z",
    "financials": {
      "codFee": 0,
      "codAmount": 580,
      "netPayout": 520,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-152528",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    }
  },
  {
    "id": "BST-367621",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "out_for_delivery",
    "timeline": [
      {
        "id": "tl-1788364815882-27-ebvr",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814776",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788578053015",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٨:١٤ م",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "Manal Sayeb",
      "notes": "",
      "phone": "1127450876",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "دار السلام سور شركه شارع استطلاع الاراضى \\عند صيدله حاتم",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-05T03:14:13.015Z",
    "financials": {
      "codFee": 0,
      "codAmount": 330,
      "netPayout": 270,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-367621",
    "estimatedDeliveryDate": "2026-09-04",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    }
  },
  {
    "id": "BST-515715",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-28-use9",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814776",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "سما احمد",
      "notes": "",
      "phone": "1508441004",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "المقطم الهضبة الوسطى شارع البارون عمارة 1046",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.776Z",
    "financials": {
      "codFee": 0,
      "codAmount": 450,
      "netPayout": 390,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-515715",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-555076",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-29-soh8",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814776",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "عمر صالح",
      "notes": "",
      "phone": "1212140140",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "كورنيش المعادي ابراج عثمان برج ٧ فوق المتوسط الحساب عند الامن",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.777Z",
    "financials": {
      "codFee": 0,
      "codAmount": 580,
      "netPayout": 520,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-555076",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-620920",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-30-9x4s",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814777",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "سميره",
      "notes": "",
      "phone": "1558731886",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "العنوان محافظة الجيزة ارض اللواء شارع المعتمديه شارع الخضار تاني شارع يمين عماره رقم ٩",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.777Z",
    "financials": {
      "codFee": 0,
      "codAmount": 450,
      "netPayout": 390,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-620920",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-535734",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-31-5nov",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814777",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "مدام ولاء عامر احمد",
      "notes": "",
      "phone": "1140643115",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "العنوان المقطم شارع ٩عماره ٤٥شعه ٢٠",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.777Z",
    "financials": {
      "codFee": 0,
      "codAmount": 260,
      "netPayout": 200,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-535734",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-231465",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-32-0g3n",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814777",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "ايمان السيد يونس",
      "notes": "",
      "phone": "1012895660",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "العنوان محافظة القاهره المقطم حي الاسمرات بلوك 19 الجوهره الشقه 15",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.777Z",
    "financials": {
      "codFee": 0,
      "codAmount": 260,
      "netPayout": 200,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-231465",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-237828",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-33-6h9r",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814777",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "ام زياد",
      "notes": "",
      "phone": "1030760115",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "القاهرة 6 شارع عزت سلطان بير ام سلطان- البساتين خلف مسجد مهويس",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.777Z",
    "financials": {
      "codFee": 0,
      "codAmount": 450,
      "netPayout": 390,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-237828",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-336905",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-34-si5h",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814777",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "سهام رجب",
      "notes": "",
      "phone": "1064657758",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "15 شارع 68ب حدائق المعادي",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.777Z",
    "financials": {
      "codFee": 0,
      "codAmount": 330,
      "netPayout": 270,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-336905",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-428675",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-35-q4zg",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814777",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "عبدالنعيم احمد",
      "notes": "",
      "phone": "1099690368",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "13 ش السيد علي متفرع من ش المشير احمد اسماعيل دار السلام القاهره",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.777Z",
    "financials": {
      "codFee": 0,
      "codAmount": 1370,
      "netPayout": 1310,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-428675",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-927727",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-36-v5zx",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814777",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "ولاء نا صر",
      "notes": "",
      "phone": "1145794401",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "العنوان محافظة القاهرة جنوب الاكاديميه فيلا 45 التجمع الخامس",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.777Z",
    "financials": {
      "codFee": 0,
      "codAmount": 460,
      "netPayout": 390,
      "paidStatus": "pending",
      "shippingFee": 70,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-927727",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-136036",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-37-26a4",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814777",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "محمد عمر",
      "notes": "",
      "phone": "1143466433",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "جنوب القاهرة كوستيا ارض نوار شارع حنفى الشيخ المتفرع من شارع نور الهدى بجوار كشرى فارس طره الحجارة طريق مصر حلوان الزراعي",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.778Z",
    "financials": {
      "codFee": 0,
      "codAmount": 460,
      "netPayout": 390,
      "paidStatus": "pending",
      "shippingFee": 70,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-136036",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-893238",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-38-a42h",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814778",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "احمد عبدالله امام",
      "notes": "",
      "phone": "201228772773",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "2ش الازهار متفرع من نور الدين عرب المعادى",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.778Z",
    "financials": {
      "codFee": 0,
      "codAmount": 260,
      "netPayout": 200,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-893238",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-894174",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-39-s4l2",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814778",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "Mohammed Kattoah",
      "notes": "",
      "phone": "1055999003",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "الدوقي حي المساحه عمارة٣١ الدور ٦",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.778Z",
    "financials": {
      "codFee": 0,
      "codAmount": 1210,
      "netPayout": 1150,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-894174",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-311789",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-40-4cri",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814778",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "مبارك فكري",
      "notes": "",
      "phone": "1111359758",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "المعادي ابراج عثمان برج 1 متوسط\\\\\\ادور الارضي \\",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.778Z",
    "financials": {
      "codFee": 0,
      "codAmount": 580,
      "netPayout": 520,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-311789",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-460427",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-41-muiz",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814778",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "ام كنزي",
      "notes": "",
      "phone": "1154431527",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "القاهره..دار السلام كورنيش..11ش سيد عبد الكريم متفرع من ش العروبه..",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.778Z",
    "financials": {
      "codFee": 0,
      "codAmount": 580,
      "netPayout": 520,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-460427",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-248160",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-42-sfxz",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814778",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "جيسي عادل",
      "notes": "",
      "phone": "1002962999",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "قاهره حدائق حلوان ٢شارع الظاهر بيبرس تقسيم فريد ذكي بعد سوبر ماركت اسواق الخير ب ٤عماير برج اصفر طويل دور تاسع شقه تسعه",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.778Z",
    "financials": {
      "codFee": 0,
      "codAmount": 530,
      "netPayout": 470,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-248160",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-720323",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-43-p3h5",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814778",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "فريال عبد الحميد فراج",
      "notes": "",
      "phone": "1095697015",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "16 احمد حسن من سلامه عفيفى الزاويه الحمراء",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.778Z",
    "financials": {
      "codFee": 0,
      "codAmount": 330,
      "netPayout": 270,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-720323",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-991501",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788364815882-44-eir7",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٧:٠٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788400814778",
        "title": "✅ تم موافقة وتأكيد الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٧:٠٠ م",
        "description": "تمت الموافقة وتأكيد الأوردر ضمن الموافقة الجماعية بواسطة أدمن النظام"
      }
    ],
    "createdAt": "2026-09-02T16:00:15.877Z",
    "recipient": {
      "city": "القاهرة",
      "name": "احمد كارم محمد",
      "notes": "",
      "phone": "1099894421",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "١٩شارع حنفي محمد البساتين بجوار مسجد السلام",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-03T02:00:14.778Z",
    "financials": {
      "codFee": 0,
      "codAmount": 330,
      "netPayout": 270,
      "paidStatus": "pending",
      "shippingFee": 60,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 2,
      "description": "ملابس",
      "allowOpening": true
    },
    "trackingNumber": "BST-991501",
    "estimatedDeliveryDate": "2026-09-04"
  },
  {
    "id": "BST-318207",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "ام فاتن",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "created",
    "timeline": [
      {
        "id": "tl-1788542402595-0-7ncu",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠٨:٢٠ م",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788578424020",
        "title": "✅ تم تأكيد وموافقة الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠٨:٢٠ م",
        "description": "قام أدمن النظام بمراجعة بيانات الشحنة وتأكيدها لبدء التنفيذ والاستلام"
      }
    ],
    "createdAt": "2026-09-04T17:20:02.595Z",
    "recipient": {
      "city": "المطرية",
      "name": "محمد ",
      "notes": "بعد الساعه ٤ ",
      "phone": "0113426544",
      "district": "شارع مصدق ",
      "buildingNo": "١٥20",
      "apartmentNo": "١شقه ١",
      "governorate": "القاهرة",
      "streetAddress": "Hkg",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-05T03:20:24.020Z",
    "financials": {
      "codFee": 0,
      "codAmount": 1200,
      "netPayout": 1155,
      "paidStatus": "pending",
      "shippingFee": 45,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "ملابس من بامبرنج",
      "allowOpening": true
    },
    "trackingNumber": "BST-318207",
    "estimatedDeliveryDate": "2026-09-06"
  },
  {
    "id": "BST-235295",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "To you",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788855671443-0-tn2y",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٢١ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788855918597",
        "title": "تم تأكيد واعتماد الشحنة",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٢٥ ص",
        "description": "تمت مراجعة وتأكيد الأوردر بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788856875971",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٤١ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1789084783870",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "courier",
        "timestamp": "٠٢:٥٩ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 400 ج.م"
      }
    ],
    "createdAt": "2026-09-08T08:21:11.443+00:00",
    "recipient": {
      "city": "عين شمس",
      "name": "عميل (عين شمس)",
      "notes": "",
      "phone": "0100323152",
      "district": "",
      "buildingNo": "24",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "امام مخليف",
      "secondaryPhone": "01119662941"
    },
    "updatedAt": "2026-09-12T16:00:11.273+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 400,
      "netPayout": 330,
      "paidStatus": "pending",
      "shippingFee": 70,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "اله حاسبه",
      "allowOpening": true
    },
    "trackingNumber": "BST-235295",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 400 ج.م",
      "verifiedPin": "8492",
      "recipientName": "،",
      "signatureDate": "١١‏/٩‏/٢٠٢٦، ٢:٥٩:٤٣ ص"
    },
    "estimatedDeliveryDate": "2026-09-10"
  },
  {
    "id": "BST-299804",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "To you",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "out_for_delivery",
    "timeline": [
      {
        "id": "tl-1788856122392-0-6a82",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٢٨ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788856171864",
        "title": "تم تأكيد واعتماد الشحنة",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٢٩ ص",
        "description": "تمت مراجعة وتأكيد الأوردر بواسطة أدمن النظام"
      },
      {
        "id": "tl-1789121244159",
        "title": "تم تعيين المندوب احمد رشاد",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٣:٠٧ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب احمد رشاد (01033011862) للمتابعة والتسليم"
      },
      {
        "id": "tl-1789121257848",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٣:٠٧ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      }
    ],
    "createdAt": "2026-09-08T08:28:42.392+00:00",
    "recipient": {
      "city": "الخصوص",
      "name": "عميل (الخصوص)",
      "notes": "",
      "phone": "01110699388",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "احمد عرابي امام صيدليه الشيما",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-12T16:00:11.273+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 400,
      "netPayout": 330,
      "paidStatus": "pending",
      "shippingFee": 70,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "طرد ملابس واكسسوارات",
      "allowOpening": true
    },
    "trackingNumber": "BST-299804",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "estimatedDeliveryDate": "2026-09-10"
  },
  {
    "id": "BST-763676",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "To you",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788855330409-0-w6z2",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:١٥ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788855906314",
        "title": "تم تأكيد واعتماد الشحنة",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٢٥ ص",
        "description": "تمت مراجعة وتأكيد الأوردر بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788856885604",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٤١ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1789084791158",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "courier",
        "timestamp": "٠٢:٥٩ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 215 ج.م"
      }
    ],
    "createdAt": "2026-09-08T08:15:30.409+00:00",
    "recipient": {
      "city": "المقطم",
      "name": "عميل (المقطم)",
      "notes": "",
      "phone": "01024587521",
      "district": "",
      "buildingNo": "122",
      "apartmentNo": "15",
      "governorate": "القاهرة",
      "streetAddress": "حي الفردوس الاسمرات",
      "secondaryPhone": "01025196590"
    },
    "updatedAt": "2026-09-12T16:00:11.273+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 215,
      "netPayout": 145,
      "paidStatus": "pending",
      "shippingFee": 70,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "اله حاسبه",
      "allowOpening": true
    },
    "trackingNumber": "BST-763676",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 215 ج.م",
      "verifiedPin": "8492",
      "recipientName": ".",
      "signatureDate": "١١‏/٩‏/٢٠٢٦، ٢:٥٩:٥١ ص"
    },
    "estimatedDeliveryDate": "2026-09-10"
  },
  {
    "id": "BST-769320",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "To you",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788856342287-0-9a9j",
        "title": "✨ تم إنشاء وتأكيد بوليصة الشحن بنجاح",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٣٢ ص",
        "description": "تم إنشاء الشحنة وتأكيدها فوراً بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788856862484",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٤١ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1789084729247",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "courier",
        "timestamp": "٠٢:٥٨ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 400 ج.م"
      }
    ],
    "createdAt": "2026-09-08T08:32:22.287+00:00",
    "recipient": {
      "city": "الشرابية",
      "name": "عميل (الشرابية)",
      "notes": "",
      "phone": "01275016104",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "،",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-12T16:00:11.273+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 400,
      "netPayout": 330,
      "paidStatus": "pending",
      "shippingFee": 70,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "اله حاسبه",
      "allowOpening": true
    },
    "trackingNumber": "BST-769320",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 400 ج.م",
      "verifiedPin": "8492",
      "recipientName": ".",
      "signatureDate": "١١‏/٩‏/٢٠٢٦، ٢:٥٨:٤٩ ص"
    },
    "estimatedDeliveryDate": "2026-09-10"
  },
  {
    "id": "BST-515492",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "To you",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "out_for_delivery",
    "timeline": [
      {
        "id": "tl-1788856287740-0-qj8t",
        "title": "✨ تم إنشاء وتأكيد بوليصة الشحن بنجاح",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٣١ ص",
        "description": "تم إنشاء الشحنة وتأكيدها فوراً بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788856864867",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٤١ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      }
    ],
    "createdAt": "2026-09-08T08:31:27.74+00:00",
    "recipient": {
      "city": "مسطرد",
      "name": "عميل (مسطرد)",
      "notes": "",
      "phone": "01012800981",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "عند جامع السنيه",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-12T16:00:11.273+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 400,
      "netPayout": 330,
      "paidStatus": "pending",
      "shippingFee": 70,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "اله حاسبه",
      "allowOpening": true
    },
    "trackingNumber": "BST-515492",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "estimatedDeliveryDate": "2026-09-10"
  },
  {
    "id": "BST-252066",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "To you",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788855544594-0-el2u",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:١٩ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788855921463",
        "title": "تم تأكيد واعتماد الشحنة",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٢٥ ص",
        "description": "تمت مراجعة وتأكيد الأوردر بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788856878983",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٤١ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1789084805859",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "courier",
        "timestamp": "٠٣:٠٠ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 400 ج.م"
      }
    ],
    "createdAt": "2026-09-08T08:19:04.593+00:00",
    "recipient": {
      "city": "عين شمس",
      "name": "عميل (عين شمس)",
      "notes": "",
      "phone": "01023286900",
      "district": "",
      "buildingNo": "52",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "الامام مالك الحرفيين من جمال عبد الناصر ",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-12T16:00:11.273+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 400,
      "netPayout": 330,
      "paidStatus": "pending",
      "shippingFee": 70,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "اله حاسبه",
      "allowOpening": true
    },
    "trackingNumber": "BST-252066",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 400 ج.م",
      "verifiedPin": "8492",
      "recipientName": ",",
      "signatureDate": "١١‏/٩‏/٢٠٢٦، ٣:٠٠:٠٥ ص"
    },
    "estimatedDeliveryDate": "2026-09-10"
  },
  {
    "id": "BST-211225",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "To you",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788855772838-0-47kf",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٢٢ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788855915048",
        "title": "تم تأكيد واعتماد الشحنة",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٢٥ ص",
        "description": "تمت مراجعة وتأكيد الأوردر بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788856873321",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٤١ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1789085005144",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "courier",
        "timestamp": "٠٣:٠٣ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 400 ج.م"
      }
    ],
    "createdAt": "2026-09-08T08:22:52.838+00:00",
    "recipient": {
      "city": "عين شمس",
      "name": "عميل (عين شمس)",
      "notes": "",
      "phone": "01119636294",
      "district": "",
      "buildingNo": "19",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "عمر بن الخطاب من مصطفي حافظ امام كبابجي الحشر",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-12T16:00:11.273+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 400,
      "netPayout": 330,
      "paidStatus": "pending",
      "shippingFee": 70,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "اله حاسبه",
      "allowOpening": true
    },
    "trackingNumber": "BST-211225",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 400 ج.م",
      "verifiedPin": "8492",
      "recipientName": ",",
      "signatureDate": "١١‏/٩‏/٢٠٢٦، ٣:٠٣:٢٥ ص"
    },
    "estimatedDeliveryDate": "2026-09-10"
  },
  {
    "id": "BST-202841",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "To you",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "out_for_delivery",
    "timeline": [
      {
        "id": "tl-1788818910241-0-4zu6",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٠٨ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788854940080",
        "title": "تم تأكيد واعتماد الشحنة",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٠٩ ص",
        "description": "تمت مراجعة وتأكيد الأوردر بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788856893020",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٤١ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788856929372",
        "title": "تم تأكيد واعتماد الشحنة",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٤٢ ص",
        "description": "تم التحديث بواسطة نظام A&Mshipping الإداري"
      },
      {
        "id": "tl-1788856964121",
        "title": "تحديث حالة الشحنة",
        "status": "picked_up",
        "actorRole": "system",
        "timestamp": "٠١:٤٢ ص",
        "description": "تم التحديث بواسطة نظام A&Mshipping الإداري"
      },
      {
        "id": "tl-1788856994580",
        "title": "وصلت المستودع الرئيسي",
        "status": "in_hub",
        "actorRole": "system",
        "timestamp": "٠١:٤٣ ص",
        "description": "تم التحديث بواسطة نظام A&Mshipping الإداري"
      },
      {
        "id": "tl-1788857028263",
        "title": "بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "system",
        "timestamp": "٠١:٤٣ ص",
        "description": "تم التحديث بواسطة نظام A&Mshipping الإداري"
      },
      {
        "id": "tl-1788857032311",
        "title": "✅ تم تأكيد وموافقة الأوردر بواسطة الأدمن",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٤٣ ص",
        "description": "قام أدمن النظام بمراجعة بيانات الشحنة وتأكيدها لبدء التنفيذ والاستلام"
      },
      {
        "id": "tl-1789121240885",
        "title": "تم تعيين المندوب احمد رشاد",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٣:٠٧ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب احمد رشاد (01033011862) للمتابعة والتسليم"
      },
      {
        "id": "tl-1789121261379",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠٣:٠٧ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      }
    ],
    "createdAt": "2026-09-07T22:08:30.241+00:00",
    "recipient": {
      "city": "فيصل",
      "name": "عميل (فيصل)",
      "notes": "",
      "phone": "01550632912",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "كفر طهرمس عند التأمين الصحي الشبراوي ",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-12T16:00:11.273+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 800,
      "netPayout": 730,
      "paidStatus": "pending",
      "shippingFee": 70,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "طرد ملابس واكسسوارات",
      "allowOpening": true
    },
    "trackingNumber": "BST-202841",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "estimatedDeliveryDate": "2026-09-09"
  },
  {
    "id": "BST-766998",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "To you",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788855215872-0-8wym",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:١٣ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788855902147",
        "title": "تم تأكيد واعتماد الشحنة",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٢٥ ص",
        "description": "تمت مراجعة وتأكيد الأوردر بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788856888838",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٤١ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788863095743",
        "title": "محاولة تسليم غير ناجحة",
        "status": "failed_attempt",
        "actorRole": "courier",
        "timestamp": "٠١:٢٤ م",
        "description": "محاولة تسليم غير ناجحة بواسطة المندوب حسن علي: رفض الاستلام بسبب السعر"
      },
      {
        "id": "tl-1789085222692",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "courier",
        "timestamp": "٠٣:٠٧ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 400 ج.م"
      }
    ],
    "createdAt": "2026-09-08T08:13:35.872+00:00",
    "recipient": {
      "city": "المقطم",
      "name": "عميل (المقطم)",
      "notes": "",
      "phone": "01003021318",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "اللوتس ناحيه مساكن مصر العليا ",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-12T16:00:11.273+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 400,
      "netPayout": 330,
      "paidStatus": "pending",
      "shippingFee": 70,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "اله حاسبه",
      "allowOpening": true
    },
    "trackingNumber": "BST-766998",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 400 ج.م",
      "verifiedPin": "8492",
      "recipientName": ".",
      "signatureDate": "١١‏/٩‏/٢٠٢٦، ٣:٠٧:٠٢ ص"
    },
    "estimatedDeliveryDate": "2026-09-10"
  },
  {
    "id": "BST-532460",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "To you",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788855443192-0-7ovb",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:١٧ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788855924348",
        "title": "تم تأكيد واعتماد الشحنة",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٢٥ ص",
        "description": "تمت مراجعة وتأكيد الأوردر بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788856881904",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٤١ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1788822406798",
        "title": "مرتجع للتاجر (مستحقات التاجر 0 ج.م)",
        "status": "returned",
        "actorRole": "courier",
        "timestamp": "٠٢:٠٦ ص",
        "description": "مرتجع بواسطة حسن علي (دفع كامل الشحن 70 ج.م - الخصم من التاجر 0 ج.م): رفض استلام الطرد نهائياً"
      },
      {
        "id": "tl-1788822449148",
        "title": "محاولة تسليم غير ناجحة",
        "status": "failed_attempt",
        "actorRole": "courier",
        "timestamp": "٠٢:٠٧ ص",
        "description": "محاولة تسليم غير ناجحة بواسطة المندوب حسن علي: رفض الاستلام بسبب السعر"
      },
      {
        "id": "tl-1788822564423",
        "title": "محاولة تسليم غير ناجحة",
        "status": "failed_attempt",
        "actorRole": "courier",
        "timestamp": "٠٢:٠٩ ص",
        "description": "محاولة تسليم غير ناجحة بواسطة المندوب حسن علي: رفض الاستلام بسبب السعر"
      },
      {
        "id": "tl-1789085230243",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "courier",
        "timestamp": "٠٣:٠٧ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 70 ج.م"
      }
    ],
    "createdAt": "2026-09-08T08:17:23.191+00:00",
    "recipient": {
      "city": "مدينة نصر",
      "name": "عميل (مدينة نصر)",
      "notes": "",
      "phone": "01155700073",
      "district": "",
      "buildingNo": "69",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "الحي التامن عمارات التعاونيات",
      "secondaryPhone": "01260022274"
    },
    "updatedAt": "2026-09-12T16:00:11.273+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 70,
      "netPayout": 0,
      "paidStatus": "pending",
      "shippingFee": 70,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "طرد ملابس واكسسوارات",
      "allowOpening": true
    },
    "refusedDetails": {
      "reason": "رفض استلام الطرد نهائياً",
      "amountCollected": 70,
      "shippingFeePaid": true,
      "merchantDeductedAmount": 0,
      "partialShippingFeePaid": false
    },
    "trackingNumber": "BST-532460",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 70 ج.م",
      "verifiedPin": "8492",
      "recipientName": ",",
      "signatureDate": "١١‏/٩‏/٢٠٢٦، ٣:٠٧:١٠ ص"
    },
    "estimatedDeliveryDate": "2026-09-10"
  },
  {
    "id": "BST-408088",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "To you",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788855895707-0-5id6",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٢٤ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788855911764",
        "title": "تم تأكيد واعتماد الشحنة",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٢٥ ص",
        "description": "تمت مراجعة وتأكيد الأوردر بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788856870387",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٤١ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1789084767951",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "courier",
        "timestamp": "٠٢:٥٩ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 400 ج.م"
      }
    ],
    "createdAt": "2026-09-08T08:24:55.707+00:00",
    "recipient": {
      "city": "المطرية",
      "name": "عميل (المطرية)",
      "notes": "",
      "phone": "01100386414",
      "district": "",
      "buildingNo": "16",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "ترعه الترابي جنب جامع عمر بن الخطاب ",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-12T16:00:11.273+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 400,
      "netPayout": 330,
      "paidStatus": "pending",
      "shippingFee": 70,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "اله حاسبه",
      "allowOpening": true
    },
    "trackingNumber": "BST-408088",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 400 ج.م",
      "verifiedPin": "8492",
      "recipientName": "،",
      "signatureDate": "١١‏/٩‏/٢٠٢٦، ٢:٥٩:٢٧ ص"
    },
    "estimatedDeliveryDate": "2026-09-10"
  },
  {
    "id": "BST-999306",
    "sender": {
      "id": "USR-1788361785496-4492",
      "city": "مدينة نصر",
      "phone": "01017266727",
      "storeName": "To you",
      "contactName": "To you",
      "governorate": "القاهرة",
      "pickupAddress": "مكرم عبيد، بجوار سيتي ستارز"
    },
    "status": "delivered",
    "timeline": [
      {
        "id": "tl-1788854695018-0-jjcz",
        "title": "⏳ طلب جديد - بانتظار موافقة الأدمن",
        "status": "pending_approval",
        "actorRole": "merchant",
        "timestamp": "٠١:٠٤ ص",
        "description": "تم إضافة الأوردر بواسطة التاجر (يدوياً أو عبر ملف إكسيل) وهي بانتظار اعتماد وموافقة الأدمن"
      },
      {
        "id": "tl-1788854751574",
        "title": "تم تأكيد واعتماد الشحنة",
        "status": "created",
        "actorRole": "system",
        "timestamp": "٠١:٠٥ ص",
        "description": "تمت مراجعة وتأكيد الأوردر بواسطة أدمن النظام"
      },
      {
        "id": "tl-1788856901503",
        "title": "تم تعيين المندوب حسن علي",
        "status": "out_for_delivery",
        "actorRole": "hub",
        "timestamp": "٠١:٤١ ص",
        "description": "تم إسناد الشحنة رسمياً للمندوب حسن علي (01093383328) للمتابعة والتسليم"
      },
      {
        "id": "tl-1789084799508",
        "title": "تم التسليم بنجاح وتحصيل المبلغ",
        "status": "delivered",
        "actorRole": "courier",
        "timestamp": "٠٢:٥٩ ص",
        "description": "تم التسليم بنجاح بواسطة المندوب حسن علي وتحصيل المبلغ 400 ج.م"
      }
    ],
    "createdAt": "2026-09-08T08:04:55.018+00:00",
    "recipient": {
      "city": "العبور",
      "name": "عميل (العبور)",
      "notes": "",
      "phone": "01156763990",
      "district": "",
      "buildingNo": "",
      "apartmentNo": "",
      "governorate": "القاهرة",
      "streetAddress": "الحي الثامن كمبوند الشركه السعوديه",
      "secondaryPhone": ""
    },
    "updatedAt": "2026-09-12T16:00:11.273+00:00",
    "financials": {
      "codFee": 0,
      "codAmount": 400,
      "netPayout": 330,
      "paidStatus": "pending",
      "shippingFee": 70,
      "insuranceFee": 0
    },
    "assignedHub": "مستودع القاهرة الرئيسي - رمسيس",
    "deliveryType": "standard",
    "packageDetails": {
      "weightKg": 1.5,
      "isFragile": false,
      "itemsCount": 1,
      "description": "اله حاسبه",
      "allowOpening": true
    },
    "trackingNumber": "BST-999306",
    "assignedCourier": {
      "id": "USR-1788364242163-4812",
      "name": "حسن علي",
      "phone": "01093383328",
      "rating": 5,
      "vehicle": "motocycle",
      "photoUrl": "https://ui-avatars.com/api/?name=%D8%AD%D8%B3%D9%86%20%D8%B9%D9%84%D9%8A&background=dc2626&color=ffffff",
      "assignedHub": "المستودع الرئيسي",
      "codCollectedToday": 0,
      "activeShipmentsCount": 0
    },
    "proofOfDelivery": {
      "note": "تم التسليم بنجاح بترميز التأكيد (8492) وتحصيل المبلغ 400 ج.م",
      "verifiedPin": "8492",
      "recipientName": ".",
      "signatureDate": "١١‏/٩‏/٢٠٢٦، ٢:٥٩:٥٩ ص"
    },
    "estimatedDeliveryDate": "2026-09-10"
  }
];

export const INITIAL_COMPANY_TRANSACTIONS: CompanyTransaction[] = [];

