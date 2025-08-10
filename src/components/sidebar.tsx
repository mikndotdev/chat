import * as React from 'react';

interface Props {
  data: {
    user: {
      name: string;
      id: string;
      avatar?: string;
    };
    chats?: {
      name: string;
      id: string;
    }[];
  };
}

export const ChatSidebar = ({ data }: Props) => {
  return (
    <>
      <div className="flex h-full flex-col justify-between">
        <div className="flex-grow">
          <ul>
            {data.chats?.map((chat) => (
              <li key={chat.id}>
                <a href={`/chat/${chat.id}`}>{chat.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
