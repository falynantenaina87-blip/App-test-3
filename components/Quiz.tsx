import React, { useState, useEffect } from 'react';
import { db } from '../services/databaseService';
import { generateQuizQuestions } from '../services/geminiService';
import { QuizQuestion, User, UserRole, QuizResult } from '../types';
import { CheckCircle, XCircle, ArrowRight, Award, BrainCircuit, Lock, Sparkles } from 'lucide-react';

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
  
  // New state for topic generation
  const [quizTopic, setQuizTopic] = useState('');

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
    if (!quizTopic.trim()) {
        alert("Veuillez entrer un mot ou une phrase pour générer le quiz.");
        return;
    }

    setIsGenerating(true);
    const newQuestions = await generateQuizQuestions(quizTopic);
    if (newQuestions.length > 0) {
        setQuestions(newQuestions);
        // Reset quiz state for demo purposes so admin can test it
        setHasSubmitted(false); 
        setScore(0);
        setCurrentQuestionIndex(0);
        setIsAnswered(false);
        setSelectedOption(null);
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
    // Save to DB
    await db.submitQuizResult(currentUser.id, score, questions.length);
  };

  if (hasSubmitted) {
    const displayScore = previousResult ? previousResult.score : score;
    const displayTotal = previousResult ? previousResult.total : questions.length;

    return (
      <div className="h-full flex flex-col items-center justify-center p-6 bg-mandarin-black text-center relative">
        <Award size={64} className="text-mandarin-yellow mb-4" />
        <h2 className="text-3xl font-bold text-white mb-2 academia-serif">Quiz Validé</h2>
        <p className="text-gray-400 mb-6">Vous avez déjà complété cette évaluation.</p>
        
        <div className="bg-mandarin-surface border border-mandarin-green/30 p-6 rounded-xl w-full max-w-sm mb-8">
          <span className="text-5xl font-bold text-mandarin-green">{displayScore}</span>
          <span className="text-2xl text-gray-500"> / {displayTotal}</span>
        </div>

        <div className="flex items-center gap-2 text-mandarin-red bg-mandarin-red/10 px-4 py-2 rounded-lg border border-mandarin-red/30">
            <Lock size={16} />
            <span className="text-sm">Tentative unique verrouillée</span>
        </div>

        {currentUser.role === UserRole.ADMIN && (
             <button 
             onClick={() => setHasSubmitted(false)}
             className="mt-8 text-xs text-gray-500 underline hover:text-white"
           >
             (Admin: Réinitialiser pour tester)
           </button>
        )}
      </div>
    );
  }

  const question = questions[currentQuestionIndex];

  return (
    <div className="h-full bg-mandarin-black p-4 flex flex-col max-w-2xl mx-auto">
      {/* Admin Toolbar - Only visible to Admin */}
      {currentUser.role === UserRole.ADMIN && (
        <div className="mb-6 p-4 bg-mandarin-surface border border-mandarin-blue/30 rounded-xl shadow-lg">
            <div className="flex items-center gap-2 mb-2 text-mandarin-blue text-sm font-bold uppercase tracking-wider">
                <BrainCircuit size={16} />
                <span>Générateur IA</span>
            </div>
            <div className="flex gap-2">
                <input 
                    type="text"
                    value={quizTopic}
                    onChange={(e) => setQuizTopic(e.target.value)}
                    placeholder="Sujet, mot ou phrase (ex: 'La famille', 'Manger', '你好')"
                    className="flex-1 bg-black border border-mandarin-border rounded px-3 py-2 text-white focus:border-mandarin-blue outline-none text-sm"
                />
                <button 
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !quizTopic.trim()}
                    className="flex items-center gap-2 bg-mandarin-blue text-white px-4 py-2 rounded hover:bg-blue-600 text-sm transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isGenerating ? (
                        <span className="animate-pulse">Création...</span>
                    ) : (
                        <>
                            <Sparkles size={16} />
                            <span>Générer</span>
                        </>
                    )}
                </button>
            </div>
        </div>
      )}

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
            {currentQuestionIndex === questions.length - 1 ? 'Terminer & Valider' : 'Suivant'}
            <ArrowRight size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Quiz;