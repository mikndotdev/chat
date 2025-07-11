'use client';

import { PlusCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { addModel, deleteModel, getModel } from '@/actions/openrouter';

interface OpenRouterModel {
  id: string;
  name: string | null;
  description?: string;
}

interface OpenRouterModelListProps {
  models: OpenRouterModel[];
}

export const OpenRouterModelList = ({ models }: OpenRouterModelListProps) => {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modelInfo, setModelInfo] = useState<unknown>(null);
  const [modelsList, setModelsList] = useState<OpenRouterModel[]>(models || []);

  const removeModel = async (id: string) => {
    try {
      await deleteModel(id);
      setModelsList((prev) => prev.filter((model) => model.id !== id));
      toast.success('Model removed successfully!');
    } catch (error) {
      toast.error('Failed to remove model. Please try again.');
    }
  };

  const add = async () => {
    if (!name) return;
    try {
      await addModel(name);
      setName('');
      setModelInfo(null);
      setOpen(false);
      toast.success('Model added successfully!');
      const updatedModels = await getModel(name);
      // @ts-expect-error
      if (updatedModels && updatedModels.data.name) {
        setModelsList((prev) => [
          ...prev,
          {
            // @ts-expect-error
            id: updatedModels.data.id,
            // @ts-expect-error
            name: updatedModels.data.name,
            // @ts-expect-error
            description: updatedModels.data.description,
          },
        ]);
      }
    } catch (error) {
      toast.error('Failed to add model. Please try again.');
    }
  };

  useEffect(() => {
    if (!name) {
      setModelInfo(null);
      return;
    }

    setLoading(true);
    const handler = setTimeout(() => {
      (async () => {
        try {
          const model = await getModel(name);
          //@ts-expect-error
          if (model && model.data.name) {
            setModelInfo(model);
          } else {
            setModelInfo(null);
          }
        } catch (err) {
          setModelInfo(null);
        } finally {
          setLoading(false);
        }
      })();
    }, 500);

    return () => {
      clearTimeout(handler);
      setLoading(false);
    };
  }, [name, modelsList]);

  return (
    <div className="space-y-2">
      <dialog className={'modal'} onClose={() => setOpen(false)} open={open}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Add OpenRouter model</h3>
          <p className="py-4">Model name</p>
          <input
            className="input input-bordered w-full"
            onChange={(e) => setName(e.target.value)}
            placeholder="openai/gpt-4.1"
            type="text"
            value={name}
          />
          <div className="card mt-4 flex bg-base-200 p-4 shadow-xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center">
                <span className="loading loading-spinner text-center" />
              </div>
              /* @ts-expect-error */
            ) : modelInfo && modelInfo.data.name ? (
              <div className="w-full">
                <h3 className="mb-2 font-bold">
                  {/* @ts-ignore */}
                  {modelInfo.data.name}
                </h3>
                {/* @ts-ignore */}
                {modelInfo.data.description && (
                  <p className="text-base-content/70 text-sm">
                    {/* @ts-ignore */}
                    {modelInfo.data.description}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-base-content/70 text-sm">
                Type a model name to see details.
              </p>
            )}
          </div>
          <div className="modal-action justify-center">
            <button
              className="btn"
              disabled={loading || !name}
              onClick={() => {
                add();
              }}
            >
              Add
            </button>
            <button className="btn btn-primary" onClick={() => setOpen(false)}>
              Close
            </button>
          </div>
        </div>
      </dialog>
      {modelsList.map((model) => (
        <div
          className="card flex flex-row items-center bg-base-200 p-4 shadow-xl"
          key={model.id}
        >
          <div>
            <h3 className="font-bold">{model.name}</h3>
            {model.description && (
              <p className="text-base-content/70 text-sm">
                {model.description}
              </p>
            )}
          </div>
          <div className="mr-2 ml-auto">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                removeModel(model.id);
              }}
            >
              <X />
            </button>
          </div>
        </div>
      ))}
      <div
        className="card flex flex-row items-center justify-center gap-2 bg-base-200 p-4 shadow-xl"
        onClick={() => setOpen(true)}
      >
        <PlusCircle className="h-6 w-6 text-base-content" />
        <h3 className="card-title text-base-content">Add a model</h3>
      </div>
    </div>
  );
};
