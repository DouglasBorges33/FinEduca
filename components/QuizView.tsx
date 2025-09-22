
import React, { useState } from 'react';
import type { QuizQuestion } from '../types';
import Modal from './Modal';

interface QuizViewProps {
  quizQuestions: QuizQuestion[];
  courseTitle: string;
  onComplete: (score: number, total: number) => void;
}

const QuizView: React.FC<QuizViewProps> = ({ quizQuestions, courseTitle, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>(Array(quizQuestions.length).fill(null));
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const score = selectedAnswers.filter((answer, index) => answer === quizQuestions[index].correctAnswerIndex).length;

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };
  
  const renderResults = () => {
    const isSuccess = (score / quizQuestions.length) >= 0.7;
    return (
        <Modal
            title={isSuccess ? "Parabéns!" : "Continue Tentando!"}
            onClose={() => onComplete(score, quizQuestions.length)}
        >
            <div className="text-center">
                <p className="text-4xl font-bold mb-2">{isSuccess ? '🎉' : '📚'}</p>
                <p className="text-lg text-slate-300">Você acertou {score} de {quizQuestions.length} perguntas.</p>
                <p className="mt-2 text-slate-400">{isSuccess ? "Excelente trabalho! Você dominou o material." : "Não desista! Reveja a lição e tente novamente."}</p>
                <button
                    onClick={() => onComplete(score, quizQuestions.length)}
                    className="mt-6 w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white font-bold py-2 px-4 rounded-md transition-colors"
                >
                    Voltar para o Curso
                </button>
            </div>
        </Modal>
    );
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 bg-slate-800/50 rounded-2xl border border-slate-700 animate-fade-in">
      {showResults && renderResults()}
      <h1 className="text-2xl font-bold text-slate-100">Quiz: {courseTitle}</h1>
      <div className="w-full bg-slate-700 rounded-full h-2.5 my-4">
        <div className="bg-[rgb(var(--color-primary))] h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}></div>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-slate-200 mb-4">{currentQuestionIndex + 1}. {currentQuestion.question}</h2>
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === index;
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                  isSelected 
                  ? 'bg-[rgb(var(--color-accent)/0.2)] border-[rgb(var(--color-accent-light))] text-white' 
                  : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700 text-slate-300'
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={handleNext}
          disabled={selectedAnswers[currentQuestionIndex] === null}
          className="bg-[rgb(var(--color-primary))] text-white font-bold py-2 px-6 rounded-md transition-colors hover:bg-[rgb(var(--color-primary-dark))] disabled:bg-slate-600 disabled:cursor-not-allowed"
        >
          {currentQuestionIndex < quizQuestions.length - 1 ? 'Próximo' : 'Finalizar'}
        </button>
      </div>
    </div>
  );
};

export default QuizView;
