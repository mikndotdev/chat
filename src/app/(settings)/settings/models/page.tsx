import { getLogtoContext } from '@logto/next/server-actions';
import { redirect } from 'next/navigation';
import { validateOllamaHost } from '@/actions/ollama';
import { ModelCard } from '@/components/modelCard';
import { OllamaModelList } from '@/components/OllamaModelList';
import { OpenRouterBadge } from '@/components/OpenRouterConfigButton';
import { OpenRouterModelList } from '@/components/OpenRouterModelList';
import models from '@/consts/models.json' with { type: 'json' };
import { logtoConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

//@ts-expect-error
interface OllamaModelWithStatus extends prisma.customProvider {
  isAvailable: boolean;
  endpoint: string;
  modelCount: number;
  id: string;
}

export default async function Home() {
  const { claims } = await getLogtoContext(logtoConfig);

  if (!claims) {
    await redirect('/login');
  }

  const userKeys = await prisma.apiKey.findMany({
    where: {
      userId: claims?.sub,
    },
  });

  const userOllamaModels = (await prisma.customProvider.findMany({
    where: {
      userId: claims?.sub,
      type: 'ollama',
    },
  })) as unknown as OllamaModelWithStatus[];

  const userOpenRouterModels = await prisma.customProvider.findMany({
    where: {
      userId: claims?.sub,
      type: 'openrouter',
    },
  });

  for (const model of userOllamaModels) {
    try {
      const hostInfo = await validateOllamaHost(model.endpoint);
      model.isAvailable = hostInfo.isValid;
      model.modelCount = hostInfo.modelCount;
    } catch (error) {
      model.isAvailable = false;
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className={'text-4xl text-base-content'}>Model Settings</h1>
      <h2 className={'mt-5 mb-2 text-base-content text-xl'}>Model Providers</h2>
      <div className="grid space-y-2">
        {Object.entries(models).map(([providerKey, provider]) => (
          <ModelCard
            configured={userKeys.some((key) => key.providerId === providerKey)}
            description={provider.description}
            icon={provider.icon}
            id={providerKey}
            key={provider.name}
            name={provider.name}
          />
        ))}
      </div>
      <div className={'mt-5 mb-2 flex flex-row gap-2'}>
        <h2 className={'text-base-content text-xl'}>OpenRouter</h2>
        <OpenRouterBadge
          configured={userKeys.some((key) => key.providerId === 'openrouter')}
        />
      </div>
      <div className="grid space-y-2">
        <OpenRouterModelList models={userOpenRouterModels} />
      </div>
      <h2 className={'mt-5 mb-2 text-base-content text-xl'}>
        Custom Providers (Ollama)
      </h2>
      <div className="grid space-y-2">
        <OllamaModelList models={userOllamaModels} />
      </div>
    </div>
  );
}
