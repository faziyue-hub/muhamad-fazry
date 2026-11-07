/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { INITIAL_SIBU_PLACES, SIBU_FACTS } from './src/data/sibuPlaces.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI server-side with telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Compact context string representing accurate Sibu places data for AI grounding
const SIBU_DATA_CONTEXT = `
TEMPAT MENARIK DI SIBU, SARAWAK:
${INITIAL_SIBU_PLACES.map(
  (p, idx) => `
${idx + 1}. [ID: ${p.id}] ${p.name}
- Kategori: ${p.category}
- Status Halal: ${p.halalStatus || 'General'}
- Butiran Halal (BM): ${p.halalDetailsBM || 'Tiada nota khusus'}
- Butiran Halal (EN): ${p.halalDetailsEN || 'No specific note'}
- Koordinat: ${p.coordinates.lat}, ${p.coordinates.lng}
- Anggaran Masa Melawat: ${p.estimatedMinutes} minit
- Penerangan (BM): ${p.descriptionBM}
- Penerangan (EN): ${p.descriptionEN}
- Fakta Menarik: ${p.interestingFactBM} / ${p.interestingFactEN}
- Waktu Terbaik Melawat: ${p.bestTimeToVisitBM}
- Tip Tempatan: ${p.localTipsBM}
- Nota Waktu Buka: ${p.openingHoursNoteBM || 'Sila sahkan sebelum pergi'}
`
).join('\n')}

FAKTA SEJARAH & BUDAYA SIBU:
${SIBU_FACTS.map((f) => `- ${f.titleBM}: ${f.factBM}`).join('\n')}
`;

// Helper for local fallback if AI service is not available
function fallbackChatResponse(message: string, lang: 'ms' | 'en'): string {
  const lower = message.toLowerCase();
  const isEn = lang === 'en';

  if (lower.includes('halal') || lower.includes('muslim') || lower.includes('babi') || lower.includes('pork')) {
    return isEn
      ? "For Halal food in Sibu without hesitation: 1) Medan Selera Harmoni (100% Halal - famous for authentic Melanau Umai fresh fish, Linut, Terubok bakar and satay), 2) Mee Kampua & Masakan Warisan Halal Sibu (100% Halal springy Foochow noodles made with shallot oil and halal chicken), 3) Pasar Pusat Sibu (1st floor separate Malay/Melanau halal food court wing), and 4) Pasar Malam Sibu (designated Muslim stalls). Note that traditional Chinese Foochow coffee shops serve non-halal items with pork/lard."
      : "Untuk makanan Halal di Sibu tanpa ragu-ragu: 1) Medan Selera Harmoni (100% Halal - terkenal dengan hidangan asli Melanau seperti Umai ikan segar, Linut, Terubok bakar dan sate), 2) Mee Kampua & Masakan Warisan Halal Sibu (100% Halal - mee kampua dan kompia halal dengan minyak bawang wangi dan ayam), 3) Pasar Pusat Sibu (tingkat 1 sayap medan selera Melayu/Melanau berasingan), dan 4) Pasar Malam Sibu (deretan gerai Muslim). Sila ambil perhatian bahawa kedai kopi Foochow Cina tradisional adalah bukan halal kerana mengandungi daging/minyak babi.";
  }

  if (lower.includes('vegetarian') || lower.includes('sayur') || lower.includes('tanpa daging')) {
    return isEn
      ? "For vegetarian dining in Sibu, top recommendations are: 1) Cafe All The Best Vegetarian Restaurant (万德林素食館) in Pahlawan for famous Foochow vegetarian dishes, claypot tofu and vegetarian Kampua, and 2) Restoran Vegetarian Tian En Sibu for handmade vegetarian Kampua with mushroom dumplings. Both serve 100% meatless, pure vegetable oil Foochow comfort food!"
      : "Untuk restoran vegetarian di Sibu, pilihan utama yang sangat disyorkan ialah: 1) Cafe All The Best Vegetarian Restaurant (万德林素食館) di kawasan Pahlawan untuk masakan vegetarian Foochow, claypot tauhu dan Mee Kampua sayur yang terkenal, dan 2) Restoran Vegetarian Tian En Sibu untuk Mee Kampua sayuran buatan tangan bersama wantan cendawan. Kedua-duanya menyajikan hidangan 100% tanpa daging dan minyak sayuran tulen!";
  }

  if (lower.includes('kampua') || lower.includes('kompia') || lower.includes('makan') || lower.includes('food')) {
    return isEn
      ? "For Sibu's signature dishes, try springy Kampua Mee and crispy claypot Kompia! If you seek Halal options, visit Medan Selera Harmoni or Mee Kampua Halal Sibu. For the traditional Foochow version, heritage coffee shops along Blacksmith/Market street are popular (non-halal). Please verify stall timings before visiting."
      : "Untuk makanan legenda Sibu, nikmati Mee Kampua dan Kompia bakar arang! Jika anda mencari pilihan Halal tanpa was-was, kunjungi Medan Selera Harmoni atau Mee Kampua Halal Sibu. Untuk versi tradisional Foochow, kedai kopi warisan di Jalan Blacksmith/Market amat popular (bukan halal). Sila sahkan waktu operasi sebelum pergi.";
  }

  if (lower.includes('sejarah') || lower.includes('history') || lower.includes('foochow') || lower.includes('warisan')) {
    return isEn
      ? "Sibu has a storied Foochow settlement history pioneered by Wong Nai Siong in 1901. Explore the Sibu Heritage Centre to see vintage cultural artifacts, and visit Tua Pek Kong Temple founded in 1871 overlooking Batang Rajang."
      : "Sibu kaya dengan sejarah peneroka Foochow yang dipimpin oleh Wong Nai Siong pada tahun 1901. Lawati Pusat Warisan Sibu untuk melihat artifak komuniti Sarawak dan Kuil Tua Pek Kong yang dibina sejak 1871 di tebing Batang Rajang.";
  }

  if (lower.includes('alam') || lower.includes('nature') || lower.includes('tasik') || lower.includes('lake') || lower.includes('park')) {
    return isEn
      ? "For nature and relaxation, visit Taman Tasik Sibu (Taman Tasik Permai) with scenic jogging trails and lotus lakes, or stroll along Rajang Esplanade for river breezes and the iconic Swan statue."
      : "Untuk rekreasi dan keindahan alam, lawati Taman Tasik Sibu (Taman Tasik Permai) yang mempunyai tasik teratai dan jambatan kayu redup, atau bersiar-siar di Tebing Sungai Rejang sambil bergambar dengan Tugu Angsa.";
  }

  return isEn
    ? "Welcome to Sibu! I am Dias, your smart guide. You can ask me about top attractions like Sibu Central Market, Halal dining at Medan Selera Harmoni, Foochow Kompia, Tua Pek Kong Temple, Sibu Heritage Centre, Rajang Esplanade, and Permai Lake Gardens. Please verify any specific timings before visiting."
    : "Selamat datai ngagai Sibu! Saya Dias, pemandu pintar anda. Anda boleh bertanya mengenai tempat menarik seperti Pasar Pusat Sibu, makanan Halal di Medan Selera Harmoni, Kompia Foochow, Kuil Tua Pek Kong, Pusat Warisan Sibu, Tebing Batang Rajang, dan Taman Tasik Permai. Sila sahkan maklumat lanjut sebelum berkunjung.";
}

// 1. API: Tanya Dias (Chat Endpoint)
app.post('/api/chat', async (req, res) => {
  try {
    const { message, lang = 'ms', conversationHistory = [] } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Mesej diperlukan (Message is required)' });
    }

    if (!ai) {
      // Graceful rule-based response when GEMINI_API_KEY is not configured
      const fallbackReply = fallbackChatResponse(message, lang);
      return res.json({ reply: fallbackReply, source: 'local_database' });
    }

    const systemInstruction = `
Anda adalah "Dias", pemandu pelancongan pintar, mesra, dan bersemangat untuk pekan Sibu, Sarawak (tema: "My Kampung, My Pride").
Bahasa pengguna semasa: ${lang === 'en' ? 'Bahasa Inggeris (English)' : 'Bahasa Melayu'}.
Sila balas dalam bahasa pengguna yang sepadan (${lang === 'en' ? 'English' : 'Bahasa Melayu'}).

PANDUAN STATUS HALAL & MAKANAN SIBU:
- Pelancong Muslim sangat dialu-alukan di Sibu. Nyatakan status Halal secara telus dan jelas tanpa ragu-ragu.
- Kedai Kopi Foochow Warisan Cina tradisional adalah BUKAN HALAL (mengandungi daging dan minyak babi / lard).
- Untuk makanan HALAL tanpa was-was, cadangkan:
  1. Medan Selera Harmoni Sibu (100% Halal - makanan Melanau & Melayu seperti Umai Ikan segar, Linut, Terubok bakar, sate).
  2. Mee Kampua & Masakan Warisan Halal Sibu (100% Halal - mee kampua dan kompia versi halal menggunakan minyak bawang wangi & ayam cincang).
  3. Pasar Pusat Sibu (Tingkat 1 ada sayap medan selera Melayu/Melanau berasingan yang halal).
  4. Pasar Malam Sibu (Ada deretan gerai peniaga Muslim yang halal).

PERATURAN KETAT:
1. Anda HANYA menjawab berdasarkan maklumat tempat dan budaya Sibu yang disenaraikan di bawah.
2. JANGAN mereka-reka maklumat! Jangan mereka-reka waktu buka yang tepat atau harga tiket/makanan tertentu jika tiada dalam data. Jika tidak pasti, sentiasa katakan "sila sahkan sebelum pergi" (atau "please verify before visiting").
3. Beri jawapan yang ringkas, jelas, mesra pelancong dan sesuai untuk semua peringkat umur.
4. Nada mesra seperti anak jati Sibu yang bangga dengan kampung halaman ("My Kampung, My Pride").
5. Jika pengguna bertanya di luar topik Sibu, arahkan mereka kembali dengan sopan ke tarikan pelancongan Sibu.

DATA TEMPAT DAN FAKTA SIBU:
${SIBU_DATA_CONTEXT}
`;

    // Format chat history
    let contentsPrompt = `${message}`;
    if (conversationHistory.length > 0) {
      const historySummary = conversationHistory
        .slice(-4)
        .map((h: { sender: string; text: string }) => `${h.sender === 'user' ? 'Pelancong' : 'Dias'}: ${h.text}`)
        .join('\n');
      contentsPrompt = `Perbualan terdahulu:\n${historySummary}\n\nSoalan pelancong sekarang: ${message}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contentsPrompt,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || fallbackChatResponse(message, lang);
    return res.json({ reply, source: 'gemini' });
  } catch (error) {
    console.error('Error in /api/chat:', error);
    const lang = req.body?.lang || 'ms';
    const fallbackReply = fallbackChatResponse(req.body?.message || '', lang);
    return res.json({ reply: fallbackReply, source: 'fallback' });
  }
});

// 2. API: Jana Laluan AI (Generate Itinerary Endpoint)
app.post('/api/generate-itinerary', async (req, res) => {
  try {
    const { hours = 4, budget = 'sederhana', interests = [], lang = 'ms' } = req.body;

    const availablePlaces = INITIAL_SIBU_PLACES;

    if (!ai) {
      // Deterministic algorithm fallback
      const filtered = availablePlaces.filter((p) =>
        interests.length === 0 ? true : interests.includes(p.category)
      );
      const chosen = (filtered.length >= 3 ? filtered : availablePlaces).slice(0, Math.min(5, Math.max(3, Math.round(hours / 1.5))));
      const placeIds = chosen.map((c) => c.id);
      const totalMinutes = chosen.reduce((acc, c) => acc + c.estimatedMinutes + 20, 0);

      const title = lang === 'en' ? `Smart ${hours}-Hour Sibu Explorer` : `Laluan Pintar Sibu ${hours} Jam`;
      const summary = lang === 'en'
        ? `A tailored Sibu journey featuring ${chosen.length} key spots matching your interests, blending Foochow culture, local gastronomy, and riverside tranquility.`
        : `Laluan santai Sibu menyatukan ${chosen.length} lokasi pilihan merangkumi gastronomi Foochow, tapak warisan bersejarah dan pemandangan sungai.`;

      return res.json({
        title,
        summary,
        placeIds,
        totalEstimatedMinutes: totalMinutes,
        source: 'deterministic'
      });
    }

    const prompt = `
Jana satu cadangan laluan pelancongan di Sibu, Sarawak:
- Tempoh masa pengguna: ${hours} jam
- Minat pengguna: ${interests.join(', ') || 'Semua (Makanan, Budaya, Alam, Kampung)'}
- Tahap perbelanjaan: ${budget}
- Bahasa: ${lang === 'en' ? 'English' : 'Bahasa Melayu'}

PILIH DARI TEMPAT-TEMPAT INI SAHAJA:
${availablePlaces.map((p) => `- ID: "${p.id}" | Nama: ${p.name} | Kategori: ${p.category} | Anggaran Masa: ${p.estimatedMinutes} minit`).join('\n')}

Formatkan output sebagai JSON tulen:
{
  "title": "Tajuk laluan ringkas yang menarik",
  "summary": "Penerangan 2-3 ayat tentang laluan ini",
  "placeIds": ["id1", "id2", "id3"], // Pilih 3 hingga 5 ID dari senarai di atas mengikut susunan perjalanan yang paling logik
  "routeTips": ["tip ringkas 1", "tip ringkas 2"]
}
Hanya balas dalam format JSON tanpa simbol markdown lain.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    const validPlaceIds = Array.isArray(parsed.placeIds)
      ? parsed.placeIds.filter((id: string) => availablePlaces.some((p) => p.id === id))
      : [];

    const finalPlaceIds = validPlaceIds.length >= 3 ? validPlaceIds : availablePlaces.slice(0, 4).map((p) => p.id);
    const chosenPlaces = availablePlaces.filter((p) => finalPlaceIds.includes(p.id));
    const totalMinutes = chosenPlaces.reduce((acc, c) => acc + c.estimatedMinutes + 15, 0);

    return res.json({
      title: parsed.title || (lang === 'en' ? `Sibu ${hours}-Hour Discovery Tour` : `Laluan Terpilih Sibu ${hours} Jam`),
      summary: parsed.summary || (lang === 'en' ? `Curated tour of Sibu highlights for your ${hours} hours visit.` : `Laluan terancang meneroka keindahan Sibu dalam masa ${hours} jam.`),
      placeIds: finalPlaceIds,
      routeTips: parsed.routeTips || [],
      totalEstimatedMinutes: totalMinutes,
      source: 'gemini'
    });
  } catch (error) {
    console.error('Error in /api/generate-itinerary:', error);
    // Safe fallback
    const defaultIds = ['pasar-pusat-sibu', 'kedai-kopi-foochow', 'kuil-tua-pek-kong', 'tebing-sungai-rejang'];
    return res.json({
      title: 'Laluan Warisan & Rasa Sibu (Klasik)',
      summary: 'Laluan teras menerokai pasar tertua, hidangan ikonik Foochow dan pemandangan Batang Rajang.',
      placeIds: defaultIds,
      totalEstimatedMinutes: 240,
      source: 'fallback'
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Dias.Ai server is running on http://localhost:${PORT}`);
  });
}

startServer();
