import React, { useState } from 'react';
import { QuizQuestion, User, QuizResult } from '../types';
import { CheckCircle, XCircle, ArrowRight, Award, BrainCircuit, Sparkles, SlidersHorizontal, RefreshCw, Loader2 } from 'lucide-react';
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

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
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const [quizContext, setQuizContext] = useState('');
  const [quizObjective, setQuizObjective] = useState('Vocabulaire');
  const [isGenerating, setIsGenerating] = useState(false);

  // Convex Hooks
  const previousResult = useQuery(api.main.checkQuizSubmission, { user_id: currentUser.id as Id<"users"> });
  const submitResult = useMutation(api.main.submitQuizResult);
  const generateQuiz = useAction(api.actions.generateQuiz);

  const handleGenerateAI = async () => {
    if (!quizContext.trim()) return;

    setIsGenerating(true);
    const newQuestions = await generateQuiz({ context: quizContext, objective: quizObjective });
    
    if (newQuestions && newQuestions.length > 0) {
        setQuestions(newQuestions);
        resetQuiz();
    } else {
        alert("Erreur de génération.");
    }
    setIsGenerating(false);
  };

  const resetQuiz = () => {
    setHasSubmitted(false);
    setScore(0);
    setCurrentQuestionIndex(0);
    setIsAnswered(false);
    setSelectedOption(null);
  };

  const handleOptionClick = (option: string) => {
    if (isAnswered || hasSubmitted || previousResult) return;
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
    await submitResult({ 
        user_id: currentUser.id as Id<"users">, 
        score, 
        total: questions.length 
    });
  };

  // Affichage du résultat (Soit historique, soit actuel)
  const showResult = hasSubmitted || !!previousResult;
  const resultData = previousResult || { score, total: questions.length };

  if (showResult) {
    const percent = Math.round((resultData.score / resultData.total) * 100);

    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in relative z-10">
        <div className="glass-panel p-10 rounded-3xl border border-white/10 shadow-2xl max-w-md w-full">
            <Award size={64} className={`mx-auto mb-6 ${percent > 50 ? 'text-mandarin-yellow' : 'text-gray-500'}`} />
            
            <h2 className="text-3xl font-bold text-white mb-2 academia-serif">
                {percent === 100 ? "Parfait !" : percent >= 50 ? "Bien joué" : "Continuez vos efforts"}
            </h2>
            <p className="text-gray-400 mb-8 text-sm uppercase tracking-widest">Résumé</p>
            
            <div className="relative w-40 h-40 mx-auto mb-8 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r="70" stroke="#333" strokeWidth="8" fill="transparent" />
                    <circle cx="80" cy="80" r="70" stroke={percent > 50 ? "#EAB308" : "#3B82F6"} strokeWidth="8" fill="transparent" 
                        strokeDasharray={440} strokeDashoffset={440 - (440 * percent) / 100} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute text-4xl font-bold text-white">{resultData.score}/{resultData.total}</div>
            </div>

            <button onClick={resetQuiz} className="w-full flex items-center justify-center gap-2 bg-mandarin-blue hover:bg-blue-600 text-white py-3 rounded-xl font-medium transition-all shadow-lg">
                <RefreshCw size={18} /> <span>Nouveau Quiz</span>
            </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestionIndex];

  return (
    <div className="h-full p-4 flex flex-col max-w-3xl mx-auto relative z-10">
      
      {/* AI Generator Panel */}
      <div className="glass-panel rounded-xl p-4 mb-6 transition-all duration-300 hover:border-mandarin-blue/30">
          <div className="flex items-center gap-2 mb-3 text-mandarin-blue text-xs font-bold uppercase tracking-widest">
              <BrainCircuit size={14} /> <span>Générateur Gemini</span>
          </div>
          <div className="flex flex-col md:flex-row gap-3">
              <input type="text" value={quizContext} onChange={(e) => setQuizContext(e.target.value)} placeholder="Thème (ex: Voyage)" className="flex-[2] bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white outline-none" />
              <button onClick={handleGenerateAI} disabled={isGenerating || !quizContext.trim()} className="bg-mandarin-blue hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 min-w-[140px]">
                  {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} <span>Générer</span>
              </button>
          </div>
      </div>

      {/* Progress */}
      <div className="mb-4 px-1">
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-mandarin-blue to-mandarin-green transition-all duration-500 ease-out" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }} />
        </div>
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col justify-center animate-slide-up">
        <div className="glass-panel border-t border-white/10 rounded-2xl p-6 md:p-10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-white font-serif leading-snug">{question.question}</h1>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === question.correctAnswer;
              let btnStyle = "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/20";
              if (isAnswered) {
                if (isCorrect) btnStyle = "bg-mandarin-green/20 border-mandarin-green text-mandarin-green ring-1 ring-mandarin-green";
                else if (isSelected) btnStyle = "bg-mandarin-red/20 border-mandarin-red text-mandarin-red";
                else btnStyle = "opacity-40 bg-black border-transparent";
              } else if (isSelected) btnStyle = "bg-mandarin-blue/20 border-mandarin-blue text-white";

              return (
                <button key={idx} onClick={() => handleOptionClick(option)} disabled={isAnswered} className={`p-4 rounded-xl border text-left transition-all duration-200 font-medium flex justify-between items-center group ${btnStyle}`}>
                  <span>{option}</span>
                  {isAnswered && isCorrect && <CheckCircle size={20} className="text-mandarin-green"/>}
                  {isAnswered && isSelected && !isCorrect && <XCircle size={20} className="text-mandarin-red"/>}
                </button>
              );
            })}
          </div>
          {isAnswered && (
            <div className="mt-6 p-5 bg-mandarin-surfaceHighlight rounded-xl border-l-4 border-mandarin-yellow animate-fade-in shadow-inner">
              <p className="text-gray-300 text-sm leading-relaxed">{question.explanation}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="h-20 flex items-center justify-end mt-4">
        {isAnswered && (
          <button onClick={handleNext} className="flex items-center gap-3 bg-white text-black px-8 py-3 rounded-full font-bold hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            <span>{currentQuestionIndex === questions.length - 1 ? 'Terminer' : 'Suivant'}</span> <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;