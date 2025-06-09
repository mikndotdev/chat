import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/animate-ui/radix/sidebar";
import { ChatSidebar } from "@/components/sidebar";
import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as React from "react";
import {redirect} from "next/navigation";

export default async function ChatLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		await redirect("/login");
	}

	const account = await prisma.user.findUnique({
		where: { id: claims?.sub },
	});

	if (!account) {
		await prisma.user.create({
			data: {
				id: claims?.sub,
			},
		});
	}

	const chats = await prisma.chat.findMany({
		where: { userId: claims?.sub || "" },
		orderBy: {
			createdAt: "desc",
		},
	});

	const data = {
		user: {
			name: claims?.name || "...",
			id: claims?.sub || "...",
			avatar: claims?.picture || "/default-avatar.png",
		},
		chats: chats.map((chat) => ({
			name: chat.name || "Untitled Chat",
			id: chat.id,
		})),
	};

	return (
		<SidebarProvider>
			<ChatSidebar data={data} />
			<SidebarTrigger className={"hover:bg-secondary ml-3 mt-3"} />
			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	);
}
