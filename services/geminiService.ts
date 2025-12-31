import { QuizQuestion } from "../types";

// Declaration globale pour Puter.js (chargé via CDN dans index.html)
declare const puter: any;

// Helper pour nettoyer le JSON retourné par les LLM
const cleanJson = (text: string): string => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

export const translateToMandarin = async (text: string): Promise<{ hanzi: string, pinyin: string } | null> => {
  if (typeof puter === 'undefined') {
    console.error("Puter.js n'est pas chargé.");
    return null;
  }

  try {
    const prompt = `Translate the following French or English text to Simplified Chinese (Hanzi) and provide the Pinyin. 
    Text: "${text}"
    
    IMPORTANT: Return ONLY a valid JSON object. Do not include any explanation or markdown formatting.
    Format: {"hanzi": "...", "pinyin": "..."}`;

    const response = await puter.ai.chat(prompt, { model: 'gemini-1.5-flash' });
    const resultText = typeof response === 'string' ? response : response?.message?.content || response?.toString();

    if (!resultText) return null;
    return JSON.parse(cleanJson(resultText));

  } catch (error) {
    console.error("Puter AI translation error:", error);
    return null;
  }
};

export const generateQuizQuestions = async (context: string, objective: string): Promise<QuizQuestion[]> => {
  if (typeof puter === 'undefined') return [];

  try {
    // Construction du prompt combiné (System + User instruction)
    const prompt = `
    INSTRUCTION SYSTÈME :
    Tu es un professeur de Mandarin expert. Ton but est de générer un quiz de 5 questions à partir du texte fourni par l'utilisateur. Si le texte n'a aucun rapport avec le chinois, adapte-le quand même pour créer des exercices de mandarin (traduction, tons, pinyin ou grammaire). Réponds uniquement au format JSON pour que je puisse parser les questions facilement.

    DÉTAILS DE LA DEMANDE :
    - Contexte / Texte de base : "${context}"
    - Objectif pédagogique : "${objective}"

    FORMAT DE RÉPONSE ATTENDU (JSON Array strict) :
    [
      {
        "question": "La question en français ou mandarin",
        "options": ["Choix A", "Choix B", "Choix C", "Choix D"],
        "correctAnswer": "La bonne réponse (doit correspondre exactement à l'une des options)",
        "explanation": "Explication pédagogique en français sur pourquoi c'est la bonne réponse."
      }
    ]
    
    IMPORTANT : Ne mets aucun texte avant ou après le JSON.
    `;

    const response = await puter.ai.chat(prompt, { model: 'gemini-1.5-flash' });
    
    const resultText = typeof response === 'string' ? response : response?.message?.content || response?.toString();

    if (!resultText) return [];
    
    const questions = JSON.parse(cleanJson(resultText));
    
    // Ajout d'IDs uniques
    return questions.map((q: any, index: number) => ({
      ...q,
      id: `ai_${Date.now()}_${index}`
    }));

  } catch (e) {
    console.error("Puter AI Quiz gen error", e);
    return [];
  }
}