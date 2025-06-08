import models from "@/consts/models.json";

import { prisma } from "@/lib/prisma";
import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";

import { redirect } from "next/navigation";

import { ModelCard } from "@/components/modelCard";

export default async function Home() {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		await redirect("/login");
	}

	const userKeys = await prisma.apiKey.findMany({
		where: {
			userId: claims?.sub,
		},
	});

	return (
		<div className="container mx-auto p-4">
			<h1 className={"text-white text-4xl"}>Model Settings</h1>
			<div className="grid py-5 space-y-2">
				{Object.entries(models).map(([providerKey, provider]) => (
					<ModelCard
						name={provider.name}
						description={provider.description}
						icon={provider.icon}
						key={provider.name}
						id={providerKey}
						configured={userKeys.some(
							(key) => key.providerId === providerKey,
						)}
					/>
				))}
			</div>
		</div>
	);
}
