import models from "@/consts/models.json";

import { prisma } from "@/lib/prisma";
import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";

import { redirect } from "next/navigation";

import { ModelCard } from "@/components/modelCard";
import { OpenRouterModelList } from "@/components/OpenRouterModelList";
import { OllamaModelList } from "@/components/OllamaModelList";
import { OpenRouterBadge } from "@/components/OpenRouterConfigButton";

import { validateOllamaHost } from "@/actions/ollama";

//@ts-ignore
interface OllamaModelWithStatus extends prisma.customProvider {
	isAvailable: boolean;
	endpoint: string;
	modelCount: number;
	id: string;
}

export default async function Home() {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		await redirect("/login");
	}

	const userKeys = await prisma.apiKey.findMany({
		where: {
			userId: claims?.sub,
		},
	});

	let userOllamaModels = (await prisma.customProvider.findMany({
		where: {
			userId: claims?.sub,
			type: "ollama",
		},
	})) as unknown as OllamaModelWithStatus[];

	const userOpenRouterModels = await prisma.customProvider.findMany({
		where: {
			userId: claims?.sub,
			type: "openrouter",
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
			<h1 className={"text-base-content text-4xl"}>Model Settings</h1>
			<h2 className={"text-base-content text-xl mt-5 mb-2"}>
				Model Providers
			</h2>
			<div className="grid space-y-2">
				{Object.entries(models).map(([providerKey, provider]) => (
					<ModelCard
						name={provider.name}
						description={provider.description}
						icon={provider.icon}
						key={provider.name}
						id={providerKey}
						configured={userKeys.some(
							(key) => key.providerId === providerKey,
						)}
					/>
				))}
			</div>
			<div className={"flex flex-row gap-2  mt-5 mb-2"}>
				<h2 className={"text-base-content text-xl"}>OpenRouter</h2>
				<OpenRouterBadge
					configured={userKeys.some(
						(key) => key.providerId === "openrouter",
					)}
				/>
			</div>
			<div className="grid space-y-2">
				<OpenRouterModelList models={userOpenRouterModels} />
			</div>
			<h2 className={"text-base-content text-xl mt-5 mb-2"}>
				Custom Providers (Ollama)
			</h2>
			<div className="grid space-y-2">
				<OllamaModelList models={userOllamaModels} />
			</div>
		</div>
	);
}
