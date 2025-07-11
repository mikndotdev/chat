'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteApiKey, setApiKey } from '@/actions/apikey';

interface ModelCardProps {
  configured: boolean;
  apiKey?: string;
}

export const OpenRouterBadge = ({ configured, apiKey }: ModelCardProps) => {
  const [key, setKey] = useState(apiKey || '');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configuredState, setConfiguredState] = useState(configured);

  const set = async (id: string) => {
    try {
      await setApiKey({ provider: 'openrouter', key });
      toast.success('API Key for OpenRouter set successfully!');
      setConfiguredState(true);
      setOpen(false);
    } catch (error) {
      toast.error('Failed to set API Key. Please try again.');
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteApiKey(id);
      toast.success('API Key for OpenRouter removed successfully!');
      setConfiguredState(false);
      setOpen(false);
    } catch (error) {
      toast.error('Failed to remove API Key. Please try again.');
    }
  };

  return (
    <div className="">
      <dialog className={'modal'} onClose={() => setOpen(false)} open={open}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">API Key for OpenRouter</h3>
          <p className="py-4">
            Please enter your API key to configure OpenRouter models.
          </p>
          <input
            className="input input-bordered w-full"
            onChange={(e) => setKey(e.target.value)}
            placeholder="Enter API Key"
            type="text"
            value={key}
          />
          <div className="modal-action justify-center">
            <button
              className="btn"
              disabled={loading || !key}
              onClick={() => {
                set('openrouter');
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
      <div className="mr-2 ml-auto">
        {configuredState ? (
          <>
            <span
              className="badge badge-success"
              onClick={() => setOpen(!open)}
            >
              Configured
            </span>
            <button
              className="btn btn-sm btn-ghost ml-2"
              onClick={() => remove('openrouter')}
            >
              <X className="h-8 w-8" />
            </button>
          </>
        ) : (
          <span className="badge badge-error" onClick={() => setOpen(!open)}>
            Not Configured
          </span>
        )}
      </div>
    </div>
  );
};
