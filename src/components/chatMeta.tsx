"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Edit } from "lucide-react";

import { renameChat } from "@/actions/settings";

export function ChatMeta({
	createdAt,
	model,
	title,
	id,
}: { createdAt: string; model: string; title: string; id: string }) {
	const localTime = new Date(createdAt).toLocaleString();
	const [name, setName] = useState(title);
	const [input, setInput] = useState("");
	const [open, setOpen] = useState(false);

	const handleRename = async () => {
		if (!input) {
			toast.error("Please enter a new name for the chat.");
			return;
		}
		try {
			await renameChat(input, id);
			setName(input);
			setInput("");
			setOpen(false);
			toast.success("Chat renamed successfully!");
		} catch (error) {
			toast.error("Failed to rename chat. Please try again.");
		}
		setOpen(false);
		setInput("");
	}

	return (
		<>
			<dialog
				className={"modal"}
				open={open}
				onClose={() => setOpen(false)}
			>
				<div className="modal-box">
					<h3 className="font-bold text-lg">
						Rename Chat
					</h3>
					<p className="py-4">
						Please enter a new name for your chat.
					</p>
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						className="input input-bordered w-full"
					/>
					<div className="modal-action justify-center">
						<button
							className="btn"
							disabled={!input}
							onClick={() => {
								handleRename();
							}}
						>
							Save
						</button>
						<button
							className="btn btn-primary"
							onClick={() => setOpen(false)}
						>
							Close
						</button>
					</div>
				</div>
			</dialog>
			<div className={"flex flex-row items-center mb-2"}>
			<h1 className="text-2xl font-bold">{name}</h1>
			<button
				className="btn btn-ghost btn-sm ml-2"
				onClick={() => {
					setOpen(true);
				}}
			>
				<Edit className="h-4 w-4" />
			</button>
			</div>
			<div className="mb-4">
				<p>
					<strong>Model:</strong> {model}
				</p>
				<p>
					<strong>Created At:</strong> {localTime}
				</p>
			</div>
		</>
	);
}
