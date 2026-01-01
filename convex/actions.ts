"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini
// Note: process.env.API_KEY must be set in the Convex Dashboard settings (Environment Variables)
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Utilisation du modèle recommandé pour les tâches textuelles rapides
const MODEL_NAME = 'gemini-3-flash-preview';

export const translateText = action({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: `Translate the following French or English text to Simplified Chinese (Hanzi) and provide the Pinyin. 
        Text: "${args.text}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              hanzi: { type: Type.STRING },
              pinyin: { type: Type.STRING }
            },
            required: ["hanzi", "pinyin"]
          }
        }
      });
      return response.text ? JSON.parse(response.text) : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
});

export const generateQuiz = action({
  args: { context: v.string(), objective: v.string() },
  handler: async (ctx, args) => {
    try {
        const prompt = `
        Tu es un professeur de Mandarin expert. Ton but est de générer un quiz de 5 questions.
        Contexte : "${args.context}"
        Objectif : "${args.objective}"
        Adapte le contenu pour des débutants/intermédiaires.
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
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ["question", "options", "correctAnswer", "explanation"]
            }
          }
        }
      });
      
      const data = response.text ? JSON.parse(response.text) : [];
      // Add IDs to ensure React keys work properly
      return data.map((q: any, i: number) => ({ ...q, id: `ai_${Date.now()}_${i}` }));

    } catch (e) {
        console.error("Gemini Error", e);
        return [];
    }
  },
});