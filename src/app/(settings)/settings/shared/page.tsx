import { prisma } from "@/lib/prisma";
import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";

import { redirect } from "next/navigation";

export default async function Home() {
    const { claims } = await getLogtoContext(logtoConfig);

    if (!claims) {
        await redirect("/login");
    }

    const userSharedChats = await prisma.chat.findMany({
        where: { userId: claims?.sub, public: true },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="container mx-auto p-4">
            <h1 className={"text-base-content text-4xl mb-4"}>Shared Chats</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {userSharedChats.map((chat) => (
                    <div
                        key={chat.id}
                        className="card bg-base-200 shadow-xl hover:shadow-2xl transition-shadow duration-300"
                    >
                        <div className="card-body">
                            <h2 className="card-title">
                                {chat.name || "Untitled Chat"}
                            </h2>
                            <p className="text-base-content/70">
                                Created at:{" "}
                                {new Date(chat.createdAt).toLocaleDateString()}
                            </p>
                            <a
                                href={`/chat/${chat.id}`}
                                className="btn btn-primary mt-4"
                            >
                                Open Chat
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
