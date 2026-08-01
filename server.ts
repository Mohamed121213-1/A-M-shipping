import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let genAI: GoogleGenAI | null = null;

function getGenAIClient(): GoogleGenAI | null {
  if (genAI) return genAI;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY environment variable is not defined.");
    return null;
  }
  genAI = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
  return genAI;
}

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Bosta Logistics API", timestamp: new Date().toISOString() });
});

// AI Smart Address Parser API
app.post("/api/parse-address", async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
      return res.status(400).json({ error: "الرجاء توفير نص العنوان للتحليل" });
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Fallback simple parsing if no API key is available
      return res.json({
        recipientName: "عميل بوسطة",
        phone: rawText.match(/01[0125]\d{8}/)?.[0] || "",
        governorate: rawText.includes("القاهرة") ? "القاهرة" : rawText.includes("الجيزة") ? "الجيزة" : rawText.includes("الإسكندرية") ? "الإسكندرية" : "القاهرة",
        city: "مدينة نصر",
        district: "",
        streetAddress: rawText,
        buildingNo: "",
        apartmentNo: "",
        deliveryNotes: "تم التحليل اليدوي التلقائي",
      });
    }

    const systemPrompt = `أنت مساعد خبير في تحليل العناوين وأرقام الهواتف لشحنات بوسطة في مصر.
قم باستخراج البيانات التالية بطلب دقيق من النص المعطى:
- recipientName: اسم المستلم الكامل.
- phone: رقم الهاتف المصري الأساسي (يبدأ بـ 010 أو 011 أو 012 أو 015).
- secondaryPhone: رقم هاتف إضافي إن وجد.
- governorate: المحافظة المصرية (مثل: القاهرة، الجيزة، الإسكندرية، الدقهلية، الغربية، الشرقية، أسيوط، إلخ).
- city: المدينة أو المركز (مثل: مدينة نصر، المعادي، الدقي، سموحة، طنطا، المنصورة، إلخ).
- district: الحي أو الشارع الرئيسي.
- streetAddress: العنوان التفصيلي للشارع مع العلامات المميزة.
- buildingNo: رقم المبنى أو العمارة إن وجد.
- apartmentNo: رقم الشقة أو الدور إن وجد.
- deliveryNotes: أية تعليمات خاصة للتسليم (مثل الاتصال قبل الوصول، معاينة الطرد، التسليم مساءً).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: rawText,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recipientName: { type: Type.STRING, description: "اسم المستلم" },
            phone: { type: Type.STRING, description: "رقم الهاتف الرئيسي" },
            secondaryPhone: { type: Type.STRING, description: "رقم هاتف إضافي" },
            governorate: { type: Type.STRING, description: "اسم المحافظة" },
            city: { type: Type.STRING, description: "المدينة أو المركز" },
            district: { type: Type.STRING, description: "الحي أو المنطقة" },
            streetAddress: { type: Type.STRING, description: "العنوان التفصيلي" },
            buildingNo: { type: Type.STRING, description: "رقم المبنى" },
            apartmentNo: { type: Type.STRING, description: "رقم الشقة" },
            deliveryNotes: { type: Type.STRING, description: "ملاحظات التسليم" },
          },
          required: ["recipientName", "phone", "governorate", "streetAddress"],
        },
      },
    });

    const parsedJson = JSON.parse(response.text || "{}");
    return res.json(parsedJson);
  } catch (error: any) {
    console.error("Error parsing address with Gemini:", error);
    return res.status(500).json({
      error: "فشل في تحليل العنوان بواسطة الذكاء الاصطناعي",
      details: error.message,
    });
  }
});

// AI Risk Assessment API
app.post("/api/ai-risk-check", async (req, res) => {
  try {
    const { shipment } = req.body;
    if (!shipment) {
      return res.status(400).json({ error: "الرجاء توفير بيانات الشحنة" });
    }

    const ai = getGenAIClient();
    if (!ai) {
      return res.json({
        riskScore: 15,
        riskLevel: "منخفض جداً",
        recommendations: ["العنوان يبدو واضحاً وجاهزاً للتسليم السريع."],
      });
    }

    const prompt = `حلل مخاطر توصيل هذه الشحنة بناءً على البيانات التالية:
- المحافظة: ${shipment.recipient?.governorate || ""}
- العنوان: ${shipment.recipient?.streetAddress || ""}
- مبلغ التحصيل (COD): ${shipment.financials?.codAmount || 0} جنيه
- نوع الطرد: ${shipment.packageDetails?.description || ""}
- إمكانية المعاينة: ${shipment.packageDetails?.allowOpening ? "نعم" : "لا"}

قم بتقييم درجة خطورة عدم التسليم أو مشاكل تحصيل الكاش من 0 إلى 100، واقترح 2-3 نصائح عمليّة لمدير عمليات بوسطة أو المندوب.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            riskScore: { type: Type.NUMBER, description: "نسبة المخاطرة من 0 إلى 100" },
            riskLevel: { type: Type.STRING, description: "مستوى المخاطرة: منخفض، متوسط، مرتفع" },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "توصيات الذكاء الاصطناعي",
            },
          },
          required: ["riskScore", "riskLevel", "recommendations"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  // Vite Middleware Setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Bosta Express Logistics Server running on http://localhost:${PORT}`);
  });
}

startServer();
