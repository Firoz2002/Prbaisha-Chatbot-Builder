import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth';

interface RouterParams {
  params: Promise<{ id: string }>
}

export async function DELETE(
  request: NextRequest,
  context: RouterParams
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await context.params;

    // First delete all documents in the knowledge base
    await prisma.document.deleteMany({
      where: {
        knowledgeBaseId: id,
      },
    })

    // Then delete the knowledge base
    await prisma.knowledgeBase.delete({
      where: {
        id: id,
      },
      include: {
        documents: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete knowledge base:', error)
    return NextResponse.json(
      { error: 'Failed to delete knowledge base' },
      { status: 500 }
    )
  }
}