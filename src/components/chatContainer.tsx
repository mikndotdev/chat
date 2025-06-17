"use client";
import { useChat, Message as BaseMessage } from "@ai-sdk/react";
import { ChatPage } from "./chat";
import { ChatInput } from "./chatInput";
import { useEffect, useState, FormEvent } from "react";
import { addMessage } from "@/actions/chat";
import { toast } from "sonner";

// Extend the Message type to include attachment
interface Message extends BaseMessage {
	attachment?: string | undefined;
}

// Type for message creation that includes attachment
interface CreateMessage {
	role: "user" | "assistant" | "system";
	content: string;
	id?: string;
	attachment?: string;
}

interface ChatContainerProps {
	id: string;
	avatar: string;
	initialMessages: Message[];
	model: string;
	models: string[];
	isPublic?: boolean | false;
}

type ChatStatus = "ready" | "submitted" | "streaming" | "error" | undefined;

export const ChatContainer = ({
	id,
	avatar,
	initialMessages,
	model,
	models,
	isPublic,
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

	console.log(isPublic);

	const handleFormSubmit = async (e: FormEvent, extra?: any) => {
		if (isPublic) return;
		e.preventDefault();

		const form = e.target as HTMLFormElement;
		const input = form.querySelector("input") as HTMLInputElement;
		const message = input.value.trim();

		if (!message) return;

		try {
			const messageData = {
				content: message,
				role: "user",
				attachment: extra?.attachmentId || undefined,
			};

			await addMessage({
				// @ts-ignore
				message: messageData,
				id: id || "",
			});

			if (extra?.messageWithAttachment) {
				await handleSubmit(e, {
					experimental_attachments: extra.experimental_attachments,
				});
			} else {
				await handleSubmit(e);
			}

			if (input) input.value = "";
			if (handleInputChange) {
				handleInputChange({ target: { value: "" } } as any);
			}
		} catch (error) {
			console.error("Error sending message:", error);
			toast.error("Failed to send message");
		}
	};

	useEffect(() => {
		if (!isInitialized && initialMessages?.length > 0) {
			setIsInitialized(true);

			const processedMessages = initialMessages.map((msg) => ({
				...msg,
			}));

			if (
				processedMessages.length === 1 &&
				processedMessages[0].role === "user" &&
				!isPublic
			) {
				const firstMessage = processedMessages[0];
				append({
					role: "user",
					content: firstMessage.content,
					id: firstMessage.id,
					attachment: firstMessage.attachment,
				} as CreateMessage);
			} else {
				setMessages(processedMessages as any);
			}
		}
	}, [initialMessages, isInitialized, append, setMessages]);

	useEffect(() => {
		if (isPublic) return;
		if (internalStatus !== "error" || status === "error") {
			setInternalStatus(status);
		}
	}, [status]);

	useEffect(() => {
		if (isPublic) return;
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
			}, 1500);

			return () => clearTimeout(timer);
		}
	}, [messages, internalStatus]);

	const handleRetry = () => {
		if (isPublic) return;
		setRetryCount((prev) => prev + 1);
		setInternalStatus("ready");

		const lastUserIndex = messages.map((m) => m.role).lastIndexOf("user");

		if (lastUserIndex !== -1) {
			const userMsg = messages[lastUserIndex];

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
			{!isPublic && (
				<div className="flex flex-col items-center justify-center">
					<ChatInput
						id={id}
						model={model}
						models={models}
						input={input}
						handleInputChange={handleInputChange}
						handleSubmit={handleFormSubmit}
						status={internalStatus}
					/>
				</div>
			)}
		</>
	);
};
