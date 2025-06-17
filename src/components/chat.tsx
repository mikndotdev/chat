"use client";
import AIIcon from "@/assets/img/ai.png";
import { Message as BaseMessage } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "motion/react";
import { File } from "lucide-react";

interface Message extends BaseMessage {
	attachment?: {
		url: string;
		name?: string;
		contentType?: string;
	};
}

interface ChatProps {
	id: string;
	avatar: string;
	status?: "submitted" | "streaming" | "ready" | "error";
	msg: Message[];
	onRetry?: () => void;
}

export const ChatPage = ({ id, msg, avatar, status, onRetry }: ChatProps) => {
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({
				behavior: "smooth",
				block: "end",
			});
		}
	}, [msg, status]);

	const lastMsgId = msg.length > 0 ? msg[msg.length - 1].id : null;

	//@ts-ignore
	const renderAttachment = (attachment) => {
		if (!attachment) return null;

		if (
			attachment.url.includes(".jpg") ||
			attachment.url.includes(".png") ||
			attachment.url.includes(".jpeg")
		) {
			return (
				<div className="my-2">
					<img
						src={attachment.url}
						alt="Attachment"
						className="max-w-full max-h-64 rounded-lg"
					/>
				</div>
			);
		} else if (attachment.url.includes(".pdf")) {
			return (
				<div className="my-2 w-1/4">
					<a
						href={attachment.url}
						target="_blank"
						rel="noopener noreferrer"
						className="btn btn-sm btn-outline flex items-center gap-2"
					>
						<span>View PDF</span>
						<File className="h-4 w-4" />
					</a>
				</div>
			);
		}
		return null;
	};

	const showLoadingMessage =
		status === "submitted" &&
		(msg.length === 0 || msg[msg.length - 1].role === "user");

	const showErrorMessage = status === "error";

	const handleRetry = () => {
		if (onRetry) {
			onRetry();
		}
	};

	const isUnrespondedUserMessage =
		msg.length > 0 &&
		msg[msg.length - 1].role === "user" &&
		status === "error";

	const extractReasoning = (
		parts: any[],
	): { reasoning: string | null; cleanedParts: any[] } => {
		if (!parts || parts.length === 0)
			return { reasoning: null, cleanedParts: parts };

		const cleanedParts = [];
		let reasoning: string | null = null;

		for (const part of parts) {
			if (part.type === "text") {
				const thinkMatch = part.text.match(
					/<think>([\s\S]*?)<\/think>/,
				);

				if (thinkMatch) {
					reasoning = thinkMatch[1].trim();
					const cleanedText = part.text
						.replace(/<think>[\s\S]*?<\/think>/, "")
						.trim();
					if (cleanedText) {
						cleanedParts.push({ ...part, text: cleanedText });
					}
				} else {
					cleanedParts.push(part);
				}
			} else {
				cleanedParts.push(part);
			}
		}

		return { reasoning, cleanedParts };
	};

	return (
		<div className="flex flex-col w-full h-full overflow-y-auto">
			<div className="flex-grow p-4">
				<AnimatePresence>
					{msg.map((message) => {
						const isLast = message.id === lastMsgId;
						const { reasoning, cleanedParts } = extractReasoning(
							message.parts || [],
						);

						return (
							<motion.div
								key={message.id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.3 }}
								className="flex flex-row items-start mb-3"
							>
								<img
									src={
										message.role === "user"
											? avatar || AIIcon.src
											: isLast && status === "streaming"
												? undefined
												: AIIcon.src
									}
									alt="Avatar"
									className="w-auto h-8 rounded-full mr-3"
									style={{
										display:
											message.role !== "user" &&
											isLast &&
											status === "streaming"
												? "none"
												: undefined,
									}}
								/>
								{message.role !== "user" &&
									isLast &&
									status === "streaming" && (
										<div className="w-8 h-8 flex items-center justify-center mr-3">
											<span className="loading loading-spinner loading-lg" />
										</div>
									)}
								<div className="flex flex-col w-full">
									{reasoning && message.role !== "user" && (
										<div className="collapse collapse-arrow bg-base-100 border border-base-300 mb-2">
											<input
												type="radio"
												name={`reasoning-${message.id}`}
											/>
											<div className="collapse-title font-semibold">
												Reasoning
											</div>
											<div className="collapse-content text-sm">
												{reasoning}
											</div>
										</div>
									)}

									{(cleanedParts || []).map((part, i) => {
										switch (part.type) {
											case "text":
												return (
													<div
														key={`${message.id}-${i}`}
														className="leading-relaxed"
													>
														<ReactMarkdown
															remarkPlugins={[
																remarkGfm,
															]}
															components={{
																table: ({
																	children,
																}) => (
																	<div className="overflow-x-auto my-4">
																		<table className="table table-zebra table-bordered border-collapse border border-base-300 w-full">
																			{
																				children
																			}
																		</table>
																	</div>
																),
																thead: ({
																	children,
																}) => (
																	<thead className="bg-base-200">
																		{
																			children
																		}
																	</thead>
																),
																th: ({
																	children,
																}) => (
																	<th className="border border-base-300 px-4 py-2 text-left">
																		{
																			children
																		}
																	</th>
																),
																td: ({
																	children,
																}) => (
																	<td className="border border-base-300 px-4 py-2">
																		{
																			children
																		}
																	</td>
																),
																p: ({
																	children,
																}) => (
																	<div className="mb-2">
																		{
																			children
																		}
																	</div>
																),
																code({
																	node,
																	// @ts-ignore
																	inline,
																	className,
																	children,
																	...props
																}) {
																	const match =
																		/language-(\w+)/.exec(
																			className ||
																				"",
																		);
																	return !inline ? (
																		<SyntaxHighlighter
																			/* @ts-ignore */
																			style={
																				oneDark
																			}
																			language={
																				match?.[1] ||
																				"plaintext"
																			}
																			PreTag="div"
																			className="rounded-md my-2 p-3 bg-gray-900 text-sm"
																			{...props}
																		>
																			{String(
																				children,
																			).replace(
																				/\n$/,
																				"",
																			)}
																		</SyntaxHighlighter>
																	) : (
																		<code
																			className="bg-gray-200 rounded px-1 py-0.5"
																			{...props}
																		>
																			{
																				children
																			}
																		</code>
																	);
																},
															}}
														>
															{part.text}
														</ReactMarkdown>
													</div>
												);
											default:
												return null;
										}
									})}
									{message.experimental_attachments &&
										message.experimental_attachments[0] &&
										renderAttachment(
											message.experimental_attachments[0],
										)}
								</div>
							</motion.div>
						);
					})}

					{(showErrorMessage || isUnrespondedUserMessage) && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
							className="flex flex-row items-start mb-3"
						>
							<div className="w-8 h-8 flex items-center justify-center mr-3">
								<span className="text-error text-xl">⚠️</span>
							</div>
							<div className="flex flex-col">
								<div className="leading-relaxed text-error mb-2">
									An error occurred while generating the
									response.
								</div>
								<button
									onClick={handleRetry}
									className="btn btn-error btn-sm"
								>
									Retry
								</button>
							</div>
						</motion.div>
					)}

					{showLoadingMessage && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.3 }}
							className="flex flex-row items-start mb-3"
						>
							<div className="w-8 h-8 flex items-center justify-center mr-3">
								<span className="loading loading-dots loading-lg" />
							</div>
						</motion.div>
					)}
				</AnimatePresence>
				<div className={"mb-20"} />
				<div ref={bottomRef} />
			</div>
		</div>
	);
};
