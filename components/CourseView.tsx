import React, { useState } from 'react';
import type { Course, Progress } from '../types';

interface CourseViewProps {
  course: Course;
  progress: Progress;
  onStartQuiz: (courseId: string, lessonIndex: number) => void;
  onBack: () => void;
}

const CourseView: React.FC<CourseViewProps> = ({ course, progress, onStartQuiz, onBack }) => {
    const [selectedLessonIndex, setSelectedLessonIndex] = useState(0);
    const selectedLesson = course.lessons[selectedLessonIndex];

    const quizzesPassedForCourse = progress.quizzesPassed[course.id] || [];
    
    const difficultyColors = {
        beginner: 'bg-teal-500/20 text-teal-300',
        intermediate: 'bg-amber-500/20 text-amber-300'
    }

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
        <button onClick={onBack} className="mb-6 text-[rgb(var(--color-primary-light))] hover:text-[rgb(var(--color-primary))] font-semibold">&larr; Voltar ao Painel</button>
        <div className="bg-slate-800/50 p-6 md:p-8 rounded-2xl border border-slate-700">
            <div className="flex items-center gap-4 mb-2">
                 <h1 className="text-3xl lg:text-4xl font-bold text-slate-100">{course.title}</h1>
                 <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficultyColors[course.difficulty]}`}>
                    {course.difficulty === 'beginner' ? 'Iniciante' : 'Intermediário'}
                 </span>
            </div>
           
            <p className="mt-2 text-slate-400">{course.description}</p>
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
                <h2 className="text-xl font-bold mb-4">Lições</h2>
                <ul className="space-y-2">
                    {course.lessons.map((lesson, index) => (
                        <li key={index}>
                            <button
                                onClick={() => setSelectedLessonIndex(index)}
                                className={`w-full text-left p-4 rounded-lg transition-colors flex items-center justify-between ${selectedLessonIndex === index ? 'bg-[rgb(var(--color-primary)/0.2)] text-[rgb(var(--color-primary-light))]' : 'bg-slate-800 hover:bg-slate-700'}`}
                            >
                                <span>{index + 1}. {lesson.title}</span>
                                {quizzesPassedForCourse.includes(index) && (
                                     <span title="Quiz concluído!">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-green-400">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                        </svg>
                                    </span>
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>
            <div className="md:col-span-2 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                {selectedLesson && (
                    <>
                        <h2 className="text-2xl font-bold mb-4">{selectedLesson.title}</h2>
                        <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-slate-100 text-slate-300 whitespace-pre-wrap">
                            {selectedLesson.content}
                        </div>
                        <button 
                            onClick={() => onStartQuiz(course.id, selectedLessonIndex)}
                            className="mt-8 w-full bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white font-bold py-3 px-4 rounded-md transition-colors"
                        >
                            {quizzesPassedForCourse.includes(selectedLessonIndex) ? 'Refazer Quiz' : 'Fazer Quiz'}
                        </button>
                    </>
                )}
            </div>
        </div>
    </div>
  );
};

export default CourseView;