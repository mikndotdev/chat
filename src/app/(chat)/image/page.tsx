import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";
import * as React from "react";
import { prisma } from "@/lib/prisma";
import models from "@/consts/image_models.json";
import { ImageGenerator } from "@/components/imageGenerator";

import Link from "next/link";

export default async function Home() {
	const { claims } = await getLogtoContext(logtoConfig);

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
				providerName: provider.name,
				name: model.name,
				id: model.id,
				// @ts-ignore
				resolution: model.resolution || null,
				// @ts-ignore
				aspect_ratio: model.aspect_ratio || null,
			})),
		);

	return (
		<main>
			<div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
				<h1 className="text-base-content font-bold text-4xl">
					Image Playground
				</h1>
				<p className="text-base-content/70 text-sm mt-5">
					Pick a model, write a prompt and watch the magic happen!
				</p>
				<p className="text-base-content/70 text-sm mt-2">
					<Link
						href={"/settings/files#files"}
						className="btn btn-link"
					>
						View your creations
					</Link>
				</p>
				<ImageGenerator models={availableModels} />
			</div>
		</main>
	);
}
