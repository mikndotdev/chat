"use client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Image from "next/image";
import MikanCat from "@/assets/img/mikan-cat.png";
import KawaiiLogo from "@/assets/img/mikan-vtube.svg";
import { ReactNode } from "react";

import { FaDiscord, FaGithub, FaTwitter } from "react-icons/fa";

export default function PagesLayout({ children }: { children: ReactNode }) {
	const nav = [
		{
			name: "Documentation",
			href: "https://docs.mikn.dev/solutions/md-chat",
		},
		{
			name: "Our Stuff",
			href: "https://mikn.dev",
		},
		{
			name: "Legal",
			href: "https://docs.mikn.dev/legal/",
		},
		{
			name: "GitHub",
			href: "https://github.com/mikndotdev/md-chat",
		},
	];

	const social = [
		{
			name: "GitHub",
			href: "https://github.com/mikndotdev",
			color: "hover:text-github hover:bg-github",
			icon: FaGithub,
		},
		{
			name: "Twitter",
			href: "https://twitter.com/kunkunmaamo",
			color: "hover:text-twitter hover:bg-twitter",
			icon: FaTwitter,
		},
		{
			name: "Discord",
			href: "https://discord.gg/FZCN6fjPuG",
			color: "hover:text-discord hover:bg-discord",
			icon: FaDiscord,
		},
	];

	const links = [
		{
			name: "Support",
			children: [
				{
					name: "Discord",
					href: "https://discord.gg/FZCN6fjPuG",
				},
				{
					name: "Contact",
					href: "https://mikn.dev/contact",
				},
			],
		},
		{
			name: "Legal",
			children: [
				{
					name: "Terms of Service",
					href: "https://docs.mikn.dev/legal/terms",
				},
				{
					name: "Privacy Policy",
					href: "https://docs.mikn.dev/legal/privacy",
				},
				{
					name: "特定商取引法に基づく表記",
					href: "https://docs.mikn.dev/legal/jp-payments",
				},
			],
		},
	];

	const buttons = [
		{
			href: "/chat",
			title: "Get Started",
		},
	];

	return (
		<>
			<Header
				navigation={nav}
				buttons={buttons}
				className="text-white bg-neutral"
				color="#6F45E3"
				brand={{
					showTitle: true,
					name: "Chat",
					href: "/",
					logo: KawaiiLogo.src,
				}}
			/>
			<div className="mx-auto min-h-screen max-w-7xl px-4 py-24">
				{children}
			</div>
			<Footer
				social={social}
				links={links}
				copyRight={`2020-${new Date().getFullYear()} MikanDev`}
				className="text-white font-thin bg-neutral"
			>
				<div className="flex items-center self-end">
					<div className="tooltip tooltip-warning" data-tip=":3">
						<Image
							src={MikanCat.src}
							width={200}
							height={100}
							alt=":3"
							className="ml-2 mb-0"
						/>
					</div>
				</div>
			</Footer>
		</>
	);
}
