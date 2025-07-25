'use client';

import React from 'react';
import AppLayout from '@cloudscape-design/components/app-layout';
import AppSideNavigation from '@/components/SideNavigation';
//import ChatInterface from '@/components/ChatInterface';
import S2sChatInterface from '@/components/S2sChatInterface';
import PedidosInterface from '@/components/PedidosInterface';
import CalendarInterface from '@/components/CalendarInterface';
import useAppStore from '@/lib/store';

export default function HomePage() {
  const { currentView } = useAppStore();

  const renderContent = () => {
    switch (currentView) {
      case 'chat':
        //return <ChatInterface />;
        return <S2sChatInterface />;
      case 'orders':
        return <PedidosInterface />;
      case 'calendar':
        return <CalendarInterface />;
      default:
        //return <ChatInterface />;
        return <S2sChatInterface />;
    }
  };

  return (
    <AppLayout
      navigation={<AppSideNavigation />}
      content={renderContent()}
      toolsHide={true}
    />
  );
}
