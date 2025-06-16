"use client";
import AIIcon from "@/assets/img/ai.png";
import { Message } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion, AnimatePresence } from "motion/react";
import { useRouter } from "next/navigation";

interface ChatProps {
	id: string;
	avatar: string;
	status?: "submitted" | "streaming" | "ready" | "error";
	msg: Message[];
	onRetry?: () => void;
}

export const ChatPage = ({ id, msg, avatar, status, onRetry }: ChatProps) => {
	const bottomRef = useRef<HTMLDivElement>(null);
	const router = useRouter();

	useEffect(() => {
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({
				behavior: "smooth",
				block: "end",
			});
		}
	}, [msg, status]);

	const lastMsgId = msg.length > 0 ? msg[msg.length - 1].id : null;

	// Add loading message when submitted but not yet streaming
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

	return (
		<div>
			<div className="mb-24">
				<AnimatePresence>
					{msg.map((message) => {
						const isLast = message.id === lastMsgId;
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
								<div className="flex flex-col">
									{message?.parts?.map((part, i) => {
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
				<div ref={bottomRef} className={"mb-5"} />
			</div>
		</div>
	);
};
