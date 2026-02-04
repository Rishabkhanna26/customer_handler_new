import pkg from "whatsapp-web.js";
import qrcode from "qrcode-terminal";
import qrImage from "qrcode";
import { EventEmitter } from "node:events";
import { db } from "./db.js";

const { Client, LocalAuth } = pkg;
export const whatsappEvents = new EventEmitter();

/* ===============================
   CLIENT SETUP
   =============================== */
export const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
});

const normalizePhone = (value) => {
  if (!value) return null;
  return value.replace(/@c\.us$/, "").replace(/@s\.whatsapp\.net$/, "");
};

const getClientPhone = () => {
  const wid = client?.info?.wid;
  if (!wid) return null;
  if (typeof wid === "string") return normalizePhone(wid);
  if (wid.user) return wid.user;
  if (wid._serialized) return normalizePhone(wid._serialized);
  return null;
};

const buildMessageMetadata = (message, extra = {}) => ({
  ...extra,
  id: message?.id?._serialized || null,
  from: message?.from || null,
  to: message?.to || null,
  timestamp: message?.timestamp || null,
  type: message?.type || null,
  hasMedia: Boolean(message?.hasMedia),
  body: message?.body || null,
  raw: message?._data || null,
});

async function resolveAdminForMessage(message) {
  const toPhone = normalizePhone(message?.to);
  const clientPhone = getClientPhone();
  const adminPhone = toPhone || clientPhone;
  if (!adminPhone) return null;

  const [admins] = await db.query(
    `SELECT id, name, phone FROM admin_accounts WHERE phone = ? AND status = 'active' LIMIT 1`,
    [adminPhone]
  );

  if (admins.length > 0) {
    return admins[0];
  }

  const [fallbacks] = await db.query(
    `SELECT id, name, phone
     FROM admin_accounts
     WHERE status = 'active'
     ORDER BY CASE WHEN admin_tier = 'super_admin' THEN 1 ELSE 0 END DESC, id ASC
     LIMIT 1`
  );

  if (fallbacks.length > 0) {
    console.warn(`⚠️ No admin matched phone ${adminPhone}. Falling back to ${fallbacks[0].phone}`);
    return fallbacks[0];
  }

  return null;
}

async function getOrCreateUser(phone, adminId) {
  const [rows] = await db.query(
    `SELECT id, name, email, assigned_admin_id FROM users WHERE phone = ? LIMIT 1`,
    [phone]
  );

  if (rows.length > 0) {
    const user = rows[0];
    if (adminId && user.assigned_admin_id !== adminId) {
      await db.query(`UPDATE users SET assigned_admin_id = ? WHERE id = ?`, [
        adminId,
        user.id,
      ]);
      user.assigned_admin_id = adminId;
    }
    return user;
  }

  const [result] = await db.query(
    `INSERT INTO users (phone, assigned_admin_id) VALUES (?, ?)`,
    [phone, adminId]
  );

  return {
    id: result.insertId,
    name: null,
    email: null,
    assigned_admin_id: adminId,
  };
}

async function logMessageToDb({
  userId,
  adminId,
  messageText,
  messageType,
  status,
  metadata,
  media,
}) {
  const safeText = messageText ?? "";
  const mediaMimeType = media?.mimetype || null;
  const mediaFilename = media?.filename || null;
  const mediaData = media?.data || null;
  const metadataJson = metadata ? JSON.stringify(metadata) : null;

  await db.query(
    `INSERT INTO messages (
      user_id,
      admin_id,
      message_text,
      message_type,
      status,
      metadata,
      media_mime_type,
      media_filename,
      media_data
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      adminId,
      safeText,
      messageType,
      status,
      metadataJson,
      mediaMimeType,
      mediaFilename,
      mediaData,
    ]
  );
}

async function sendAndLogMessage(to, text, session, extraMetadata = {}) {
  const sent = await client.sendMessage(to, text);
  const metadata = buildMessageMetadata(sent, {
    direction: "outgoing",
    flowStep: session.step,
    ...extraMetadata,
  });
  await logMessageToDb({
    userId: session.userId,
    adminId: session.adminId,
    messageText: text,
    messageType: "outgoing",
    status: "sent",
    metadata,
  });
  return sent;
}


let isReady = false;
let hasStarted = false;
let status = "idle";
let latestQrImage = null;

const emitStatus = (nextStatus) => {
  status = nextStatus;
  whatsappEvents.emit("status", status);
};

/* ===============================
   QR & READY EVENTS
   =============================== */
client.on("qr", async (qr) => {
  emitStatus("qr");
  isReady = false;
  console.log("📱 Scan the QR code");
  qrcode.generate(qr, { small: true });
  try {
    latestQrImage = await qrImage.toDataURL(qr);
    whatsappEvents.emit("qr", latestQrImage);
  } catch (err) {
    console.error("❌ QR generation failed:", err);
  }
});

client.on("ready", () => {
  isReady = true;
  latestQrImage = null;
  emitStatus("connected");
  console.log("✅ WhatsApp Ready");
});

client.on("disconnected", () => {
  isReady = false;
  emitStatus("disconnected");
  console.log("⚠️ WhatsApp disconnected");
});

client.on("auth_failure", () => {
  isReady = false;
  emitStatus("auth_failure");
  console.log("❌ WhatsApp auth failure");
});

export const startWhatsApp = async () => {
  if (hasStarted) {
    return { status, alreadyStarted: true };
  }

  hasStarted = true;
  emitStatus("starting");
  try {
    await client.initialize();
    return { status, alreadyStarted: false };
  } catch (err) {
    hasStarted = false;
    emitStatus("error");
    throw err;
  }
};

export const stopWhatsApp = async () => {
  if (!hasStarted) {
    return { status, alreadyStarted: false };
  }

  try {
    await client.destroy();
  } finally {
    hasStarted = false;
    isReady = false;
    latestQrImage = null;
    emitStatus("disconnected");
  }
  return { status, alreadyStarted: true };
};

export const getWhatsAppState = () => ({
  status,
  ready: isReady,
  qrImage: latestQrImage,
});

/* ===============================
   🧠 USER MEMORY
   =============================== */
const users = Object.create(null);
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

/* ===============================
   🔥 AUTOMATION LOGIC
   =============================== */
client.on("message", async (message) => {
  try {
    if (!isReady) return;
    if (!message || message.fromMe) return;

    const from = message.from;
    if (!from || from.endsWith("@g.us")) return;

    const text = message.body?.trim() || "";
    const lower = text.toLowerCase();
    const phone = from.replace("@c.us", "");

    const admin = await resolveAdminForMessage(message);
    if (!admin) {
      console.error("❌ No active admin found to assign this user.");
      return;
    }

    const existingUser = await getOrCreateUser(phone, admin.id);
    const isReturningUser = Boolean(existingUser?.name);

    /* ===============================
       🔍 CHECK USER IN DB
       =============================== */
    let media = null;
    if (message.hasMedia) {
      try {
        media = await message.downloadMedia();
      } catch (err) {
        console.error("❌ Failed to download media:", err);
      }
    }
    const incomingMetadata = buildMessageMetadata(message, {
      direction: "incoming",
      adminPhone: admin.phone,
    });

    /* ===============================
       INIT USER SESSION
       =============================== */
    if (!users[from]) {
      users[from] = {
        step: isReturningUser ? "MENU" : "START",
        data: {},
        isReturningUser,
        userId: existingUser.id,
        adminId: admin.id,
        name: isReturningUser ? existingUser.name : null,
      };
    }

    const user = users[from];
    user.adminId = admin.id;
    user.userId = existingUser.id;

    incomingMetadata.flowStep = user.step;
    incomingMetadata.reason = user.data?.reason || null;
    incomingMetadata.isReturningUser = user.isReturningUser;

    await logMessageToDb({
      userId: user.userId,
      adminId: user.adminId,
      messageText: text,
      messageType: "incoming",
      status: "delivered",
      metadata: incomingMetadata,
      media,
    });

    /* ===============================
       STEP 1: START (NEW USER)
       =============================== */
    if (user.step === "START") {
      if (lower === "hi" || lower === "hello") {
        await delay(1000);
        await sendAndLogMessage(
          from,
          [
            "Hi 👋",
            "I am a helper bot for *ABC Company*.",
            "",
            "How can I help you today?",
            "",
            "1️⃣ Services",
            "2️⃣ Products",
            "3️⃣ Talk to an Executive",
            "",
            "_Reply with 1, 2, or 3_",
          ].join("\n"),
          user
        );
        user.step = "MENU";
      }
      return;
    }

    /* ===============================
       STEP 1B: START (RETURNING USER)
       =============================== */
    if (user.step === "MENU" && user.isReturningUser && (lower === "hi" || lower === "hello")) {
      await delay(1000);
      await sendAndLogMessage(
        from,
        [
          `Welcome back ${user.name} 👋`,
          "",
          "How can we help you today?",
          "",
          "1️⃣ Services",
          "2️⃣ Products",
          "3️⃣ Talk to an Executive",
          "",
          "_Reply with 1, 2, or 3_",
        ].join("\n"),
        user
      );
      return;
    }

    /* ===============================
       STEP 2: MENU
       =============================== */
    if (user.step === "MENU") {
      if (!["1", "2", "3"].includes(lower)) {
        await sendAndLogMessage(from, "Please reply with 1, 2, or 3 🙂", user);
        return;
      }

      user.data.reason =
        lower === "1"
          ? "Services"
          : lower === "2"
          ? "Products"
          : "Talk to an Executive";

      // RETURNING USER → SKIP NAME & EMAIL
      if (user.isReturningUser) {
        await delay(1000);
        await sendAndLogMessage(
          from,
          "Got it 👍\nPlease tell us briefly *how we can help you today*."
        );
        user.step = "ASK_MESSAGE";
        return;
      }

      // NEW USER → ASK NAME
      await delay(1000);
      await sendAndLogMessage(from, "Great 😊\nMay I know your *name*?", user);
      user.step = "ASK_NAME";
      return;
    }

    /* ===============================
       STEP 3: NAME
       =============================== */
    if (user.step === "ASK_NAME") {
      if (!text) {
        await sendAndLogMessage(from, "Please share your *name* 🙂", user);
        return;
      }
      user.data.name = text;
      user.name = text;
      await db.query(`UPDATE users SET name = ? WHERE id = ?`, [text, user.userId]);

      await delay(1000);
      await sendAndLogMessage(
        from,
        `Thanks ${text} 🙏\nCould you please share your *email address*?`
      );

      user.step = "ASK_EMAIL";
      return;
    }

    /* ===============================
       STEP 4: EMAIL
       =============================== */
    if (user.step === "ASK_EMAIL") {
      if (!text) {
        await sendAndLogMessage(from, "Please share your *email address* 🙂", user);
        return;
      }
      user.data.email = text;
      user.email = text;
      await db.query(`UPDATE users SET email = ? WHERE id = ?`, [text, user.userId]);

      await delay(1000);
      await sendAndLogMessage(
        from,
        "Got it 👍\nPlease tell us briefly *how we can help you*."
      );

      user.step = "ASK_MESSAGE";
      return;
    }

    /* ===============================
       STEP 5: FINAL (SAVE MESSAGE)
       =============================== */
    if (user.step === "ASK_MESSAGE") {
      if (!text && !message.hasMedia) {
        await sendAndLogMessage(
          from,
          "Please tell us briefly *how we can help you* 🙂",
          user
        );
        return;
      }

      user.data.message = text;

      console.log(
        user.isReturningUser
          ? `🔁 Message saved for returning user: ${user.name}`
          : "🆕 New lead saved"
      );

      await delay(1000);
      await sendAndLogMessage(
        from,
        `Thank you ${user.isReturningUser ? user.name : user.data.name} 😊
Our team will contact you shortly.`
      );

      delete users[from];
    }
  } catch (err) {
    console.error("❌ Automation error:", err);
  }
});

/* ===============================
   INIT
   =============================== */
// Start the client via startWhatsApp() from the server.
