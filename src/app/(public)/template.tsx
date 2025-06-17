import {
	SidebarProvider,
	SidebarInset,
	SidebarTrigger,
} from "@/components/animate-ui/radix/sidebar";
import * as React from "react";

export default async function ShareLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<SidebarProvider>
			<SidebarInset>{children}</SidebarInset>
		</SidebarProvider>
	);
}
