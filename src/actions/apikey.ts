"use server";

import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function setApiKey({
	provider,
	key,
}: {
	provider: string;
	key: string;
}) {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		throw new Error("User not authenticated");
	}

	const user = await prisma.user.findUnique({ where: { id: claims?.sub } });

	if (!user) {
		await prisma.user.create({ data: { id: claims?.sub } });
	}

	const existingKey = await prisma.apiKey.findFirst({
		where: {
			userId: claims.sub,
			providerId: provider,
		},
	});

	if (existingKey) {
		await prisma.apiKey.update({
			where: { id: existingKey.id },
			data: {
				key,
			},
		});
	} else {
		await prisma.apiKey.create({
			data: {
				userId: claims.sub,
				providerId: provider,
				key,
			},
		});
	}
}

export async function deleteApiKey(provider: string) {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		throw new Error("User not authenticated");
	}

	const existingKey = await prisma.apiKey.findFirst({
		where: {
			userId: claims.sub,
			providerId: provider,
		},
	});

	if (existingKey) {
		await prisma.apiKey.delete({
			where: { id: existingKey.id },
		});
	} else {
		throw new Error("API key not found");
	}
}
