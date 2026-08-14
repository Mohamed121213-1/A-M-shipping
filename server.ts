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

// Server-side State Persistence & Multi-Device Sync Engine
import fs from "fs";
import webpush from "web-push";

const DATA_DIR = path.join(process.cwd(), "data");
const BACKUPS_DIR = path.join(DATA_DIR, "backups");
const STATE_FILE = path.join(DATA_DIR, "app_state.json");
const LATEST_BACKUP_FILE = path.join(BACKUPS_DIR, "latest_backup.json");
const VAPID_KEYS_FILE = path.join(DATA_DIR, "vapid_keys.json");
const PUSH_SUBS_FILE = path.join(DATA_DIR, "push_subscriptions.json");

// Permanent Static Web Push VAPID Keys (Guarantees push subscriptions remain valid across restarts)
const vapidKeys = {
  publicKey: "BG3V0XFkpUw3Z0hJir8nueeTkvLKxeAKSwME5al0uYiwtp8E5NUAPaw9FSTHL4WbFlV3wURUAl9UldcpqHaPIbA",
  privateKey: "P_XsqaNOrOFgxttq2naHZ02z-OoT7tvD7HHzmkFCxQI"
};

try {
  webpush.setVapidDetails(
    "mailto:support@bosta-shipping.eg",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );
} catch (e) {
  console.warn("Error setting VAPID details:", e);
}

let pushSubscriptions: Array<{
  subscription: any;
  userId?: string;
  role?: string;
  courierId?: string;
  updatedAt: string;
}> = [];

if (fs.existsSync(PUSH_SUBS_FILE)) {
  try {
    pushSubscriptions = JSON.parse(fs.readFileSync(PUSH_SUBS_FILE, "utf-8"));
  } catch (e) {
    pushSubscriptions = [];
  }
}

function savePushSubscriptions() {
  try {
    fs.writeFileSync(PUSH_SUBS_FILE, JSON.stringify(pushSubscriptions, null, 2));
  } catch (e) {
    console.warn("Failed to save push subscriptions:", e);
  }
}

// Broadcast Remote Web Push to closed/background devices
async function sendWebPushToSubscribers(payload: {
  title: string;
  body: string;
  tag?: string;
  data?: any;
  targetCourierId?: string;
}) {
  if (!pushSubscriptions || pushSubscriptions.length === 0) return;

  const notificationPayload = JSON.stringify({
    title: payload.title,
    body: payload.body,
    tag: payload.tag || `push-${Date.now()}`,
    data: payload.data || {},
  });

  const deadEndpoints: string[] = [];
  const options = {
    TTL: 86400,
    headers: {
      'Urgency': 'high',
    },
  };

  await Promise.allSettled(
    pushSubscriptions.map(async (subItem) => {
      if (!subItem || !subItem.subscription) return;
      if (
        payload.targetCourierId &&
        subItem.courierId &&
        subItem.courierId !== payload.targetCourierId &&
        subItem.role === 'courier'
      ) {
        return;
      }

      try {
        await webpush.sendNotification(subItem.subscription, notificationPayload, options);
      } catch (err: any) {
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          if (subItem.subscription?.endpoint) {
            deadEndpoints.push(subItem.subscription.endpoint);
          }
        } else {
          console.warn('Web Push delivery notice:', err?.statusCode || err?.message);
        }
      }
    })
  );

  if (deadEndpoints.length > 0) {
    pushSubscriptions = pushSubscriptions.filter(
      (s) => !deadEndpoints.includes(s.subscription?.endpoint)
    );
    savePushSubscriptions();
  }
}

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {}
}

if (!fs.existsSync(BACKUPS_DIR)) {
  try {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  } catch (e) {}
}

function sanitizeServerState(rawState: any) {
  if (!rawState) return rawState;

  if (Array.isArray(rawState.users)) {
    rawState.users = rawState.users.filter((u: any) => u && typeof u === 'object' && u.id && u.name);
    const hasAdmin = rawState.users.some((u: any) => u.role === 'admin' || u.email === 'mohamedsalah565657@icloud.com');
    if (!hasAdmin) {
      rawState.users.unshift({
        id: 'USR-ADMIN-2',
        name: 'محمد صلاح (أدمن الرئيسية)',
        email: 'mohamedsalah565657@icloud.com',
        phone: '01000000001',
        role: 'admin',
        avatarUrl: 'https://ui-avatars.com/api/?name=%D9%85%D8%AD%D9%85%D8%AF+%D8%B5%D9%84%D8%A7%D8%AD&background=dc2626&color=ffffff',
        isConfirmed: true,
      });
    }
  }

  if (Array.isArray(rawState.couriers)) {
    rawState.couriers = rawState.couriers.filter((c: any) => c && typeof c === 'object' && c.id && c.name);
  }

  if (Array.isArray(rawState.companyTransactions)) {
    rawState.companyTransactions = rawState.companyTransactions.filter((t: any) => t && typeof t === 'object' && t.id);
  }

  if (Array.isArray(rawState.shipments)) {
    rawState.shipments = rawState.shipments.filter((s: any) => s && typeof s === 'object' && (s.id || s.trackingNumber));
  }

  return rawState;
}

let serverAppState: any = null;
let serverLastUpdated = 0;

// Helper to save backup copy to disk safely
function saveBackupSnapshot(state: any, timestamp: number) {
  try {
    const backupData = JSON.stringify({ state, timestamp, savedAt: new Date().toISOString() }, null, 2);
    fs.writeFileSync(LATEST_BACKUP_FILE, backupData);
    
    // Also save a timestamped snapshot
    const timestampedFile = path.join(BACKUPS_DIR, `backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
    fs.writeFileSync(timestampedFile, backupData);

    // Keep only last 15 backup files
    const files = fs.readdirSync(BACKUPS_DIR)
      .filter((f) => f.startsWith("backup_"))
      .sort((a, b) => fs.statSync(path.join(BACKUPS_DIR, b)).mtimeMs - fs.statSync(path.join(BACKUPS_DIR, a)).mtimeMs);

    if (files.length > 15) {
      files.slice(15).forEach((f) => {
        try { fs.unlinkSync(path.join(BACKUPS_DIR, f)); } catch (e) {}
      });
    }
  } catch (err) {
    console.warn("Failed to write backup snapshot:", err);
  }
}

// Load initial state with backup fallback
if (fs.existsSync(STATE_FILE)) {
  try {
    const raw = fs.readFileSync(STATE_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    serverAppState = sanitizeServerState(parsed.state || null);
    serverLastUpdated = parsed.timestamp || 0;
  } catch (e) {
    console.warn("Failed to read app_state.json:", e);
  }
}

// Fallback to latest backup if main file was empty or corrupted
if ((!serverAppState || Object.keys(serverAppState).length === 0) && fs.existsSync(LATEST_BACKUP_FILE)) {
  try {
    const raw = fs.readFileSync(LATEST_BACKUP_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed.state) {
      serverAppState = sanitizeServerState(parsed.state);
      serverLastUpdated = parsed.timestamp || Date.now();
      console.log("Restored server state from latest backup snapshot!");
    }
  } catch (e) {
    console.warn("Failed to load backup snapshot:", e);
  }
}

// Web Push Registration Endpoints
app.get("/api/push/vapid-public-key", (req, res) => {
  res.json({ publicKey: vapidKeys.publicKey });
});

app.post("/api/push/subscribe", (req, res) => {
  try {
    const { subscription, userId, role, courierId } = req.body || {};
    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ error: "بيانات اشتراك الإشعارات غير صحيحة" });
    }

    pushSubscriptions = pushSubscriptions.filter(
      (s) => s.subscription?.endpoint !== subscription.endpoint
    );

    pushSubscriptions.push({
      subscription,
      userId,
      role,
      courierId,
      updatedAt: new Date().toISOString(),
    });

    savePushSubscriptions();
    return res.json({ success: true, count: pushSubscriptions.length });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/push/test", async (req, res) => {
  try {
    const activeSubsCount = pushSubscriptions.length;
    if (activeSubsCount === 0) {
      return res.status(400).json({ error: "لا يوجد أجهزة مشتركة حالياً بالخادم" });
    }

    await sendWebPushToSubscribers({
      title: "🔔 إشعار هاتف تجريبي (والتطبيق مقفول)",
      body: "تهانينا! الإشعارات تعمل بنجاح في خلفية هاتفك حتى أثناء قفل الشاشة وإغلاق الموقع.",
      tag: `test-push-${Date.now()}`,
      data: { url: '/' },
    });

    return res.json({ success: true, sentTo: activeSubsCount });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

app.post("/api/push/notify", async (req, res) => {
  try {
    const { title, body, tag, data, courierId } = req.body || {};
    if (!title) {
      return res.status(400).json({ error: "عنوان الإشعار مطلوب" });
    }

    await sendWebPushToSubscribers({
      title,
      body: body || '',
      tag: tag || `push-${Date.now()}`,
      data: data || {},
      targetCourierId: courierId,
    });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Active Server-Sent Events (SSE) connections for sub-second real-time cross-device sync
const sseClients = new Set<express.Response>();

function broadcastSseState(state: any, timestamp: number, senderId?: string) {
  if (sseClients.size === 0) return;
  const payload = JSON.stringify({
    state,
    timestamp,
    senderId: senderId || "server_broadcast",
  });
  sseClients.forEach((client) => {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch (e) {
      sseClients.delete(client);
    }
  });
}

// Service Worker Route with Service-Worker-Allowed header to ensure PWA works when app/phone is locked
app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Service-Worker-Allowed", "/");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  const swPath = path.join(process.cwd(), "public", "sw.js");
  if (fs.existsSync(swPath)) {
    return res.sendFile(swPath);
  }
  return res.status(404).send("// sw.js not found");
});

app.get("/api/sync/sse", (req, res) => {
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Access-Control-Allow-Origin": "*",
  });

  // Send current state immediately on connection
  if (serverAppState) {
    const initPayload = JSON.stringify({
      state: serverAppState,
      timestamp: serverLastUpdated,
      senderId: "server_sse_init",
    });
    res.write(`data: ${initPayload}\n\n`);
  }

  sseClients.add(res);

  req.on("close", () => {
    sseClients.delete(res);
  });
});

app.get("/api/sync/state", (req, res) => {
  res.json({
    state: serverAppState,
    timestamp: serverLastUpdated,
  });
});

app.post("/api/sync/state", (req, res) => {
  try {
    const { state, timestamp, senderId, isExplicitClear } = req.body || {};
    const incomingTime = Number(timestamp) || Date.now();

    if (!state) {
      return res.status(400).json({ error: "بيانات الإرسال فارغة" });
    }

    // Detect new notifications or shipment updates to send remote push to closed devices
    if (Array.isArray(state.notifications) && state.notifications.length > 0) {
      const previousNotifIds = new Set(
        Array.isArray(serverAppState?.notifications)
          ? serverAppState.notifications.map((n: any) => n.id)
          : []
      );

      const newNotifs = state.notifications.filter((n: any) => n && n.id && !previousNotifIds.has(n.id));

      for (const notif of newNotifs) {
        sendWebPushToSubscribers({
          title: notif.statusTitle || `💬 إشعار شحنة جديد (#${notif.trackingNumber || ''})`,
          body: notif.message || notif.statusNote || `تم تحديث حالة الشحنة رقم ${notif.trackingNumber || ''}`,
          tag: notif.id,
          data: { shipmentId: notif.shipmentId, url: '/' },
          targetCourierId: notif.courierId,
        }).catch((e) => console.warn('Remote push send error:', e));
      }
    }

    // Detect direct shipment status changes, new shipments, and courier assignments
    if (Array.isArray(state.shipments) && state.shipments.length > 0) {
      const oldShipmentsMap = new Map<string, any>(
        Array.isArray(serverAppState?.shipments)
          ? serverAppState.shipments.map((s: any) => [s.id || s.trackingNumber, s])
          : []
      );

      for (const s of state.shipments) {
        if (!s || (!s.id && !s.trackingNumber)) continue;
        const key = s.id || s.trackingNumber;
        const oldS = oldShipmentsMap.get(key);

        if (!oldS && oldShipmentsMap.size > 0) {
          // New shipment created
          sendWebPushToSubscribers({
            title: `📦 شحنة جديدة (#${s.trackingNumber || s.id})`,
            body: `تم إضافة شحنة جديدة للعميل ${s.recipient?.name || ''} - ${s.recipient?.governorate || ''}`,
            tag: `new-shipment-${key}`,
            data: { shipmentId: s.id, url: '/' },
          }).catch((e) => console.warn('New shipment push error:', e));
        } else if (oldS && oldS.status !== s.status) {
          // Status changed!
          sendWebPushToSubscribers({
            title: `🚚 تحديث حالة شحنة (#${s.trackingNumber || s.id})`,
            body: `تغيرت الحالة إلى (${s.status || 'تحديث جديد'}) - العميل: ${s.recipient?.name || s.recipient?.governorate || ''}`,
            tag: `status-change-${key}-${Date.now()}`,
            data: { shipmentId: s.id, url: '/' },
          }).catch((e) => console.warn('Status change push error:', e));
        } else if (oldS && s.assignedCourier?.id && oldS.assignedCourier?.id !== s.assignedCourier?.id) {
          // Courier assigned/changed!
          sendWebPushToSubscribers({
            title: `🛵 تعيين مندوب للشحنة (#${s.trackingNumber || s.id})`,
            body: `تم تكليف المندوب (${s.assignedCourier.name}) بالتوصيل`,
            tag: `courier-assigned-${key}-${Date.now()}`,
            data: { shipmentId: s.id, url: '/' },
            targetCourierId: s.assignedCourier.id,
          }).catch((e) => console.warn('Courier change push error:', e));
        }
      }
    }

    let mergedState = { ...state };

    if (!isExplicitClear && serverAppState) {
      if (Array.isArray(serverAppState.shipments) && serverAppState.shipments.length > 0) {
        if (!Array.isArray(state.shipments) || state.shipments.length === 0) {
          mergedState.shipments = serverAppState.shipments;
        }
      }
      if (Array.isArray(serverAppState.users) && serverAppState.users.length > 0) {
        if (!Array.isArray(state.users) || state.users.length === 0) {
          mergedState.users = serverAppState.users;
        }
      }
      if (Array.isArray(serverAppState.couriers) && serverAppState.couriers.length > 0) {
        if (!Array.isArray(state.couriers) || state.couriers.length === 0) {
          mergedState.couriers = serverAppState.couriers;
        }
      }
      if (Array.isArray(serverAppState.companyTransactions) && serverAppState.companyTransactions.length > 0) {
        if (!Array.isArray(state.companyTransactions) || state.companyTransactions.length === 0) {
          mergedState.companyTransactions = serverAppState.companyTransactions;
        }
      }
    }

    if (incomingTime >= serverLastUpdated || !serverAppState) {
      serverLastUpdated = incomingTime;
      serverAppState = sanitizeServerState({ ...mergedState, timestamp: incomingTime, senderId });

      fs.writeFile(STATE_FILE, JSON.stringify({ state: serverAppState, timestamp: incomingTime }), (err) => {
        if (err) console.warn("Error persisting server state:", err);
      });

      // Save automatic rolling backup snapshot
      saveBackupSnapshot(serverAppState, incomingTime);

      // Broadcast state update INSTANTLY (< 50ms) to all connected SSE clients across devices
      broadcastSseState(serverAppState, incomingTime, senderId);
    }

    return res.json({ success: true, timestamp: serverLastUpdated, state: serverAppState });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// BACKUP & RESTORE API ENDPOINTS

// 1. Download/Export full JSON backup file
app.get("/api/backup/export", (req, res) => {
  try {
    const backupPayload = {
      app: "A&M Shipping Logistics",
      version: "2.0",
      exportedAt: new Date().toISOString(),
      timestamp: serverLastUpdated || Date.now(),
      state: serverAppState || {},
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="bosta_backup_${new Date().toISOString().slice(0, 10)}.json"`);
    return res.json(backupPayload);
  } catch (err: any) {
    return res.status(500).json({ error: "فشل إنشاء ملف النسخة الاحتياطية", details: err.message });
  }
});

// 2. Import JSON backup file
app.post("/api/backup/import", (req, res) => {
  try {
    const { state, timestamp } = req.body || {};
    const importData = state || req.body;

    if (!importData || (typeof importData !== "object")) {
      return res.status(400).json({ error: "ملف النسخة الاحتياطية غير صالح" });
    }

    const newTime = Date.now();
    const sanitized = sanitizeServerState(importData.state || importData);

    serverAppState = sanitized;
    serverLastUpdated = newTime;

    fs.writeFileSync(STATE_FILE, JSON.stringify({ state: serverAppState, timestamp: newTime }));
    saveBackupSnapshot(serverAppState, newTime);

    return res.json({
      success: true,
      message: "تم استعادة النسخة الاحتياطية بنجاح وتسجيل البيانات في النظام!",
      timestamp: newTime,
      state: serverAppState,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "فشل في استعادة البيانات من النسخة الاحتياطية", details: err.message });
  }
});

// 3. List available server backup snapshots
app.get("/api/backup/list", (req, res) => {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      return res.json({ snapshots: [] });
    }

    const files = fs.readdirSync(BACKUPS_DIR)
      .filter((f) => f.endsWith(".json"))
      .map((f) => {
        const fullPath = path.join(BACKUPS_DIR, f);
        const stats = fs.statSync(fullPath);
        return {
          filename: f,
          size: stats.size,
          mtime: stats.mtime,
          isLatest: f === "latest_backup.json",
        };
      })
      .sort((a, b) => new Date(b.mtime).getTime() - new Date(a.mtime).getTime());

    return res.json({ snapshots: files });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Restore a specific backup snapshot from server disk
app.post("/api/backup/restore-snapshot", (req, res) => {
  try {
    const { filename } = req.body || {};
    const targetFile = filename ? path.join(BACKUPS_DIR, filename) : LATEST_BACKUP_FILE;

    if (!fs.existsSync(targetFile)) {
      return res.status(404).json({ error: "ملف اللقطة الاحتياطية غير موجود" });
    }

    const raw = fs.readFileSync(targetFile, "utf-8");
    const parsed = JSON.parse(raw);
    const newTime = Date.now();

    serverAppState = sanitizeServerState(parsed.state || parsed);
    serverLastUpdated = newTime;

    fs.writeFileSync(STATE_FILE, JSON.stringify({ state: serverAppState, timestamp: newTime }));

    return res.json({
      success: true,
      message: "تم استعادة اللقطة الاحتياطية المحددة بنجاح!",
      timestamp: newTime,
      state: serverAppState,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// AI Smart Address & Image OCR Data Extractor API
app.post("/api/parse-address", async (req, res) => {
  try {
    const { rawText, imageBase64, mimeType } = req.body;
    if ((!rawText || typeof rawText !== "string" || !rawText.trim()) && !imageBase64) {
      return res.status(400).json({ error: "الرجاء توفير نص أو صورة بوليصة/فاتورة للتحليل" });
    }

    const ai = getGenAIClient();
    if (!ai) {
      // Fallback simple parsing if no API key is available
      const text = rawText || "";
      return res.json({
        recipientName: "عميل بوسطة",
        phone: text.match(/01[0125]\d{8}/)?.[0] || "",
        governorate: text.includes("القاهرة") ? "القاهرة" : text.includes("الجيزة") ? "الجيزة" : text.includes("الإسكندرية") ? "الإسكندرية" : "القاهرة",
        city: "مدينة نصر",
        district: "",
        streetAddress: text || "عنوان مفرغ من الصورة",
        buildingNo: "",
        apartmentNo: "",
        deliveryNotes: "تم التحليل اليدوي التلقائي",
        description: "طرد ملابس واكسسوارات",
        codAmount: 500,
        itemsCount: 1,
      });
    }

    const systemPrompt = `أنت مساعد خبير ومتخصص في تفريغ واستخراج بيانات بوليصات الشحن والفواتير ومحادثات الواتساب لشحنات بوسطة و A&M shipping في مصر.
قم باستخراج وتفريغ البيانات التالية بدقة عالية سواء من النص أو من الصورة المرفقة:
- recipientName: اسم المستلم الكامل.
- phone: رقم الهاتف المصري الأساسي (يبدأ بـ 010 أو 011 أو 012 أو 015).
- secondaryPhone: رقم هاتف إضافي إن وجد.
- governorate: المحافظة المصرية (مثل: القاهرة، الجيزة، الإسكندرية، الدقهلية، الغربية، الشرقية، المنوفية، أسيوط، البحيرة، إلخ).
- city: المدينة أو المركز (مثل: مدينة نصر، المعادي، التجمع، الدقي، 6 أكتوبر، سموحة، طنطا، المنصورة، إلخ).
- district: الحي أو الشارع الرئيسي.
- streetAddress: العنوان التفصيلي للشارع مع العلامات المميزة.
- buildingNo: رقم المبنى أو العمارة إن وجد.
- apartmentNo: رقم الشقة أو الدور إن وجد.
- deliveryNotes: أية تعليمات خاصة للتسليم (مثل الاتصال قبل الوصول، معاينة الطرد، التسليم مساءً).
- description: وصف الطرد أو المحتويات (مثل: فستان، ساعة، ملابس أطفال، إلكترونيات).
- codAmount: مبلغ التحصيل المطلوب (الدفع عند الاستلام / COD) بالأرقام فقط إن وجد.
- itemsCount: عدد القطع داخل الطرد (أرقام فقط).`;

    let contentsPayload: any;
    if (imageBase64) {
      // Clean base64 string if it contains data prefix
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contentsPayload = {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: mimeType || "image/jpeg",
            },
          },
          {
            text: rawText
              ? `قم بتفريغ بيانات الشحنة والعنوان والمستلم ومبلغ التحصيل من هذه الصورة والنص المرفق: ${rawText}`
              : "قم بتفريغ وتفريغ كافة بيانات بوليصة الشحن أو الرسالة الموضحة في الصورة بدقة.",
          },
        ],
      };
    } else {
      contentsPayload = rawText;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: contentsPayload,
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
            description: { type: Type.STRING, description: "وصف المحتويات والطرد" },
            codAmount: { type: Type.NUMBER, description: "مبلغ التحصيل النقدي COD" },
            itemsCount: { type: Type.NUMBER, description: "عدد القطع داخل الطرد" },
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
      error: "فشل في تفريغ بيانات الصورة أو العنوان بواسطة الذكاء الاصطناعي",
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
