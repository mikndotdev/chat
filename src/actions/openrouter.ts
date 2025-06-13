"use server";

import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getModel(name: string) {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		throw new Error("User not authenticated");
	}

	const response = await fetch(
		`https://openrouter.ai/api/v1/models/${name}/endpoints`,
	);

	if (!response.ok) {
		throw new Error(`Failed to fetch model: ${response.statusText}`);
	}

	return response.json();
}

export async function addModel(name: string) {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		throw new Error("User not authenticated");
	}

	const response = await fetch(
		`https://openrouter.ai/api/v1/models/${name}/endpoints`,
	);

	const data = (await response.json()) as {
		data: {
			architecture: {
				input_modalities: string[];
			};
		};
		error?: string;
	};

	const existingModel = await prisma.customProvider.findFirst({
		where: {
			name,
			userId: claims.sub,
			type: "openrouter",
			supportsAttachments:
				data.data.architecture.input_modalities.includes("file"),
		},
	});

	if (existingModel) {
		throw new Error("Model already exists");
	}

	const newModel = await prisma.customProvider.create({
		data: {
			name,
			userId: claims.sub,
			type: "openrouter",
		},
	});

	return newModel;
}

export async function deleteModel(name: string) {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		throw new Error("User not authenticated");
	}

	const existingModel = await prisma.customProvider.findFirst({
		where: { name, userId: claims.sub, type: "openrouter" },
	});

	if (!existingModel) {
		throw new Error("Model not found");
	}

	await prisma.customProvider.delete({
		where: { id: existingModel.id },
	});
}
