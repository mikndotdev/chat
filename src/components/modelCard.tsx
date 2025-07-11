'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { deleteApiKey, setApiKey } from '@/actions/apikey';

interface ModelCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  configured: boolean;
  apiKey?: string;
}

export const ModelCard = ({
  id,
  name,
  description,
  icon,
  configured,
  apiKey,
}: ModelCardProps) => {
  const [key, setKey] = useState(apiKey || '');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configuredState, setConfiguredState] = useState(configured);

  const set = async (id: string) => {
    try {
      console.log(id, key);
      await setApiKey({ provider: id, key });
      toast.success(`API Key for ${name} set successfully!`);
      setConfiguredState(true);
      setOpen(false);
    } catch (error) {
      toast.error('Failed to set API Key. Please try again.');
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteApiKey(id);
      toast.success(`API Key for ${name} removed successfully!`);
      setConfiguredState(false);
      setOpen(false);
    } catch (error) {
      toast.error('Failed to remove API Key. Please try again.');
    }
  };

  return (
    <div
      className="card flex-row items-center bg-base-200 p-4 shadow-xl"
      key={name}
    >
      <dialog className={'modal'} onClose={() => setOpen(false)} open={open}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">API Key for {name}</h3>
          <p className="py-4">
            Please enter your API key for {name} to configure the model.
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
                set(id);
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
      <div className="mr-4">
        <div className="max-w-12">
          <img alt={name} className={'rounded-full'} src={icon} />
        </div>
      </div>
      <div>
        <h2 className="card-title text-base-content">{name}</h2>
        <p className="text-base-content/70">{description}</p>
      </div>
      <div className="mr-2 ml-auto">
        {configuredState ? (
          <>
            <button
              className="btn btn-sm btn-ghost mr-2"
              onClick={() => remove(id)}
            >
              <X className="h-8 w-8" />
            </button>
            <span
              className="badge badge-success"
              onClick={() => setOpen(!open)}
            >
              Configured
            </span>
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
