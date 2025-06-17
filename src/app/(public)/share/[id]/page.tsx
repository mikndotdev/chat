import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Models from "@/consts/models.json";
import * as React from "react";
import { ChatContainer } from "@/components/chatContainer";
import { ChatMeta } from "@/components/chatMeta";
import Image from "next/image";
import Link from "next/link";

import UserIcon from "@/assets/img/user.png";
import Logo from "@/assets/img/mikan-vtube.svg";

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

export async function generateMetadata({
	params,
}: { params: Promise<{ id: string }> }) {
	const id = (await params).id;

	const chat = await prisma.chat.findUnique({
		where: { id },
		include: {
			messages: {
				orderBy: { createdAt: "asc" },
			},
		},
	});

	if (!chat || !chat.public) {
		return {
			title: "Chat not found",
			description: "The requested chat does not exist or is not public.",
		};
	}

	const modelInfo = ModelInfoFromID[chat.model] || { name: "Unknown Model" };

	return {
		title: `MD Chat - ${chat.name || "Untitled Chat"}`,
		description: `Chat using ${modelInfo.name}. Read it on MD Chat!`,
	};
}

export default async function SharePage({
	params,
}: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const { claims } = await getLogtoContext(logtoConfig);

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

	if (!chat.public) {
		return notFound();
	}

	if (chat.userId == claims?.sub) {
		await redirect(`/chat/${id}`);
	}

	const messages = await prisma.message.findMany({
		where: { chatId: chat.id },
		orderBy: { createdAt: "asc" },
		include: { attachments: true },
	});

	const modelsArray = Object.entries(Models).flatMap(
		([providerKey, provider]) =>
			provider.models.map((model) => ({
				...model,
				provider: providerKey,
				providerName: provider.name,
				icon: provider.icon,
			})),
	);

	const modelInfo = ModelInfoFromID[chat.model] || chat.model;

	const formattedMessages = messages.map((message) => ({
		id: message.id,
		content: message.content,
		role: message.role as "user" | "assistant" | "system",
		createdAt: message.createdAt,
		experimental_attachments: message.attachments.map((attachment) => ({
			id: attachment.id,
			url: attachment.url,
			contentType: attachment.filetype || "unknown",
		})),
	}));

	return (
		<main className="container mx-auto p-4">
			<ChatMeta
				createdAt={chat.createdAt.toISOString()}
				model={modelInfo?.name || chat.model || "Unknown Model"}
				title={chat.name || "Untitled Chat"}
				id={id}
				shared={chat.public}
				isPublic={true}
			/>
			<div className="space-y-4">
				<ChatContainer
					id={id}
					avatar={UserIcon.src}
					//@ts-ignore
					initialMessages={formattedMessages}
					model={chat.model}
					//@ts-ignore
					models={modelsArray}
					isPublic={true}
				/>
			</div>
			<div className="flex items-center w-full card bg-base-200 shadow-xl p-4 mt-8">
				<div className="flex flex-row justify-between items-center w-full">
					<div className="flex flex-row items-center">
						<p
							className={
								"text-base-content/70 text-sm mr-2 font-bold text-xl"
							}
						>
							Generated on
						</p>
						<Image
							src={Logo}
							alt="MikanDev Logo"
							width={200}
							height={200}
							className="rounded-lg w-1/6 h-auto"
						/>
						<p
							className={
								"text-base-content/70 text-sm ml-2 font-bold text-xl"
							}
						>
							Chat
						</p>
					</div>
					<Link href={`/chat`} className="">
						<button className={"btn btn-secondary"}>
							Try it now!
						</button>
					</Link>
				</div>
			</div>
		</main>
	);
}
