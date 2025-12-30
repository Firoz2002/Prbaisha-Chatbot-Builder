// components/chatbot/widget.tsx
'use client';
import { useEffect, useState } from 'react';

interface ChatbotWidgetProps {
  chatbot: any;
}

export default function ChatbotWidget({ chatbot }: ChatbotWidgetProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');

  useEffect(() => {
    // Generate session ID for anonymous user
    const sessionId = localStorage.getItem(`chatbot_session_${chatbot.id}`) || 
                      `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setSessionId(sessionId);
    localStorage.setItem(`chatbot_session_${chatbot.id}`, sessionId);
    
    setIsInitialized(true);
    
    // Notify parent window of widget load
    window.parent.postMessage({ 
      type: 'chatbot-loaded',
      chatbotId: chatbot.id 
    }, '*');
  }, [chatbot.id]);

  // Handle closing from inside
  const handleClose = () => {
    window.parent.postMessage({ 
      type: 'chatbot-close',
      chatbotId: chatbot.id 
    }, '*');
  };

  // Handle resize
  const handleResize = (width: string, height: string) => {
    window.parent.postMessage({ 
      type: 'chatbot-resize',
      chatbotId: chatbot.id,
      width,
      height
    }, '*');
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      
    </div>
  );
}