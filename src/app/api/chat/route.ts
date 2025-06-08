import { NextRequest } from "next/server";
import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { createGroq } from "@ai-sdk/groq";
import { streamText } from "ai";
import Models from "@/consts/models.json";

export const maxDuration = 30;

function getProviderKeyFromModelId(modelId: string): string | undefined {
	for (const [providerKey, provider] of Object.entries(Models)) {
		if (provider.models.some((model: any) => model.id === modelId)) {
			return providerKey;
		}
	}
	return undefined;
}

function createProviderInstance(providerKey: string, apiKey: string) {
	switch (providerKey) {
		case "openai":
			return createOpenAI({ apiKey });
		case "google":
			return createGoogleGenerativeAI({ apiKey });
		case "xai":
			return createXai({ apiKey });
		case "groq":
			return createGroq({ apiKey });
		default:
			throw new Error("Unknown provider");
	}
}

export async function POST(req: NextRequest) {
	const { messages } = (await req.json()) as { messages: any[] };
	const searchParams = req.nextUrl.searchParams;
	const id = searchParams.get("id");
	const { claims } = await getLogtoContext(logtoConfig);

	if (!id) return new Response("Chat not found.", { status: 404 });

	const chatData = await prisma.chat.findUnique({ where: { id } });
	if (!chatData) return new Response("Chat not found.", { status: 404 });
	if (chatData.userId !== claims?.sub)
		return new Response("Chat not found.", { status: 404 });

	const modelId = chatData.model;
	const providerKey = getProviderKeyFromModelId(modelId);
	if (!providerKey)
		return new Response("Provider not found.", { status: 400 });

	const userKey = await prisma.apiKey.findFirst({
		where: { userId: claims.sub, providerId: providerKey },
	});
	if (!userKey)
		return new Response("API key not found for provider.", { status: 400 });

	const provider = createProviderInstance(providerKey, userKey.key);

	const result = streamText({
		model: provider(modelId),
		messages,
	});

	return result.toDataStreamResponse();
}
