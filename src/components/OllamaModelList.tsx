'use client';

import { PlusCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { addModel, deleteModel, validateOllamaHost } from '@/actions/ollama';

interface OllamaHost {
  id: string;
  endpoint: string;
  isAvailable: boolean;
  modelCount: number;
}

interface OllamaModel {
  id: string;
  name: string;
  description?: string;
}

interface ModelInfo {
  isValid: boolean;
  modelCount: number;
  models: OllamaModel[];
}

interface OllamaListProps {
  models: OllamaHost[];
}

export const OllamaModelList = ({ models }: OllamaListProps) => {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [valid, setValid] = useState(false);
  const [modelCount, setModelCount] = useState(0);
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [modelsList, setModelsList] = useState<OllamaHost[]>(models || []);

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
      const updatedModel = await addModel(name);
      const modelCount = modelInfo ? modelInfo.modelCount : 0;
      setName('');
      setModelInfo(null);
      setOpen(false);
      toast.success('Model added successfully!');
      if (updatedModel) {
        setModelsList((prev) => [
          ...prev,
          {
            id: updatedModel.id,
            endpoint: name,
            isAvailable: true,
            modelCount,
          },
        ]);
      }
    } catch (error) {
      toast.error('Failed to add model. Please try again.');
    }
  };

  useEffect(() => {
    if (!name) {
      setValid(false);
      setModelCount(0);
      setModelInfo(null);
      return;
    }

    setLoading(true);
    const handler = setTimeout(() => {
      (async () => {
        try {
          const result = await validateOllamaHost(name);
          setModelInfo(result);

          // Check if there's more than one model
          if (result.isValid && result.modelCount > 0) {
            setValid(true);
            setModelCount(result.modelCount);
          } else {
            setValid(false);
            setModelCount(0);
          }
        } catch (err) {
          setModelInfo(null);
          setValid(false);
          setModelCount(0);
        } finally {
          setLoading(false);
        }
      })();
    }, 500);

    return () => {
      clearTimeout(handler);
      setLoading(false);
    };
  }, [name]);

  return (
    <div className="space-y-2">
      <dialog className={'modal'} onClose={() => setOpen(false)} open={open}>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Add Ollama Host</h3>
          <p className="py-4">Endpoint</p>
          <input
            className="input input-bordered w-full"
            onChange={(e) => setName(e.target.value)}
            placeholder="http://localhost:11434"
            type="text"
            value={name}
          />
          <div className="card mt-4 flex bg-base-200 p-4 shadow-xl">
            {loading ? (
              <div className="flex flex-col items-center justify-center">
                <span className="loading loading-spinner text-center" />
              </div>
            ) : modelInfo && modelInfo.isValid ? (
              <div className="w-full">
                <h3 className="mb-2 font-bold">
                  Available Models: {modelInfo.modelCount}
                </h3>
                <p className="text-base-content/70 text-sm">
                  {modelInfo.modelCount > 0
                    ? `This host is valid and has ${modelInfo.modelCount} models available.`
                    : 'No models found on this host.'}
                </p>
              </div>
            ) : (
              <p className="text-base-content/70 text-sm">
                Enter a valid Ollama host URL to see available models.
              </p>
            )}
          </div>
          <div className="modal-action justify-center">
            <button
              className="btn"
              disabled={loading || !name || !valid}
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
            <h3 className="font-bold">{model.endpoint}</h3>
            <p className="text-base-content/70 text-sm">
              {model.modelCount
                ? `Serving ${model.modelCount} models`
                : 'No models available.'}
            </p>
          </div>
          <div className="mr-2 ml-auto">
            {model.isAvailable ? (
              <>
                <button
                  className="btn btn-sm btn-ghost mr-2"
                  onClick={() => removeModel(model.id)}
                >
                  <X className="h-4 w-4" />
                </button>
                <span className="badge badge-success">Available</span>
              </>
            ) : (
              <>
                <button
                  className="btn btn-sm btn-ghost mr-2"
                  onClick={() => removeModel(model.id)}
                >
                  <X className="h-4 w-4" />
                </button>
                <span className="badge badge-error">Not Available</span>
              </>
            )}
          </div>
        </div>
      ))}
      <div
        className="card flex cursor-pointer flex-row items-center justify-center gap-2 bg-base-200 p-4 shadow-xl"
        onClick={() => setOpen(true)}
      >
        <PlusCircle className="h-6 w-6 text-base-content" />
        <h3 className="card-title text-base-content">Add a host</h3>
      </div>
    </div>
  );
};
