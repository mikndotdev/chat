'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { generateImages } from '@/actions/image';

export const ImageGenerator = ({ models }: { models: any[] }) => {
  const [selectedModel, setSelectedModel] = useState(models[0]?.id || '');
  const [prompt, setPrompt] = useState('');
  const [count, setCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!(prompt && selectedModel)) {
      toast.error('Please enter a prompt and select a model.');
      return;
    }
    setImages([]);
    setLoading(true);
    try {
      const generatedImages = await generateImages({
        model: selectedModel,
        prompt,
        count,
      });
      setImages(generatedImages.map((image: any) => image.url));
    } catch (error) {
      toast.error('Failed to generate images. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card mt-5 flex min-h-1/3 w-full flex-col items-center justify-center gap-2 bg-base-200 p-4 shadow-xl">
        <textarea
          className={'textarea h-full w-full'}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here"
          value={prompt}
        />
        <div className={'flex w-full flex-row items-center justify-between'}>
          <div className={'flex flex-row items-center gap-2'}>
            <select
              className={'select'}
              onChange={(e) => setSelectedModel(e.target.value)}
              value={selectedModel}
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
            <input
              className={'input w-24'}
              max={9}
              min={1}
              onChange={(e) => setCount(Number(e.target.value))}
              placeholder="Count"
              type="number"
              value={count}
            />
          </div>
          <button
            className={'btn btn-secondary'}
            disabled={loading || !prompt}
            onClick={handleGenerate}
          >
            {loading && (
              <span className="loading loading-spinner loading-sm mr-2" />
            )}
            Generate
          </button>
        </div>
      </div>
      <div className="card mt-5 flex w-full flex-col items-center justify-center gap-2 bg-base-200 p-4 shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center">
            <span className="loading loading-spinner text-center" />
          </div>
        ) : images.length > 0 ? (
          <div className="grid w-full grid-cols-3 gap-4">
            {images.map((image, index) => (
              <div className="card bg-base-100 shadow-xl" key={index}>
                <div className={'card-body'}>
                  <img
                    alt={`Generated image ${index + 1}`}
                    className={'h-auto w-full'}
                    src={image}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-base-content/70 text-sm">
            Type a prompt and select a model to generate images.
          </p>
        )}
      </div>
    </>
  );
};
