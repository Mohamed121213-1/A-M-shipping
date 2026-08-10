/**
 * WhatsApp Helper Utilities for Bosta Delivery Platform
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

export function generateWhatsAppLink(phone: string, text: string): string {
  const formattedPhone = formatPhoneNumberForWhatsApp(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

export interface WhatsAppTemplateData {
  recipientName: string;
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
      } ستكون معك للتسليم غداً بإذن الله 📦.\n💵 المطلوب عند الاستلام: ${
        data.codAmount ?? 0
      } ج.م.\n📍 يرجى إرسال موقعك (اللوكيشن) هنا عبر الواتساب لتأكيد العنوان وسرعة الوصول إليك.\nشكراً لك!`,
  },
  {
    id: 'out_for_delivery',
    title: 'تنبيه الشحنة مع المندوب 🚚',
    getMessage: (data: WhatsAppTemplateData) =>
      `أهلاً بك أ/ ${data.recipientName} 👋\nشحنتك رقم #${data.trackingNumber} ${
        data.storeName ? `من (${data.storeName})` : ''
      } خرجت الآن للتسليم معك مع المندوب ${
        data.courierName ? `كابتن ${data.courierName}` : ''
      }.\n💵 المبلغ المطلوب كاش عند الاستلام: ${
        data.codAmount ?? 0
      } ج.م.\nيرجى التواجد بفرع/عنوان الاستلام. شكراً لتعاملك معنا!`,
  },
  {
    id: 'tracking_link',
    title: 'رابط تتبع الشحنة 📱',
    getMessage: (data: WhatsAppTemplateData) =>
      `أهلاً بك أ/ ${data.recipientName} 👋\nيمكنك متابعة خط سير وموعد وصول شحنتك رقم #${
        data.trackingNumber
      } لحظة بلحظة عبر منصة A&M shipping من خلال هذا الرابط:\n${window.location.origin}/?tracking=${data.trackingNumber}`,
  },
  {
    id: 'arrival_notice',
    title: 'المندوب وصل أسفل العقار 📍',
    getMessage: (data: WhatsAppTemplateData) =>
      `أهلاً أ/ ${data.recipientName}، كابتن التوصيل متواجد الآن بالعنوان لتسليم شحنتك رقم #${data.trackingNumber}. يرجى التكرم بالاستلام أو التواصل معه.`,
  },
  {
    id: 'delivery_confirm',
    title: 'تأكيد الموعد والتسليم 📅',
    getMessage: (data: WhatsAppTemplateData) =>
      `مرحباً أ/ ${data.recipientName} 👋\nنود التأكيد على جاهزيتك لاستلام طرد شحنة #${data.trackingNumber} بقيمة ${
        data.codAmount ?? 0
      } ج.م. يسعدنا تأكيد موافقتك لإرسال المندوب فوراً.`,
  },
];
