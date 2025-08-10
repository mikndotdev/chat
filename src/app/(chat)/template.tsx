import { getLogtoContext } from '@logto/next/server-actions';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { LuBot, LuFile, LuLogOut, LuMenu, LuShare } from 'react-icons/lu';
import KawaiiLogo from '@/assets/img/mikan-vtube.svg';
import { ChatSidebar } from '@/components/sidebar';
import { logtoConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function ChatLayout({
  children,
}: {
  children: ReactNode;
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
    <div className="drawer">
      <input className="drawer-toggle" id="my-drawer-3" type="checkbox" />
      <div className="drawer-content flex flex-col">
        <div className="navbar sticky top-0 z-40 w-full bg-base-300">
          <div className="flex-none">
            <label
              aria-label="open sidebar"
              className="btn btn-square btn-ghost"
              htmlFor="my-drawer-3"
            >
              <LuMenu className="inline-block h-6 w-6" />
            </label>
          </div>
          <div className="mx-2 flex-1 px-2">
            <a className="flex space-x-3 font-bold text-xl normal-case">
              <img
                alt="MikanDev Logo"
                className="mr-3 h-8 w-auto"
                src={KawaiiLogo.src}
              />
              Chat
            </a>
          </div>
          <div className="hidden flex-none lg:block">
            <ul className="menu menu-horizontal">
              <Link href={'/settings/models'}>
                <button className={'btn btn-ghost'}>
                  <LuBot className="inline-block h-6 w-6" />
                  Models
                </button>
              </Link>
              <Link href={'/settings/files'}>
                <button className={'btn btn-ghost'}>
                  <LuFile className="inline-block h-6 w-6" />
                  Files
                </button>
              </Link>
              <Link href={'/settings/shared'}>
                <button className={'btn btn-ghost'}>
                  <LuShare className="inline-block h-6 w-6" />
                  Shared chats
                </button>
              </Link>
              <Link href={'/logout'} prefetch={false}>
                <button className={'btn btn-ghost'}>
                  <LuLogOut className="inline-block h-6 w-6" />
                  Logout
                </button>
              </Link>
            </ul>
          </div>
        </div>
        {children}
      </div>
      <div className="drawer-side z-60">
        <label
          aria-label="close sidebar"
          className="drawer-overlay"
          htmlFor="my-drawer-3"
        />
        <ul className="menu flex min-h-screen w-80 flex-col bg-base-200 p-4">
          <ChatSidebar data={data} />
          <div className="card mt-auto shadow-xl">
            <div className="card-body">
              <div className="flex items-center">
                <div className="avatar">
                  <div className="w-12 rounded-full">
                    <img
                      alt={data.user.name}
                      src={data.user.avatar || '/default-avatar.png'}
                    />
                  </div>
                </div>
                <div className="ml-3">
                  <h2 className="card-title">{data.user.name}</h2>
                  <p className="text-gray-500 text-sm">UID {data.user.id}</p>
                </div>
              </div>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
}
