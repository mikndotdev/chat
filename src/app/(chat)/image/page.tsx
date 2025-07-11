import { getLogtoContext } from '@logto/next/server-actions';
import Link from 'next/link';
import * as React from 'react';
import { ImageGenerator } from '@/components/imageGenerator';
import models from '@/consts/image_models.json' with { type: 'json' };
import { logtoConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function Home() {
  const { claims } = await getLogtoContext(logtoConfig);

  const userKeys = await prisma.apiKey.findMany({
    where: { userId: claims?.sub || '' },
  });

  const availableModels = Object.entries(models)
    .filter(([providerKey]) =>
      userKeys.some((key) => key.providerId === providerKey)
    )
    .flatMap(([providerKey, provider]) =>
      provider.models.map((model) => ({
        ...model,
        icon: provider.icon,
        provider: providerKey,
        providerName: provider.name,
        name: model.name,
        id: model.id,
        // @ts-expect-error
        resolution: model.resolution || null,
        // @ts-expect-error
        aspect_ratio: model.aspect_ratio || null,
      }))
    );

  return (
    <main>
      <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
        <h1 className="font-bold text-4xl text-base-content">
          Image Playground
        </h1>
        <p className="mt-5 text-base-content/70 text-sm">
          Pick a model, write a prompt and watch the magic happen!
        </p>
        <p className="mt-2 text-base-content/70 text-sm">
          <Link className="btn btn-link" href={'/settings/files#files'}>
            View your creations
          </Link>
        </p>
        <ImageGenerator models={availableModels} />
      </div>
    </main>
  );
}
