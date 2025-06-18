"use server";

import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const validateOllamaHost = async (host: string) => {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		throw new Error("User not authenticated");
	}

	try {
		const response = await fetch(`${host}/v1/models`);
		if (!response.ok) {
			throw new Error("Invalid Ollama host");
		}
		const data = await response.json();
		// @ts-ignore
		if (!data || !data.data) {
			throw new Error("No data returned from Ollama host");
		}
		return {
			isValid: true,
			// @ts-ignore
			modelCount: data.data.length,
			// @ts-ignore
			models: data.data,
		};
	} catch (error) {
		console.error("Error validating Ollama host:", error);
		return {
			isValid: false,
			modelCount: 0,
			models: [],
		};
	}
};

export const addModel = async (host: string) => {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		throw new Error("User not authenticated");
	}

	const validation = await validateOllamaHost(host);
	if (!validation.isValid) {
		throw new Error("Invalid Ollama host");
	}

	const existingModel = await prisma.customProvider.findFirst({
		where: {
			endpoint: host,
			userId: claims.sub,
			type: "ollama",
		},
	});

	if (existingModel) {
		throw new Error("Model already exists");
	}

	return prisma.customProvider.create({
		data: {
			endpoint: host,
			userId: claims.sub,
			type: "ollama",
		},
	});
};

export const deleteModel = async (id: string) => {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		throw new Error("User not authenticated");
	}

	const model = await prisma.customProvider.findUnique({
		where: { id },
	});

	if (!model || model.userId !== claims.sub) {
		throw new Error("Model not found or access denied");
	}

	return prisma.customProvider.delete({
		where: { id },
	});
};
