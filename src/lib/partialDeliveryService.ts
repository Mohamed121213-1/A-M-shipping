import {
  Shipment,
  ShipmentOrderItem,
  PartialDeliveryReport,
  PartialDeliveryItemRecord,
} from '../types';

export interface PartialDeliveryInput {
  shipmentId: string;
  courierId: string;
  courierName: string;
  /** per-item accepted quantities keyed by itemId */
  acceptedQuantities: Record<string, number>;
  /** optional override COD (if courier collected different amount) */
  partialCodOverride?: number;
  notes?: string;
  returnReasons?: Record<string, string>;
}

export interface PartialDeliveryValidationResult {
  valid: boolean;
  errors: string[];
  report?: PartialDeliveryReport;
}

/** Resolve order items from shipment — falls back to synthetic single item */
export function resolveOrderItems(shipment: Shipment): ShipmentOrderItem[] {
  if (shipment.orderItems && shipment.orderItems.length > 0) {
    return shipment.orderItems;
  }
  const totalQty = shipment.packageDetails.itemsCount || 1;
  const totalCod = shipment.financials.codAmount || 0;
  return [
    {
      id: 'default-item',
      name: shipment.packageDetails.description || 'محتويات الطرد',
      quantity: totalQty,
      unitPrice: totalQty > 0 ? totalCod / totalQty : totalCod,
    },
  ];
}

export function computePartialDeliveryReport(
  shipment: Shipment,
  input: PartialDeliveryInput
): PartialDeliveryValidationResult {
  const errors: string[] = [];
  const orderItems = resolveOrderItems(shipment);
  const originalCod = shipment.financials.codAmount || 0;

  const itemBreakdown: PartialDeliveryItemRecord[] = [];
  let acceptedItemsCount = 0;
  let returnedItemsCount = 0;
  let computedCod = 0;

  for (const item of orderItems) {
    const accepted = Math.max(0, Math.min(item.quantity, input.acceptedQuantities[item.id] ?? 0));
    const returned = item.quantity - accepted;

    if (accepted === 0 && returned === item.quantity) {
      // fully returned — ok
    } else if (accepted > 0 && accepted < item.quantity) {
      // partial — ok
    } else if (accepted === item.quantity) {
      // fully accepted — ok for partial delivery (some items fully accepted, others not)
    }

    acceptedItemsCount += accepted;
    returnedItemsCount += returned;
    const acceptedValue = accepted * item.unitPrice;
    const returnedValue = returned * item.unitPrice;
    computedCod += acceptedValue;

    itemBreakdown.push({
      itemId: item.id,
      itemName: item.name,
      orderedQuantity: item.quantity,
      acceptedQuantity: accepted,
      returnedQuantity: returned,
      unitPrice: item.unitPrice,
      acceptedValue,
      returnedValue,
      returnReason: input.returnReasons?.[item.id],
    });
  }

  const totalOrdered = orderItems.reduce((s, i) => s + i.quantity, 0);

  if (acceptedItemsCount <= 0) {
    errors.push('يجب استلام قطعة واحدة على الأقل');
  }
  if (acceptedItemsCount >= totalOrdered) {
    errors.push('الاستلام الجزئي يتطلب إرجاع قطعة واحدة على الأقل — استخدم التسليم الكامل بدلاً من ذلك');
  }

  const partialCodAmount =
    input.partialCodOverride !== undefined && input.partialCodOverride >= 0
      ? input.partialCodOverride
      : computedCod;

  if (partialCodAmount > originalCod) {
    errors.push(`المبلغ المحصل (${partialCodAmount}) لا يمكن أن يتجاوز المبلغ الأصلي (${originalCod})`);
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  const report: PartialDeliveryReport = {
    reportId: `PDR-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
    reportedAt: new Date().toISOString(),
    reportedByCourierId: input.courierId,
    reportedByCourierName: input.courierName,
    acceptedItemsCount,
    returnedItemsCount,
    partialCodAmount,
    remainingCodAmount: Math.max(0, originalCod - partialCodAmount),
    originalCodAmount: originalCod,
    itemBreakdown,
    notes: input.notes,
  };

  return { valid: true, errors: [], report };
}

export function buildPartialDeliveryNote(
  report: PartialDeliveryReport,
  courierName: string
): string {
  const itemsSummary = report.itemBreakdown
    .filter((i) => i.acceptedQuantity > 0 || i.returnedQuantity > 0)
    .map(
      (i) =>
        `${i.itemName}: استلم ${i.acceptedQuantity}/${i.orderedQuantity} (${i.acceptedValue} ج.م)${
          i.returnedQuantity > 0 ? ` — مرتجع ${i.returnedQuantity}` : ''
        }`
    )
    .join(' | ');

  return `استلام جزئي بواسطة المندوب ${courierName} [${report.reportId}]: تسليم ${report.acceptedItemsCount} قطعة (${report.partialCodAmount} ج.م) وارتجاع ${report.returnedItemsCount} قطعة (${report.remainingCodAmount} ج.م). ${itemsSummary}${report.notes ? `. (${report.notes})` : ''}`;
}
