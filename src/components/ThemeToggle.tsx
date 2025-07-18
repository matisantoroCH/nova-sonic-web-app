'use client';

import React, { useState } from 'react';
import { useTheme } from './ThemeProvider';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    toggleTheme();
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 theme-transition">
        {theme === 'light' ? 'Claro' : 'Oscuro'}
      </span>
      
      <button
        onClick={handleToggle}
        disabled={isAnimating}
        className={`
          relative inline-flex h-6 w-11 items-center rounded-full theme-toggle-smooth
          ${theme === 'light' 
            ? 'bg-gray-200 hover:bg-gray-300' 
            : 'bg-gray-600 hover:bg-gray-700'
          }
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          ${isAnimating ? 'scale-95' : 'hover:scale-105'}
        `}
        aria-label={`Cambiar a modo ${theme === 'light' ? 'oscuro' : 'claro'}`}
      >
        {/* Toggle handle */}
        <div className={`
          inline-block h-4 w-4 transform rounded-full theme-toggle-smooth
          ${theme === 'light' 
            ? 'translate-x-1 bg-white shadow-sm' 
            : 'translate-x-6 bg-white shadow-sm'
          }
        `}>
          {/* Sun icon for light mode */}
          <div className={`
            absolute inset-0 flex items-center justify-center theme-toggle-smooth
            ${theme === 'light' ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
          `}>
            <svg className="w-2.5 h-2.5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          </div>
          
          {/* Moon icon for dark mode */}
          <div className={`
            absolute inset-0 flex items-center justify-center theme-toggle-smooth
            ${theme === 'light' ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}
          `}>
            <svg className="w-2.5 h-2.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
} 