import { NextRequest } from "next/server";
import { headers } from "next/headers";
import { after } from "next/server";
import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createXai } from "@ai-sdk/xai";
import { createGroq } from "@ai-sdk/groq";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, generateId, createDataStream } from "ai";
import Models from "@/consts/models.json";

import { createResumableStreamContext } from "resumable-stream";
import { addMessage } from "@/actions/chat";

export const maxDuration = 30;

const streamContext = createResumableStreamContext({
	waitUntil: after,
});

function getProviderKeyFromModelId(modelId: string): string | undefined {
	for (const [providerKey, provider] of Object.entries(Models)) {
		if (provider.models.some((model: any) => model.id === modelId)) {
			return providerKey;
		}
	}
	return undefined;
}

async function getUserORKey(userId: string) {
	return prisma.apiKey.findFirst({
		where: {
			userId,
			providerId: "openrouter",
		},
	});
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
		case "anthropic":
			return createAnthropic({ apiKey });
		case "openrouter":
			return createOpenRouter({ apiKey });
		default:
			throw new Error("Unknown provider");
	}
}

export async function POST(req: NextRequest) {
	try {
		const { messages } = (await req.json()) as { messages: any[] };
		const headersList = await headers();
		const id = headersList.get("X-Chat-Id");
		const { claims } = await getLogtoContext(logtoConfig);

		if (!claims) {
			return new Response("User not authenticated.", { status: 401 });
		}

		if (!id) return new Response("Chat not found.", { status: 404 });

		const chatData = await prisma.chat.findUnique({ where: { id } });
		if (!chatData) return new Response("Chat not found.", { status: 404 });
		if (chatData.userId !== claims?.sub)
			return new Response("Chat not found.", { status: 404 });

		const modelId = chatData.model;
		const modelType = chatData.modelType;

		if (modelType === "openrouter") {
			const providerKey = await getUserORKey(claims?.sub);
			if (!providerKey) {
				return new Response("OpenRouter API key not found for user.", {
					status: 400,
				});
			}
			const provider = createOpenRouter({ apiKey: providerKey.key });
			const streamId = generateId();
			await prisma.stream.create({
				data: {
					chatId: id,
					streamId,
				},
			});

			const result = streamText({
				model: provider.chat(modelId),
				messages,
				onFinish: async (message) => {
					await addMessage({
						message: {
							content: message.text,
							role: "assistant",
						},
						id,
					});
					await prisma.stream.deleteMany({
						where: { streamId: streamId },
					});
				},
			});
			return result.toDataStreamResponse();
		}

		const providerKey = getProviderKeyFromModelId(modelId);
		if (!providerKey)
			return new Response("Provider not found.", { status: 400 });

		const userKey = await prisma.apiKey.findFirst({
			where: { userId: claims.sub, providerId: providerKey },
		});
		if (!userKey)
			return new Response("API key not found for provider.", {
				status: 400,
			});

		const provider = createProviderInstance(providerKey, userKey.key);

		const streamId = generateId();

		await prisma.stream.create({
			data: {
				chatId: id,
				streamId,
			},
		});

		const result = streamText({
			//@ts-ignore
			model: provider.chat(modelId),
			messages,
			onFinish: async (message) => {
				await addMessage({
					message: {
						content: message.text,
						role: "assistant",
					},
					id,
				});
				await prisma.stream.deleteMany({
					where: { streamId: streamId },
				});
			},
		});

		return result.toDataStreamResponse();
	} catch (error) {
		console.error("Error in chat API:", error);
		return new Response(
			JSON.stringify({
				error: "An error occurred while processing your request.",
				details:
					error instanceof Error ? error.message : "Unknown error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
