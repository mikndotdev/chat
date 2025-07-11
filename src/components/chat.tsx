'use client';
import type { Message as BaseMessage } from '@ai-sdk/react';
import { File } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import AIIcon from '@/assets/img/ai.png';

interface Message extends BaseMessage {
  attachment?: {
    url: string;
    name?: string;
    contentType?: string;
  };
}

interface ChatProps {
  id: string;
  avatar: string;
  status?: 'submitted' | 'streaming' | 'ready' | 'error';
  msg: Message[];
  onRetry?: () => void;
}

export const ChatPage = ({ id, msg, avatar, status, onRetry }: ChatProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [msg, status]);

  const lastMsgId = msg.length > 0 ? msg[msg.length - 1].id : null;

  //@ts-expect-error
  const renderAttachment = (attachment) => {
    if (!attachment) return null;

    if (
      attachment.url.includes('.jpg') ||
      attachment.url.includes('.png') ||
      attachment.url.includes('.jpeg')
    ) {
      return (
        <div className="my-2">
          <img
            alt="Attachment"
            className="max-h-64 max-w-full rounded-lg"
            src={attachment.url}
          />
        </div>
      );
    }
    if (attachment.url.includes('.pdf')) {
      return (
        <div className="my-2 w-1/4">
          <a
            className="btn btn-sm btn-outline flex items-center gap-2"
            href={attachment.url}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>View PDF</span>
            <File className="h-4 w-4" />
          </a>
        </div>
      );
    }
    return null;
  };

  const showLoadingMessage =
    status === 'submitted' &&
    (msg.length === 0 || msg[msg.length - 1].role === 'user');

  const showErrorMessage = status === 'error';

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const isUnrespondedUserMessage =
    msg.length > 0 && msg[msg.length - 1].role === 'user' && status === 'error';

  const extractReasoning = (
    parts: any[]
  ): { reasoning: string | null; cleanedParts: any[] } => {
    if (!parts || parts.length === 0)
      return { reasoning: null, cleanedParts: parts };

    const cleanedParts = [];
    let reasoning: string | null = null;

    for (const part of parts) {
      if (part.type === 'text') {
        const thinkMatch = part.text.match(/<think>([\s\S]*?)<\/think>/);

        if (thinkMatch) {
          reasoning = thinkMatch[1].trim();
          const cleanedText = part.text
            .replace(/<think>[\s\S]*?<\/think>/, '')
            .trim();
          if (cleanedText) {
            cleanedParts.push({ ...part, text: cleanedText });
          }
        } else {
          cleanedParts.push(part);
        }
      } else {
        cleanedParts.push(part);
      }
    }

    return { reasoning, cleanedParts };
  };

  return (
    <div className="flex h-full w-full flex-col overflow-y-auto">
      <div className="flex-grow p-4">
        <AnimatePresence>
          {msg.map((message) => {
            const isLast = message.id === lastMsgId;
            const { reasoning, cleanedParts } = extractReasoning(
              message.parts || []
            );

            return (
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mb-3 flex flex-row items-start"
                exit={{ opacity: 0 }}
                initial={{ opacity: 0, y: 20 }}
                key={message.id}
                transition={{ duration: 0.3 }}
              >
                <img
                  alt="Avatar"
                  className="mr-3 h-8 w-auto rounded-full"
                  src={
                    message.role === 'user'
                      ? avatar || AIIcon.src
                      : isLast && status === 'streaming'
                        ? undefined
                        : AIIcon.src
                  }
                  style={{
                    display:
                      message.role !== 'user' &&
                      isLast &&
                      status === 'streaming'
                        ? 'none'
                        : undefined,
                  }}
                />
                {message.role !== 'user' &&
                  isLast &&
                  status === 'streaming' && (
                    <div className="mr-3 flex h-8 w-8 items-center justify-center">
                      <span className="loading loading-spinner loading-lg" />
                    </div>
                  )}
                <div className="flex w-full flex-col">
                  {reasoning && message.role !== 'user' && (
                    <div className="collapse-arrow collapse mb-2 border border-base-300 bg-base-100">
                      <input name={`reasoning-${message.id}`} type="radio" />
                      <div className="collapse-title font-semibold">
                        Reasoning
                      </div>
                      <div className="collapse-content text-sm">
                        {reasoning}
                      </div>
                    </div>
                  )}

                  {(cleanedParts || []).map((part, i) => {
                    switch (part.type) {
                      case 'text':
                        return (
                          <div
                            className="leading-relaxed"
                            key={`${message.id}-${i}`}
                          >
                            <ReactMarkdown
                              components={{
                                table: ({ children }) => (
                                  <div className="my-4 overflow-x-auto">
                                    <table className="table-zebra table-bordered table w-full border-collapse border border-base-300">
                                      {children}
                                    </table>
                                  </div>
                                ),
                                thead: ({ children }) => (
                                  <thead className="bg-base-200">
                                    {children}
                                  </thead>
                                ),
                                th: ({ children }) => (
                                  <th className="border border-base-300 px-4 py-2 text-left">
                                    {children}
                                  </th>
                                ),
                                td: ({ children }) => (
                                  <td className="border border-base-300 px-4 py-2">
                                    {children}
                                  </td>
                                ),
                                p: ({ children }) => (
                                  <div className="mb-2">{children}</div>
                                ),
                                code({
                                  node,
                                  // @ts-expect-error
                                  inline,
                                  className,
                                  children,
                                  ...props
                                }) {
                                  const match = /language-(\w+)/.exec(
                                    className || ''
                                  );
                                  return inline ? (
                                    <code
                                      className="rounded bg-gray-200 px-1 py-0.5"
                                      {...props}
                                    >
                                      {children}
                                    </code>
                                  ) : (
                                    <SyntaxHighlighter
                                      /* @ts-expect-error */
                                      className="my-2 rounded-md bg-gray-900 p-3 text-sm"
                                      language={match?.[1] || 'plaintext'}
                                      PreTag="div"
                                      style={oneDark}
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, '')}
                                    </SyntaxHighlighter>
                                  );
                                },
                              }}
                              remarkPlugins={[remarkGfm]}
                            >
                              {part.text}
                            </ReactMarkdown>
                          </div>
                        );
                      default:
                        return null;
                    }
                  })}
                  {message.experimental_attachments &&
                    message.experimental_attachments[0] &&
                    renderAttachment(message.experimental_attachments[0])}
                </div>
              </motion.div>
            );
          })}

          {(showErrorMessage || isUnrespondedUserMessage) && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex flex-row items-start"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mr-3 flex h-8 w-8 items-center justify-center">
                <span className="text-error text-xl">⚠️</span>
              </div>
              <div className="flex flex-col">
                <div className="mb-2 text-error leading-relaxed">
                  An error occurred while generating the response.
                </div>
                <button className="btn btn-error btn-sm" onClick={handleRetry}>
                  Retry
                </button>
              </div>
            </motion.div>
          )}

          {showLoadingMessage && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex flex-row items-start"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mr-3 flex h-8 w-8 items-center justify-center">
                <span className="loading loading-dots loading-lg" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className={'mb-20'} />
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
