import { QuizQuestion } from "../types";

// Declaration globale pour Puter.js (chargé via CDN dans index.html)
declare const puter: any;

// Helper pour nettoyer le JSON retourné par les LLM (qui ajoutent souvent du markdown ```json ... ```)
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

    // Appel via Puter.js
    const response = await puter.ai.chat(prompt, { model: 'gemini-1.5-flash' });
    
    // Puter retourne généralement un objet ou une string selon le contexte, on sécurise l'accès au message
    const resultText = typeof response === 'string' ? response : response?.message?.content || response?.toString();

    if (!resultText) return null;
    
    return JSON.parse(cleanJson(resultText));

  } catch (error) {
    console.error("Puter AI translation error:", error);
    return null;
  }
};

export const generateQuizQuestions = async (topic: string): Promise<QuizQuestion[]> => {
  if (typeof puter === 'undefined') return [];

  try {
    const prompt = `Génère 5 questions à choix multiples (QCM) pour des étudiants universitaires de Mandarin (Niveau L1/Débutant).
    
    Le contexte/sujet du quiz est : "${topic}".
    
    Consignes strictes :
    1. Les questions doivent être directement liées au sujet ou aux mots fournis dans le contexte "${topic}".
    2. Mélange les types de questions : 
       - Traduire du Français vers le Hanzi.
       - Traduire du Hanzi vers le Français.
       - Grammaire ou contexte culturel lié à "${topic}".
    3. L'explication doit être en Français.
    4. Fournis 4 choix de réponse par question.

    IMPORTANT: Retourne UNIQUEMENT un tableau JSON valide. Pas de markdown, pas de texte avant ou après.
    Structure attendue :
    [
      {
        "id": "q1",
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "correctAnswer": "...",
        "explanation": "..."
      }
    ]`;

    const response = await puter.ai.chat(prompt, { model: 'gemini-1.5-flash' });
    
    const resultText = typeof response === 'string' ? response : response?.message?.content || response?.toString();

    if (!resultText) return [];
    
    // On ajoute des IDs uniques au cas où l'IA oublie ou duplique
    const questions = JSON.parse(cleanJson(resultText));
    return questions.map((q: any, index: number) => ({
      ...q,
      id: `ai_${Date.now()}_${index}`
    }));

  } catch (e) {
    console.error("Puter AI Quiz gen error", e);
    return [];
  }
}