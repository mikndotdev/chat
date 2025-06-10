"use client";
import { useChat, Message } from "@ai-sdk/react";
import { ChatPage } from "./chat";
import { ChatInput } from "./chatInput";
import { useEffect } from "react";

interface ChatContainerProps {
	id: string;
	avatar: string;
	initialMessages: Message[];
	model?: string;
	models?: any[];
}

export const ChatContainer = ({
	id,
	avatar,
	initialMessages,
	model,
	models,
}: ChatContainerProps) => {
	const {
		messages,
		handleInputChange,
		handleSubmit,
		append,
		input,
		setMessages,
		experimental_resume,
		status,
	} = useChat({
		id,
		initialMessages,
		headers: {
			"X-Chat-Id": id,
		},
	});

	useEffect(() => {
		experimental_resume();
		if (!initialMessages?.length) return;
		const lastMsg = initialMessages[initialMessages.length - 1];
		if (lastMsg.role === "user") {
			if (lastMsg.content) {
				setMessages([]);
				append({ role: "user", content: lastMsg.content });
			}
		}
	}, []);

	return (
		<>
			<ChatPage id={id} avatar={avatar} msg={messages} status={status} />
			<div className={"flex flex-col items-center justify-center"}>
				<ChatInput
					id={id}
					model={model}
					models={models}
					input={input}
					handleInputChange={handleInputChange}
					handleSubmit={handleSubmit}
					status={status}
				/>
			</div>
		</>
	);
};
