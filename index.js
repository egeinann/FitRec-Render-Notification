import express from "express";
import admin from "firebase-admin";

const app = express();

// 🔐 Base64 olarak gelen JSON'u decode ediyoruz
const decoded = Buffer.from(process.env.FIREBASE_KEY_B64, "base64").toString("utf8");
const serviceAccount = JSON.parse(decoded);

// 🔥 Firebase Admin'i başlat
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// 🌍 Dile göre mesajlar
const messages = {
  tr: { title: "Hatırlatma!", body: "Kilonu kaydet ve serini devam ettir!" },
  fr: { title: "Rappel !", body: "Enregistre ton poids et continue ta série!" },
  en: { title: "Reminder!", body: "Log your weight and continue your streak!" },
  ko: { title: "알림!", body: "몸무게를 기록하고 연속 기록을 이어가세요!" },
  ja: { title: "リマインダー！", body: "体重を記録して連続記録を続けましょう!" },
  ru: { title: "Напоминание!", body: "Запишите свой вес и продолжайте серию!" },
  zh: { title: "提醒！", body: "记录你的体重，继续坚持!" },
  pt: { title: "Lembrete!", body: "Registre seu peso e continue sua sequência!" },
  de: { title: "Erinnerung!", body: "Trage dein Gewicht ein und setze deine Serie fort!" },
  es: { title: "¡Recordatorio!", body: "¡Registra tu peso y continúa tu racha!" }
};

// 🛠 Bildirim gönderme endpoint'i
app.get("/send", async (req, res) => {
  try {
    // Parametreden dil al, yoksa default `tr`
    const lang = req.query.lang || "tr";

    if (!messages[lang]) {
      return res.status(400).send(`Invalid language code: ${lang}`);
    }

    const msg = messages[lang];

    // Tek seferlik gönderim
    const response = await admin.messaging().send({
      topic: `lang_${lang}`,
      notification: {
        title: msg.title,
        body: msg.body,
      },
    });

    res.send({ lang, response });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
});

// 🌐 Sunucu başlatılıyor
const port = process.env.PORT || 10000;
app.listen(port, () => console.log("Sunucu aktif, port: " + port));
