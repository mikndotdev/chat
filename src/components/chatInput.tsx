'use client';
import type { Attachment } from '@ai-sdk/ui-utils';
import { Bot, Paperclip, Send, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { addMessage, startChat } from '@/actions/chat';
import { addAttachment } from '@/actions/upload';

interface ChatInputProps {
  id?: string;
  model?: string;
  status?: 'submitted' | 'streaming' | 'ready' | 'error';
  models?: any[];
  customModels?: any[];
  openRouterModels?: any[];
  ollamaModels?: any[];
  openRouterEnabled?: boolean;
  input?: string;
  handleInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit?: (e: FormEvent, extra?: any) => void;
}

export const ChatInput = ({
  models,
  id,
  model,
  input,
  handleInputChange,
  handleSubmit,
  status,
  openRouterModels,
  openRouterEnabled,
  ollamaModels = [],
}: ChatInputProps) => {
  const pathname = usePathname();
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState(model);
  const [modelType, setModelType] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentId, setAttachmentId] = useState<string | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('providers');

  console.log(ollamaModels);

  const chatId = pathname.startsWith('/chat/')
    ? pathname.split('/chat/')[1]?.split('/')[0]
    : null;
  const isInChat = Boolean(chatId);

  const selectedModelObj = models?.find((m) => m.id === model);

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault();
    const inputEl = e.currentTarget.querySelector('input');
    if (!(inputEl && selectedModel)) return;
    const message = inputEl.value.trim();
    if (!message) {
      return;
    }

    try {
      if (isInChat) {
        if (attachment) {
          if (handleSubmit) {
            const attachmentData = {
              url: attachmentUrl,
              name: attachment.name,
              contentType: attachment.type,
            };

            const messageWithAttachment = {
              content: message,
              role: 'user' as const,
              id: Date.now().toString(),
              attachment: attachmentData,
            };

            handleSubmit(e, {
              experimental_attachments: [
                {
                  name: attachment.name,
                  contentType: attachment.type,
                  url: attachmentUrl,
                },
              ] as Attachment[],
              messageWithAttachment,
              attachmentId,
            });
          }
          setAttachment(null);
        } else if (handleSubmit) {
          const regularMessage = {
            content: message,
            role: 'user' as const,
            id: Date.now().toString(),
          };

          handleSubmit(e, {
            messageWithAttachment: regularMessage,
          });
        }

        inputEl.value = '';
        if (handleInputChange) {
          handleInputChange({ target: { value: '' } } as any);
        }
      } else {
        if (!message) {
          toast.error('Please enter a message before starting a chat.');
          return;
        }

        const chat = await startChat({
          model: selectedModel,
          type: modelType || 'provider',
          message,
        });

        inputEl.value = '';
        if (handleInputChange) {
          handleInputChange({ target: { value: '' } } as any);
        }

        router.push(`/chat/${chat.id}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message.');
    }
  };

  return (
    <div className="fixed bottom-5 flex w-full max-w-10/13 items-center justify-center rounded-lg bg-neutral p-4 shadow-lg">
      <dialog className={'modal'} open={open}>
        {models && models.length > 0 ? (
          <div className="modal-box max-h-3/4 min-w-1/2 max-w-1/2 overflow-y-auto">
            <h3 className="text-center font-bold text-lg">Select a Model</h3>
            <div className="tabs tabs-border justify-center" role="tablist">
              <a
                className={`tab ${tab === 'providers' ? 'tab-active' : ''}`}
                onClick={() => setTab('providers')}
                role="tab"
              >
                Model Providers
              </a>
              <a
                className={`tab ${tab === 'openrouter' ? 'tab-active' : ''}`}
                onClick={() => setTab('openrouter')}
                role="tab"
              >
                OpenRouter
              </a>
              <a
                className={`tab ${tab === 'ollama' ? 'tab-active' : ''}`}
                onClick={() => setTab('ollama')}
                role="tab"
              >
                Custom Providers
              </a>
            </div>
            <div className="py-4">
              <div className="grid grid-cols-2 gap-2">
                {tab === 'providers' &&
                  models &&
                  models.map((model) => (
                    <div
                      className={`card flex w-full items-center justify-start gap-3 bg-primary ${selectedModel === model.name ? 'btn-active' : ''}`}
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.name);
                        setModelType('provider');
                        setOpen(false);
                      }}
                    >
                      <div className={'card-body justify-left w-full p-3'}>
                        <div
                          className={
                            'card-title flex flex-row items-center justify-center space-x-2'
                          }
                        >
                          <img
                            alt={model.provider}
                            className="h-8 w-8 rounded-full"
                            src={model.icon}
                          />
                          <span
                            className={
                              'font-semibold text-base-content text-md'
                            }
                          >
                            {model.providerName} {model.name}
                          </span>
                        </div>
                        <p className={'text-primary-content text-sm'}>
                          {model.description}
                        </p>
                      </div>
                      <div className="card-actions mb-4 justify-center space-x-2">
                        {model.freeTier && (
                          <span className="badge badge-success">
                            Offers free tier
                          </span>
                        )}
                        {model.experimental && (
                          <span className="badge badge-warning">
                            Experimental
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                {tab === 'openrouter' && (
                  <div className="col-span-2 flex flex-col items-center justify-center py-8">
                    {openRouterEnabled ? (
                      <>
                        {openRouterModels && openRouterModels.length > 0 ? (
                          <div className="grid w-full grid-cols-2 gap-2">
                            {openRouterModels.map((model) => (
                              <div
                                className={`card flex w-full items-center justify-start gap-3 bg-primary ${selectedModel === model.name ? 'btn-active' : ''}`}
                                key={model.id}
                                onClick={() => {
                                  setSelectedModel(model.name);
                                  setModelType('openrouter');
                                  setOpen(false);
                                }}
                              >
                                <div
                                  className={
                                    'card-body justify-left w-full p-3'
                                  }
                                >
                                  <div
                                    className={
                                      'card-title flex flex-row items-center justify-center space-x-2'
                                    }
                                  >
                                    <span
                                      className={
                                        'font-semibold text-base-content text-md'
                                      }
                                    >
                                      {model.name}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-base-content/70">
                            no models available.
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-base-content/70">
                        OpenRouter is not configured. Please add your OpenRouter
                        API key in settings.
                      </span>
                    )}
                  </div>
                )}
                {tab === 'ollama' && (
                  <div className="col-span-2 flex flex-col items-center justify-center py-8">
                    {ollamaModels && ollamaModels.length > 0 ? (
                      <div className="w-full">
                        {ollamaModels.map((model) => (
                          <div className="mb-4" key={model.id}>
                            <span className="mb-2 block font-bold text-base-content">
                              {model.endpoint} - {model.models?.length || 0}{' '}
                              Models
                            </span>
                            <div className="grid w-full grid-cols-2 gap-2">
                              {model.models && model.models.length > 0 ? (
                                model.models.map(
                                  (
                                    //@ts-expect-error
                                    modelObj
                                  ) => (
                                    <div
                                      className={`card flex w-full items-center justify-start gap-3 bg-primary ${
                                        selectedModel === model.endpoint
                                          ? 'btn-active'
                                          : ''
                                      }`}
                                      key={
                                        typeof modelObj === 'string'
                                          ? modelObj
                                          : modelObj.id
                                      }
                                      onClick={() => {
                                        setSelectedModel(
                                          model.endpoint +
                                            ' - ' +
                                            (typeof modelObj === 'string'
                                              ? modelObj
                                              : modelObj.id)
                                        );
                                        setModelType('ollama');
                                        setOpen(false);
                                      }}
                                    >
                                      <div className="card-body justify-left w-full p-3">
                                        <div className="card-title flex flex-row items-center justify-center space-x-2">
                                          <span className="font-semibold text-base-content text-md">
                                            {typeof modelObj === 'string'
                                              ? modelObj
                                              : modelObj.id}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )
                                )
                              ) : (
                                <div className="col-span-2 text-center text-base-content/70">
                                  No models found on this server.
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-base-content/70">
                        No models available.
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="modal-action justify-center">
              <button className="btn" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <div className="modal-box">
            <h3 className="font-bold text-lg">No Models Available</h3>
            <p>
              <Link
                className="text-blue-500 hover:underline"
                href="/settings/models"
              >
                Add a model
              </Link>
              &nbsp;to start chatting.
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </dialog>
      <div className="flex w-full flex-row items-center space-x-3">
        {isInChat &&
          selectedModelObj?.supports_attachment &&
          (attachment && !uploading ? (
            <div className="flex items-center space-x-2">
              {attachment.type.startsWith('image/') ? (
                <img
                  alt="Attachment"
                  className="h-12 w-12 rounded-lg object-cover"
                  src={attachmentUrl}
                />
              ) : attachment.type.startsWith('application/pdf') ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-200">
                  <span className="text-gray-500">PDF</span>
                </div>
              ) : null}
              <X onClick={() => setAttachment(null)} />
            </div>
          ) : uploading ? (
            <span className="loading loading-spinner loading-lg" />
          ) : (
            <button
              className="btn btn-ghost"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/png, image/jpeg, application/pdf';
                input.onchange = async (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) {
                    if (file.size > 8 * 1024 * 1024) {
                      return toast.error('File size exceeds 8MB limit.');
                    }
                    setAttachment(file);
                    if (chatId) {
                      setUploading(true);
                      const formData = new FormData();
                      formData.append('file', file);
                      const upload = await addAttachment(formData, chatId);
                      setAttachmentUrl(upload.url);
                      setAttachmentId(upload.id);
                      setUploading(false);
                      toast.success('Attachment added successfully!');
                    } else {
                      setAttachment(null);
                      toast.error('Please start a chat first.');
                    }
                  }
                };
                input.click();
              }}
            >
              <Paperclip />
            </button>
          ))}
        <form
          className={'flex w-full flex-row items-center space-x-3'}
          onSubmit={sendMessage}
        >
          <input
            className="input w-full"
            disabled={!selectedModel}
            onChange={handleInputChange}
            placeholder={
              selectedModel
                ? `Chatting with ${selectedModel}`
                : 'Select a model to start chatting...'
            }
            type="text"
            value={input}
          />
          {!model && (
            <button
              className="btn btn-primary"
              onClick={() => setOpen(!open)}
              type="button"
            >
              <Bot className="text-white" />
            </button>
          )}
          <button
            className="btn btn-primary"
            disabled={(status !== 'ready' && status !== 'error') || uploading}
            type="submit"
          >
            <Send className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
