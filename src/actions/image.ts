'use server';
import { openai } from '@ai-sdk/openai';
import { xai } from '@ai-sdk/xai';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getLogtoContext } from '@logto/next/server-actions';
import { experimental_generateImage as generateImage } from 'ai';
import Models from '@/consts/image_models.json' with { type: 'json' };
import { logtoConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
  },
});

interface ImageGenerationParams {
  model: string;
  prompt: string;
  count: number;
}

function getProviderKeyFromModelId(modelId: string): string | undefined {
  for (const [providerKey, provider] of Object.entries(Models)) {
    if (provider.models.some((model: any) => model.id === modelId)) {
      return providerKey;
    }
  }
  return;
}

async function generate(
  providerKey: string,
  apiKey: string,
  model: string,
  count: number,
  prompt: string
) {
  switch (providerKey) {
    case 'openai':
      process.env.OPENAI_API_KEY = apiKey;
      return await generateImage({
        model: openai.image(model),
        prompt,
        n: count,
      });
    case 'xai':
      process.env.XAI_API_KEY = apiKey;
      return await generateImage({
        model: xai.image(model),
        prompt,
        n: count,
      });
    default:
      throw new Error('Unknown provider');
  }
}

const ModelInfoFromID: Record<string, { name: string; description: string }> =
  Object.entries(Models)
    .flatMap(([providerKey, provider]) =>
      provider.models.map(
        (model) =>
          [
            model.id,
            { name: model.name, description: provider.description },
          ] as [string, { name: string; description: string }]
      )
    )
    .reduce(
      (acc, [id, info]: [string, { name: string; description: string }]) => ({
        ...acc,
        [id]: info,
      }),
      {}
    );

export const generateImages = async ({
  model,
  prompt,
  count,
}: ImageGenerationParams) => {
  const { claims } = await getLogtoContext(logtoConfig);

  if (!claims) {
    throw new Error('User not authenticated');
  }

  const userKeys = await prisma.apiKey.findMany({
    where: { userId: claims.sub },
  });

  const providerKey = getProviderKeyFromModelId(model);

  if (!providerKey) {
    throw new Error('Model not found for the given ID.');
  }

  const modelInfo = ModelInfoFromID[model];

  if (!modelInfo) {
    throw new Error('Model not found.');
  }

  const userKey = userKeys.find((key) => key.providerId === providerKey);

  if (!userKey) {
    throw new Error('User does not have access to this model.');
  }

  const apiKey = userKey.key;

  const images = await generate(providerKey, apiKey, model, count, prompt);

  const urls = images.images;

  const uploadPromises = urls.map(async (url) => {
    const base64 = url.base64;
    const buffer = Buffer.from(base64, 'base64');

    const fileName = `${claims.sub}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.png`;

    const key = `${process.env.S3_UPLOAD_DIR}/generations/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: 'image/png',
    });

    await client.send(command);
    const imageUrl = `${process.env.S3_PUBLIC_URL}/${key}`;

    return prisma.file.create({
      data: {
        url: imageUrl,
        userId: claims.sub,
        description: prompt,
      },
    });
  });

  const uploadedFiles = await Promise.all(uploadPromises);

  return uploadedFiles.map((file) => ({
    id: file.id,
    url: file.url,
    createdAt: file.createdAt,
  }));
};
