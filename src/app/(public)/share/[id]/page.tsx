import { getLogtoContext } from '@logto/next/server-actions';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import * as React from 'react';
import Logo from '@/assets/img/mikan-vtube.svg';
import UserIcon from '@/assets/img/user.png';
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const chat = await prisma.chat.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!(chat && chat.public)) {
    return {
      title: 'Chat not found',
      description: 'The requested chat does not exist or is not public.',
    };
  }

  const modelInfo = ModelInfoFromID[chat.model] || { name: 'Unknown Model' };
  const modelType = chat.modelType;

  return {
    title: `MD Chat - ${chat.name || 'Untitled Chat'}`,
    description: `Chat using ${modelType === 'ollama' ? 'a selfhosted model' : modelInfo?.name || chat.model || 'Unknown Model'}. Read it on MD Chat!`,
  };
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { claims } = await getLogtoContext(logtoConfig);

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

  if (!chat.public) {
    return notFound();
  }

  if (chat.userId == claims?.sub) {
    await redirect(`/chat/${id}`);
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
  const modelType = chat.modelType;

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
        isPublic={true}
        model={
          modelType === 'ollama'
            ? 'Selfhosted Model'
            : modelInfo?.name || chat.model || 'Unknown Model'
        }
        shared={chat.public}
        title={chat.name || 'Untitled Chat'}
      />
      <div className="space-y-4">
        <ChatContainer
          avatar={UserIcon.src}
          id={id}
          //@ts-expect-error
          initialMessages={formattedMessages}
          isPublic={true}
          //@ts-expect-error
          model={chat.model}
          models={modelsArray}
        />
      </div>
      <div className="card mt-8 flex w-full items-center bg-base-200 p-4 shadow-xl">
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex flex-row items-center">
            <p
              className={'mr-2 font-bold text-base-content/70 text-sm text-xl'}
            >
              Generated on
            </p>
            <Image
              alt="MikanDev Logo"
              className="h-auto w-1/6 rounded-lg"
              height={200}
              src={Logo}
              width={200}
            />
            <p
              className={'ml-2 font-bold text-base-content/70 text-sm text-xl'}
            >
              Chat
            </p>
          </div>
          <Link className="" href={'/chat'}>
            <button className={'btn btn-secondary'}>Try it now!</button>
          </Link>
        </div>
      </div>
    </main>
  );
}
