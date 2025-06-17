"use server";

import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function renameChat(name: string, id: string) {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		throw new Error("User not authenticated");
	}

	const chat = await prisma.chat.findUnique({
		where: { id },
	});

	if (!chat || chat.userId !== claims.sub) {
		throw new Error("Chat not found or access denied");
	}

	return await prisma.chat.update({
		where: { id },
		data: { name },
	});
}

export async function deleteChat(id: string) {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		throw new Error("User not authenticated");
	}

	const chat = await prisma.chat.findUnique({
		where: { id },
	});

	if (!chat || chat.userId !== claims.sub) {
		throw new Error("Chat not found or access denied");
	}

	await prisma.attachment.deleteMany({
		where: { chatId: id },
	});

	await prisma.message.deleteMany({
		where: { chatId: id },
	});

	return await prisma.chat.delete({
		where: { id },
	});
}
