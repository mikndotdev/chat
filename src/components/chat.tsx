"use client";
import AIIcon from "@/assets/img/ai.png";
import { Message } from "@ai-sdk/react";

interface ChatProps {
	id: string;
	avatar: string;
	msg: Message[];
}

export const ChatPage = ({ id, msg, avatar }: ChatProps) => {
	return (
		<div>
			<div className="mb-24">
				{msg.map((msg) => (
					<div
						key={msg.id}
						className="flex flex-row items-start mb-3"
					>
						<img
							src={
								msg.role === "user"
									? avatar || AIIcon.src
									: AIIcon.src
							}
							alt="Avatar"
							className="w-auto h-8 rounded-full mr-3"
						/>
						<div className="flex flex-col">
							{msg?.parts?.map((part, i) => {
								switch (part.type) {
									case "text":
										return (
											<div
												key={`${msg.id}-${i}`}
												className="whitespace-pre-line"
											>
												{part.text}
											</div>
										);
								}
							})}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
