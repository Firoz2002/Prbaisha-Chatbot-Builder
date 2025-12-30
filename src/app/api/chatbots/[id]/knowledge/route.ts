// app/api/chatbot/[chatbotId]/knowledge/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

import { embedAndStore } from '@/lib/langchain/vector-store';
import { processFile, processTable } from '@/lib/langchain/knowledge/processor';

interface RouterParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouterParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: chatbotId } = await context.params;

    const knowledgeBases = await prisma.knowledgeBase.findMany({
      where: {
        chatbotId,
      },
      include: {
        documents: {
          select: {
            id: true,
            source: true,
            metadata: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(knowledgeBases)
  } catch (error) {
    console.error('Failed to fetch knowledge bases:', error)
    return NextResponse.json(
      { error: 'Failed to fetch knowledge bases' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: RouterParams
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: chatbotId } = await context.params;

    // Verify user has access to this chatbot
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        id: chatbotId,
        workspace: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    });

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const type = formData.get('type') as string;
    const name = formData.get('name') as string;

    if (type === 'file') {
      const files = formData.getAll('files') as File[];
      
      if (files.length === 0) {
        return NextResponse.json({ error: 'No files provided' }, { status: 400 });
      }

      // Create knowledge base
      const knowledgeBase = await prisma.knowledgeBase.create({
        data: {
          chatbotId,
          name: name || `Files - ${new Date().toLocaleDateString()}`,
          type: 'DOC',
          indexName: `kb_${chatbotId}_${Date.now()}`,
        },
      });

      const results = [];

      for (const file of files) {
        try {
          // Process file and extract text
          const { content, metadata } = await processFile(file);

          // Create document record
          const document = await prisma.document.create({
            data: {
              knowledgeBaseId: knowledgeBase.id,
              source: file.name,
              content,
              metadata: {
                ...metadata,
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
              },
            },
          });

          // Embed and store in vector database
          await embedAndStore({
            documentId: document.id,
            content,
            metadata: {
              chatbotId,
              knowledgeBaseId: knowledgeBase.id,
              source: file.name,
            },
            chatbotId,
            knowledgeBaseId: knowledgeBase.id,
          });

          results.push({
            success: true,
            fileName: file.name,
            documentId: document.id,
          });
        } catch (error) {
          results.push({
            success: false,
            fileName: file.name,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return NextResponse.json({
        knowledgeBaseId: knowledgeBase.id,
        results,
      });
    } else if (type === 'table') {
      const files = formData.getAll('files') as File[];
      
      if (files.length === 0) {
        return NextResponse.json({ error: 'No files provided' }, { status: 400 });
      }

      // Create knowledge base
      const knowledgeBase = await prisma.knowledgeBase.create({
        data: {
          chatbotId,
          name: name || `Tables - ${new Date().toLocaleDateString()}`,
          type: 'FAQ', // Using FAQ type for structured data
          indexName: `kb_${chatbotId}_${Date.now()}`,
        },
      });

      const results = [];

      for (const file of files) {
        try {
          // Process table file
          const { rows, metadata } = await processTable(file);

          // Create document for each row or batch
          const chunks = chunkArray(rows, 100); // Process in batches of 100

          for (let i = 0; i < chunks.length; i++) {
            const chunk = chunks[i];
            const content = formatTableContent(chunk, metadata);

            const document = await prisma.document.create({
              data: {
                knowledgeBaseId: knowledgeBase.id,
                source: `${file.name} (batch ${i + 1})`,
                content,
                metadata: {
                  ...metadata,
                  fileName: file.name,
                  fileSize: file.size,
                  fileType: file.type,
                  batchNumber: i + 1,
                  totalBatches: chunks.length,
                  rowCount: chunk.length,
                },
              },
            });

            // Embed and store
            await embedAndStore({
              documentId: document.id,
              content,
              metadata: {
                chatbotId,
                knowledgeBaseId: knowledgeBase.id,
                source: file.name,
                type: 'table',
              },
              chatbotId,
              knowledgeBaseId: knowledgeBase.id,
            });
          }

          results.push({
            success: true,
            fileName: file.name,
            rowCount: rows.length,
            batches: chunks.length,
          });
        } catch (error) {
          results.push({
            success: false,
            fileName: file.name,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return NextResponse.json({
        knowledgeBaseId: knowledgeBase.id,
        results,
      });
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Error processing knowledge:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

function formatTableContent(rows: any[], metadata: any): string {
  if (rows.length === 0) return '';
  
  const headers = Object.keys(rows[0]);
  let content = `Table: ${metadata.tableName || 'Data'}\n\n`;
  content += `Columns: ${headers.join(', ')}\n\n`;
  
  rows.forEach((row, idx) => {
    content += `Row ${idx + 1}:\n`;
    headers.forEach(header => {
      content += `  ${header}: ${row[header]}\n`;
    });
    content += '\n';
  });
  
  return content;
}