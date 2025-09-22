import React from 'react';
import type { Course } from '../types';
import { ICONS } from '../constants';

interface CourseCardProps {
  course: Course;
  onSelectCourse: (courseId: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onSelectCourse }) => {
    const IconComponent = ICONS[course.icon];
    const iconColor = {
        tax: 'text-red-400',
        investment: 'text-green-400',
        budget: 'text-blue-400'
    };
    const bgColor = {
        tax: 'bg-red-500/10',
        investment: 'bg-green-500/10',
        budget: 'bg-blue-500/10'
    }
    
    const difficultyColors = {
        beginner: 'bg-teal-500/20 text-teal-300',
        intermediate: 'bg-amber-500/20 text-amber-300'
    }

  return (
    <div 
      className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 hover:border-[rgb(var(--color-primary))] transition-all duration-300 transform hover:-translate-y-1 cursor-pointer flex flex-col relative"
      onClick={() => onSelectCourse(course.id)}
    >
        <div className={`absolute top-4 right-4 px-2 py-1 rounded-full text-xs font-semibold ${difficultyColors[course.difficulty]}`}>
            {course.difficulty === 'beginner' ? 'Iniciante' : 'Intermediário'}
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${bgColor[course.icon]}`}>
            <IconComponent className={`w-7 h-7 ${iconColor[course.icon]}`} />
        </div>
        <h3 className="text-xl font-bold mt-4 text-slate-100">{course.title}</h3>
        <p className="text-slate-400 mt-2 flex-grow">{course.description}</p>
        <button className="mt-6 text-[rgb(var(--color-primary-light))] font-semibold self-start hover:text-[rgb(var(--color-primary))]">
            Começar a aprender &rarr;
        </button>
    </div>
  );
};

export default CourseCard;