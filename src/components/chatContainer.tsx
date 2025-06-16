"use client";
import { useChat, Message } from "@ai-sdk/react";
import { ChatPage } from "./chat";
import { ChatInput } from "./chatInput";
import { useEffect, useState } from "react";

// Define types for the component props
interface ChatContainerProps {
	id: string;
	avatar: string;
	initialMessages: Message[];
	model: string;
	models: string[];
}

// Define the valid status types
type ChatStatus = "ready" | "submitted" | "streaming" | "error" | undefined;

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
		status,
		reload,
	} = useChat({
		id,
		initialMessages: [], // Start with empty messages to avoid duplication
		headers: {
			"X-Chat-Id": id,
		},
	});

	const [retryCount, setRetryCount] = useState(0);
	const [internalStatus, setInternalStatus] = useState<ChatStatus>("ready");
	const [isInitialized, setIsInitialized] = useState(false);

	// Handle initial message loading and auto-processing
	useEffect(() => {
		if (!isInitialized && initialMessages?.length > 0) {
			setIsInitialized(true);

			// Check if this is a single user message with no response yet
			if (
				initialMessages.length === 1 &&
				initialMessages[0].role === "user"
			) {
				const firstMessage = initialMessages[0];

				// Use append directly to trigger the LLM response
				append({
					role: "user",
					content: firstMessage.content,
					id: firstMessage.id,
				});
			} else {
				// If there are multiple messages or it's not just a user message,
				// load them all at once
				setMessages(initialMessages);
			}
		}
	}, [initialMessages, isInitialized, append, setMessages]);

	// Sync status from useChat with our internal status
	useEffect(() => {
		if (internalStatus !== "error" || status === "error") {
			setInternalStatus(status);
		}
	}, [status]);

	// Handle error detection for unresponded user messages
	useEffect(() => {
		if (
			messages.length > 0 &&
			messages[messages.length - 1].role === "user" &&
			internalStatus !== "streaming" &&
			internalStatus !== "submitted"
		) {
			const timer = setTimeout(() => {
				if (
					messages.length > 0 &&
					messages[messages.length - 1].role === "user" &&
					//@ts-ignore
					internalStatus !== "streaming" &&
					//@ts-ignore
					internalStatus !== "submitted"
				) {
					console.log(
						"Detected unresponded message, setting error state",
					);
					setInternalStatus("error");
				}
			}, 15000);

			return () => clearTimeout(timer);
		}
	}, [messages, internalStatus]);

	const handleRetry = () => {
		setRetryCount((prev) => prev + 1);
		setInternalStatus("ready");

		// Find the last user message
		const lastUserIndex = messages.map((m) => m.role).lastIndexOf("user");

		if (lastUserIndex !== -1) {
			const userMsg = messages[lastUserIndex];

			// Reappend the user message to trigger a new response
			append({
				id: `retry-${retryCount}-${userMsg.id || Date.now()}`,
				content: userMsg.content,
				role: "user",
			});
		} else {
			reload();
		}
	};

	return (
		<>
			<ChatPage
				id={id}
				avatar={avatar}
				msg={messages}
				status={internalStatus}
				onRetry={handleRetry}
			/>
			<div className="flex flex-col items-center justify-center">
				<ChatInput
					id={id}
					model={model}
					models={models}
					input={input}
					handleInputChange={handleInputChange}
					handleSubmit={handleSubmit}
					status={internalStatus}
				/>
			</div>
		</>
	);
};
