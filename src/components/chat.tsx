"use client";
import AIIcon from "@/assets/img/ai.png";
import { Message } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useRef } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface ChatProps {
	id: string;
	avatar: string;
	status?: "submitted" | "streaming" | "ready" | "error";
	msg: Message[];
}

export const ChatPage = ({ id, msg, avatar, status }: ChatProps) => {
	const bottomRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [msg, status]);

	const lastMsgId = msg.length > 0 ? msg[msg.length - 1].id : null;

	return (
		<div>
			<div className="mb-24">
				{msg.map((message, idx) => {
					const isLast = message.id === lastMsgId;
					return (
						<div key={message.id} className="flex flex-row items-start mb-3">
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
										message.role !== "user" && isLast && status === "streaming"
											? "none"
											: undefined,
								}}
							/>
							{message.role !== "user" && isLast && status === "streaming" && (
								<div className="w-8 h-8 flex items-center justify-center mr-3">
									<span className="loading loading-spinner loading-lg" />
								</div>
							)}
							<div className="flex flex-col">
								{message?.parts?.map((part, i) => {
									switch (part.type) {
										case "text":
											return (
												<div key={`${message.id}-${i}`} className="leading-relaxed">
													<ReactMarkdown
														remarkPlugins={[remarkGfm]}
														components={{
															p: ({ children }) => <div className="mb-2">{children}</div>,
															code({
																	 node,
																	 // @ts-ignore
																	 inline,
																	 className,
																	 children,
																	 ...props
																 }) {
																const match = /language-(\w+)/.exec(className || "");
																return !inline ? (
																	<SyntaxHighlighter
																		/* @ts-ignore */
																		style={oneDark}
																		language={match?.[1] || "plaintext"}
																		PreTag="div"
																		className="rounded-md my-2 p-3 bg-gray-900 text-sm"
																		{...props}
																	>
																		{String(children).replace(/\n$/, "")}
																	</SyntaxHighlighter>
																) : (
																	<code className="bg-gray-200 rounded px-1 py-0.5" {...props}>
																		{children}
																	</code>
																);
															},
														}}
													>
														{part.text}
													</ReactMarkdown>
												</div>
											);
									}
								})}
							</div>
						</div>
					);
				})}
				<div ref={bottomRef} />
			</div>
		</div>
	);
};