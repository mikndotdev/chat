'use client';

import {
  Bot,
  File,
  House,
  Image as ImageIcon,
  LogOut,
  MessageCircle,
  MessageSquareHeart,
  Settings,
  Share,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import * as React from 'react';
import KawaiiLogo from '@/assets/img/mikan-vtube.svg';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/animate-ui/radix/dropdown-menu';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from '@/components/animate-ui/radix/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';

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
    <Sidebar className={'bg-neutral text-base-content'} collapsible="icon">
      <SidebarHeader className="group-data-[collapsible=icon]:hidden">
        <div className={'flex w-full flex-row justify-center'}>
          <Link href="/chat">
            <SidebarMenuButton
              className="flex w-full items-center justify-center gap-2 p-4 text-center font-semibold text-lg"
              size="lg"
            >
              <MessageCircle className="text-muted-foreground" />
              <span className="hidden sm:inline">Chat</span>
            </SidebarMenuButton>
          </Link>
          <Link href="/image">
            <SidebarMenuButton
              className="flex w-full items-center justify-center gap-2 p-4 text-center font-semibold text-lg"
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
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  size="lg"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage alt={data.user.name} src={data.user.avatar} />
                    <AvatarFallback className="rounded-lg">
                      <span className={'loading loading-spinner'} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {data.user.name}
                    </span>
                    <span className="truncate text-xs">UID {data.user.id}</span>
                  </div>
                  <Settings className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-56 rounded-lg bg-neutral text-base-content shadow-md"
                side={isMobile ? 'bottom' : 'right'}
                sideOffset={4}
              >
                <Link href={'/settings/models'}>
                  <DropdownMenuItem>
                    <Bot />
                    Your Models
                  </DropdownMenuItem>
                </Link>
                <Link href={'/settings/files'}>
                  <DropdownMenuItem>
                    <File />
                    Your Files
                  </DropdownMenuItem>
                </Link>
                <Link href={'/settings/shared'}>
                  <DropdownMenuItem>
                    <Share />
                    Shared chats
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link href={'/home'}>
                  <DropdownMenuItem>
                    <House />
                    Homepage
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <Link href={'/logout'} prefetch={false}>
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
