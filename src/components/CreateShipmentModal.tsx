import React, { useState, useRef, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Shipment, GovernorateRate, AddressInfo, PackageDetails, DeliveryType, HubInfo, AppUserRole, UserSession } from '../types';
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
    setCustomShippingFee(null); // Reset manual override to adapt to newly selected merchant's custom rate
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
  const [isImageDragOver, setIsImageDragOver] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('يرجى اختيار صورة صحيحة (JPG, PNG, WEBP, إلخ)');
      return;
    }

    const mime = file.type || 'image/jpeg';
    setAiImageMimeType(mime);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAiImagePreview(result);
      setAiImageBase64(result);
      // Automatically trigger smart extraction immediately
      handleAiParse(result, mime, aiRawText);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleImageFile(file);
  };

  const handleRemoveImage = () => {
    setAiImagePreview(null);
    setAiImageBase64(null);
    setAiSuccessMessage('');
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

  // Financials
  const [codAmount, setCodAmount] = useState<number>(1200);

  // Excel Batch Upload States
  const [stagedRows, setStagedRows] = useState<StagedShipmentRow[]>([]);
  const [excelError, setExcelError] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const governoratesList = governorates && governorates.length > 0 ? governorates : EGYPT_GOVERNORATES;

  // Currently Selected Merchant Object
  const currentSelectedMerchant = useMemo(() => {
    if (currentUser && currentUser.role === 'merchant') {
      return currentUser;
    }
    return registeredMerchants.find((m) => m.id === selectedMerchantId) || registeredMerchants[0] || null;
  }, [currentUser, registeredMerchants, selectedMerchantId]);

  // Selected Governorate Object
  const selectedGov = governoratesList.find((g) => g.code === governorateCode) || governoratesList[0];

  // Check if current merchant has custom shipping rate for this governorate
  const merchantCustomRate = useMemo(() => {
    if (!currentSelectedMerchant) return null;

    // 1. Check custom per-governorate rates first
    if (
      currentSelectedMerchant.shippingPricingType === 'governorates' &&
      currentSelectedMerchant.customGovernorateRates &&
      currentSelectedMerchant.customGovernorateRates[governorateCode] !== undefined &&
      currentSelectedMerchant.customGovernorateRates[governorateCode] !== null
    ) {
      return Number(currentSelectedMerchant.customGovernorateRates[governorateCode]);
    }

    // 2. Check unified custom rate
    if (
      currentSelectedMerchant.hasCustomShippingRate &&
      currentSelectedMerchant.customShippingRate !== undefined &&
      currentSelectedMerchant.customShippingRate !== null &&
      Number(currentSelectedMerchant.customShippingRate) > 0
    ) {
      return Number(currentSelectedMerchant.customShippingRate);
    }

    return null;
  }, [currentSelectedMerchant, governorateCode]);

  // Effective Base Shipping Rate
  const effectiveBaseRate = merchantCustomRate !== null ? merchantCustomRate : selectedGov.baseRate;

  // Calculated / Custom Shipping Fee
  const autoShippingFee = Math.round(
    effectiveBaseRate + Math.max(0, weightKg - 3) * selectedGov.additionalKgRate + (deliveryType === 'express' ? 25 : 0)
  );
  const [customShippingFee, setCustomShippingFee] = useState<number | null>(null);
  const calculatedShippingFee = customShippingFee !== null ? customShippingFee : autoShippingFee;

  const calculatedCodFee = 0;
  const calculatedNetPayout = Math.max(0, codAmount - calculatedShippingFee);

  // AI Address & Image OCR Parsing Handler
  const handleAiParse = async (overrideImageBase64?: string, overrideMimeType?: string, overrideRawText?: string) => {
    const targetImage = overrideImageBase64 !== undefined ? overrideImageBase64 : aiImageBase64;
    const targetMime = overrideMimeType !== undefined ? overrideMimeType : aiImageMimeType;
    const targetText = overrideRawText !== undefined ? overrideRawText : aiRawText;

    if (!targetText?.trim() && !targetImage) return;
    setIsAiParsing(true);
    setAiSuccessMessage('');

    try {
      const res = await fetch('/api/parse-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawText: targetText,
          imageBase64: targetImage,
          mimeType: targetMime,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'فشل في الاتصال بخدمة التحليل الذكي وتفريغ البيانات');
      }

      const data = await res.json();
      let extractedCount = 0;

      if (data.recipientName) { setRecipientName(data.recipientName); extractedCount++; }
      if (data.phone) { setPhone(data.phone); extractedCount++; }
      if (data.secondaryPhone) { setSecondaryPhone(data.secondaryPhone); extractedCount++; }
      if (data.city) { setCity(data.city); extractedCount++; }
      if (data.district) { setDistrict(data.district); extractedCount++; }
      if (data.streetAddress) { setStreetAddress(data.streetAddress); extractedCount++; }
      if (data.buildingNo) { setBuildingNo(data.buildingNo); }
      if (data.apartmentNo) { setApartmentNo(data.apartmentNo); }
      if (data.deliveryNotes) { setNotes(data.deliveryNotes); }

      if (data.description) { setDescription(data.description); }
      if (typeof data.codAmount === 'number' && data.codAmount > 0) { setCodAmount(data.codAmount); extractedCount++; }
      if (typeof data.itemsCount === 'number' && data.itemsCount > 0) { setItemsCount(data.itemsCount); }

      // Match governorate
      if (data.governorate || data.city) {
        const govTerm = (data.governorate || '').trim();
        const cityTerm = (data.city || '').trim();
        const matchedGov = governoratesList.find((g) =>
          (govTerm && (g.nameAr.includes(govTerm) || govTerm.includes(g.nameAr))) ||
          (cityTerm && g.cities?.some((c) => c.toLowerCase().includes(cityTerm.toLowerCase()) || cityTerm.toLowerCase().includes(c.toLowerCase())))
        );
        if (matchedGov) {
          setGovernorateCode(matchedGov.code);
          extractedCount++;
        }
      }

      setAiSuccessMessage(
        extractedCount > 0
          ? '✨ تم استخراج وتعبئة بيانات الشحنة من الصورة بنجاح!'
          : '✨ تم استخراج البيانات، يرجى مراجعة الحقول وتأكيدها.'
      );
    } catch (err: any) {
      console.warn('AI Parsing notice:', err.message || err);
      setAiSuccessMessage('تم فحص الصورة، يمكنك إكمال أو تعديل أي حقول يدوياً');
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
        itemsCount,
        weightKg,
        allowOpening,
        isFragile,
      },
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
          const countVal = parseInt(getColValue(row, ['عدد القطع', 'عدد قطع', 'القطع', 'قطع', 'الكمية', 'عدد', 'items', 'count', 'pieces', 'qty', 'quantity'], '1')) || 1;
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
      
      // Determine merchant custom rate for this governorate
      const rowMerchCustomRate = currentSelectedMerchant?.shippingPricingType === 'governorates' &&
        currentSelectedMerchant?.customGovernorateRates &&
        currentSelectedMerchant.customGovernorateRates[govObj.code] !== undefined &&
        currentSelectedMerchant.customGovernorateRates[govObj.code] !== null
          ? Number(currentSelectedMerchant.customGovernorateRates[govObj.code])
          : (currentSelectedMerchant?.hasCustomShippingRate && currentSelectedMerchant?.customShippingRate !== undefined && currentSelectedMerchant?.customShippingRate !== null && Number(currentSelectedMerchant.customShippingRate) > 0
              ? Number(currentSelectedMerchant.customShippingRate)
              : null);

      const effectiveRowBaseRate = rowMerchCustomRate !== null ? rowMerchCustomRate : govObj.baseRate;

      const autoShippingFee = Math.round(
        effectiveRowBaseRate + Math.max(0, row.weightKg - 3) * govObj.additionalKgRate + (row.deliveryType === 'express' ? 25 : 0)
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
  const totalStagedPieces = stagedRows.reduce((sum, r) => sum + (r.itemsCount || 1), 0);
  const totalStagedShippingFees = stagedRows.reduce((sum, r) => {
    const govObj = governoratesList.find((g) => g.code === r.governorateCode) || governoratesList[0];
    const rowMerchCustomRate = currentSelectedMerchant?.shippingPricingType === 'governorates' &&
      currentSelectedMerchant?.customGovernorateRates &&
      currentSelectedMerchant.customGovernorateRates[govObj.code] !== undefined &&
      currentSelectedMerchant.customGovernorateRates[govObj.code] !== null
        ? Number(currentSelectedMerchant.customGovernorateRates[govObj.code])
        : (currentSelectedMerchant?.hasCustomShippingRate && currentSelectedMerchant?.customShippingRate !== undefined && currentSelectedMerchant?.customShippingRate !== null && Number(currentSelectedMerchant.customShippingRate) > 0
            ? Number(currentSelectedMerchant.customShippingRate)
            : null);

    const baseRate = rowMerchCustomRate !== null ? rowMerchCustomRate : govObj.baseRate;
    const autoFee = Math.round(baseRate + Math.max(0, r.weightKg - 3) * govObj.additionalKgRate + (r.deliveryType === 'express' ? 25 : 0));
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
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 space-y-4 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">تفريغ بيانات الشحنة تلقائياً (اختياري)</h4>
                    <p className="text-[11px] text-slate-500">ارفع صورة بوليصة/سكرين شوت أو الصق نص رسالة العميل لملء البيانات بضغطة زر</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-full self-start sm:self-auto">
                  توفير الوقت والجهد
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Option 1: Image Upload (File / Drag & Drop) */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-red-600" />
                    خيار 1: صورة البوليصة أو المحادثة
                  </span>

                  <input
                    type="file"
                    ref={imageInputRef}
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />

                  {aiImagePreview ? (
                    <div className="bg-white border border-slate-300 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <img
                          src={aiImagePreview}
                          alt="صورة البوليصة"
                          className="w-12 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">تم اختيار الصورة بنجاح</p>
                          <p className="text-[10px] text-slate-500">جاهزة للقراءة والاستخراج</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleAiParse(aiImageBase64 || undefined, aiImageMimeType, aiRawText)}
                          disabled={isAiParsing}
                          className="text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          إعادة الاستخراج
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="إزالة الصورة"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsImageDragOver(true);
                      }}
                      onDragLeave={() => setIsImageDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsImageDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleImageFile(file);
                      }}
                      onClick={() => imageInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1 ${
                        isImageDragOver
                          ? 'border-red-500 bg-red-50/60'
                          : 'border-slate-300 bg-white hover:border-red-400 hover:bg-slate-50/50'
                      }`}
                    >
                      <ImageIcon className="w-5 h-5 text-red-600" />
                      <span className="text-xs font-bold text-slate-800">
                        اضغط لرفع صورة أو اسحبها هنا
                      </span>
                      <span className="text-[10px] text-slate-400">يدعم JPG و PNG وسكرين شوت الواتساب</span>
                    </div>
                  )}
                </div>

                {/* Option 2: Raw Text Paste */}
                <div className="space-y-1.5 flex flex-col">
                  <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-red-600" />
                    خيار 2: لصق نص الرسالة أو العنوان
                  </span>
                  <div className="relative flex-1 flex flex-col">
                    <textarea
                      value={aiRawText}
                      onChange={(e) => setAiRawText(e.target.value)}
                      rows={2}
                      placeholder="مثال: أحمد سامي 01012345678 شارع التحرير الدقي الجيزة (مبلغ التحصيل 1200 ج)"
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none flex-1 resize-none"
                    />
                    {aiRawText.trim() && (
                      <button
                        type="button"
                        onClick={() => handleAiParse(aiImageBase64 || undefined, aiImageMimeType, aiRawText)}
                        disabled={isAiParsing}
                        className="mt-1.5 self-end bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3 text-yellow-400" />
                        استخراج من النص
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Status or Progress Feedback */}
              {isAiParsing && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2.5 text-xs font-bold text-red-800">
                  <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin shrink-0"></span>
                  <span>جاري تحليل وقراءة بيانات الشحنة واستخراج الاسم والهاتف والعنوان تلقائياً...</span>
                </div>
              )}

              {aiSuccessMessage && !isAiParsing && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs font-bold text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{aiSuccessMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAiSuccessMessage('')}
                    className="text-emerald-500 hover:text-emerald-700 text-xs px-2"
                  >
                    إغلاق
                  </button>
                </div>
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
                        {m.storeName || `متجر ${m.name}`} - ({m.name} | {m.phone}) {m.hasCustomShippingRate && m.customShippingRate ? `[سعر شحن خاص: ${m.customShippingRate} ج.م]` : ''}
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

              {/* Custom Shipping Rate Indicator for Selected Merchant */}
              {merchantCustomRate !== null ? (
                <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-950 font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      سعر الشحن المخصص للتاجر ({currentSelectedMerchant?.storeName || currentSelectedMerchant?.name}):{' '}
                      <strong className="text-emerald-700 font-black text-sm">{merchantCustomRate} ج.م</strong>{' '}
                      {currentSelectedMerchant?.shippingPricingType === 'governorates' ? '(تسعيرة المحافظة)' : '(سعر موحد متفق عليه)'}
                    </span>
                  </div>
                  <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-black px-2 py-0.5 rounded-md">
                    مطبق تلقائياً
                  </span>
                </div>
              ) : currentSelectedMerchant?.role === 'merchant' ? (
                <div className="bg-slate-100 border border-slate-200 p-2 rounded-lg flex items-center justify-between text-[11px] text-slate-600">
                  <span>سعر الشحن لهذا التاجر: <strong>حسب تسعيرة المحافظات العامة للنظام ({selectedGov.baseRate} ج.م)</strong></span>
                  {currentRole === 'admin' && (
                    <span className="text-[10px] text-red-600 font-bold">يمكنك تخصيص سعر ثابت للتاجر من لوحة الأدمن</span>
                  )}
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم العلامة التجارية / المتجر</label>
                  <input
                    type="text"
                    required
                    value={merchantStoreName}
                    readOnly={currentRole === 'merchant' || currentUser?.role === 'merchant'}
                    onChange={(e) => setMerchantStoreName(e.target.value)}
                    placeholder="مثال: متجر الأناقة"
                    className={`w-full text-xs p-2.5 border rounded-lg font-bold ${
                      currentRole === 'merchant' || currentUser?.role === 'merchant'
                        ? 'bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-white border border-slate-200 focus:ring-2 focus:ring-red-500/20'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف التاجر</label>
                  <input
                    type="tel"
                    required
                    value={merchantPhone}
                    readOnly={currentRole === 'merchant' || currentUser?.role === 'merchant'}
                    onChange={(e) => setMerchantPhone(e.target.value)}
                    placeholder="01012345678"
                    className={`w-full text-xs p-2.5 border rounded-lg font-mono ${
                      currentRole === 'merchant' || currentUser?.role === 'merchant'
                        ? 'bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-white border border-slate-200 focus:ring-2 focus:ring-red-500/20'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* STEP 1: Recipient Information */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  1
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-red-600" />
                  بيانات العميل المستلم
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم العميل (المستلم) *</label>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="مثال: أحمد محمد محمود"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف الرئيسي *</label>
                  <input
                    type="tel"
                    required
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01012345678"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف بديل (اختياري)</label>
                  <input
                    type="tel"
                    dir="ltr"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    placeholder="01123456789"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
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
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-slate-900 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all cursor-pointer"
                  >
                    {governoratesList.map((g) => (
                      <option key={g.code} value={g.code}>
                        {g.nameAr} (سعر الشحن: {g.baseRate} ج.م)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">المدينة / المركز / المنطقة *</label>
                    <span className="text-[11px] text-slate-400">اختر من المقترحات السريعة أو اكتب مباشرة</span>
                  </div>
                  <input
                    type="text"
                    list="city-suggestions"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={selectedGov.cities && selectedGov.cities.length > 0 ? `مثال: ${selectedGov.cities.slice(0, 3).join('، ')}` : "اكتب اسم المدينة أو المركز"}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  />
                  <datalist id="city-suggestions">
                    {selectedGov.cities?.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>

                  {/* Auto-suggested Centers Chips */}
                  {selectedGov.cities && selectedGov.cities.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] font-bold text-slate-400">شائع في {selectedGov.nameAr}:</span>
                      {selectedGov.cities.slice(0, 8).map((cityName) => (
                        <button
                          key={cityName}
                          type="button"
                          onClick={() => setCity(cityName)}
                          className={`text-[11px] px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                            city === cityName
                              ? 'bg-red-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-700'
                          }`}
                        >
                          {cityName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">العنوان بالتفصيل والعلامة المميزة *</label>
                  <input
                    type="text"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="اسم الشارع، رقم العمارة، بجوار علامة مميزة (مسجد، مدرسة، صيدلية)"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:col-span-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">رقم المبنى / العمارة</label>
                    <input
                      type="text"
                      value={buildingNo}
                      onChange={(e) => setBuildingNo(e.target.value)}
                      placeholder="15"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">رقم الشقة / الدور</label>
                    <input
                      type="text"
                      value={apartmentNo}
                      onChange={(e) => setApartmentNo(e.target.value)}
                      placeholder="شقة 3 الدور 2"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-600 mb-1">ملاحظات للمندوب</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="الاتصال قبل الوصول..."
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* STEP 2: Package Details & Pricing */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-2xs">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                  2
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-red-600" />
                  مواصفات الطرد ومبلغ التحصيل
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">وصف محتويات الطرد</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="مثال: عباية سوداء مقاس XL + طرحة"
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all"
                  />
                </div>

                {/* PROMINENT COD AMOUNT INPUT */}
                <div className="bg-emerald-50/70 border-2 border-emerald-300 rounded-2xl p-4 sm:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <label className="block text-xs font-black text-emerald-950">
                        مبلغ التحصيل المطلوب من العميل نقداً (COD) *
                      </label>
                      <p className="text-[11px] text-emerald-700">المبلغ الإجمالي شاملاً ثمن المنتج ومصاريف الشحن المتفق عليها</p>
                    </div>
                    <span className="text-xs font-extrabold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 self-start sm:self-auto">
                      بالجنيه المصري (EGP)
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0}
                      step="any"
                      value={codAmount === 0 ? '' : codAmount}
                      onChange={(e) => setCodAmount(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full text-2xl font-black text-emerald-900 bg-white border border-emerald-300 rounded-xl p-3 pl-16 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-600 outline-none"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-extrabold text-emerald-700 pointer-events-none">
                      ج.م
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">نوع الشحنة والخدمة</label>
                  <select
                    value={deliveryType}
                    onChange={(e) => setDeliveryType(e.target.value as DeliveryType)}
                    className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white outline-none"
                  >
                    <option value="standard">شحن عادي ({selectedGov.estDays})</option>
                    <option value="express">شحن سريع VIP (+25 ج.م)</option>
                    <option value="exchange">طلب استبدال واسترجاع قديم</option>
                    <option value="return">طلب مرتجع فقط</option>
                  </select>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl border border-slate-200 transition-colors flex-1">
                    <input
                      type="checkbox"
                      checked={allowOpening}
                      onChange={(e) => setAllowOpening(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                    />
                    <span>السماح بفتح المعاينة</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl border border-slate-200 transition-colors flex-1">
                    <input
                      type="checkbox"
                      checked={isFragile}
                      onChange={(e) => setIsFragile(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                    />
                    <span>طرد حساس / قابل للكسر</span>
                  </label>
                </div>
              </div>
            </div>

            {/* STEP 3: Financial Summary & Confirmation */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-4 shadow-md">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    الملخص المالي وصافي المستحقات
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400">حساب فوري وتلقائي</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl">
                  <span className="text-[11px] text-slate-400 block mb-1">المبلغ المحصل من العميل</span>
                  <span className="text-lg font-black text-white">{codAmount.toLocaleString()} ج.م</span>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] text-slate-400">تكلفة الشحن لـ {selectedGov.nameAr}</span>
                    {merchantCustomRate !== null ? (
                      <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40 flex items-center gap-1">
                        ✨ سعر خاص للتاجر
                      </span>
                    ) : currentRole === 'admin' ? (
                      <span className="text-[10px] text-red-400 font-bold">(قابل للتعديل للمدير)</span>
                    ) : null}
                  </div>
                  {currentRole === 'admin' ? (
                    <input
                      type="number"
                      value={calculatedShippingFee}
                      onChange={(e) => setCustomShippingFee(parseFloat(e.target.value) || 0)}
                      className="w-full text-base font-black text-slate-900 p-1.5 bg-white rounded-lg"
                    />
                  ) : (
                    <span className="text-lg font-black text-red-400">{calculatedShippingFee.toLocaleString()} ج.م</span>
                  )}
                </div>

                <div className="bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-xl flex flex-col justify-center">
                  <span className="text-[11px] text-emerald-300 block mb-1 font-bold">صافي المستحق لك (أرباحك):</span>
                  <span className="text-xl font-black text-emerald-400">{calculatedNetPayout.toLocaleString()} ج.م</span>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-8 py-3 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Package className="w-4.5 h-4.5" />
                تأكيد وإنشاء الشحنة الآن
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
                      <th className="p-2.5 w-[75px]">عدد القطع</th>
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

                          {/* Items Count */}
                          <td className="p-1.5">
                            <input
                              type="number"
                              min="1"
                              value={row.itemsCount || 1}
                              onChange={(e) => updateStagedRow(row.id, 'itemsCount', parseInt(e.target.value) || 1)}
                              className="w-full text-xs p-1.5 rounded border border-slate-200 bg-slate-50 text-center font-mono font-bold focus:bg-white"
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
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 w-full sm:w-auto text-center sm:text-right">
                  <div>
                    <span className="text-[10px] text-slate-400 block">شحنات صالحة:</span>
                    <span className="text-sm font-extrabold text-emerald-400">
                      {validStagedCount} من {stagedRows.length}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block">إجمالي القطع:</span>
                    <span className="text-sm font-extrabold text-amber-300">
                      {totalStagedPieces} قطعة
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

