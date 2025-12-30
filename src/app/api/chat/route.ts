import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest
) {
  try {
    const { message, conversationId, context, chatbotId: bodyChatbotId } = await request.json();
    const chatbotId = bodyChatbotId;

    // Get chatbot with configurations
    const chatbot = await prisma.chatbot.findUnique({
      where: { id: chatbotId },
      include: {
        knowledgeBases: {
          include: { documents: true }
        },
        flows: {
          include: {
            nodes: true,
            edges: true
          }
        },
        logics: {
          where: { isActive: true }
        }
      }
    });

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    // Create or get conversation
    let conversation;
    if (conversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: conversationId }
      });
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          chatbotId,
          title: message.substring(0, 50),
          metadata: context
        }
      });
    }

    // Save user message
    await prisma.message.create({
      data: {
        content: message,
        senderType: 'USER',
        conversationId: conversation.id
      }
    });

    // Process the message (simplified - you'll need to integrate with your LLM)
    // let response = await generateResponse(chatbot, message, conversation.id);

    // Save bot response
    await prisma.message.create({
      data: {
        content: "This is a placeholder response.",
        senderType: 'BOT',
        conversationId: conversation.id
      }
    });

    return NextResponse.json({
      message: "This is a placeholder response.",
      conversationId: conversation.id
    });

  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
