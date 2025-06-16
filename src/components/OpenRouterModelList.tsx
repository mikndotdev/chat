"use client";

import { useState, useEffect } from "react";
import { PlusCircle } from "lucide-react";

import { getModel, addModel, deleteModel } from "@/actions/openrouter";
import { toast } from "sonner";
import { X } from "lucide-react";

interface OpenRouterModel {
	id: string;
	name: string | null;
	description?: string;
}

interface OpenRouterModelListProps {
	models: OpenRouterModel[];
}

export const OpenRouterModelList = ({ models }: OpenRouterModelListProps) => {
	const [name, setName] = useState("");
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [modelInfo, setModelInfo] = useState<unknown>(null);
	const [modelsList, setModelsList] = useState<OpenRouterModel[]>(
		models || [],
	);

	const removeModel = async (id: string) => {
		try {
			await deleteModel(id);
			setModelsList((prev) => prev.filter((model) => model.id !== id));
			toast.success("Model removed successfully!");
		} catch (error) {
			toast.error("Failed to remove model. Please try again.");
		}
	};

	const add = async () => {
		if (!name) return;
		try {
			await addModel(name);
			setName("");
			setModelInfo(null);
			setOpen(false);
			toast.success("Model added successfully!");
			const updatedModels = await getModel(name);
			// @ts-ignore
			if (updatedModels && updatedModels.data.name) {
				setModelsList((prev) => [
					...prev,
					{
						// @ts-ignore
						id: updatedModels.data.id,
						// @ts-ignore
						name: updatedModels.data.name,
						// @ts-ignore
						description: updatedModels.data.description,
					},
				]);
			}
		} catch (error) {
			toast.error("Failed to add model. Please try again.");
		}
	};

	useEffect(() => {
		if (!name) {
			setModelInfo(null);
			return;
		}

		setLoading(true);
		const handler = setTimeout(() => {
			(async () => {
				try {
					const model = await getModel(name);
					//@ts-ignore
					if (model && model.data.name) {
						setModelInfo(model);
					} else {
						setModelInfo(null);
					}
				} catch (err) {
					setModelInfo(null);
				} finally {
					setLoading(false);
				}
			})();
		}, 500);

		return () => {
			clearTimeout(handler);
			setLoading(false);
		};
	}, [name, modelsList]);

	return (
		<div className="space-y-2">
			<dialog
				className={"modal"}
				open={open}
				onClose={() => setOpen(false)}
			>
				<div className="modal-box">
					<h3 className="font-bold text-lg">Add OpenRouter model</h3>
					<p className="py-4">Model name</p>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className="input input-bordered w-full"
						placeholder="openai/gpt-4.1"
					/>
					<div className="card bg-base-200 shadow flex p-4 mt-4">
						{loading ? (
							<div className="flex flex-col items-center justify-center">
								<span className="loading loading-spinner text-center" />
							</div>
							/* @ts-ignore */
						) : modelInfo && modelInfo.data.name ? (
							<div className="w-full">
								<h3 className="font-bold mb-2">
									{/* @ts-ignore */}
									{modelInfo.data.name}
								</h3>
								{/* @ts-ignore */}
								{modelInfo.data.description && (
									<p className="text-sm text-base-content/70">
										{/* @ts-ignore */}
										{modelInfo.data.description}
									</p>
								)}
							</div>
						) : (
							<p className="text-sm text-base-content/70">
								Type a model name to see details.
							</p>
						)}
					</div>
					<div className="modal-action justify-center">
						<button
							className="btn"
							disabled={loading || !name}
							onClick={() => {
								add();
							}}
						>
							Add
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
			{modelsList.map((model) => (
				<div
					key={model.id}
					className="card bg-base-200 shadow flex flex-row items-center p-4"
				>
					<div>
						<h3 className="font-bold">{model.name}</h3>
						{model.description && (
							<p className="text-sm text-base-content/70">
								{model.description}
							</p>
						)}
					</div>
					<div className="ml-auto mr-2">
						<button
							className="btn btn-sm btn-ghost"
							onClick={() => {
								removeModel(model.id);
							}}
						>
							<X />
						</button>
					</div>
				</div>
			))}
			<div
				className="card bg-base-200 shadow flex flex-row justify-center items-center p-4 gap-2"
				onClick={() => setOpen(true)}
			>
				<PlusCircle className="w-6 h-6 text-base-content" />
				<h3 className="card-title text-base-content">Add a model</h3>
			</div>
		</div>
	);
};
