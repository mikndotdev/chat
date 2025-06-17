// src/app/(public)/share/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { ChatPage } from "@/components/chat";
import { notFound } from "next/navigation";
import AIIcon from "@/assets/img/ai.png";

export default async function SharedChatPage({
	params,
}: { params: { id: string } }) {
	const { id } = params;

	// Fetch the chat and its messages
	const chat = await prisma.chat.findUnique({
		where: { id, public: true },
		include: { messages: { orderBy: { createdAt: "asc" } } },
	});

	if (!chat) {
		return notFound();
	}

	// Format messages to match the expected structure by ChatPage
	const formattedMessages = chat.messages.map((msg) => ({
		id: msg.id,
		role: msg.role as "user" | "assistant" | "system",
		content: msg.content,
		parts: [{ type: "text", text: msg.content }],
		attachment: msg.attachmentId
			? {
					url: msg.attachmentId,
					name: msg.attachmentName || undefined,
					contentType: msg.attachmentType || undefined,
				}
			: undefined,
	}));

	return (
		<div className="container mx-auto flex flex-col h-screen">
			<div className="bg-base-200 p-4 flex items-center">
				<h1 className="text-2xl font-bold">
					{chat.name || "Shared Chat"}
				</h1>
				<span className="ml-2 badge badge-primary">Read Only</span>
			</div>

			<div className="flex-grow overflow-hidden">
				<ChatPage
					id={id}
					msg={formattedMessages}
					avatar="/avatar-placeholder.png" // Default avatar for shared chats
					status="ready"
				/>
			</div>
		</div>
	);
}
