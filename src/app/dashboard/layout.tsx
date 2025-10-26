'use client';

import { useState } from 'react';
import { VerticalNav } from '@/components/layout/VerticalNav';
import { AgentChatPanel, ChatFloatingButton } from '@/components/chat/AgentChatPanel';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#fafafa]">
      {/* Vertical Navigation */}
      <VerticalNav />
      
      {/* Main Content - shifts when chat is open */}
      <main 
        className="flex-1 overflow-y-auto transition-all duration-300"
        style={{ 
          marginRight: isChatOpen ? '480px' : '0' 
        }}
      >
        {children}
      </main>

      {/* AI Chat Panel */}
      <AgentChatPanel
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      {/* Floating Chat Button */}
      {!isChatOpen && (
        <ChatFloatingButton onClick={() => setIsChatOpen(true)} />
      )}
    </div>
  );
}
