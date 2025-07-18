'use client';

import React from 'react';
import SideNavigation from '@cloudscape-design/components/side-navigation';
import useAppStore from '@/lib/store';
import { useTheme } from './ThemeProvider';
import ThemeToggle from './ThemeToggle';

export default function AppSideNavigation() {
  const { currentView, setCurrentView } = useAppStore();
  const { theme, toggleTheme } = useTheme();

  const handleNavigationChange = ({ detail }: { detail: { href: string } }) => {
    const href = detail.href;
    if (href === '#chat' || href === '/') {
      setCurrentView('chat');
    } else if (href === '#orders') {
      setCurrentView('orders');
    } else if (href === '#calendar') {
      setCurrentView('calendar');
    } else if (href === '#theme') {
      // Cambiar el tema
      toggleTheme();
      return;
    }
  };

  const getActiveHref = () => {
    switch (currentView) {
      case 'chat':
        return '#chat';
      case 'orders':
        return '#orders';
      case 'calendar':
        return '#calendar';
      default:
        return '#chat';
    }
  };

  return (
    <SideNavigation
      activeHref={getActiveHref()}
      header={{
        href: '#',
        text: 'Nova Sonic'
      }}
      onFollow={(e) => {
        e.preventDefault();
        handleNavigationChange(e);
      }}
      items={[
        {
          type: 'link',
          text: 'Chat con Nova Sonic',
          href: '#chat'
        },
        {
          type: 'link',
          text: 'Seguimiento de Pedidos',
          href: '#orders'
        },
        {
          type: 'link',
          text: 'Calendario de Citas',
          href: '#calendar'
        },
        {
          type: 'divider'
        },
        {
          type: 'link',
          text: 'Tema',
          href: '#theme',
          info: <ThemeToggle />
        }
      ]}
    />
  );
} 