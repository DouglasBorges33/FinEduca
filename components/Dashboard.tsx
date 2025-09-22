
import React, { useState } from 'react';
import type { Course, Progress, Goal, PointEvent } from '../types';
import type { Theme } from '../themes';
import CourseCard from './CourseCard';
import Metrics from './Metrics';
import Goals from './Goals';
import Spinner from './Spinner';

interface DashboardProps {
  courses: Course[];
  progress: Progress;
  goals: Goal[];
  points: number;
  pointsHistory: PointEvent[];
  onSelectCourse: (courseId: string) => void;
  onAddGoal: (text: string) => void;
  onGoalToggle: (goalId: number) => void;
  onGenerateCourse: (topic: string, difficulty: 'beginner' | 'intermediate') => void;
  isGeneratingCourse: boolean;
  generationError: string | null;
  activeTheme: Theme;
}

const Dashboard: React.FC<DashboardProps> = ({
  courses,
  progress,
  goals,
  points,
  pointsHistory,
  onSelectCourse,
  onAddGoal,
  onGoalToggle,
  onGenerateCourse,
  isGeneratingCourse,
  generationError,
  activeTheme,
}) => {
  const [newTopic, setNewTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate'>('beginner');

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopic.trim()) {
      onGenerateCourse(newTopic.trim(), difficulty);
      setNewTopic('');
    }
  };

  const completedCourses = progress.coursesCompleted.length;
  const totalCourses = courses.length;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
        <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-slate-100">Seu Painel</h1>
            <p className="mt-2 text-slate-400">
                Continue sua jornada de aprendizado financeiro. Você completou {completedCourses} de {totalCourses} cursos.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
            <div className="lg:col-span-2">
                <Metrics pointsHistory={pointsHistory} activeTheme={activeTheme} />
            </div>
             <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col items-center justify-center text-center">
                <h2 className="text-xl font-bold mb-2 text-slate-200">Pontos de Conquista</h2>
                <div className="flex items-center space-x-3 my-2">
                    <span className="text-yellow-400 text-4xl" role="img" aria-label="Star">⭐</span>
                    <p className="text-5xl font-bold text-white">{points}</p>
                </div>
                <p className="mt-2 text-slate-400">Continue aprendendo para ganhar mais!</p>
            </div>
            <div className="lg:col-span-1">
                <Goals goals={goals} onAddGoal={onAddGoal} onGoalToggle={onGoalToggle} />
            </div>
        </div>

      <div className="mb-12 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
        <h2 className="text-2xl font-bold mb-4 text-slate-100">Crie seu Próprio Curso</h2>
        <p className="text-slate-400 mb-4">Tem algum tópico financeiro que você quer aprender? Diga para a nossa IA e ela criará um curso para você!</p>
        <form onSubmit={handleGenerateSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="topic" className="block text-sm font-medium text-slate-300 mb-1">Tópico do Curso</label>
            <input
              id="topic"
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Ex: Fundos Imobiliários"
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
              disabled={isGeneratingCourse}
            />
          </div>
          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-slate-300 mb-1">Dificuldade</label>
            <select
              id="difficulty"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'beginner' | 'intermediate')}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
              disabled={isGeneratingCourse}
            >
              <option value="beginner">Iniciante</option>
              <option value="intermediate">Intermediário</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <button type="submit" disabled={isGeneratingCourse || !newTopic.trim()} className="w-full md:w-auto bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white font-bold py-2 px-6 rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center">
              {isGeneratingCourse && <Spinner />}
              {isGeneratingCourse ? 'Gerando Curso...' : 'Gerar Curso'}
            </button>
          </div>
        </form>
        {generationError && <p className="text-red-400 mt-4">{generationError}</p>}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6">Cursos Disponíveis</h2>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} onSelectCourse={onSelectCourse} />
            ))}
          </div>
        ) : (
           <p className="text-slate-400">Nenhum curso disponível no momento.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;