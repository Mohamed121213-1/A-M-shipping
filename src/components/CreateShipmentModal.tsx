import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Shipment, GovernorateRate, AddressInfo, PackageDetails, DeliveryType, HubInfo, AppUserRole, UserSession, ShipmentOrderItem } from '../types';
import { EGYPT_GOVERNORATES, BOSTA_HUBS } from '../data/mockData';
import { 
  X, Sparkles, MapPin, Package, DollarSign, User, Phone, AlertCircle, CheckCircle, 
  Calculator, Building, ShieldCheck, FileSpreadsheet, Upload, Download, Trash2, Plus, 
  Check, RefreshCw, FileText, Store, Image as ImageIcon, Camera
} from 'lucide-react';

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateShipment: (shipment: Omit<Shipment, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt' | 'timeline'>) => void;
  onCreateBatchShipments?: (shipments: Omit<Shipment, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt' | 'timeline'>[]) => void;
  governorates?: GovernorateRate[];
  hubs?: HubInfo[];
  currentRole?: AppUserRole;
  systemUsers?: UserSession[];
  currentUser?: UserSession | null;
}

export interface StagedShipmentRow {
  id: string;
  recipientName: string;
  phone: string;
  secondaryPhone: string;
  governorateCode: string;
  city: string;
  district: string;
  streetAddress: string;
  buildingNo: string;
  apartmentNo: string;
  notes: string;
  description: string;
  itemsCount: number;
  weightKg: number;
  allowOpening: boolean;
  isFragile: boolean;
  deliveryType: DeliveryType;
  codAmount: number;
  customShippingFee?: number | null;
}

export const CreateShipmentModal: React.FC<CreateShipmentModalProps> = ({
  isOpen,
  onClose,
  onCreateShipment,
  onCreateBatchShipments,
  governorates = EGYPT_GOVERNORATES,
  hubs = BOSTA_HUBS,
  currentRole = 'merchant',
  systemUsers = [],
  currentUser = null,
}) => {
  if (!isOpen) return null;

  // Active Tab: 'single' | 'excel'
  const [activeTab, setActiveTab] = useState<'single' | 'excel'>('single');

  // Registered Merchants from Admin Panel
  const registeredMerchants = systemUsers.filter((u) => u.role === 'merchant');

  // Merchant / Sender Selection State
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>('');
  const [merchantStoreName, setMerchantStoreName] = useState<string>('');
  const [merchantContactName, setMerchantContactName] = useState<string>('');
  const [merchantPhone, setMerchantPhone] = useState<string>('');

  useEffect(() => {
    if (currentUser && currentUser.role === 'merchant') {
      setSelectedMerchantId(currentUser.id);
      setMerchantStoreName(currentUser.storeName || `متجر ${currentUser.name}`);
      setMerchantContactName(currentUser.name);
      setMerchantPhone(currentUser.phone);
    } else if (registeredMerchants.length > 0) {
      const first = registeredMerchants[0];
      setSelectedMerchantId(first.id);
      setMerchantStoreName(first.storeName || `متجر ${first.name}`);
      setMerchantContactName(first.name);
      setMerchantPhone(first.phone);
    } else {
      setSelectedMerchantId(`merch-${Date.now()}`);
      setMerchantStoreName('متجر أحدث');
      setMerchantContactName('التاجر العام');
      setMerchantPhone('01000000000');
    }
  }, [currentUser, systemUsers.length]);

  const handleSelectMerchant = (merchantId: string) => {
    setSelectedMerchantId(merchantId);
    const found = registeredMerchants.find((m) => m.id === merchantId);
    if (found) {
      setMerchantStoreName(found.storeName || `متجر ${found.name}`);
      setMerchantContactName(found.name);
      setMerchantPhone(found.phone);
    }
  };

  // AI Paste Text & Image OCR state
  const [aiRawText, setAiRawText] = useState('');
  const [aiImagePreview, setAiImagePreview] = useState<string | null>(null);
  const [aiImageBase64, setAiImageBase64] = useState<string | null>(null);
  const [aiImageMimeType, setAiImageMimeType] = useState<string>('image/jpeg');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار صورة صحيحة (JPG, PNG, WEBP, إلخ)');
      return;
    }

    setAiImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAiImagePreview(result);
      setAiImageBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setAiImagePreview(null);
    setAiImageBase64(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  // Single Form Fields
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');
  const [governorateCode, setGovernorateCode] = useState('CAI');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [buildingNo, setBuildingNo] = useState('');
  const [apartmentNo, setApartmentNo] = useState('');
  const [notes, setNotes] = useState('');

  // Package Details
  const [description, setDescription] = useState('طرد ملابس واكسسوارات');
  const [itemsCount, setItemsCount] = useState<number>(1);
  const [weightKg, setWeightKg] = useState<number>(1.5);
  const [allowOpening, setAllowOpening] = useState<boolean>(true);
  const [isFragile, setIsFragile] = useState<boolean>(false);
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('standard');

  // Order Items (line-level products)
  const [orderItems, setOrderItems] = useState<ShipmentOrderItem[]>([
    { id: `item-${Date.now()}`, name: 'طرد ملابس واكسسوارات', quantity: 1, unitPrice: 1200 },
  ]);
  const [useDetailedItems, setUseDetailedItems] = useState(true);

  const syncTotalsFromItems = (items: ShipmentOrderItem[]) => {
    const totalQty = items.reduce((s, i) => s + i.quantity, 0);
    const totalValue = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    setItemsCount(Math.max(1, totalQty));
    setCodAmount(totalValue);
    if (items.length === 1) setDescription(items[0].name);
    else if (items.length > 1) setDescription(items.map((i) => i.name).join(' + '));
  };

  const addOrderItem = () => {
    const newItem: ShipmentOrderItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: '',
      quantity: 1,
      unitPrice: 0,
    };
    const next = [...orderItems, newItem];
    setOrderItems(next);
    syncTotalsFromItems(next);
  };

  const removeOrderItem = (id: string) => {
    if (orderItems.length <= 1) return;
    const next = orderItems.filter((i) => i.id !== id);
    setOrderItems(next);
    syncTotalsFromItems(next);
  };

  const updateOrderItem = (id: string, field: keyof ShipmentOrderItem, value: string | number) => {
    const next = orderItems.map((i) => (i.id === id ? { ...i, [field]: value } : i));
    setOrderItems(next);
    if (useDetailedItems) syncTotalsFromItems(next);
  };

  // Financials
  const [codAmount, setCodAmount] = useState<number>(1200);

  // Excel Batch Upload States
  const [stagedRows, setStagedRows] = useState<StagedShipmentRow[]>([]);
  const [excelError, setExcelError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const governoratesList = governorates && governorates.length > 0 ? governorates : EGYPT_GOVERNORATES;

  // Selected Governorate Object
  const selectedGov = governoratesList.find((g) => g.code === governorateCode) || governoratesList[0];

  // Calculated / Custom Shipping Fee
  const autoShippingFee = Math.round(
    selectedGov.baseRate + Math.max(0, weightKg - 3) * selectedGov.additionalKgRate + (deliveryType === 'express' ? 25 : 0)
  );
  const [customShippingFee, setCustomShippingFee] = useState<number | null>(null);
  const calculatedShippingFee = customShippingFee !== null ? customShippingFee : autoShippingFee;

  const calculatedCodFee = 0;
  const calculatedNetPayout = Math.max(0, codAmount - calculatedShippingFee);

  // AI Address & Image OCR Parsing Handler
  const handleAiParse = async () => {
    if (!aiRawText.trim() && !aiImageBase64) return;
    setIsAiParsing(true);
    setAiSuccessMessage('');

    try {
      const res = await fetch('/api/parse-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: aiRawText,
          imageBase64: aiImageBase64,
          mimeType: aiImageMimeType,
        }),
      });

      if (!res.ok) throw new Error('فشل في الاتصال بخدمة التحليل الذكي وتفريغ البيانات');
      const data = await res.json();

      if (data.recipientName) setRecipientName(data.recipientName);
      if (data.phone) setPhone(data.phone);
      if (data.secondaryPhone) setSecondaryPhone(data.secondaryPhone);
      if (data.city) setCity(data.city);
      if (data.district) setDistrict(data.district);
      if (data.streetAddress) setStreetAddress(data.streetAddress);
      if (data.buildingNo) setBuildingNo(data.buildingNo);
      if (data.apartmentNo) setApartmentNo(data.apartmentNo);
      if (data.deliveryNotes) setNotes(data.deliveryNotes);

      if (data.description) setDescription(data.description);
      if (typeof data.codAmount === 'number' && data.codAmount > 0) setCodAmount(data.codAmount);
      if (typeof data.itemsCount === 'number' && data.itemsCount > 0) setItemsCount(data.itemsCount);

      // Match governorate
      if (data.governorate || data.city) {
        const govTerm = data.governorate || '';
        const cityTerm = data.city || '';
        const matchedGov = governoratesList.find((g) =>
          (govTerm && (g.nameAr.includes(govTerm) || govTerm.includes(g.nameAr))) ||
          (cityTerm && g.cities?.some((c) => c.toLowerCase().includes(cityTerm.toLowerCase()) || cityTerm.toLowerCase().includes(c.toLowerCase())))
        );
        if (matchedGov) setGovernorateCode(matchedGov.code);
      }

      setAiSuccessMessage(
        aiImageBase64
          ? '✨ تم تفريغ البيانات واستخراج العنوان بنجاح من الصورة بواسطة الذكاء الاصطناعي!'
          : '✨ تم استخراج وتعبئة بيانات العنوان بنجاح بواسطة الذكاء الاصطناعي!'
      );
    } catch (err: any) {
      console.error(err);
      setAiSuccessMessage('تعذر تفريغ البيانات تلقائياً، يرجى ملء الحقول يدوياً');
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName || !phone || !streetAddress) {
      alert('الرجاء إدخال اسم المستلم، رقم الهاتف، والعنوان التفصيلي');
      return;
    }

    const matchedHub = BOSTA_HUBS.find((h) => h.governorate.includes(selectedGov.nameAr)) || BOSTA_HUBS[0];

    onCreateShipment({
      status: currentRole === 'admin' ? 'created' : 'pending_approval',
      deliveryType,
      sender: {
        id: selectedMerchantId || `merch-${Date.now()}`,
        storeName: merchantStoreName || 'متجر غير محدد',
        contactName: merchantContactName || 'مسؤول المتجر',
        phone: merchantPhone || '01000000000',
        governorate: 'القاهرة',
        city: 'مدينة نصر',
        pickupAddress: 'مكرم عبيد، بجوار سيتي ستارز',
      },
      recipient: {
        name: recipientName,
        phone,
        secondaryPhone,
        governorate: selectedGov.nameAr,
        city: city || selectedGov.nameAr,
        district,
        streetAddress,
        buildingNo,
        apartmentNo,
        notes,
      },
      packageDetails: {
        description,
        itemsCount: useDetailedItems ? orderItems.reduce((s, i) => s + i.quantity, 0) : itemsCount,
        weightKg,
        allowOpening,
        isFragile,
      },
      orderItems: useDetailedItems ? orderItems.filter((i) => i.name.trim()) : undefined,
      financials: {
        codAmount,
        shippingFee: calculatedShippingFee,
        codFee: calculatedCodFee,
        insuranceFee: 0,
        netPayout: calculatedNetPayout,
        paidStatus: 'pending',
      },
      assignedHub: matchedHub.name,
      estimatedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    });

    onClose();
  };

  // Helper for column value extraction
  const getColValue = (row: Record<string, any>, possibleKeys: string[], defaultVal: string = ''): string => {
    for (const key of Object.keys(row)) {
      const cleanKey = key.trim().toLowerCase();
      for (const pKey of possibleKeys) {
        if (cleanKey.includes(pKey.toLowerCase())) {
          return String(row[key] ?? '').trim();
        }
      }
    }
    return defaultVal;
  };

  // Excel File Parsing Logic
  const processExcelFile = (file: File) => {
    setExcelError('');
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

        if (!jsonRows || jsonRows.length === 0) {
          setExcelError('ملف الإكسيل فارغ أو لا يحتوي على صفوف بيانات.');
          return;
        }

        const parsedRows: StagedShipmentRow[] = jsonRows.map((row, idx) => {
          const recName = getColValue(row, ['اسم المستلم', 'المستلم', 'اسم العميل', 'الاسم', 'recipient', 'name', 'customer']);
          const phoneNum = getColValue(row, ['رقم الهاتف', 'الموبايل', 'الهاتف', 'الهاتف الرئيسي', 'phone', 'mobile', 'tel']);
          const secPhone = getColValue(row, ['هاتف آخر', 'رقم آخر', 'هاتف إضافي', 'secondary phone', 'mobile 2']);
          const govVal = getColValue(row, ['المحافظة', 'محافظة', 'governorate', 'gov']);
          const cityVal = getColValue(row, ['المدينة', 'المركز', 'city']);
          const distVal = getColValue(row, ['الحي', 'المنطقة', 'district']);
          const addressVal = getColValue(row, ['العنوان التفصيلي', 'العنوان', 'اسم الشارع', 'address', 'street']);
          const bldgVal = getColValue(row, ['العمارة', 'المبنى', 'building']);
          const aptVal = getColValue(row, ['الشقة', 'الدور', 'apartment']);
          const notesVal = getColValue(row, ['ملاحظات التسليم', 'ملاحظات', 'تعليمات', 'notes']);
          const descVal = getColValue(row, ['وصف الطرد', 'الوصف', 'المحتويات', 'description', 'package']);
          const countVal = parseInt(getColValue(row, ['عدد القطع', 'الكمية', 'items', 'count'], '1')) || 1;
          const weightVal = parseFloat(getColValue(row, ['الوزن', 'وزن الطرد', 'weight'], '1.5')) || 1.5;
          const codVal = parseFloat(getColValue(row, ['مبلغ التحصيل', 'المبلغ', 'الكاش', 'تحصيل', 'cod', 'amount'], '0')) || 0;
          const customShippingVal = getColValue(row, ['سعر الشحن', 'قيمة الشحن', 'تكلفة الشحن', 'الشحن', 'سعر شحن', 'قيمة شحن', 'shipping_fee', 'shipping fee', 'shipping', 'freight'], '');
          const parsedShippingFee = customShippingVal !== '' && !isNaN(parseFloat(customShippingVal)) ? parseFloat(customShippingVal) : null;
          const allowVal = getColValue(row, ['المعاينة', 'معاينة', 'allow opening'], 'نعم');

          // Match Governorate
          let matchedGovCode = 'CAI';
          if (govVal) {
            const foundGov = EGYPT_GOVERNORATES.find((g) =>
              g.nameAr.includes(govVal) || govVal.includes(g.nameAr) || g.nameEn.toLowerCase().includes(govVal.toLowerCase())
            );
            if (foundGov) matchedGovCode = foundGov.code;
          }
          if (cityVal) {
            const foundByCity = EGYPT_GOVERNORATES.find((g) =>
              g.cities?.some((c) => c.toLowerCase().includes(cityVal.toLowerCase()) || cityVal.toLowerCase().includes(c.toLowerCase()))
            );
            if (foundByCity) matchedGovCode = foundByCity.code;
          }

          return {
            id: `stage-${Date.now()}-${idx}`,
            recipientName: recName,
            phone: phoneNum,
            secondaryPhone: secPhone,
            governorateCode: matchedGovCode,
            city: cityVal,
            district: distVal,
            streetAddress: addressVal,
            buildingNo: bldgVal,
            apartmentNo: aptVal,
            notes: notesVal,
            description: descVal || 'طرد A&Mshipping',
            itemsCount: countVal,
            weightKg: weightVal,
            allowOpening: ['نعم', 'yes', 'true', '1'].some((v) => allowVal.toLowerCase().includes(v)),
            isFragile: false,
            deliveryType: 'standard',
            codAmount: codVal,
            customShippingFee: parsedShippingFee,
          };
        });

        setStagedRows((prev) => [...prev, ...parsedRows]);
      } catch (err: any) {
        console.error(err);
        setExcelError('تعذر معالجة ملف الإكسيل. يرجى التأكد من التنسيق وتجربة ملف آخر.');
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processExcelFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processExcelFile(e.dataTransfer.files[0]);
    }
  };

  // Bulk Shipping Fee Action State & Handlers
  const [bulkShippingFeeInput, setBulkShippingFeeInput] = useState<string>('');

  const handleApplyBulkShippingFee = () => {
    if (!bulkShippingFeeInput.trim()) return;
    const fee = parseFloat(bulkShippingFeeInput);
    if (isNaN(fee)) return;
    setStagedRows((prev) =>
      prev.map((row) => ({ ...row, customShippingFee: fee }))
    );
  };

  const handleClearBulkShippingFee = () => {
    setStagedRows((prev) =>
      prev.map((row) => ({ ...row, customShippingFee: null }))
    );
    setBulkShippingFeeInput('');
  };

  // Download Sample Template
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        'اسم المستلم': 'محمود عبد الفتاح',
        'رقم الهاتف': '01012345678',
        'هاتف إضافي': '01234567890',
        'المحافظة': 'الإسكندرية',
        'المدينة': 'سموحة',
        'الحي': 'شارع ألبير الأول',
        'العنوان التفصيلي': 'عمارة 14 الدور الرابع شقة 12',
        'وصف الطرد': 'ساعة يد رجالي زرقاء',
        'عدد القطع': 1,
        'الوزن كجم': 1,
        'مبلغ التحصيل COD': 850,
        'سعر الشحن': '', // تترك فارغة للربط الآلي بالمحافظة أو كتابة سعر خاص
        'المعاينة مسموحة': 'نعم',
        'ملاحظات التسليم': 'الاتصال قبل الاستلام بساعة',
      },
      {
        'اسم المستلم': 'سارة محمود علي',
        'رقم الهاتف': '01122334455',
        'هاتف إضافي': '',
        'المحافظة': 'الجيزة',
        'المدينة': 'الدقي',
        'الحي': 'شارع مصدق',
        'العنوان التفصيلي': 'برج الأمل رقم 22',
        'وصف الطرد': 'طقم ملابس أطفال 3 قطع',
        'عدد القطع': 3,
        'الوزن كجم': 2,
        'مبلغ التحصيل COD': 1400,
        'سعر الشحن': '', // تترك فارغة للربط الآلي بالمحافظة أو كتابة سعر خاص
        'المعاينة مسموحة': 'نعم',
        'ملاحظات التسليم': 'التسليم بعد الساعة 5 مساء',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'نموذج_شحنات_AMshipping');
    XLSX.writeFile(wb, 'AMshipping_Shipments_Template.xlsx');
  };

  // Staging Row Updater
  const updateStagedRow = (id: string, field: keyof StagedShipmentRow, value: any) => {
    setStagedRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: value } : row))
    );
  };

  // Delete Staged Row
  const removeStagedRow = (id: string) => {
    setStagedRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Add Empty Row to Staging
  const handleAddEmptyStagedRow = () => {
    const newRow: StagedShipmentRow = {
      id: `stage-${Date.now()}`,
      recipientName: '',
      phone: '',
      secondaryPhone: '',
      governorateCode: 'CAI',
      city: 'القاهرة',
      district: '',
      streetAddress: '',
      buildingNo: '',
      apartmentNo: '',
      notes: '',
      description: 'طرد ملابس',
      itemsCount: 1,
      weightKg: 1,
      allowOpening: true,
      isFragile: false,
      deliveryType: 'standard',
      codAmount: 500,
      customShippingFee: null,
    };
    setStagedRows((prev) => [newRow, ...prev]);
  };

  // Validate Staged Row
  const isRowValid = (row: StagedShipmentRow): boolean => {
    return Boolean(row.recipientName.trim() && row.phone.trim() && row.streetAddress.trim());
  };

  // Batch Submit Handler
  const handleBatchConfirm = () => {
    const validRows = stagedRows.filter(isRowValid);
    if (validRows.length === 0) {
      alert('لا توجد شحنات مكتملة البيانات للاستيراد. يرجى التأكد من إضافة حقول اسم المستلم ورقم الهاتف والعنوان.');
      return;
    }

    const batchToCreate: Omit<Shipment, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt' | 'timeline'>[] = validRows.map((row) => {
      const govObj = EGYPT_GOVERNORATES.find((g) => g.code === row.governorateCode) || EGYPT_GOVERNORATES[0];
      const autoShippingFee = Math.round(
        govObj.baseRate + Math.max(0, row.weightKg - 3) * govObj.additionalKgRate + (row.deliveryType === 'express' ? 25 : 0)
      );
      const shippingFee = row.customShippingFee !== undefined && row.customShippingFee !== null ? row.customShippingFee : autoShippingFee;
      const codFee = 0;
      const netPayout = Math.max(0, row.codAmount - shippingFee);
      const matchedHub = BOSTA_HUBS.find((h) => h.governorate.includes(govObj.nameAr)) || BOSTA_HUBS[0];

      return {
        status: currentRole === 'admin' ? 'created' : 'pending_approval',
        deliveryType: row.deliveryType,
        sender: {
          id: selectedMerchantId || `merch-${Date.now()}`,
          storeName: merchantStoreName || 'متجر غير محدد',
          contactName: merchantContactName || 'مسؤول المتجر',
          phone: merchantPhone || '01000000000',
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          pickupAddress: 'مكرم عبيد، بجوار سيتي ستارز',
        },
        recipient: {
          name: row.recipientName,
          phone: row.phone,
          secondaryPhone: row.secondaryPhone,
          governorate: govObj.nameAr,
          city: row.city || govObj.nameAr,
          district: row.district,
          streetAddress: row.streetAddress,
          buildingNo: row.buildingNo,
          apartmentNo: row.apartmentNo,
          notes: row.notes,
        },
        packageDetails: {
          description: row.description || 'طرد بوسطة',
          itemsCount: row.itemsCount || 1,
          weightKg: row.weightKg || 1,
          allowOpening: row.allowOpening,
          isFragile: row.isFragile,
        },
        financials: {
          codAmount: row.codAmount,
          shippingFee,
          codFee,
          insuranceFee: 0,
          netPayout,
          paidStatus: 'pending',
        },
        assignedHub: matchedHub.name,
        estimatedDeliveryDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      };
    });

    if (onCreateBatchShipments) {
      onCreateBatchShipments(batchToCreate);
    } else {
      batchToCreate.forEach((s) => onCreateShipment(s));
    }

    setStagedRows([]);
    onClose();
  };

  // Calculations for Staging Summary Bar
  const totalStagedCod = stagedRows.reduce((sum, r) => sum + (r.codAmount || 0), 0);
  const totalStagedShippingFees = stagedRows.reduce((sum, r) => {
    const govObj = governoratesList.find((g) => g.code === r.governorateCode) || governoratesList[0];
    const autoFee = Math.round(govObj.baseRate + Math.max(0, r.weightKg - 3) * govObj.additionalKgRate);
    const rowFee = r.customShippingFee !== undefined && r.customShippingFee !== null ? r.customShippingFee : autoFee;
    return sum + rowFee;
  }, 0);
  const totalStagedNetPayout = Math.max(0, totalStagedCod - totalStagedShippingFees);
  const validStagedCount = stagedRows.filter(isRowValid).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden my-4 sm:my-8 flex flex-col max-h-[92vh]">
        {/* Top Modal Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6" />
            <div>
              <h3 className="font-extrabold text-lg">إنشاء وإضافة شحنات A&Mshipping</h3>
              <p className="text-xs text-red-100">إدخال فردي مباشر أو رفع كشف إكسيل جماعي مع المعاينة والتعديل</p>
            </div>
          </div>
          <button onClick={onClose} className="text-red-100 hover:text-white p-1 rounded-lg transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-2 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === 'single'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              إضافة شحنة واحدة
            </button>

            <button
              onClick={() => setActiveTab('excel')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-extrabold transition-all ${
                activeTab === 'excel'
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              رفع كشف إكسيل (.xlsx)
              {stagedRows.length > 0 && (
                <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[10px] font-mono">
                  {stagedRows.length}
                </span>
              )}
            </button>
          </div>

          {activeTab === 'excel' && (
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              تحميل نموذج الإكسيل (.xlsx)
            </button>
          )}
        </div>

        {/* TAB 1: SINGLE SHIPMENT FORM */}
        {activeTab === 'single' && (
          <form onSubmit={handleSingleSubmit} className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* AI Smart Address & Image OCR Parser Section */}
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-200 rounded-xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-extrabold text-indigo-950 text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-bounce" />
                  المحلل الذكي وتفريغ البيانات من الصورة والنص (Gemini AI Vision & OCR)
                </span>
                <span className="text-[11px] text-indigo-700 font-bold bg-indigo-100/80 px-2 py-0.5 rounded-full">
                  استخراج فوري للعنوان، الهاتف، والمبلغ
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-start">
                <div className="md:col-span-8 space-y-2">
                  <textarea
                    value={aiRawText}
                    onChange={(e) => setAiRawText(e.target.value)}
                    rows={2}
                    placeholder="الصق نص الرسالة أو عنوان الواتساب... مثال: أحمد سامي 01012345678 شارع التحرير عمارة 12 شقة 4 الدقي الجيزة (مبلغ التحصيل 1400 ج.م)"
                    className="w-full text-xs p-2.5 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                  />
                </div>

                {/* Image Upload / Preview Controls */}
                <div className="md:col-span-4 flex flex-col justify-between gap-2 h-full">
                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {aiImagePreview ? (
                    <div className="relative group bg-white border border-indigo-200 rounded-lg p-1.5 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <img
                          src={aiImagePreview}
                          alt="صورة البوليصة"
                          className="w-10 h-10 object-cover rounded-md border border-slate-200 shrink-0"
                        />
                        <div className="text-[11px] font-bold text-slate-700 truncate">
                          صورة مرفقة للذكاء الاصطناعي
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="إزالة الصورة"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="w-full bg-white hover:bg-indigo-50 text-indigo-700 border border-dashed border-indigo-300 font-bold text-xs p-2 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                      تفريغ بيانات من صورة / بوليصة
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleAiParse}
                    disabled={isAiParsing || (!aiRawText.trim() && !aiImageBase64)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-extrabold text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xs"
                  >
                    {isAiParsing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        جاري تفريغ البيانات...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        تفريغ بالذكاء الاصطناعي
                      </>
                    )}
                  </button>
                </div>
              </div>

              {aiSuccessMessage && (
                <p className="text-xs text-indigo-800 font-bold mt-1 flex items-center gap-1.5 bg-indigo-100/60 p-2 rounded-lg border border-indigo-200">
                  <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                  {aiSuccessMessage}
                </p>
              )}
            </div>

            {/* Merchant / Sender Selection Section */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="flex items-center gap-1.5 font-extrabold text-slate-900 text-xs sm:text-sm">
                  <Store className="w-4 h-4 text-red-600" />
                  بيانات التاجر / المتجر (مربوط بإعدادات لوحة التحكم)
                </span>
                <span className="text-[11px] text-slate-500 font-bold">
                  {registeredMerchants.length > 0 ? `مسجل ${registeredMerchants.length} تاجر` : 'لا يوجد تجار مسجلين'}
                </span>
              </div>

              {currentRole === 'admin' && registeredMerchants.length > 0 ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اختر التاجر المسجل من لوحة التحكم</label>
                  <select
                    value={selectedMerchantId}
                    onChange={(e) => handleSelectMerchant(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-red-500/20 outline-none"
                  >
                    {registeredMerchants.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.storeName || `متجر ${m.name}`} - ({m.name} | {m.phone})
                      </option>
                    ))}
                    <option value="custom">-- إدخال اسم متجر يدوي جديد --</option>
                  </select>
                </div>
              ) : currentUser?.role === 'merchant' ? (
                <div className="text-xs font-bold text-slate-800 bg-red-50 border border-red-200 p-2.5 rounded-lg flex items-center gap-2">
                  <Store className="w-4 h-4 text-red-600 shrink-0" />
                  <span>الشحنة سيتم تسجيلها باسم متجرك: <strong className="text-red-700">{merchantStoreName}</strong> ({merchantPhone})</span>
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم العلامة التجارية / المتجر</label>
                  <input
                    type="text"
                    required
                    value={merchantStoreName}
                    onChange={(e) => setMerchantStoreName(e.target.value)}
                    placeholder="مثال: متجر الأناقة"
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف التاجر</label>
                  <input
                    type="tel"
                    required
                    value={merchantPhone}
                    onChange={(e) => setMerchantPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500/20 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Recipient Information */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <User className="w-4 h-4 text-red-600" />
                بيانات العميل المستلم
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستلم الثلاثي *</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="محمد أحمد علي"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف الرئيسي *</label>
                  <input
                    type="text"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف إضافي (اختياري)</label>
                  <input
                    type="text"
                    dir="ltr"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    placeholder="01198765432"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة *</label>
                  <select
                    value={governorateCode}
                    onChange={(e) => {
                      setGovernorateCode(e.target.value);
                      const newGov = governoratesList.find((g) => g.code === e.target.value);
                      if (newGov && newGov.cities && newGov.cities.length > 0) {
                        setCity(newGov.cities[0]);
                      }
                    }}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500/20"
                  >
                    {governoratesList.map((g) => (
                      <option key={g.code} value={g.code}>
                        {g.nameAr} ({g.baseRate} ج.م)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
                    <span>المدينة / المركز *</span>
                    <span className="text-[11px] text-red-600 font-extrabold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-red-500" />
                      عرض تلقائي للمراكز والمدن (التجمع، أكتوبر...)
                    </span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      list="city-suggestions"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={selectedGov.cities && selectedGov.cities.length > 0 ? `اختر من مدن ${selectedGov.nameAr} أو اكتب...` : "اسم المدينة / المركز"}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500/20 font-bold text-slate-900"
                    />
                    <datalist id="city-suggestions">
                      {selectedGov.cities?.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>

                    {/* Auto-suggested Centers & Cities Chips */}
                    {selectedGov.cities && selectedGov.cities.length > 0 && (
                      <div className="bg-red-50/60 border border-red-200/80 rounded-xl p-2.5 space-y-1.5 shadow-2xs">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-red-950">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-red-600" />
                            المراكز والمدن المقترحة داخل {selectedGov.nameAr} (اضغط للاختيار):
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {selectedGov.cities.map((cityName) => (
                            <button
                              key={cityName}
                              type="button"
                              onClick={() => setCity(cityName)}
                              className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                                city === cityName
                                  ? 'bg-red-600 text-white shadow-xs scale-105'
                                  : 'bg-white text-slate-800 border border-red-200 hover:bg-red-100 hover:border-red-300'
                              }`}
                            >
                              {cityName}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الحي / المنطقة</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="مثال: الحي السابع / شارع مصدق"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">العنوان التفصيلي والعلامة المميزة *</label>
                <input
                  type="text"
                  required
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                  placeholder="اسم الشارع، رقم العمارة، بجوار المسجد أو المستشفى"
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم المبنى</label>
                  <input
                    type="text"
                    value={buildingNo}
                    onChange={(e) => setBuildingNo(e.target.value)}
                    placeholder="15"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الشقة/الدور</label>
                  <input
                    type="text"
                    value={apartmentNo}
                    onChange={(e) => setApartmentNo(e.target.value)}
                    placeholder="شقة 4 الدور 3"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">تعليمات التسليم</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="الاتصال قبل الوصول..."
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Package Details & Type */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Package className="w-4 h-4 text-red-600" />
                مواصفات الطرد والشحن
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">وصف الطرد / المحتويات</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="فستان زارا + حذاء مقاس 38"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الخدمة</label>
                  <select
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                  >
                    <option value="standard">عادي (Standard) - {selectedGov.estDays}</option>
                    <option value="express">سريع (Express) - إضافة 25 ج.م</option>
                    <option value="exchange">طلب استبدال (Exchange)</option>
                    <option value="return">طلب إرجاع (Return)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عدد القطع داخل الطرد</label>
                  <input
                    type="number"
                    min={1}
                    value={itemsCount}
                    onChange={(e) => setItemsCount(parseInt(e.target.value) || 1)}
                    disabled={useDetailedItems}
                    className={`w-full text-xs p-2.5 border border-slate-200 rounded-lg ${useDetailedItems ? 'bg-slate-100 text-slate-500' : 'bg-slate-50'}`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الوزن التقديري (كجم)</label>
                  <input
                    type="number"
                    step="0.1"
                    min={0.1}
                    value={weightKg}
                    onChange={(e) => setWeightKg(parseFloat(e.target.value) || 1)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex flex-col justify-end gap-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={allowOpening}
                      onChange={(e) => setAllowOpening(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                    />
                    السماح بفتح المعاينة للعميل
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={isFragile}
                      onChange={(e) => setIsFragile(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                    />
                    طرد قابل للكسر / حساس
                  </label>
                </div>
              </div>
            </div>

            {/* Order Items — Detailed Product List */}
            <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-indigo-900 flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-indigo-600" />
                  منتجات الأوردر (للاستلام الجزئي)
                </h4>
                <label className="flex items-center gap-2 cursor-pointer text-[11px] font-bold text-indigo-800">
                  <input
                    type="checkbox"
                    checked={useDetailedItems}
                    onChange={(e) => setUseDetailedItems(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  تفصيل المنتجات
                </label>
              </div>

              {useDetailedItems && (
                <div className="space-y-2">
                  {orderItems.map((item, idx) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-end bg-white p-2.5 rounded-lg border border-indigo-100">
                      <div className="col-span-5">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">اسم المنتج #{idx + 1}</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateOrderItem(item.id, 'name', e.target.value)}
                          placeholder="فستان زارا مقاس M"
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">SKU</label>
                        <input
                          type="text"
                          value={item.sku || ''}
                          onChange={(e) => updateOrderItem(item.id, 'sku', e.target.value)}
                          placeholder="SKU-001"
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">الكمية</label>
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) => updateOrderItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">السعر (ج.م)</label>
                        <input
                          type="number"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) => updateOrderItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => removeOrderItem(item.id)}
                          disabled={orderItems.length <= 1}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg disabled:opacity-30"
                          title="حذف المنتج"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addOrderItem}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 hover:text-indigo-900 px-2 py-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    إضافة منتج آخر
                  </button>
                  <p className="text-[10px] text-indigo-600 font-medium">
                    إجمالي: {orderItems.reduce((s, i) => s + i.quantity, 0)} قطعة — {orderItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0).toLocaleString()} ج.م
                  </p>
                </div>
              )}
            </div>

            {/* Financials & Rate Calculation Preview */}
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  حاسبة التحصيل والمستحقات المالية
                </span>
                <span className="text-[11px] text-slate-400">حساب آلي بنظام بوسطة</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">المبلغ المحصل (COD) *</label>
                  <input
                    type="number"
                    value={codAmount}
                    onChange={(e) => setCodAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-extrabold text-slate-900 p-2 bg-white rounded-lg focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">قيمة الشحن (ج.م) *</label>
                  <input
                    type="number"
                    value={calculatedShippingFee}
                    onChange={(e) => setCustomShippingFee(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-extrabold text-slate-900 p-2 bg-white rounded-lg focus:ring-2 focus:ring-red-400"
                  />
                </div>

                <div className="bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded-lg flex flex-col justify-center">
                  <span className="text-[10px] text-emerald-300 block font-bold">رصيد المستحقات للتاجر (المبلغ المحصل - قيمة الشحن):</span>
                  <span className="text-base font-black text-emerald-400">{calculatedNetPayout.toLocaleString()} ج.م</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md transition-all flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                إنشاء وحفظ بوليصة الشحن
              </button>
            </div>
          </form>
        )}

        {/* TAB 2: EXCEL BATCH UPLOAD & STAGING TABLE */}
        {activeTab === 'excel' && (
          <div className="p-6 space-y-6 overflow-y-auto flex-1 flex flex-col">
            {/* Excel Upload Drag & Drop Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-red-500 bg-red-50/50 scale-[1.01]'
                  : 'border-slate-300 bg-slate-50/80 hover:border-red-400 hover:bg-slate-100/80'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-900">
                اسحب ملف الإكسيل هنا أو <span className="text-red-600 underline">اضغط للاختيار</span>
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                يدعم ملفات بصيغة Excel (.xlsx, .xls) و CSV مع التعرف الآلي على الأعمدة بالعربية والإنجليزية
              </p>
            </div>

            {excelError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                {excelError}
              </div>
            )}

            {/* Staging Actions Bar */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-3">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  جدول الشحنات المجهزة للاستيراد (Staging Table)
                </h4>
                <span className="bg-slate-200 text-slate-800 font-mono text-xs font-bold px-2 py-0.5 rounded-md">
                  {stagedRows.length} صف
                </span>
              </div>

              {/* Bulk Shipping Price Control */}
              {stagedRows.length > 0 && (
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-2xs text-xs">
                  <span className="font-bold text-slate-700 shrink-0">تحديد سعر الشحن للكل:</span>
                  <input
                    type="number"
                    placeholder="مثال: 50"
                    value={bulkShippingFeeInput}
                    onChange={(e) => setBulkShippingFeeInput(e.target.value)}
                    className="w-16 text-xs p-1 bg-slate-50 border border-slate-300 rounded-md font-bold text-center focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
                  />
                  <button
                    type="button"
                    onClick={handleApplyBulkShippingFee}
                    className="bg-red-600 hover:bg-red-700 text-white font-extrabold px-2.5 py-1 rounded-md transition-colors"
                  >
                    تطبيق
                  </button>
                  <button
                    type="button"
                    onClick={handleClearBulkShippingFee}
                    className="text-slate-500 hover:text-slate-900 font-bold px-2 py-1 rounded-md hover:bg-slate-100"
                    title="إعادة التكلفة للحساب الآلي حسب المحافظة"
                  >
                    إعادة للآلي
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={handleAddEmptyStagedRow}
                  className="flex-1 lg:flex-none text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5 text-red-600" />
                  إضافة سطر جديد
                </button>

                {stagedRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setStagedRows([])}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors"
                  >
                    تفريغ القائمة
                  </button>
                )}
              </div>
            </div>

            {/* STAGING TABLE LIST */}
            {stagedRows.length === 0 ? (
              <div className="border border-slate-200 rounded-2xl p-12 text-center text-slate-400 space-y-3 bg-slate-50/50">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-500">
                  قم برفع ملف إكسيل يحتوي على شحناتك، أو اضغط "إضافة سطر جديد" لإدخال البيانات يدوياً في كشف الاستيراد.
                </p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs max-h-[360px] overflow-y-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-extrabold sticky top-0 z-10 border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-center">#</th>
                      <th className="p-2.5 min-w-[140px]">اسم المستلم *</th>
                      <th className="p-2.5 min-w-[110px]">رقم الهاتف *</th>
                      <th className="p-2.5 min-w-[120px]">المحافظة *</th>
                      <th className="p-2.5 min-w-[180px]">العنوان التفصيلي *</th>
                      <th className="p-2.5 min-w-[130px]">وصف الطرد</th>
                      <th className="p-2.5 w-[70px]">الوزن (كجم)</th>
                      <th className="p-2.5 min-w-[90px]">الكاش (COD)</th>
                      <th className="p-2.5 min-w-[125px]">سعر الشحن (ج.م) *</th>
                      <th className="p-2.5 text-center w-[50px]">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {stagedRows.map((row, index) => {
                      const valid = isRowValid(row);
                      const govObj = EGYPT_GOVERNORATES.find((g) => g.code === row.governorateCode) || EGYPT_GOVERNORATES[0];
                      const autoShipping = Math.round(
                        govObj.baseRate + Math.max(0, row.weightKg - 3) * govObj.additionalKgRate
                      );
                      const isCustom = row.customShippingFee !== undefined && row.customShippingFee !== null;

                      return (
                        <tr
                          key={row.id}
                          className={`hover:bg-slate-50/90 transition-colors ${
                            !valid ? 'bg-amber-50/40' : ''
                          }`}
                        >
                          <td className="p-2 text-center font-mono font-bold text-slate-500">
                            {index + 1}
                          </td>

                          {/* Recipient Name */}
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={row.recipientName}
                              onChange={(e) => updateStagedRow(row.id, 'recipientName', e.target.value)}
                              placeholder="اسم المستلم"
                              className={`w-full text-xs p-1.5 rounded border focus:outline-none font-bold ${
                                !row.recipientName ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50 focus:bg-white'
                              }`}
                            />
                          </td>

                          {/* Phone */}
                          <td className="p-1.5">
                            <input
                              type="text"
                              dir="ltr"
                              value={row.phone}
                              onChange={(e) => updateStagedRow(row.id, 'phone', e.target.value)}
                              placeholder="010xxxxxxx"
                              className={`w-full text-xs p-1.5 rounded border focus:outline-none font-mono ${
                                !row.phone ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50 focus:bg-white'
                              }`}
                            />
                          </td>

                          {/* Governorate */}
                          <td className="p-1.5">
                            <select
                              value={row.governorateCode}
                              onChange={(e) => updateStagedRow(row.id, 'governorateCode', e.target.value)}
                              className="w-full text-xs p-1.5 rounded border border-slate-200 bg-slate-50 font-bold focus:bg-white"
                            >
                              {EGYPT_GOVERNORATES.map((g) => (
                                <option key={g.code} value={g.code}>
                                  {g.nameAr} ({g.baseRate} ج.م)
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Street Address */}
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={row.streetAddress}
                              onChange={(e) => updateStagedRow(row.id, 'streetAddress', e.target.value)}
                              placeholder="اسم الشارع والحي"
                              className={`w-full text-xs p-1.5 rounded border focus:outline-none ${
                                !row.streetAddress ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50 focus:bg-white'
                              }`}
                            />
                          </td>

                          {/* Description */}
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={row.description}
                              onChange={(e) => updateStagedRow(row.id, 'description', e.target.value)}
                              placeholder="محتوى الطرد"
                              className="w-full text-xs p-1.5 rounded border border-slate-200 bg-slate-50 focus:bg-white"
                            />
                          </td>

                          {/* Weight */}
                          <td className="p-1.5">
                            <input
                              type="number"
                              step="0.5"
                              min="0.5"
                              value={row.weightKg}
                              onChange={(e) => updateStagedRow(row.id, 'weightKg', parseFloat(e.target.value) || 1)}
                              className="w-full text-xs p-1.5 rounded border border-slate-200 bg-slate-50 text-center font-mono focus:bg-white"
                            />
                          </td>

                          {/* COD Amount */}
                          <td className="p-1.5">
                            <input
                              type="number"
                              value={row.codAmount}
                              onChange={(e) => updateStagedRow(row.id, 'codAmount', parseFloat(e.target.value) || 0)}
                              className="w-full text-xs p-1.5 rounded border border-slate-200 bg-slate-50 font-bold text-emerald-700 text-center focus:bg-white"
                            />
                          </td>

                          {/* Shipping Fee (Editable) */}
                          <td className="p-1.5">
                            <div className="relative flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                value={isCustom ? row.customShippingFee! : ''}
                                placeholder={`${autoShipping}`}
                                onChange={(e) => {
                                  const val = e.target.value === '' ? null : parseFloat(e.target.value);
                                  updateStagedRow(row.id, 'customShippingFee', val !== null && !isNaN(val) ? val : null);
                                }}
                                className={`w-full text-xs p-1.5 rounded border text-center font-mono font-extrabold focus:outline-none focus:ring-1 focus:ring-red-500 ${
                                  isCustom
                                    ? 'border-red-400 bg-red-50 text-red-700'
                                    : 'border-slate-200 bg-slate-50 text-slate-700 focus:bg-white'
                                }`}
                              />
                              {isCustom && (
                                <button
                                  type="button"
                                  onClick={() => updateStagedRow(row.id, 'customShippingFee', null)}
                                  className="text-slate-400 hover:text-red-600 font-bold text-xs px-1"
                                  title="مسح وتفعيل الحساب الآلي للمحافظة"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          </td>

                          {/* Action */}
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => removeStagedRow(row.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="حذف الصف"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* STAGING SUMMARY FOOTER BAR */}
            {stagedRows.length > 0 && (
              <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto text-center sm:text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block">شحنات صالحة:</span>
                    <span className="text-sm font-extrabold text-emerald-400">
                      {validStagedCount} من {stagedRows.length}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">إجمالي الكاش المراد تحصيله:</span>
                    <span className="text-sm font-extrabold text-white">
                      {totalStagedCod.toLocaleString()} ج.م
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">إجمالي رسوم الشحن:</span>
                    <span className="text-sm font-extrabold text-red-400">
                      {totalStagedShippingFees.toLocaleString()} ج.م
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">الصافي المتوقع للتاجر:</span>
                    <span className="text-sm font-extrabold text-emerald-300">
                      {totalStagedNetPayout.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-400 hover:text-white"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={handleBatchConfirm}
                    disabled={validStagedCount === 0}
                    className="px-6 py-2.5 rounded-xl text-xs font-extrabold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 shadow-md transition-all flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    تأكيد واستيراد ({validStagedCount}) شحنة
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

