"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Send, Paperclip, Bot, X } from "lucide-react";
import { useState, FormEvent } from "react";
import { toast } from "sonner";
import { startChat, addMessage } from "@/actions/chat";
import { addAttachment } from "@/actions/upload";
import { Attachment } from "@ai-sdk/ui-utils";

interface ChatInputProps {
	id?: string;
	model?: string;
	status?: "submitted" | "streaming" | "ready" | "error";
	models?: any[];
	customModels?: any[];
	openRouterModels?: any[];
	openRouterEnabled?: boolean;
	input?: string;
	handleInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
	handleSubmit?: (e: FormEvent, extra?: any) => void;
}

export const ChatInput = ({
	models,
	id,
	model,
	input,
	handleInputChange,
	handleSubmit,
	status,
	openRouterModels,
	openRouterEnabled,
}: ChatInputProps) => {
	const pathname = usePathname();
	const router = useRouter();
	const [selectedModel, setSelectedModel] = useState(model);
	const [modelType, setModelType] = useState("");
	const [attachment, setAttachment] = useState<File | null>(null);
	const [attachmentId, setAttachmentId] = useState<string | null>(null);
	const [attachmentUrl, setAttachmentUrl] = useState("");
	const [uploading, setUploading] = useState(false);
	const [open, setOpen] = useState(false);
	const [tab, setTab] = useState("providers");

	const chatId = pathname.startsWith("/chat/")
		? pathname.split("/chat/")[1]?.split("/")[0]
		: null;
	const isInChat = Boolean(chatId);

	const selectedModelObj = models?.find((m) => m.id === model);

	const sendMessage = async (e: FormEvent) => {
		e.preventDefault();
		const inputEl = e.currentTarget.querySelector("input");
		if (!inputEl || !selectedModel) return;
		const message = inputEl.value.trim();
		if (!message) {
			return;
		}

		try {
			if (!isInChat) {
				if (!message) {
					toast.error(
						"Please enter a message before starting a chat.",
					);
					return;
				}

				const chat = await startChat({
					model: selectedModel,
					type: modelType || "provider",
					message,
				});

				inputEl.value = "";
				if (handleInputChange) {
					handleInputChange({ target: { value: "" } } as any);
				}

				router.push(`/chat/${chat.id}`);
			} else {
				if (attachment) {
					if (handleSubmit) {
						const attachmentData = {
							url: attachmentUrl,
							name: attachment.name,
							contentType: attachment.type,
						};

						const messageWithAttachment = {
							content: message,
							role: "user" as const,
							id: Date.now().toString(),
							attachment: attachmentData,
						};

						handleSubmit(e, {
							experimental_attachments: [
								{
									name: attachment.name,
									contentType: attachment.type,
									url: attachmentUrl,
								},
							] as Attachment[],
							messageWithAttachment,
							attachmentId,
						});
					}
					setAttachment(null);
				} else {
					if (handleSubmit) {
						const regularMessage = {
							content: message,
							role: "user" as const,
							id: Date.now().toString(),
						};

						handleSubmit(e, {
							messageWithAttachment: regularMessage,
						});
					}
				}

				inputEl.value = "";
				if (handleInputChange) {
					handleInputChange({ target: { value: "" } } as any);
				}
			}
		} catch (error) {
			console.error("Error sending message:", error);
			toast.error("Failed to send message.");
		}
	};

	return (
		<div className="flex items-center justify-center p-4 bg-neutral rounded-lg fixed bottom-5 w-full max-w-10/13 shadow-lg">
			<dialog className={"modal"} open={open}>
				{models && models.length > 0 ? (
					<div className="modal-box min-w-1/2 max-w-1/2 max-h-3/4 overflow-y-auto">
						<h3 className="font-bold text-lg text-center">
							Select a Model
						</h3>
						<div
							role="tablist"
							className="tabs tabs-border justify-center"
						>
							<a
								role="tab"
								className={`tab ${tab === "providers" ? "tab-active" : ""}`}
								onClick={() => setTab("providers")}
							>
								Model Providers
							</a>
							<a
								role="tab"
								className={`tab ${tab === "openrouter" ? "tab-active" : ""}`}
								onClick={() => setTab("openrouter")}
							>
								OpenRouter
							</a>
							<a
								role="tab"
								className={`tab ${tab === "ollama" ? "tab-active" : ""}`}
								onClick={() => setTab("ollama")}
							>
								Custom Providers
							</a>
						</div>
						<div className="py-4">
							<div className="grid grid-cols-2 gap-2">
								{tab === "providers" &&
									models &&
									models.map((model) => (
										<div
											key={model.id}
											className={`card bg-primary w-full flex items-center justify-start gap-3 ${selectedModel === model.name ? "btn-active" : ""}`}
											onClick={() => {
												setSelectedModel(model.name);
												setModelType("provider");
												setOpen(false);
											}}
										>
											<div
												className={
													"card-body p-3 justify-left w-full"
												}
											>
												<div
													className={
														"card-title flex flex-row justify-center items-center space-x-2"
													}
												>
													<img
														src={model.icon}
														alt={model.provider}
														className="w-8 h-8 rounded-full"
													/>
													<span
														className={
															"font-semibold text-md text-base-content"
														}
													>
														{model.providerName}{" "}
														{model.name}
													</span>
												</div>
												<p
													className={
														"text-sm text-primary-content"
													}
												>
													{model.description}
												</p>
											</div>
											<div className="card-actions justify-center mb-4 space-x-2">
												{model.freeTier && (
													<span className="badge badge-success">
														Offers free tier
													</span>
												)}
												{model.experimental && (
													<span className="badge badge-warning">
														Experimental
													</span>
												)}
											</div>
										</div>
									))}
								{tab === "openrouter" && (
									<div className="col-span-2 flex flex-col items-center justify-center py-8">
										{openRouterEnabled ? (
											<>
												{openRouterModels &&
												openRouterModels.length > 0 ? (
													<div className="grid grid-cols-2 gap-2 w-full">
														{openRouterModels.map(
															(model) => (
																<div
																	key={
																		model.id
																	}
																	className={`card bg-primary w-full flex items-center justify-start gap-3 ${selectedModel === model.name ? "btn-active" : ""}`}
																	onClick={() => {
																		setSelectedModel(
																			model.name,
																		);
																		setModelType(
																			"openrouter",
																		);
																		setOpen(
																			false,
																		);
																	}}
																>
																	<div
																		className={
																			"card-body p-3 justify-left w-full"
																		}
																	>
																		<div
																			className={
																				"card-title flex flex-row justify-center items-center space-x-2"
																			}
																		>
																			<span
																				className={
																					"font-semibold text-md text-base-content"
																				}
																			>
																				{
																					model.name
																				}
																			</span>
																		</div>
																	</div>
																</div>
															),
														)}
													</div>
												) : (
													<span className="text-base-content/70">
														no models available.
													</span>
												)}
											</>
										) : (
											<span className="text-base-content/70">
												OpenRouter is not configured.
												Please add your OpenRouter API
												key in settings.
											</span>
										)}
									</div>
								)}
								{tab === "ollama" && (
									<div className="col-span-2 flex flex-col items-center justify-center py-8">
										<span className="text-base-content/70">
											Custom providers coming soon.
										</span>
									</div>
								)}
							</div>
						</div>
						<div className="modal-action justify-center">
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
				{isInChat &&
					selectedModelObj?.supports_attachment &&
					(attachment && !uploading ? (
						<div className="flex items-center space-x-2">
							{attachment.type.startsWith("image/") ? (
								<img
									src={attachmentUrl}
									alt="Attachment"
									className="w-12 h-12 rounded-lg object-cover"
								/>
							) : attachment.type.startsWith(
									"application/pdf",
								) ? (
								<div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded-lg">
									<span className="text-gray-500">PDF</span>
								</div>
							) : null}
							<X onClick={() => setAttachment(null)} />
						</div>
					) : uploading ? (
						<span className="loading loading-spinner loading-lg" />
					) : (
						<button
							className="btn btn-ghost"
							onClick={() => {
								const input = document.createElement("input");
								input.type = "file";
								input.accept =
									"image/png, image/jpeg, application/pdf";
								input.onchange = async (e) => {
									const file = (e.target as HTMLInputElement)
										.files?.[0];
									if (file) {
										if (file.size > 8 * 1024 * 1024) {
											return toast.error(
												"File size exceeds 8MB limit.",
											);
										}
										setAttachment(file);
										if (chatId) {
											setUploading(true);
											const formData = new FormData();
											formData.append("file", file);
											const upload = await addAttachment(
												formData,
												chatId,
											);
											setAttachmentUrl(upload.url);
											setAttachmentId(upload.id);
											setUploading(false);
											toast.success(
												"Attachment added successfully!",
											);
										} else {
											setAttachment(null);
											toast.error(
												"Please start a chat first.",
											);
										}
									}
								};
								input.click();
							}}
						>
							<Paperclip />
						</button>
					))}
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
							className="btn btn-primary"
							onClick={() => setOpen(!open)}
							type="button"
						>
							<Bot className="text-white" />
						</button>
					)}
					<button
						className="btn btn-primary"
						type="submit"
						disabled={
							(status !== "ready" && status !== "error") ||
							uploading
						}
					>
						<Send className="text-white" />
					</button>
				</form>
			</div>
		</div>
	);
};
