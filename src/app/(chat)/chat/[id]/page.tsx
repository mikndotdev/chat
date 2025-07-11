import { getLogtoContext } from '@logto/next/server-actions';
import { notFound, redirect } from 'next/navigation';
import * as React from 'react';
import { ChatContainer } from '@/components/chatContainer';
import { ChatMeta } from '@/components/chatMeta';
import Models from '@/consts/models.json' with { type: 'json' };
import { logtoConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ModelInfoFromID: Record<string, { name: string; description: string }> =
  Object.entries(Models)
    .flatMap(([providerKey, provider]) =>
      provider.models.map(
        (model) =>
          [
            model.id,
            { name: model.name, description: provider.description },
          ] as [string, { name: string; description: string }]
      )
    )
    .reduce(
      (acc, [id, info]: [string, { name: string; description: string }]) => ({
        ...acc,
        [id]: info,
      }),
      {}
    );

export default async function Home({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { claims } = await getLogtoContext(logtoConfig);
  const { id } = await params;

  if (!claims) {
    await redirect('/login');
  }

  const chat = await prisma.chat.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!chat) {
    return notFound();
  }

  if (chat.userId !== claims?.sub) {
    return notFound();
  }

  const messages = await prisma.message.findMany({
    where: { chatId: chat.id },
    orderBy: { createdAt: 'asc' },
    include: { attachments: true },
  });

  const modelsArray = Object.entries(Models).flatMap(
    ([providerKey, provider]) =>
      provider.models.map((model) => ({
        ...model,
        provider: providerKey,
        providerName: provider.name,
        icon: provider.icon,
      }))
  );

  const modelInfo = ModelInfoFromID[chat.model] || chat.model;

  const formattedMessages = messages.map((message) => ({
    id: message.id,
    content: message.content,
    role: message.role as 'user' | 'assistant' | 'system',
    createdAt: message.createdAt,
    experimental_attachments: message.attachments.map((attachment) => ({
      id: attachment.id,
      url: attachment.url,
      contentType: attachment.filetype || 'unknown',
    })),
  }));

  return (
    <main className="container mx-auto p-4">
      <ChatMeta
        createdAt={chat.createdAt.toISOString()}
        id={id}
        model={modelInfo?.name || chat.model || 'Unknown Model'}
        shared={chat.public}
        title={chat.name || 'Untitled Chat'}
      />
      <div className="space-y-4">
        <ChatContainer
          avatar={claims?.picture || ''}
          id={id}
          //@ts-expect-error
          initialMessages={formattedMessages}
          model={chat.model}
          //@ts-expect-error
          models={modelsArray}
        />
      </div>
    </main>
  );
}
