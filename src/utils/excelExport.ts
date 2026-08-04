import * as XLSX from 'xlsx';
import { Shipment } from '../types';

/**
 * Exports an array of Shipment objects to an Excel file (.xlsx) with Arabic headings.
 */
export const exportShipmentsToExcel = (
  shipments: Shipment[],
  fileNamePrefix = 'اوردرات_الشحن'
) => {
  if (!shipments || shipments.length === 0) {
    alert('لا توجد أوردرات لتصديرها إلى شيت إكسيل');
    return;
  }

  const data = shipments.map((s, index) => {
    let statusAr = 'جديدة';
    switch (s.status) {
      case 'pending_approval':
        statusAr = 'بانتظار موافقة الأدمن';
        break;
      case 'created':
        statusAr = 'تم الإنشاء';
        break;
      case 'pickup_requested':
        statusAr = 'طلب بيك أب';
        break;
      case 'picked_up':
        statusAr = 'تم الاستلام من التاجر';
        break;
      case 'in_hub':
        statusAr = 'في المستودع';
        break;
      case 'out_for_delivery':
        statusAr = 'مع المندوب (قيد التوصيل)';
        break;
      case 'delivered':
        statusAr = 'تم التسليم';
        break;
      case 'partial_delivery':
        statusAr = 'استلام جزئي';
        break;
      case 'refused':
        statusAr = s.refusedDetails?.shippingFeePaid ? 'مرفوض (دفع الشحن)' : 'مرفوض (لم يدفع الشحن)';
        break;
      case 'failed_attempt':
        statusAr = 'محاولة فاشلة';
        break;
      case 'returned':
        statusAr = 'مرتجع';
        break;
      case 'cancelled':
        statusAr = 'ملغاة';
        break;
    }

    return {
      'م': index + 1,
      'رقم البوليصة (AWB)': s.trackingNumber,
      'تاريخ الطلب': new Date(s.createdAt).toLocaleDateString('ar-EG'),
      'التاجر / المتجر': s.sender?.storeName || s.sender?.contactName || 'غير محدد',
      'هاتف التاجر': s.sender?.phone || '-',
      'اسم المستلم': s.recipient.name,
      'هاتف المستلم': s.recipient.phone,
      'المحافظة': s.recipient.governorate,
      'المدينة / المنطقة': s.recipient.city || '-',
      'العنوان التفصيلي': s.recipient.streetAddress,
      'مبلغ التحصيل COD (ج.م)': s.financials.codAmount,
      'رسوم الشحن (ج.م)': s.financials.shippingFee,
      'صافي للتاجر (ج.م)': s.financials.netPayout,
      'الوصف والمحتويات': s.packageDetails.description || 'طرد شحن',
      'الوزن (كجم)': s.packageDetails.weightKg,
      'عدد القطع': s.packageDetails.itemsCount,
      'السماح بالفتح والمعاينة': s.packageDetails.allowOpening ? 'مسموح' : 'غير مسموح',
      'حالة الشحنة': statusAr,
      'المندوب المخصص': s.assignedCourier?.name || 'غير مخصص',
      'المستودع / الفرع': s.assignedHub || 'المستودع الرئيسي',
      'ملاحظات العنوان': s.recipient.notes || '-'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 5 },  // index
    { wch: 18 }, // AWB
    { wch: 12 }, // Date
    { wch: 22 }, // Merchant
    { wch: 14 }, // Merchant Phone
    { wch: 20 }, // Recipient
    { wch: 14 }, // Phone
    { wch: 14 }, // Gov
    { wch: 16 }, // City
    { wch: 32 }, // Address
    { wch: 16 }, // COD
    { wch: 14 }, // Shipping Fee
    { wch: 14 }, // Net Merchant
    { wch: 24 }, // Desc
    { wch: 10 }, // Weight
    { wch: 10 }, // Pieces
    { wch: 14 }, // Allow open
    { wch: 20 }, // Status
    { wch: 18 }, // Courier
    { wch: 16 }, // Hub
    { wch: 25 }, // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'الأوردرات الشحنات');

  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `${fileNamePrefix}_${dateStr}.xlsx`);
};

/**
 * Specialized Excel Exporter for Returns Ledger (كشف حساب المرتجعات بدون مصاريف الشحن)
 */
export const exportReturnsToExcel = (
  returns: Shipment[],
  merchantName = 'جميع_التجار'
) => {
  if (!returns || returns.length === 0) {
    alert('لا توجد شحنات مرتجعة لتصديرها');
    return;
  }

  const data = returns.map((s, index) => {
    let statusAr = 'مرتجع';
    if (s.status === 'refused') {
      statusAr = s.refusedDetails?.shippingFeePaid ? 'مرفوض (دفع الشحن)' : 'مرفوض (لم يدفع الشحن)';
    } else if (s.status === 'failed_attempt') {
      statusAr = 'محاولة تسليم فاشلة';
    }

    // Returns Value without deducting shipping fee
    const productValue = s.financials.codAmount;
    const shippingFeeExcluded = 0; // Excluded from merchant calculations
    const netReturnVal = productValue;

    return {
      'م': index + 1,
      'رقم البوليصة (AWB)': s.trackingNumber,
      'تاريخ الطلب / الارتجاع': new Date(s.createdAt).toLocaleDateString('ar-EG'),
      'التاجر / المتجر': s.sender?.storeName || s.sender?.contactName || 'غير محدد',
      'اسم المستلم': s.recipient.name,
      'هاتف المستلم': s.recipient.phone,
      'المحافظة': s.recipient.governorate,
      'المدينة / العنوان': s.recipient.streetAddress,
      'قيمة البضاعة المرتجعة COD (ج.م)': productValue,
      'رسوم الشحن (مستبعدة)': shippingFeeExcluded,
      'صافي المسترد للتاجر (ج.م)': netReturnVal,
      'حالة الارتجاع': statusAr,
      'سبب الارتجاع / التفاصيل': s.refusedDetails?.reason || s.recipient.notes || 'طلب التاجر / العميل رفض الاستلام',
      'المندوب المعالج': s.assignedCourier?.name || 'غير مخصص',
      'المستودع / الفرع': s.assignedHub || 'المستودع الرئيسي'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);

  worksheet['!cols'] = [
    { wch: 5 },  // index
    { wch: 18 }, // AWB
    { wch: 14 }, // Date
    { wch: 22 }, // Merchant
    { wch: 20 }, // Recipient
    { wch: 14 }, // Phone
    { wch: 14 }, // Gov
    { wch: 30 }, // Address
    { wch: 22 }, // Product Value
    { wch: 16 }, // Shipping Fee Excluded
    { wch: 20 }, // Net Return
    { wch: 22 }, // Return Status
    { wch: 30 }, // Reason
    { wch: 18 }, // Courier
    { wch: 16 }, // Hub
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'حساب المرتجعات بدون شحن');

  const dateStr = new Date().toISOString().split('T')[0];
  const safeMerchant = merchantName.replace(/[\s/]+/g, '_');
  XLSX.writeFile(workbook, `كشف_مرتجعات_${safeMerchant}_${dateStr}.xlsx`);
};
