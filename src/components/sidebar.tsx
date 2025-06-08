"use client";

import * as React from "react";

import Link from "next/link";

import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarRail,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
	SidebarMenuAction,
} from "@/components/animate-ui/radix/sidebar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/animate-ui/radix/dropdown-menu";
import {
	LogOut,
	Settings,
	MessageSquareHeart,
	Bot,
	Share,
	House,
	PlusCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface Props {
	data: {
		user: {
			name: string;
			id: string;
			avatar?: string;
		};
		chats?: {
			name: string;
			id: string;
		}[];
	};
}

export const ChatSidebar = ({ data }: Props) => {
	const isMobile = useIsMobile();

	return (
		<Sidebar collapsible="icon" className={"bg-neutral text-white"}>
			<SidebarHeader className="group-data-[collapsible=icon]:hidden">
				<Link href="/chat">
					<SidebarMenuButton
						className="flex items-center gap-2 p-4 text-lg font-semibold text-center justify-center"
						size="lg"
					>
						<PlusCircle className="text-muted-foreground" />
						<span className="hidden sm:inline">New Chat</span>
					</SidebarMenuButton>
				</Link>
			</SidebarHeader>

			<SidebarContent>
				{/* Nav Project */}
				<SidebarGroup className="group-data-[collapsible=icon]:hidden">
					{data.chats && data.chats.length > 0 && (
						<>
							<SidebarGroupLabel>Chats</SidebarGroupLabel>
							<SidebarMenu>
								{data.chats.map((item) => (
									<SidebarMenuItem key={item.id}>
										<SidebarMenuButton asChild>
											<Link href={`/chat/${item.id}`}>
												<MessageSquareHeart className="text-muted-foreground" />
												<span>{item.name}</span>
											</Link>
										</SidebarMenuButton>
									</SidebarMenuItem>
								))}
							</SidebarMenu>
						</>
					)}
				</SidebarGroup>
				{/* Nav Project */}
			</SidebarContent>
			<SidebarFooter>
				{/* Nav User */}
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<Avatar className="h-8 w-8 rounded-lg">
										<AvatarImage
											src={data.user.avatar}
											alt={data.user.name}
										/>
										<AvatarFallback className="rounded-lg">
											<span
												className={
													"loading loading-spinner"
												}
											/>
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">
											{data.user.name}
										</span>
										<span className="truncate text-xs">
											UID {data.user.id}
										</span>
									</div>
									<Settings className="ml-auto size-4" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="min-w-56 rounded-lg bg-neutral text-white shadow-md"
								side={isMobile ? "bottom" : "right"}
								align="end"
								sideOffset={4}
							>
								<Link href={"/settings/models"}>
									<DropdownMenuItem>
										<Bot />
										My Models
									</DropdownMenuItem>
								</Link>
								<Link href={"/settings/shared"}>
									<DropdownMenuItem>
										<Share />
										Shared chats
									</DropdownMenuItem>
								</Link>
								<DropdownMenuSeparator />
								<Link href={"/home"}>
									<DropdownMenuItem>
										<House />
										Homepage
									</DropdownMenuItem>
								</Link>
								<DropdownMenuSeparator />
								<Link href={"/logout"}>
									<DropdownMenuItem>
										<LogOut />
										Log out
									</DropdownMenuItem>
								</Link>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
				{/* Nav User */}
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
};
