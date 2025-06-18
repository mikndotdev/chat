import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatInput } from "@/components/chatInput";
import * as React from "react";
import { prisma } from "@/lib/prisma";
import models from "@/consts/models.json";
import { validateOllamaHost } from "@/actions/ollama";

//@ts-ignore
interface OllamaModelWithStatus extends prisma.customProvider {
	isAvailable: boolean;
	endpoint: string;
	models: string[];
	id: string;
}

export default async function Home() {
	const { claims } = await getLogtoContext(logtoConfig);

	const userKeys = await prisma.apiKey.findMany({
		where: { userId: claims?.sub || "" },
	});

	const openRouterModels = await prisma.customProvider.findMany({
		where: {
			userId: claims?.sub || "",
			type: "openrouter",
		},
	});

	const ollamaHosts = await prisma.customProvider.findMany({
		where: {
			userId: claims?.sub || "",
			type: "ollama",
		},
	});

	const ollamaModels: OllamaModelWithStatus[] = [];

	for (const host of ollamaHosts) {
		if (!host.endpoint) {
			ollamaModels.push({
				...host,
				endpoint: "",
				isAvailable: false,
				models: [],
			});
			continue;
		}
		try {
			const hostInfo = await validateOllamaHost(host.endpoint);
			ollamaModels.push({
				...host,
				endpoint: host.endpoint,
				isAvailable: hostInfo.isValid,
				models: hostInfo.models,
			});
		} catch (error) {
			ollamaModels.push({
				...host,
				endpoint: host.endpoint,
				isAvailable: false,
				models: [],
			});
		}
	}

	const availableModels = Object.entries(models)
		.filter(([providerKey]) =>
			userKeys.some((key) => key.providerId === providerKey),
		)
		.flatMap(([providerKey, provider]) =>
			provider.models.map((model) => ({
				...model,
				icon: provider.icon,
				provider: providerKey,
				providerName: provider.name,
				freeTier: model.free_tier || false,
				experimental: model.experimental,
				description: model.description,
				supports_attachment: model.supports_attachment || false,
			})),
		);

	const openRouterKey = userKeys.find(
		(key) => key.providerId === "openrouter",
	);

	return (
		<main>
			<div className="h-screen flex flex-col items-center justify-center text-center">
				<h1 className="text-base-content font-bold text-4xl">
					Hello, {claims?.name}
				</h1>
				<p className="text-base-content/70 text-sm mt-5">
					Start a new chat by typing a message down below!
				</p>
			</div>
			<div className={"flex items-center justify-center"}>
				<ChatInput
					models={availableModels}
					status={"ready"}
					openRouterModels={openRouterModels}
					openRouterEnabled={!!openRouterKey}
					ollamaModels={ollamaModels}
				/>
			</div>
		</main>
	);
}
