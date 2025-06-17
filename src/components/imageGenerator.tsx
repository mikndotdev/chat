"use client";
import { useState } from "react";
import { generateImages } from "@/actions/image";
import { toast } from "sonner";

export const ImageGenerator = ({ models }: { models: any[] }) => {
	const [selectedModel, setSelectedModel] = useState(models[0]?.id || "");
	const [prompt, setPrompt] = useState("");
	const [count, setCount] = useState(1);
	const [loading, setLoading] = useState(false);
	const [images, setImages] = useState<string[]>([]);

	const handleGenerate = async () => {
		if (!prompt || !selectedModel) {
			toast.error("Please enter a prompt and select a model.");
			return;
		}
		setImages([]);
		setLoading(true);
		try {
			const generatedImages = await generateImages({
				model: selectedModel,
				prompt,
				count,
			});
			setImages(generatedImages.map((image: any) => image.url));
		} catch (error) {
			toast.error("Failed to generate images. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="card bg-base-200 shadow-xl flex flex-col justify-center items-center p-4 gap-2 w-full mt-5 min-h-1/3">
				<textarea
					className={"textarea w-full h-full"}
					value={prompt}
					onChange={(e) => setPrompt(e.target.value)}
					placeholder="Enter your prompt here"
				/>
				<div
					className={
						"flex flex-row justify-between items-center w-full"
					}
				>
					<div className={"flex flex-row items-center gap-2"}>
						<select
							value={selectedModel}
							onChange={(e) => setSelectedModel(e.target.value)}
							className={"select"}
						>
							{models.map((model) => (
								<option key={model.id} value={model.id}>
									{model.name}
								</option>
							))}
						</select>
						<input
							type="number"
							value={count}
							onChange={(e) => setCount(Number(e.target.value))}
							className={"input w-24"}
							min={1}
							max={9}
							placeholder="Count"
						/>
					</div>
					<button
						className={"btn btn-secondary"}
						disabled={loading || !prompt}
						onClick={handleGenerate}
					>
						{loading && (
							<span className="loading loading-spinner loading-sm mr-2" />
						)}
						Generate
					</button>
				</div>
			</div>
			<div className="card bg-base-200 shadow-xl flex flex-col justify-center items-center p-4 gap-2 w-full mt-5">
				{loading ? (
					<div className="flex flex-col items-center justify-center">
						<span className="loading loading-spinner text-center" />
					</div>
				) : images.length > 0 ? (
					<div className="grid grid-cols-3 gap-4 w-full">
						{images.map((image, index) => (
							<div
								key={index}
								className="card bg-base-100 shadow-xl"
							>
								<div className={"card-body"}>
									<img
										src={image}
										alt={`Generated image ${index + 1}`}
										className={"w-full h-auto"}
									/>
								</div>
							</div>
						))}
					</div>
				) : (
					<p className="text-sm text-base-content/70">
						Type a prompt and select a model to generate images.
					</p>
				)}
			</div>
		</>
	);
};
