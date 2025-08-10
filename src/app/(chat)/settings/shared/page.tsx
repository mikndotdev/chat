import { getLogtoContext } from '@logto/next/server-actions';
import { redirect } from 'next/navigation';
import { logtoConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const { claims } = await getLogtoContext(logtoConfig);

  if (!claims) {
    await redirect('/login');
  }

  const userSharedChats = await prisma.chat.findMany({
    where: { userId: claims?.sub, public: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="container mx-auto p-4">
      <h1 className={'mb-4 text-4xl text-base-content'}>Shared Chats</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {userSharedChats.map((chat) => (
          <div
            className="card bg-base-200 shadow-xl transition-shadow duration-300 hover:shadow-2xl"
            key={chat.id}
          >
            <div className="card-body">
              <h2 className="card-title">{chat.name || 'Untitled Chat'}</h2>
              <p className="text-base-content/70">
                Created at: {new Date(chat.createdAt).toLocaleDateString()}
              </p>
              <a className="btn btn-primary mt-4" href={`/chat/${chat.id}`}>
                Open Chat
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
