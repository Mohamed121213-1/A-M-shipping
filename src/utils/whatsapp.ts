import { AddressInfo, PackageDetails } from '../types';

/**
 * WhatsApp Helper Utilities for Delivery Platform
 */

export function formatPhoneNumberForWhatsApp(phone: string): string {
  // Clean non-digits
  let cleaned = phone.replace(/\D/g, '');

  // If local Egyptian number starting with 01 (11 digits e.g. 01012345678)
  if (cleaned.startsWith('01') && cleaned.length === 11) {
    return `20${cleaned.slice(1)}`;
  }

  // If local Egyptian number without leading 0 (10 digits e.g. 1012345678)
  if (cleaned.startsWith('1') && cleaned.length === 10) {
    return `20${cleaned}`;
  }

  // If already starts with 20 (e.g. 201012345678)
  if (cleaned.startsWith('20') && cleaned.length === 12) {
    return cleaned;
  }

  return cleaned;
}

export function formatFullAddress(recipient: AddressInfo): string {
  if (!recipient) return 'العنوان المسجل لدى المتجر';
  const parts: string[] = [];

  if (recipient.governorate) parts.push(recipient.governorate);
  if (recipient.city && recipient.city !== recipient.governorate) parts.push(recipient.city);
  if (recipient.district && recipient.district !== recipient.city) parts.push(recipient.district);
  if (recipient.streetAddress) parts.push(recipient.streetAddress);

  const buildingParts: string[] = [];
  if (recipient.buildingNo) buildingParts.push(`عمارة/رقم ${recipient.buildingNo}`);
  if (recipient.apartmentNo) buildingParts.push(`شقة/دور ${recipient.apartmentNo}`);
  if (buildingParts.length > 0) parts.push(buildingParts.join('، '));

  if (recipient.notes && recipient.notes.trim()) {
    parts.push(`(علامة مميزة: ${recipient.notes.trim()})`);
  }

  return parts.filter(Boolean).join(' - ') || 'العنوان المسجل لدى المتجر';
}

export function formatProductDetails(pkg?: PackageDetails): string {
  if (!pkg) return 'طرد مغلف';
  const desc = pkg.description && pkg.description.trim() ? pkg.description.trim() : 'طرد مغلف';
  const countStr = pkg.itemsCount && pkg.itemsCount > 1 ? ` (${pkg.itemsCount} قطع)` : '';
  return `${desc}${countStr}`;
}

export function generateWhatsAppLink(phone: string, text: string): string {
  const formattedPhone = formatPhoneNumberForWhatsApp(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

export interface WhatsAppTemplateData {
  recipientName: string;
  recipientPhone?: string;
  recipientAddress?: string; // العنوان كامل بالتفصيل
  productType?: string;      // نوع ومحتوى المنتج
  itemsCount?: number;
  allowOpening?: boolean;
  trackingNumber: string;
  storeName?: string;
  codAmount?: number;
  courierName?: string;
  courierPhone?: string;
}

export const WHATSAPP_TEMPLATES = [
  {
    id: 'tomorrow_delivery_location',
    title: 'تنبيه وصول الغد + طلب اللوكيشن 📍',
    getMessage: (data: WhatsAppTemplateData) =>
      `أهلاً بك أ/ ${data.recipientName} 👋\nمعاك كابتن ${
        data.courierName ? `${data.courierName}` : 'التوصيل'
      } من شركة الشحن 🚚\nنود إفادتك بأن شحنتك رقم #${data.trackingNumber} ${
        data.storeName ? `من (${data.storeName})` : ''
      } ستكون معك للتسليم غداً بإذن الله 📦.\n\n📦 نوع ومحتوى المنتج: ${
        data.productType || 'طرد مغلف'
      }\n📍 عنوان التسليم المسجل: ${
        data.recipientAddress || 'العنوان المسجل لدى المتجر'
      }\n💵 المطلوب كاش عند الاستلام: ${
        data.codAmount ?? 0
      } ج.م.\n${
        data.allowOpening ? '✨ مسموح بمعاينة وفتح الشحنة للتأكد قبل الدفع\n' : ''
      }\n📍 يرجى إرسال موقعك (اللوكيشن) هنا عبر الواتساب لتأكيد العنوان وسرعة الوصول إليك بدقة.\nشكراً لك!`,
  },
  {
    id: 'out_for_delivery',
    title: 'تنبيه الشحنة مع المندوب الآن 🚚',
    getMessage: (data: WhatsAppTemplateData) =>
      `أهلاً بك أ/ ${data.recipientName} 👋\nشحنتك رقم #${data.trackingNumber} ${
        data.storeName ? `من (${data.storeName})` : ''
      } خرجت الآن للتسليم معك مع المندوب ${
        data.courierName ? `كابتن ${data.courierName}` : 'كابتن التوصيل'
      } 🚚.\n\n📦 نوع ومحتوى المنتج: ${
        data.productType || 'طرد مغلف'
      }\n📍 العنوان المتجه إليه: ${
        data.recipientAddress || 'العنوان المسجل لدى المتجر'
      }\n💵 المبلغ المطلوب كاش عند الاستلام: ${
        data.codAmount ?? 0
      } ج.م.\n${
        data.allowOpening ? '✨ مسموح بفحص ومعاينة الشحنة قبل الاستلام\n' : ''
      }\nيرجى التواجد بالعنوان لسرعة الاستلام. شكراً لتعاملك معنا!`,
  },
  {
    id: 'arrival_notice',
    title: 'المندوب وصل أسفل العقار 📍',
    getMessage: (data: WhatsAppTemplateData) =>
      `أهلاً أ/ ${data.recipientName} 👋\nكابتن التوصيل ${
        data.courierName ? `(${data.courierName})` : ''
      } متواجد الآن بالعنوان لتسليم شحنتك:\n📍 العنوان: ${
        data.recipientAddress || 'العنوان المسجل'
      }\n📦 نوع المنتج: ${
        data.productType || 'طرد مغلف'
      }\n🔢 رقم الشحنة: #${data.trackingNumber}\n💵 المبلغ المطلوب: ${
        data.codAmount ?? 0
      } ج.م.\n\nيرجى التكرم بالاستلام أو التواصل معي هاتفياً. شكراً لك!`,
  },
  {
    id: 'delivery_confirm',
    title: 'تأكيد الموعد والعنوان 📅',
    getMessage: (data: WhatsAppTemplateData) =>
      `مرحباً أ/ ${data.recipientName} 👋\nمعاك كابتن ${
        data.courierName || 'التوصيل'
      } من شركة الشحن.\nنود التأكيد على بيانات وموعد تسليم طرد شحنة رقم #${data.trackingNumber} ${
        data.storeName ? `من (${data.storeName})` : ''
      }:\n📦 نوع ومحتوى المنتج: ${
        data.productType || 'طرد مغلف'
      }\n📍 عنوان التسليم: ${
        data.recipientAddress || 'العنوان المسجل'
      }\n💵 المبلغ المطلوب كاش: ${
        data.codAmount ?? 0
      } ج.م.\n\nيسعدنا تأكيد تواجدك بالعنوان لنصل إليك مباشرة.`,
  },
  {
    id: 'tracking_link',
    title: 'رابط التتبع والبيانات 📱',
    getMessage: (data: WhatsAppTemplateData) =>
      `أهلاً بك أ/ ${data.recipientName} 👋\nبيانات شحنتك رقم #${data.trackingNumber} ${
        data.storeName ? `من (${data.storeName})` : ''
      }:\n📦 نوع ومحتوى المنتج: ${
        data.productType || 'طرد مغلف'
      }\n📍 عنوان التسليم: ${
        data.recipientAddress || 'العنوان المسجل'
      }\n💵 المبلغ المطلوب عند الاستلام: ${
        data.codAmount ?? 0
      } ج.م.\n\nيمكنك متابعة خط سير الشحنة لحظة بلحظة عبر الرابط التالي:\n${
        typeof window !== 'undefined' ? window.location.origin : ''
      }/?tracking=${data.trackingNumber}`,
  },
];
