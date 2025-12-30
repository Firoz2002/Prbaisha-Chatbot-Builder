import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

interface RouterParams {
  params: Promise<{ id: string }>
}

export async function GET(
  request: NextRequest,
  context: RouterParams
) {
  try {
    const { id } = await context.params;

    // Find the chatbot
    const chatbot = await prisma.chatbot.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        greeting: true,
        directive: true,
      }
    })

    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(chatbot)
  } catch (error) {
    console.error('Error fetching chatbot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouterParams) {
  try {
    const { id } = await context.params;
    const { name, avatar, theme, iconBgColor, avatarBgColor, iconShape, iconSize, avatarSize, iconBorder, avatarBorder, popup_onload, greeting, directive } = await request.json();

    if(!id) {
      return NextResponse.json(
        { error: 'Chatbot ID is required'},
        { status: 400 }
      )
    }

    const existingChatbot = await prisma.chatbot.findUnique({
      where: { id },
    });

    if(!existingChatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found'},
        { status: 404 }
      )
    }

    await prisma.chatbot.update({
      where: { id },
      data: {
        name,
        avatar,
        theme,
        iconBgColor,
        avatarBgColor,
        iconShape,
        iconSize,
        avatarSize,
        iconBorder,
        avatarBorder,
        popup_onload,
        greeting,
        directive
      }
    });

    return NextResponse.json({ message: 'Chatbot updated successfully'});
  } catch(error) {
    console.error('Error updating chatbot', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500}
    )
  }
}