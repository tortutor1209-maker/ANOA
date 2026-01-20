
import { GoogleGenAI, Type } from "@google/genai";
import { StoryRequest, StoryResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateStoryContent = async (req: StoryRequest): Promise<StoryResult> => {
  const { title, numScenes, visualStyle, language } = req;

  const systemInstruction = `
    Anda adalah ANOALABS ULTIMATE v4, seorang AI Fact-Based Content Analyzer & Cinematic Storytelling Architect.
    
    PERAN UTAMA:
    Memverifikasi, menganalisis, dan menyusun konten berbasis fakta yang dapat diverifikasi dari media tepercaya Indonesia (detik.com, cnnindonesia.com, kompas.com).

    ATURAN VERIFIKASI (WAJIB):
    1. Gunakan Google Search untuk memvalidasi fakta "${title}".
    2. Prioritaskan sumber: detik.com, cnnindonesia.com, kompas.com.
    3. Jika fakta tidak ditemukan, nyatakan secara eksplisit: "Fakta ini tidak ditemukan pada sumber tepercaya." Jangan mengarang fakta.
    4. Setiap klaim informasi WAJIB diverifikasi sebelum diubah menjadi scene.

    ATURAN JUMLAH SCENE (N+1):
    - Jika user meminta ${numScenes} scene, buat total ${numScenes + 1} scene.
    - Scene terakhir (Scene ${numScenes + 1}) WAJIB berisi "Source Verification".
    - Narasi scene terakhir harus berisi: Nama Media, Judul Berita, Ringkasan Verifikasi, dan Validasi.
    - Set 'tone' scene terakhir ke "SOURCE_VERIFICATION".

    ATURAN PROMPT COVER (WAJIB):
    - "tiktokCover": Prompt sinematik detail untuk TikTok (9:16) berdasarkan Judul "${title}" dan Gaya Visual "${visualStyle}".
    - "youtubeCover": Prompt sinematik detail untuk YouTube (16:9) berdasarkan Judul "${title}" dan Gaya Visual "${visualStyle}".

    STORYTELLING RULES:
    - Narasi per scene: 20-25 kata (Edukatif, Padat, Bermakna).
    - DUAL STRUCTURED PROMPTING: Setiap prompt visual wajib dimulai dengan subjek bergaya "${visualStyle}".
    
    OUTPUT FORMAT: Strict JSON.
  `;

  const prompt = `Analisis fakta dan buatkan storytelling edukatif sinematik "${title}" sebanyak ${numScenes} scene + 1 scene verifikasi. Gaya: "${visualStyle}". Bahasa: ${language}.`;

  const structuredPromptSchema = {
    type: Type.OBJECT,
    properties: {
      subject: { type: Type.STRING },
      action: { type: Type.STRING },
      environment: { type: Type.STRING },
      camera_movement: { type: Type.STRING },
      lighting: { type: Type.STRING },
      visual_style_tags: { type: Type.STRING }
    },
    required: ['subject', 'action', 'environment', 'camera_movement', 'lighting', 'visual_style_tags']
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          numScenes: { type: Type.NUMBER },
          visualStyle: { type: Type.STRING },
          language: { type: Type.STRING },
          scenes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                number: { type: Type.NUMBER },
                narration: { type: Type.STRING },
                tone: { type: Type.STRING },
                structuredPrompt1: structuredPromptSchema,
                structuredPrompt2: structuredPromptSchema
              },
              required: ['number', 'narration', 'tone', 'structuredPrompt1', 'structuredPrompt2']
            }
          },
          tiktokCover: { type: Type.STRING },
          youtubeCover: { type: Type.STRING },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'numScenes', 'visualStyle', 'language', 'scenes', 'tiktokCover', 'youtubeCover', 'hashtags']
      }
    }
  });

  const jsonStr = response.text || '{}';
  return JSON.parse(jsonStr) as StoryResult;
};

export const generateAffiliateContent = async (
  productName: string, 
  customInstructions: string, 
  productImg: string | undefined, 
  modelImg: string | undefined,
  style: string,
  numScenes: number
) => {
  const systemInstruction = `
    Anda adalah ANOALABS UGC TOOL - Pakar AI Video & Affiliate Marketing.
    Tugas: Menghasilkan Video Prompt untuk VEO 3.1 & FLOW dengan fitur LIP-SYNC & VOICE PROMOTION.
    Gaya Konten: ${style}
    Target Jumlah Adegan: ${numScenes}
    
    ATURAN EMAS:
    1. VOICE SYNC (WAJIB): Sertakan narasi promosi spesifik dalam Bahasa Indonesia di dalam prompt.
    2. AFFILIATE PERSUASION: Dialog persuasif untuk mengajak mencoba produk ${productName}.
  `;

  const parts: any[] = [{ text: `Hasilkan konten promosi untuk ${productName} dalam gaya ${style}.` }];
  if (productImg) parts.push({ inlineData: { mimeType: "image/png", data: productImg.split(',')[1] } });
  if (modelImg) parts.push({ inlineData: { mimeType: "image/png", data: modelImg.split(',')[1] } });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          caption: { type: Type.STRING },
          assets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                videoPrompt: { type: Type.STRING }
              },
              required: ['label', 'imagePrompt', 'videoPrompt']
            }
          }
        },
        required: ['summary', 'caption', 'assets']
      }
    }
  });

  return JSON.parse(response.text || '{}');
};

export const generateImage = async (prompt: string, aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "1:1", referenceImg?: string): Promise<string> => {
  const parts: any[] = [{ text: `High quality cinematic photo, strictly follow visual aesthetic: ${prompt}` }];
  if (referenceImg) parts.push({ inlineData: { mimeType: "image/png", data: referenceImg.split(',')[1] } });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts },
    config: { imageConfig: { aspectRatio } },
  });

  const responseParts = response.candidates?.[0]?.content?.parts || [];
  for (const part of responseParts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Gagal generate gambar.");
};
