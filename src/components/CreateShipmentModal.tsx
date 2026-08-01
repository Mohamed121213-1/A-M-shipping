import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Shipment, GovernorateRate, AddressInfo, PackageDetails, DeliveryType } from '../types';
import { EGYPT_GOVERNORATES, BOSTA_HUBS } from '../data/mockData';
import { 
  X, Sparkles, MapPin, Package, DollarSign, User, Phone, AlertCircle, CheckCircle, 
  Calculator, Building, ShieldCheck, FileSpreadsheet, Upload, Download, Trash2, Plus, 
  Check, RefreshCw, FileText
} from 'lucide-react';

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateShipment: (shipment: Omit<Shipment, 'id' | 'trackingNumber' | 'createdAt' | 'updatedAt' | 'timeline'>) => void;
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
}

export const CreateShipmentModal: React.FC<CreateShipmentModalProps> = ({
  isOpen,
  onClose,
  onCreateShipment,
}) => {
  if (!isOpen) return null;

  // Active Tab: 'single' | 'excel'
  const [activeTab, setActiveTab] = useState<'single' | 'excel'>('single');

  // AI Paste Text state
  const [aiRawText, setAiRawText] = useState('');
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState('');

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

  // Selected Governorate Object
  const selectedGov = EGYPT_GOVERNORATES.find((g) => g.code === governorateCode) || EGYPT_GOVERNORATES[0];

  // Calculated / Custom Shipping Fee
  const autoShippingFee = Math.round(
    selectedGov.baseRate + Math.max(0, weightKg - 3) * selectedGov.additionalKgRate + (deliveryType === 'express' ? 25 : 0)
  );
  const [customShippingFee, setCustomShippingFee] = useState<number | null>(null);
  const calculatedShippingFee = customShippingFee !== null ? customShippingFee : autoShippingFee;

  const calculatedCodFee = Math.round(codAmount > 0 ? Math.max(10, codAmount * 0.01) : 0);
  const calculatedNetPayout = Math.max(0, codAmount - calculatedShippingFee - calculatedCodFee);

  // AI Address Parsing Handler
  const handleAiParse = async () => {
    if (!aiRawText.trim()) return;
    setIsAiParsing(true);
    setAiSuccessMessage('');

    try {
      const res = await fetch('/api/parse-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: aiRawText }),
      });

      if (!res.ok) throw new Error('فشل في الاتصال بخدمة التحليل الذكي');
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

      // Match governorate
      if (data.governorate) {
        const matchedGov = EGYPT_GOVERNORATES.find((g) =>
          g.nameAr.includes(data.governorate) || data.governorate.includes(g.nameAr)
        );
        if (matchedGov) setGovernorateCode(matchedGov.code);
      }

      setAiSuccessMessage('✨ تم استخراج وتعبئة بيانات العنوان بنجاح بواسطة الذكاء الاصطناعي!');
    } catch (err: any) {
      console.error(err);
      setAiSuccessMessage('تعذر التحليل الذكي التلقائي، يرجى ملء الحقول يدوياً');
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
      status: 'created',
      deliveryType,
      sender: {
        id: 'merch-8841',
        storeName: 'متجر الأناقة للموضة (Elegance Store)',
        contactName: 'سارة إبراهيم',
        phone: '01012345678',
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
          const countVal = parseInt(getColValue(row, ['عدد القطع', 'الكمية', 'items', 'count'], '1')) || 1;
          const weightVal = parseFloat(getColValue(row, ['الوزن', 'وزن الطرد', 'weight'], '1.5')) || 1.5;
          const codVal = parseFloat(getColValue(row, ['مبلغ التحصيل', 'المبلغ', 'الكاش', 'تحصيل', 'cod', 'amount'], '0')) || 0;
          const allowVal = getColValue(row, ['المعاينة', 'معاينة', 'allow opening'], 'نعم');

          // Match Governorate
          let matchedGovCode = 'CAI';
          if (govVal) {
            const foundGov = EGYPT_GOVERNORATES.find((g) =>
              g.nameAr.includes(govVal) || govVal.includes(g.nameAr) || g.nameEn.toLowerCase().includes(govVal.toLowerCase())
            );
            if (foundGov) matchedGovCode = foundGov.code;
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

    validRows.forEach((row) => {
      const govObj = EGYPT_GOVERNORATES.find((g) => g.code === row.governorateCode) || EGYPT_GOVERNORATES[0];
      const shippingFee = Math.round(
        govObj.baseRate + Math.max(0, row.weightKg - 3) * govObj.additionalKgRate + (row.deliveryType === 'express' ? 25 : 0)
      );
      const codFee = Math.round(row.codAmount > 0 ? Math.max(10, row.codAmount * 0.01) : 0);
      const netPayout = Math.max(0, row.codAmount - shippingFee - codFee);
      const matchedHub = BOSTA_HUBS.find((h) => h.governorate.includes(govObj.nameAr)) || BOSTA_HUBS[0];

      onCreateShipment({
        status: 'created',
        deliveryType: row.deliveryType,
        sender: {
          id: 'merch-8841',
          storeName: 'متجر الأناقة للموضة (Elegance Store)',
          contactName: 'سارة إبراهيم',
          phone: '01012345678',
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
      });
    });

    setStagedRows([]);
    onClose();
  };

  // Calculations for Staging Summary Bar
  const totalStagedCod = stagedRows.reduce((sum, r) => sum + (r.codAmount || 0), 0);
  const totalStagedShippingFees = stagedRows.reduce((sum, r) => {
    const govObj = EGYPT_GOVERNORATES.find((g) => g.code === r.governorateCode) || EGYPT_GOVERNORATES[0];
    return sum + Math.round(govObj.baseRate + Math.max(0, r.weightKg - 3) * govObj.additionalKgRate);
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
            {/* AI Smart Address Parser Section */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 font-bold text-indigo-900 text-xs sm:text-sm">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-bounce" />
                  المحلل الذكي للعنوان (Gemini AI Address Extractor)
                </span>
                <span className="text-[11px] text-indigo-600 font-medium">الصق رسالة العميل أو عنوان الواتساب</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <textarea
                  value={aiRawText}
                  onChange={(e) => setAiRawText(e.target.value)}
                  rows={2}
                  placeholder="مثال: أحمد سامي 01012345678 شارع التحرير عممارة 12 شقة 4 الدقي الجيزة (الاتصال قبل الاستلام)"
                  className="w-full text-xs p-2.5 bg-white border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500/30 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAiParse}
                  disabled={isAiParsing || !aiRawText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 shrink-0"
                >
                  {isAiParsing ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      جاري التحليل...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      استخراج بالذكاء الاصطناعي
                    </>
                  )}
                </button>
              </div>

              {aiSuccessMessage && (
                <p className="text-xs text-indigo-700 font-semibold mt-2 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-indigo-600 shrink-0" />
                  {aiSuccessMessage}
                </p>
              )}
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
                      const newGov = EGYPT_GOVERNORATES.find((g) => g.code === e.target.value);
                      if (newGov && newGov.cities && newGov.cities.length > 0) {
                        setCity(newGov.cities[0]);
                      }
                    }}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-red-500/20"
                  >
                    {EGYPT_GOVERNORATES.map((g) => (
                      <option key={g.code} value={g.code}>
                        {g.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المدينة / المركز *</label>
                  <input
                    type="text"
                    list="city-suggestions"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder={selectedGov.cities && selectedGov.cities.length > 0 ? `اختر من مدن ${selectedGov.nameAr} أو اكتب...` : "اسم المدينة / المركز"}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-red-500/20 font-medium text-slate-800"
                  />
                  <datalist id="city-suggestions">
                    {selectedGov.cities?.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
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
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-lg"
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

            {/* Financials & Rate Calculation Preview */}
            <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-300 flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  حاسبة التحصيل والمستحقات المالية
                </span>
                <span className="text-[11px] text-slate-400">حساب آلي بنظام بوسطة</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">المبلغ المطلوب تحصيله (COD) *</label>
                  <input
                    type="number"
                    value={codAmount}
                    onChange={(e) => setCodAmount(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-extrabold text-slate-900 p-2 bg-white rounded-lg focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">تكلفة الشحن (ج.م) *</label>
                  <input
                    type="number"
                    value={calculatedShippingFee}
                    onChange={(e) => setCustomShippingFee(parseFloat(e.target.value) || 0)}
                    className="w-full text-sm font-extrabold text-slate-900 p-2 bg-white rounded-lg focus:ring-2 focus:ring-red-400"
                  />
                </div>

                <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700 flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 block">رسوم التحصيل (COD Fee):</span>
                  <span className="text-sm font-bold text-amber-400">{calculatedCodFee} ج.م</span>
                </div>

                <div className="bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded-lg flex flex-col justify-center">
                  <span className="text-[10px] text-emerald-300 block">الصافي المحول لحسابك:</span>
                  <span className="text-base font-extrabold text-emerald-400">{calculatedNetPayout} ج.م</span>
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  جدول الشحنات المجهزة للاستيراد (Staging Table)
                </h4>
                <span className="bg-slate-200 text-slate-800 font-mono text-xs font-bold px-2 py-0.5 rounded-md">
                  {stagedRows.length} صف
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAddEmptyStagedRow}
                  className="flex-1 sm:flex-none text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-colors"
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
                      <th className="p-2.5 min-w-[80px]">الشحن المقدر</th>
                      <th className="p-2.5 text-center w-[50px]">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {stagedRows.map((row, index) => {
                      const valid = isRowValid(row);
                      const estShipping = Math.round(
                        (EGYPT_GOVERNORATES.find((g) => g.code === row.governorateCode)?.baseRate || 50) +
                          Math.max(0, row.weightKg - 3) * 10
                      );

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

                          {/* Estimated Shipping */}
                          <td className="p-2 font-bold text-red-600 text-center font-mono">
                            {estShipping} ج.م
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

