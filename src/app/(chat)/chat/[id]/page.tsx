import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Message } from "@ai-sdk/react";
import Models from "@/consts/models.json";
import * as React from "react";
import { ChatContainer } from "@/components/chatContainer";

const ModelInfoFromID: Record<string, { name: string; description: string }> =
	Object.entries(Models)
		.flatMap(([providerKey, provider]) =>
			provider.models.map(
				(model) =>
					[
						model.id,
						{ name: model.name, description: provider.description },
					] as [string, { name: string; description: string }],
			),
		)
		.reduce(
			(
				acc,
				[id, info]: [string, { name: string; description: string }],
			) => ({
				...acc,
				[id]: info,
			}),
			{},
		);

export default async function Home({
	params,
}: { params: Promise<{ id: string }> }) {
	const { claims } = await getLogtoContext(logtoConfig);
	const { id } = await params;

	if (!claims) {
		await redirect("/login");
	}

	const chat = await prisma.chat.findUnique({
		where: { id },
		include: {
			messages: {
				orderBy: { createdAt: "asc" },
			},
		},
	});

	if (!chat) {
		return notFound();
	}

	if (chat.userId !== claims?.sub) {
		return notFound();
	}

	const messages = await prisma.message.findMany({
		where: { chatId: chat.id },
		orderBy: { createdAt: "asc" },
	});

	const modelInfo = ModelInfoFromID[chat.model];

	return (
		<main className="container mx-auto p-4">
			<h1 className="text-2xl font-bold mb-2">
				{chat.name || "Untitled Chat"}
			</h1>
			<div className="mb-4">
				<p>
					<strong>Model:</strong> {modelInfo?.name || "Unknown Model"}
				</p>
				<p>
					<strong>Created At:</strong>{" "}
					{new Date(chat.createdAt).toLocaleString()}
				</p>
			</div>
			<div className="space-y-4">
				<ChatContainer
					id={id}
					avatar={claims?.picture || ""}
					initialMessages={messages as Message[]}
					model={chat.model}
					// Pass models if needed
				/>
			</div>
		</main>
	);
}
