import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../types";

let ai: GoogleGenAI | null = null;

try {
  if (process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  } else {
    console.warn("API_KEY not found. Gemini features will be disabled or mocked.");
  }
} catch (error) {
  console.error("Failed to initialize Gemini Client", error);
}

export const translateToMandarin = async (text: string): Promise<{ hanzi: string, pinyin: string } | null> => {
  if (!ai) return null;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Translate the following French or English text to Simplified Chinese (Hanzi) and provide the Pinyin. Text: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            hanzi: { type: Type.STRING, description: "The simplified Chinese characters" },
            pinyin: { type: Type.STRING, description: "The Pinyin with tone marks" }
          },
          required: ["hanzi", "pinyin"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) return null;
    return JSON.parse(resultText);

  } catch (error) {
    console.error("Gemini translation error:", error);
    return null;
  }
};

export const generateQuizQuestions = async (): Promise<QuizQuestion[]> => {
  if (!ai) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate 5 multiple choice questions for L1 Mandarin Chinese students. 
      Mix the questions: some should ask to translate a French word to Hanzi, others from Hanzi to French.
      Ensure cultural context is appropriate.
      Provide explanation in French.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              question: { type: Type.STRING, description: "The question text (e.g., 'Que signifie: 你好?')" },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING, description: "Explanation in French" }
            },
            required: ["id", "question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);

  } catch (e) {
    console.error("Quiz gen error", e);
    return [];
  }
}
