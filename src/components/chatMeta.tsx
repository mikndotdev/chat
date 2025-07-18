'use client';
import { Edit, Link, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  deleteChat,
  renameChat,
  shareChat,
  unshareChat,
} from '@/actions/settings';

export function ChatMeta({
  createdAt,
  model,
  title,
  id,
  shared,
  isPublic,
}: {
  createdAt: string;
  model: string;
  title: string;
  id: string;
  shared: boolean;
  isPublic?: boolean;
}) {
  const localTime = new Date(createdAt).toLocaleString();
  const [name, setName] = useState(title);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [isShared, setIsShared] = useState(shared);

  const toggleShare = async () => {
    try {
      if (isShared) {
        await unshareChat(id);
        setIsShared(false);
        toast.success('Chat unshared successfully!');
      } else {
        await shareChat(id);
        setIsShared(true);
        toast.success('Chat shared successfully!');
      }
    } catch (error) {
      toast.error('Failed to toggle chat sharing. Please try again.');
    }
  };

  const handleRename = async () => {
    if (!input) {
      toast.error('Please enter a new name for the chat.');
      return;
    }
    try {
      await renameChat(input, id);
      setName(input);
      setInput('');
      setOpen(false);
      toast.success('Chat renamed successfully!');
    } catch (error) {
      toast.error('Failed to rename chat. Please try again.');
    }
    setOpen(false);
    setInput('');
  };

  const handleDelete = async () => {
    try {
      await deleteChat(id);
      toast.success('Chat deleted successfully!');
      setTimeout(() => {
        window.location.href = '/chat';
      }, 1000);
    } catch (error) {
      toast.error('Failed to delete chat. Please try again.');
    }
  };

  return (
    <>
      <dialog className={'modal'} onClose={() => setOpen(false)} open={open}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Rename Chat</h3>
          <p className="py-4">Please enter a new name for your chat.</p>
          <input
            className="input input-bordered w-full"
            onChange={(e) => setInput(e.target.value)}
            type="text"
            value={input}
          />
          <div className="modal-action justify-center">
            <button
              className="btn"
              disabled={!input}
              onClick={() => {
                handleRename();
              }}
            >
              Save
            </button>
            <button className="btn btn-primary" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </dialog>
      <div className={'mb-2 flex flex-row items-center'}>
        <h1 className="font-bold text-2xl">{name}</h1>
        <>
          {!isPublic && (
            <>
              <button
                className="btn btn-ghost btn-sm ml-2"
                onClick={() => {
                  setOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                className="btn btn-ghost btn-sm ml-2"
                onClick={() => {
                  handleDelete();
                }}
              >
                <Trash className="h-4 w-4" />
              </button>
              {isShared && (
                <button
                  className="btn btn-ghost btn-sm ml-2"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/share/${id}`
                    );
                    toast.success('Share link copied to clipboard!');
                  }}
                >
                  <Link className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </>
        {!isPublic && (
          <div className="ml-2 flex items-center">
            <button
              className={`btn btn-sm ${isShared ? 'btn-primary' : 'btn-secondary'}`}
              onClick={toggleShare}
            >
              {isShared ? 'Unshare Chat' : 'Share Chat'}
            </button>
          </div>
        )}
      </div>
      <div className="mb-4">
        <p>
          <strong>Model:</strong> {model}
        </p>
        <p>
          <strong>Created At:</strong> {localTime}
        </p>
      </div>
    </>
  );
}
