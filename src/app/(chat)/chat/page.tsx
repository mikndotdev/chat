import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ChatInput } from "@/components/chatInput";
import * as React from "react";
import { prisma } from "@/lib/prisma";
import models from "@/consts/models.json";

export default async function Home() {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		await redirect("/login");
	}

	const userKeys = await prisma.apiKey.findMany({
		where: { userId: claims?.sub || "" },
	});

	const availableModels = Object.entries(models)
		.filter(([providerKey]) =>
			userKeys.some((key) => key.providerId === providerKey),
		)
		.flatMap(([providerKey, provider]) =>
			provider.models.map((model) => ({
				...model,
				icon: provider.icon,
				provider: providerKey,
			})),
		);

	return (
		<main>
			<div className="h-screen flex flex-col items-center justify-center text-center">
				<h1 className="text-white font-bold text-4xl">
					Hello, {claims?.name}
				</h1>
				<p className="text-gray-500 text-sm mt-5">
					Start a new chat by typing a message down below!
				</p>
			</div>
			<div className={"flex items-center justify-center"}>
				<ChatInput models={availableModels} status={"ready"}/>
			</div>
		</main>
	);
}
