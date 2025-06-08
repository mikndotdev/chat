"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Send, Paperclip, ChevronDown, Bot } from "lucide-react";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { startChat, addMessage } from "@/actions/chat";

interface ChatInputProps {
	id?: string;
	model?: string;
	models?: {
		name: string;
		id: string;
		icon: string;
		provider: string;
	}[];
	input?: string;
	handleInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleSubmit?: (e: FormEvent) => void;
}

export const ChatInput = ({
	models,
	id,
	model,
	input,
	handleInputChange,
	handleSubmit,
}: ChatInputProps) => {
	const pathname = usePathname();
	const router = useRouter();
	const [selectedModel, setSelectedModel] = useState(model);
	const [open, setOpen] = useState(false);

	const chatId = pathname.startsWith("/chat/")
		? pathname.split("/chat/")[1]?.split("/")[0]
		: null;
	const isInChat = Boolean(chatId);

	const sendMessage = async (e: FormEvent) => {
		const inputEl = e.currentTarget.querySelector("input");
		if (!inputEl || !selectedModel) return;
		e.preventDefault();
		const message = inputEl.value.trim();
		if (!isInChat) {
			const chat = await startChat({
				model: selectedModel,
				message,
			});
			console.log("chat", chat);
			await router.push(`/chat/${chat.id}`);
		} else {
			if (isInChat) {
				addMessage({
					message: { content: message, role: "user" },
					id: chatId!,
				});
				if (handleSubmit) {
					handleSubmit(e);
				}
			}
		}
	};

	return (
		<div className="flex items-center justify-center p-4 bg-neutral rounded-lg fixed bottom-5 w-full max-w-10/13 shadow-lg">
			<dialog className={"modal"} open={open}>
				{models && models.length > 0 ? (
					<div className="modal-box">
						<h3 className="font-bold text-lg">Select a Model</h3>
						<div className="py-4">
							{models.map((model) => (
								<button
									key={model.id}
									className={`btn btn-secondary w-full mb-2 flex items-center justify-start gap-3 ${selectedModel === model.name ? "btn-active" : ""}`}
									onClick={() => {
										setSelectedModel(model.name);
										setOpen(false);
									}}
								>
									<img
										src={model.icon}
										alt={model.provider}
										className="w-6 h-6 rounded-full"
									/>
									<span>
										{model.provider} {model.name}
									</span>
								</button>
							))}
						</div>
						<div className="modal-action">
							<button
								className="btn"
								onClick={() => setOpen(false)}
							>
								Close
							</button>
						</div>
					</div>
				) : (
					<div className="modal-box">
						<h3 className="font-bold text-lg">
							No Models Available
						</h3>
						<p>
							<Link
								href="/settings/models"
								className="text-blue-500 hover:underline"
							>
								Add a model
							</Link>
							&nbsp;to start chatting.
						</p>
						<div className="modal-action">
							<button
								className="btn"
								onClick={() => setOpen(false)}
							>
								Close
							</button>
						</div>
					</div>
				)}
			</dialog>
			<div className="flex flex-row items-center space-x-3 w-full">
				<Paperclip className="text-gray-400" />
				<form
					className={"flex flex-row items-center space-x-3 w-full"}
					onSubmit={sendMessage}
				>
					<input
						type="text"
						placeholder={
							selectedModel
								? `Chatting with ${selectedModel}`
								: "Select a model to start chatting..."
						}
						value={input}
						onChange={handleInputChange}
						className="input w-full"
						disabled={!selectedModel}
					/>
					{!model && (
						<button
							className="btn btn-secondary"
							onClick={() => setOpen(!open)}
							type="button"
						>
							<Bot className="text-white" />
						</button>
					)}
					<button className="btn btn-secondary" type="submit">
						<Send className="text-white" />
					</button>
				</form>
			</div>
		</div>
	);
};
