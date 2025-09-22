
import React, { useState } from 'react';
import type { Goal } from '../types';

interface GoalsProps {
  goals: Goal[];
  onGoalToggle: (goalId: number) => void;
  onAddGoal: (text: string) => void;
}

const Goals: React.FC<GoalsProps> = ({ goals, onGoalToggle, onAddGoal }) => {
    const [newGoalText, setNewGoalText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newGoalText.trim()) {
            onAddGoal(newGoalText.trim());
            setNewGoalText('');
        }
    };
    
    return (
        <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
            <h2 className="text-xl font-bold mb-4">Suas Metas</h2>
            <ul className="space-y-3 mb-4">
                {goals.map(goal => (
                    <li key={goal.id} className="flex items-center bg-slate-700/50 p-3 rounded-lg">
                        <input
                            type="checkbox"
                            checked={goal.completed}
                            onChange={() => onGoalToggle(goal.id)}
                            className="h-5 w-5 rounded border-gray-300 text-[rgb(var(--color-primary))] focus:ring-[rgb(var(--color-primary))] cursor-pointer"
                        />
                        <span className={`ml-3 ${goal.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>{goal.text}</span>
                    </li>
                ))}
            </ul>
            <form onSubmit={handleSubmit} className="flex space-x-2">
                <input
                    type="text"
                    value={newGoalText}
                    onChange={(e) => setNewGoalText(e.target.value)}
                    placeholder="Adicionar nova meta..."
                    className="flex-grow bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[rgb(var(--color-primary))]"
                />
                <button type="submit" className="bg-[rgb(var(--color-primary))] hover:bg-[rgb(var(--color-primary-dark))] text-white font-bold py-2 px-4 rounded-md transition-colors">Adicionar</button>
            </form>
        </div>
    );
};

export default Goals;
