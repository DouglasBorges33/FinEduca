import React from 'react';

interface HeaderProps {
    onLogoClick: () => void;
    profilePic: string | null;
    onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogoClick, profilePic, onProfileClick }) => {
  return (
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 border-b border-slate-700">
          <div 
            className="flex items-center space-x-2 cursor-pointer group"
            onClick={onLogoClick}
          >
            <div className="w-8 h-8 bg-gradient-to-tr from-[rgb(var(--color-primary-light))] to-[rgb(var(--color-accent-light))] rounded-lg flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-6">
                <span className="text-slate-900 font-bold text-xl">F</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 group-hover:text-[rgb(var(--color-primary-light))] transition-colors">
              FinEduca
            </h1>
          </div>
           <div className="flex items-center">
             <button 
                onClick={onProfileClick} 
                className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center hover:ring-2 hover:ring-[rgb(var(--color-primary-light))] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-[rgb(var(--color-primary-light))]"
                aria-label="Change profile picture"
            >
                {profilePic ? (
                    <img src={profilePic} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                    <svg xmlns="http://www.w.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-slate-400">
                        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                    </svg>
                )}
             </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
