import { GoogleGenAI, Type } from "@google/genai";
import { QuizQuestion } from "../types";

// Initialisation de l'IA
// NOTE: La clé API doit être définie dans les variables d'environnement Vercel (process.env.API_KEY)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Modèle optimisé pour les tâches de texte rapides (Basic Text Tasks)
const MODEL_NAME = 'gemini-3-flash-preview';

export const translateToMandarin = async (text: string): Promise<{ hanzi: string, pinyin: string } | null> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Translate the following French or English text to Simplified Chinese (Hanzi) and provide the Pinyin. 
      Text: "${text}"`,
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

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;

  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return null;
  }
};

export const generateQuizQuestions = async (context: string, objective: string): Promise<QuizQuestion[]> => {
  try {
    const prompt = `
      Tu es un professeur de Mandarin expert. Ton but est de générer un quiz de 5 questions à partir du texte fourni par l'utilisateur.
      
      Contexte : "${context}"
      Objectif pédagogique : "${objective}"
      
      Si le texte n'a aucun rapport avec le chinois, adapte-le pour créer des exercices de mandarin (traduction, vocabulaire, grammaire).
      Assure-toi que les options incorrectes sont plausibles.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "La question en français ou mandarin" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "4 options de réponse"
              },
              correctAnswer: { type: Type.STRING, description: "La bonne réponse exacte" },
              explanation: { type: Type.STRING, description: "Explication pédagogique brève" }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });

    if (!response.text) return [];

    const questions = JSON.parse(response.text);

    // Ajout d'IDs uniques et validation basique
    return questions.map((q: any, index: number) => ({
      ...q,
      id: `gemini_${Date.now()}_${index}`,
      // Sécurité pour s'assurer qu'il y a bien 4 options
      options: q.options.length >= 2 ? q.options : ["Oui", "Non", "Peut-être", "Je ne sais pas"] 
    }));

  } catch (e) {
    console.error("Gemini Quiz Generation Error", e);
    return [];
  }
};