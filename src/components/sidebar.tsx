"use client";

import * as React from "react";

import Link from "next/link";
import Image from "next/image";

import KawaiiLogo from "@/assets/img/mikan-vtube.svg";

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
	File,
	Image as ImageIcon,
	MessageCircle,
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
		<Sidebar collapsible="icon" className={"bg-neutral text-base-content"}>
			<SidebarHeader className="group-data-[collapsible=icon]:hidden">
				<div className={"flex flex-row w-full justify-center"}>
					<Link href="/chat">
						<SidebarMenuButton
							className="flex items-center gap-2 p-4 text-lg font-semibold text-center justify-center w-full"
							size="lg"
						>
							<MessageCircle className="text-muted-foreground" />
							<span className="hidden sm:inline">Chat</span>
						</SidebarMenuButton>
					</Link>
					<Link href="/image">
						<SidebarMenuButton
							className="flex items-center gap-2 p-4 text-lg font-semibold text-center justify-center w-full"
							size="lg"
						>
							<span className="hidden sm:inline">Image</span>
							<ImageIcon className="text-muted-foreground" />
						</SidebarMenuButton>
					</Link>
				</div>
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
								className="min-w-56 rounded-lg bg-neutral text-base-content shadow-md"
								side={isMobile ? "bottom" : "right"}
								align="end"
								sideOffset={4}
							>
								<Link href={"/settings/models"}>
									<DropdownMenuItem>
										<Bot />
										Your Models
									</DropdownMenuItem>
								</Link>
								<Link href={"/settings/files"}>
									<DropdownMenuItem>
										<File />
										Your Files
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
								<Link href={"/logout"} prefetch={false}>
									<DropdownMenuItem>
										<LogOut />
										Log out
									</DropdownMenuItem>
								</Link>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>
	);
};
