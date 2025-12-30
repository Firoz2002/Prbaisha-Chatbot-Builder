import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateText } from "ai";
import { createTogetherAI } from '@ai-sdk/togetherai';
import { searchSimilar } from "@/lib/langchain/vector-store";

const togetherai = createTogetherAI({
  apiKey: process.env.TOGETHER_AI_API_KEY ?? '',
});

interface RouterParams {
  params: Promise<{ id: string }>;
}

export async function POST(
  request: NextRequest,
  context: RouterParams
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return new NextResponse("Invalid ID", { status: 400 });
    }

    const { 
      input, 
      conversationId,
      prompt, 
      model, 
      temperature, 
      max_tokens 
    } = await request.json();

    // Fetch chatbot with knowledge bases
    const chatbot = await prisma.chatbot.findUnique({
      where: { id },
      include: {
        knowledgeBases: true,
      }
    });

    if (!chatbot) {
      return new NextResponse("Chatbot not found", { status: 404 });
    }

    // Retrieve relevant context from knowledge bases
    let contextChunks: any[] = [];
    
    if (chatbot.knowledgeBases.length > 0) {
      // Search across all knowledge bases for this chatbot
      const searchPromises = chatbot.knowledgeBases.map(kb =>
        searchSimilar({
          query: input,
          chatbotId: chatbot.id,
          knowledgeBaseId: kb.id,
          limit: 3,
          threshold: 0.75,
        }).catch(err => {
          console.error(`Error searching KB ${kb.name}:`, err);
          return [];
        })
      );

      const results = await Promise.all(searchPromises);
      contextChunks = results.flat();
    }

    // Build context string from retrieved chunks
    const contextString = contextChunks.length > 0
      ? contextChunks
          .map((chunk, idx) => `[Context ${idx + 1}]\n${chunk.content}`)
          .join('\n\n')
      : '';

    // Fetch conversation history if conversationId provided
    let conversationHistory = '';
    if (conversationId) {
      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'asc' },
        take: 10, // Last 10 messages
      });

      conversationHistory = messages
        .map(msg => `${msg.senderType}: ${msg.content}`)
        .join('\n');
    }

    // Construct enhanced prompt with RAG context
    const systemPrompt = prompt || chatbot.directive;
    const enhancedPrompt = `${systemPrompt}

${contextString ? `## Relevant Knowledge:\n${contextString}\n` : ''}
${conversationHistory ? `## Conversation History:\n${conversationHistory}\n` : ''}

## User Query:
${input}

Please respond based on the provided knowledge and conversation context. If the answer isn't in the knowledge base, rely on your general knowledge but mention this to the user.`;

    // Generate response
    const { text } = await generateText({
      model: togetherai(model || chatbot.model),
      prompt: enhancedPrompt,
      temperature: temperature ?? chatbot.temperature,
      maxOutputTokens: max_tokens ?? chatbot.max_tokens,
    });

    // Save conversation if conversationId provided
    if (conversationId) {
      await prisma.$transaction([
        // Save user message
        prisma.message.create({
          data: {
            content: input,
            senderType: 'USER',
            conversationId,
          }
        }),
        // Save bot response
        prisma.message.create({
          data: {
            content: text,
            senderType: 'BOT',
            conversationId,
          }
        }),
        // Update conversation timestamp
        prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() }
        })
      ]);
    }

    return NextResponse.json({
      message: text,
      sources: contextChunks.length > 0 ? contextChunks.map(chunk => ({
        documentId: chunk.documentId,
        score: chunk.score,
        metadata: chunk.metadata
      })) : undefined
    });

  } catch (error) {
    console.error("Error while generating: ", error);
    return NextResponse.json({
      error: "Something went wrong"
    }, {
      status: 500
    });
  }
}