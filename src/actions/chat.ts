"use server";

import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Message } from "@ai-sdk/react";

import Models from "@/consts/models.json";

const ModelNameToId: Record<string, string> = Object.entries(Models)
	.flatMap(([providerKey, provider]) =>
		provider.models.map((model) => [model.name, model.id]),
	)
	.reduce((acc, [name, id]) => ({ ...acc, [name]: id }), {});

export async function startChat({
	model,
	message,
}: {
	model: string;
	message: string;
}) {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		throw new Error("User not authenticated");
	}

	const modelId = ModelNameToId[model];

	const chat = await prisma.chat.create({
		data: {
			userId: claims.sub,
			model: modelId,
		},
	});

	await prisma.message.create({
		data: {
			chatId: chat.id,
			userId: claims.sub,
			content: message,
		},
	});

	return chat;
}

export const addMessage = async ({
	message,
	id,
}: {
	message: { content: string; role: "user" | "assistant" | "system" | "data" };
	id: string;
}) => {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		throw new Error("User not authenticated");
	}

	const chat = await prisma.chat.findUnique({
		where: { id: id },
	});

	if (!chat || chat.userId !== claims.sub) {
		throw new Error("Chat not found or access denied");
	}

	const newMessage = await prisma.message.create({
		data: {
			chatId: chat.id,
			userId: claims.sub,
			content: message.content,
			role: message.role,
		},
	});

	return newMessage;
};
