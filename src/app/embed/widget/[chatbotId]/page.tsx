// app/embed/widget/[chatbotId]/page.tsx
import { notFound } from 'next/navigation';
import ChatbotWidget from '@/components/features/chatbot-widget';

interface PageProps {
  params: {
    chatbotId: string;
  };
}

export default async function WidgetPage({ params }: PageProps) {
  const { chatbotId } = params;

  try {
    // Fetch chatbot data
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL}/api/chatbots/${chatbotId}`,
      { cache: 'no-store' }
    );
    
    if (!response.ok) {
      notFound();
    }
    
    const chatbot = await response.json();
    
    return <ChatbotWidget chatbot={chatbot} />;
  } catch (error) {
    notFound();
  }
}