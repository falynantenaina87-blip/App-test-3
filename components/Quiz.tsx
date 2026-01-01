import React, { useState, useEffect } from 'react';
import { db } from '../services/databaseService';
import { generateQuizQuestions } from '../services/geminiService';
import { QuizQuestion, User, UserRole, QuizResult } from '../types';
import { CheckCircle, XCircle, ArrowRight, Award, BrainCircuit, Lock, Sparkles, SlidersHorizontal, RefreshCw } from 'lucide-react';

// Fallback questions if AI fails or manual default
const DEFAULT_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Que signifie 你好 (Nǐ hǎo) ?',
    options: ['Bonjour', 'Au revoir', 'Merci', 'Je t\'aime'],
    correctAnswer: 'Bonjour',
    explanation: '“Nǐ” signifie “tu” et “hǎo” signifie “bon”.'
  }
];

interface QuizProps {
  currentUser: User;
}

const Quiz: React.FC<QuizProps> = ({ currentUser }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>(DEFAULT_QUESTIONS);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  
  // States for flow
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [previousResult, setPreviousResult] = useState<QuizResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Inputs pour l'IA
  const [quizContext, setQuizContext] = useState('');
  const [quizObjective, setQuizObjective] = useState('Vocabulaire');

  useEffect(() => {
    // 1. Check if user already took the quiz
    const checkStatus = async () => {
        const result = await db.checkQuizSubmission(currentUser.id);
        if (result) {
            setPreviousResult(result);
            setHasSubmitted(true);
        }
    };
    checkStatus();
  }, [currentUser.id]);

  // Admin function to generate new questions
  const handleGenerateAI = async () => {
    if (!quizContext.trim()) {
        alert("Veuillez entrer un contexte (mot, phrase, texte) pour générer le quiz.");
        return;
    }

    setIsGenerating(true);
    // Appel avec les deux paramètres : contexte et objectif
    const newQuestions = await generateQuizQuestions(quizContext, quizObjective);
    
    if (newQuestions.length > 0) {
        setQuestions(newQuestions);
        // Reset quiz state for practice
        setHasSubmitted(false); 
        setScore(0);
        setCurrentQuestionIndex(0);
        setIsAnswered(false);
        setSelectedOption(null);
        setPreviousResult(null); // Important: clear previous DB result context
    } else {
        alert("L'IA n'a pas pu générer le quiz. Veuillez réessayer.");
    }
    setIsGenerating(false);
  };

  const handleOptionClick = (option: string) => {
    if (isAnswered || hasSubmitted) return;
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setHasSubmitted(true);
    // Only save to DB if it's the "official" quiz (checking against default ID or logic)
    // For now we save everything, but in a real app we might distinguish "Practice" vs "Exam"
    // Just saving is fine, it updates the "last score" effectively if we allowed multiple inserts,
    // but db.submitQuizResult logic in previous file wasn't checked for duplicates/updates.
    // Assuming simple flow:
    try {
        // We use a try catch because if unique constraint exists, it might fail, 
        // but for practice mode we might not care about saving to DB if already there.
        await db.submitQuizResult(currentUser.id, score, questions.length);
    } catch(e) {
        console.log("Score update skipped or failed", e);
    }
  };

  if (hasSubmitted) {
    const displayScore = previousResult ? previousResult.score : score;
    const displayTotal = previousResult ? previousResult.total : questions.length;

    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-mandarin-black text-center relative">
        <Award size={64} className="text-mandarin-yellow mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2 academia-serif">Quiz Terminé</h2>
        <p className="text-gray-400 mb-6">
            {previousResult ? "Résultat enregistré." : "Bien joué !"}
        </p>
        
        <div className="bg-mandarin-surface border border-mandarin-green/30 p-6 rounded-xl w-full max-w-sm mb-8">
          <span className="text-5xl font-bold text-mandarin-green">{displayScore}</span>
          <span className="text-2xl text-gray-500"> / {displayTotal}</span>
        </div>

        {/* Bouton accessible à TOUS pour relancer un quiz IA */}
        <button 
            onClick={() => {
                setHasSubmitted(false);
                setPreviousResult(null);
                setScore(0);
                setCurrentQuestionIndex(0);
                setIsAnswered(false);
                setSelectedOption(null);
            }}
            className="flex items-center gap-2 bg-mandarin-blue text-white px-6 py-3 rounded-full font-bold hover:bg-blue-600 transition shadow-lg shadow-blue-500/20"
        >
            <RefreshCw size={20} />
            <span>Générer un nouveau Quiz</span>
        </button>
      </div>
    );
  }

  const question = questions[currentQuestionIndex];

  return (
    <div className="h-full bg-mandarin-black p-4 flex flex-col max-w-2xl mx-auto">
      {/* Generator Toolbar - Available to ALL users now */}
      <div className="mb-6 p-4 bg-mandarin-surface border border-mandarin-blue/30 rounded-xl shadow-lg">
          <div className="flex items-center gap-2 mb-3 text-mandarin-blue text-sm font-bold uppercase tracking-wider">
              <BrainCircuit size={16} />
              <span>Générateur d'Entraînement IA</span>
          </div>
          
          <div className="flex flex-col gap-3">
              {/* Ligne 1: Inputs */}
              <div className="flex flex-col md:flex-row gap-2">
                  <input 
                      type="text"
                      value={quizContext}
                      onChange={(e) => setQuizContext(e.target.value)}
                      placeholder="Sujet (ex: Famille, Chiffres, Restaurant...)"
                      className="flex-[2] bg-black border border-mandarin-border rounded px-3 py-2 text-white focus:border-mandarin-blue outline-none text-sm placeholder-gray-600"
                  />
                  
                  <div className="flex-1 relative">
                      <SlidersHorizontal size={14} className="absolute left-3 top-3 text-gray-500 pointer-events-none"/>
                      <select 
                          value={quizObjective} 
                          onChange={(e) => setQuizObjective(e.target.value)}
                          className="w-full bg-black border border-mandarin-border rounded px-3 py-2 pl-9 text-white focus:border-mandarin-blue outline-none text-sm appearance-none cursor-pointer hover:bg-gray-900 transition"
                      >
                          <option value="Vocabulaire">Vocabulaire</option>
                          <option value="Grammaire">Grammaire</option>
                          <option value="Compréhension">Compréhension</option>
                          <option value="Traduction">Traduction</option>
                          <option value="Culture">Culture</option>
                      </select>
                  </div>
              </div>

              {/* Ligne 2: Bouton Action */}
              <button 
                  onClick={handleGenerateAI}
                  disabled={isGenerating || !quizContext.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-mandarin-blue text-white px-4 py-2 rounded hover:bg-blue-600 text-sm transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                  {isGenerating ? (
                      <span className="animate-pulse flex items-center gap-2">
                          <Sparkles size={16} className="animate-spin" />
                          Création des exercices...
                      </span>
                  ) : (
                      <>
                          <Sparkles size={16} />
                          <span>Générer les Questions</span>
                      </>
                  )}
              </button>
          </div>
      </div>

      {/* Progress */}
      <div className="mb-6 mt-2">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>Question {currentQuestionIndex + 1} / {questions.length}</span>
          <span>Score: {score}</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-mandarin-yellow transition-all duration-500 ease-out"
            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-mandarin-surface border border-mandarin-border rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
          
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4 font-serif leading-tight">
                {question.question}
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === question.correctAnswer;
              
              let btnStyle = "bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800";
              if (isAnswered) {
                if (isCorrect) btnStyle = "bg-mandarin-green/20 border-mandarin-green text-mandarin-green";
                else if (isSelected) btnStyle = "bg-mandarin-red/20 border-mandarin-red text-mandarin-red";
                else btnStyle = "opacity-50 border-gray-800 bg-black";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option)}
                  disabled={isAnswered}
                  className={`p-4 rounded-lg border text-left transition-all font-medium ${btnStyle}`}
                >
                  {option}
                  {isAnswered && isCorrect && <CheckCircle className="float-right" size={20}/>}
                  {isAnswered && isSelected && !isCorrect && <XCircle className="float-right" size={20}/>}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-6 p-4 bg-mandarin-blue/10 border-l-4 border-mandarin-blue rounded text-sm text-gray-200 animate-fade-in">
              <p className="font-bold text-mandarin-blue mb-1">Explication :</p>
              {question.explanation}
            </div>
          )}

        </div>
      </div>

      {/* Action Bar */}
      <div className="h-20 flex items-center justify-end">
        {isAnswered && (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-gray-200 transition shadow-lg shadow-white/10"
          >
            {currentQuestionIndex === questions.length - 1 ? 'Voir le résultat' : 'Suivant'}
            <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;