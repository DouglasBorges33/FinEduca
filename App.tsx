import React, { useState, useEffect, useMemo } from 'react';
import { AppView, Course, Progress, Goal, PointEvent } from './types';
import { INITIAL_COURSE_TOPICS } from './constants';
import { generateCourse } from './services/geminiService';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import CourseView from './components/CourseView';
import QuizView from './components/QuizView';
import Spinner from './components/Spinner';
import ProfileModal from './components/ProfileModal';
import { THEMES, Theme } from './themes';

const App: React.FC = () => {
    // State management
    const [view, setView] = useState<AppView>(AppView.DASHBOARD);
    const [courses, setCourses] = useState<Record<string, Course>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState('Carregando seus cursos...');
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingCourse, setIsGeneratingCourse] = useState(false);

    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [currentQuiz, setCurrentQuiz] = useState<{ courseId: string; lessonIndex: number } | null>(null);

    const [progress, setProgress] = useState<Progress>({ coursesCompleted: [], quizzesPassed: {} });
    const [goals, setGoals] = useState<Goal[]>([]);
    const [pointsHistory, setPointsHistory] = useState<PointEvent[]>([]);
    
    const [profilePic, setProfilePic] = useState<string | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [activeTheme, setActiveTheme] = useState<Theme>(THEMES[0]);

    const totalPoints = useMemo(() => pointsHistory.reduce((sum, event) => sum + event.points, 0), [pointsHistory]);

    // Load from localStorage on initial render
    useEffect(() => {
        try {
            const savedProgress = localStorage.getItem('finEducaProgress');
            if (savedProgress) setProgress(JSON.parse(savedProgress));

            const savedGoals = localStorage.getItem('finEducaGoals');
            if (savedGoals) setGoals(JSON.parse(savedGoals));

            const savedPointsHistory = localStorage.getItem('finEducaPointsHistory');
            if (savedPointsHistory) setPointsHistory(JSON.parse(savedPointsHistory));

            const savedProfilePic = localStorage.getItem('finEducaProfilePic');
            if (savedProfilePic) setProfilePic(savedProfilePic);
            
            const savedThemeId = localStorage.getItem('finEducaTheme');
            const foundTheme = THEMES.find(t => t.id === savedThemeId);
            if (foundTheme) setActiveTheme(foundTheme);

        } catch (e) {
            console.error("Failed to load data from localStorage", e);
        }
    }, []);

    // Save to localStorage when state changes
    useEffect(() => {
        try {
            localStorage.setItem('finEducaProgress', JSON.stringify(progress));
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    }, [progress]);

    useEffect(() => {
        try {
            localStorage.setItem('finEducaGoals', JSON.stringify(goals));
        } catch (e) {
            console.error("Failed to save goals", e);
        }
    }, [goals]);

    useEffect(() => {
        try {
            localStorage.setItem('finEducaPointsHistory', JSON.stringify(pointsHistory));
        } catch (e) {
            console.error("Failed to save points history", e);
        }
    }, [pointsHistory]);
    
    useEffect(() => {
        if (profilePic) {
            localStorage.setItem('finEducaProfilePic', profilePic);
        } else {
            localStorage.removeItem('finEducaProfilePic');
        }
    }, [profilePic]);

    useEffect(() => {
        localStorage.setItem('finEducaTheme', activeTheme.id);
        Object.entries(activeTheme.colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
    }, [activeTheme]);


    // Fetch courses
    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Load user-generated courses from localStorage
                const allCourseKeys = Object.keys(localStorage).filter(key => key.startsWith('course-'));
                const loadedCourses: Record<string, Course> = {};

                for (const key of allCourseKeys) {
                    const cachedCourse = localStorage.getItem(key);
                    if (cachedCourse) {
                        const course = JSON.parse(cachedCourse);
                        loadedCourses[course.id] = course;
                    }
                }

                const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

                // Fetch initial courses if not already in localStorage
                for (const topic of INITIAL_COURSE_TOPICS) {
                     if (!loadedCourses[topic.id]) {
                        setLoadingMessage(`Gerando curso: ${topic.title}...`);
                        const courseContent = await generateCourse(topic.title, 'beginner');
                        const newCourse: Course = { 
                            id: topic.id, 
                            title: topic.title, 
                            ...courseContent 
                        };
                        loadedCourses[topic.id] = newCourse;
                        localStorage.setItem(`course-${topic.id}`, JSON.stringify(newCourse));
                        
                        // Add a delay to avoid hitting API rate limits
                        await delay(1000); 
                    }
                }
                setCourses(loadedCourses);
            } catch (err) {
                console.error(err);
                // Fix: Explicitly check if the caught error is an instance of Error before accessing its message property to ensure type safety.
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("Ocorreu um erro desconhecido ao carregar os cursos.");
                }
            } finally {
                setIsLoading(false);
                setLoadingMessage('');
            }
        };

        fetchCourses();
    }, []);

    // Handlers
    const handleSelectCourse = (courseId: string) => {
        setSelectedCourseId(courseId);
        setView(AppView.COURSE_VIEW);
    };

    const handleBackToDashboard = () => {
        setSelectedCourseId(null);
        setCurrentQuiz(null);
        setView(AppView.DASHBOARD);
    };

    const handleStartQuiz = (courseId: string, lessonIndex: number) => {
        setCurrentQuiz({ courseId, lessonIndex });
        setView(AppView.QUIZ_VIEW);
    };
    
    const handleCompleteQuiz = (score: number, total: number) => {
        if (currentQuiz) {
            const { courseId, lessonIndex } = currentQuiz;
            // Mark as passed if score is >= 70%
            if (score / total >= 0.7) {
                setProgress(prev => {
                    const quizzesForCourse = prev.quizzesPassed[courseId] || [];
                    // Check if it's a first-time pass to award points
                    if (!quizzesForCourse.includes(lessonIndex)) {
                        setPointsHistory(history => [...history, { points: 50, timestamp: Date.now(), reason: 'Quiz Passou' }]);
                        const newQuizzesPassed = {
                            ...prev.quizzesPassed,
                            [courseId]: [...quizzesForCourse, lessonIndex]
                        };
                        
                        // Check if course is completed
                        const course = courses[courseId];
                        const newCoursesCompleted = [...prev.coursesCompleted];
                        if (course && course.lessons.length === newQuizzesPassed[courseId].length && !newCoursesCompleted.includes(courseId)) {
                             newCoursesCompleted.push(courseId);
                             setPointsHistory(history => [...history, { points: 100, timestamp: Date.now(), reason: 'Curso Completo' }]);
                        }

                        return {
                            ...prev,
                            coursesCompleted: newCoursesCompleted,
                            quizzesPassed: newQuizzesPassed
                        };
                    }
                    return prev; // Return prev state if quiz was already passed
                });
            }
            setView(AppView.COURSE_VIEW);
            setCurrentQuiz(null);
        }
    };

    const handleAddGoal = (text: string) => {
        const newGoal: Goal = {
            id: Date.now(),
            text,
            completed: false,
        };
        setGoals(prev => [...prev, newGoal]);
    };

    const handleToggleGoal = (goalId: number) => {
        const goal = goals.find(g => g.id === goalId);
        // Award points only when completing an incomplete goal
        if (goal && !goal.completed) {
            setPointsHistory(history => [...history, { points: 25, timestamp: Date.now(), reason: 'Meta Completa' }]);
        }
        setGoals(prev => prev.map(g => g.id === goalId ? { ...g, completed: !g.completed } : g));
    };
    
    const handleSaveProfilePic = (imageDataUrl: string) => {
        setProfilePic(imageDataUrl);
        setShowProfileModal(false);
    };
    
    const handleThemeChange = (themeId: string) => {
        const theme = THEMES.find(t => t.id === themeId);
        if (theme) {
            setActiveTheme(theme);
        }
    };

    const handleGenerateNewCourse = async (topicTitle: string, difficulty: 'beginner' | 'intermediate') => {
        const topicId = `user-${topicTitle.toLowerCase().replace(/\s+/g, '-')}`;
        if (courses[topicId]) {
            alert("Você já gerou um curso sobre este tópico!");
            return;
        }
        
        setIsGeneratingCourse(true);
        setError(null);
        try {
            const courseContent = await generateCourse(topicTitle, difficulty);
            const newCourse: Course = {
                id: topicId,
                title: topicTitle,
                ...courseContent,
            };
            setCourses(prev => ({...prev, [topicId]: newCourse}));
            localStorage.setItem(`course-${topicId}`, JSON.stringify(newCourse));
        } catch (err) {
            // Fix: Explicitly check if the caught error is an instance of Error before accessing its message property to ensure type safety.
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocorreu um erro desconhecido ao gerar o curso.");
            }
        } finally {
            setIsGeneratingCourse(false);
        }
    };

    // Memos for derived state
    const selectedCourse = useMemo(() => {
        return selectedCourseId ? courses[selectedCourseId] : null;
    }, [selectedCourseId, courses]);
    
    const quizQuestions = useMemo(() => {
        if (currentQuiz && selectedCourse) {
            return selectedCourse.lessons[currentQuiz.lessonIndex]?.quiz;
        }
        return null;
    }, [currentQuiz, selectedCourse]);

    // Render logic
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-full pt-20">
                    <Spinner />
                    <p className="mt-4 text-slate-300">{loadingMessage}</p>
                </div>
            );
        }

        // Show a general error, but allow the dashboard to render if there's a generation-specific error
        if (error && !isGeneratingCourse) {
            return (
                <div className="flex flex-col items-center justify-center h-full pt-20 text-center">
                    <p className="text-red-400 text-lg">Oops! Algo deu errado.</p>
                    <p className="mt-2 text-slate-400 max-w-md">{error}</p>
                </div>
            );
        }

        switch (view) {
            case AppView.COURSE_VIEW:
                return selectedCourse ? (
                    <CourseView 
                        course={selectedCourse} 
                        progress={progress} 
                        onStartQuiz={handleStartQuiz} 
                        onBack={handleBackToDashboard}
                    />
                ) : null;
            case AppView.QUIZ_VIEW:
                return quizQuestions && selectedCourse ? (
                    <QuizView 
                        quizQuestions={quizQuestions} 
                        courseTitle={selectedCourse.lessons[currentQuiz!.lessonIndex].title}
                        onComplete={handleCompleteQuiz}
                    />
                ) : null;
            case AppView.DASHBOARD:
            default:
                return (
                    <Dashboard
                        courses={Object.values(courses)}
                        progress={progress}
                        goals={goals}
                        points={totalPoints}
                        pointsHistory={pointsHistory}
                        onSelectCourse={handleSelectCourse}
                        onAddGoal={handleAddGoal}
                        onGoalToggle={handleToggleGoal}
                        onGenerateCourse={handleGenerateNewCourse}
                        isGeneratingCourse={isGeneratingCourse}
                        generationError={error}
                        activeTheme={activeTheme}
                    />
                );
        }
    };
    
    return (
        <div className="bg-slate-900 text-slate-200 min-h-screen font-sans">
            <Header 
                onLogoClick={handleBackToDashboard} 
                profilePic={profilePic} 
                onProfileClick={() => setShowProfileModal(true)}
            />
            <main className="p-4 sm:p-6 lg:p-8">
                {renderContent()}
            </main>
            {showProfileModal && (
                <ProfileModal 
                    onClose={() => setShowProfileModal(false)}
                    onSave={handleSaveProfilePic}
                    currentImage={profilePic}
                    activeTheme={activeTheme}
                    onThemeChange={handleThemeChange}
                />
            )}
        </div>
    );
};

export default App;