import { getLogtoContext } from '@logto/next/server-actions';
import { redirect } from 'next/navigation';
import type * as React from 'react';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/animate-ui/radix/sidebar';
import { ChatSidebar } from '@/components/sidebar';
import { logtoConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { claims } = await getLogtoContext(logtoConfig);

  if (!claims) {
    await redirect('/login');
  }

  const account = await prisma.user.findUnique({
    where: { id: claims?.sub },
  });

  if (!account) {
    await prisma.user.create({
      data: {
        id: claims?.sub,
      },
    });
  }

  const chats = await prisma.chat.findMany({
    where: { userId: claims?.sub || '' },
    orderBy: {
      createdAt: 'desc',
    },
  });

  const data = {
    user: {
      name: claims?.name || '...',
      id: claims?.sub || '...',
      avatar: claims?.picture || '/default-avatar.png',
    },
    chats: chats.map((chat) => ({
      name: chat.name || 'Untitled Chat',
      id: chat.id,
    })),
  };

  return (
    <SidebarProvider>
      <ChatSidebar data={data} />
      <SidebarTrigger className={'mt-3 ml-3 hover:bg-secondary'} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
}
