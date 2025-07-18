'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { theme } = useTheme();

  return (
    <div 
      className={`
        min-h-screen bg-transition
        ${theme === 'light' 
          ? 'bg-gradient-to-br from-gray-50 via-white to-gray-50' 
          : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
        }
      `}
      data-theme={theme}
    >
      <div className={`
        theme-transition
        ${theme === 'light' 
          ? 'text-gray-900' 
          : 'text-gray-100'
        }
      `}>
        {children}
      </div>
    </div>
  );
} 