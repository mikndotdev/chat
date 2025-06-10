"use client";

import { useState } from "react";
import { toast } from "sonner";

import { setApiKey, deleteApiKey } from "@/actions/apikey";

import { X } from "lucide-react";

interface ModelCardProps {
	id: string;
	name: string;
	description: string;
	icon: string;
	configured: boolean;
	apiKey?: string;
}

export const ModelCard = ({
	id,
	name,
	description,
	icon,
	configured,
	apiKey,
}: ModelCardProps) => {
	const [key, setKey] = useState(apiKey || "");
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const [configuredState, setConfiguredState] = useState(configured);

	const set = async (id: string) => {
		try {
			console.log(id, key);
			await setApiKey({ provider: id, key });
			toast.success(`API Key for ${name} set successfully!`);
			setConfiguredState(true);
			setOpen(false);
		} catch (error) {
			toast.error(`Failed to set API Key. Please try again.`);
		}
	};

	const remove = async (id: string) => {
		try {
			await deleteApiKey(id);
			toast.success(`API Key for ${name} removed successfully!`);
			setConfiguredState(false);
			setOpen(false);
		} catch (error) {
			toast.error(`Failed to remove API Key. Please try again.`);
		}
	};

	return (
		<div
			key={name}
			className="card bg-base-200 shadow-xl flex-row items-center p-4"
		>
			<dialog
				className={"modal"}
				open={open}
				onClose={() => setOpen(false)}
			>
				<div className="modal-box">
					<h3 className="font-bold text-lg">API Key for {name}</h3>
					<p className="py-4">
						Please enter your API key for {name} to configure the
						model.
					</p>
					<input
						type="text"
						value={key}
						onChange={(e) => setKey(e.target.value)}
						className="input input-bordered w-full"
						placeholder="Enter API Key"
					/>
					<div className="modal-action justify-center">
						<button
							className="btn"
							disabled={loading || !key}
							onClick={() => {
								set(id);
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
			<div className="mr-4">
				<div className="max-w-12">
					<img src={icon} alt={name} className={"rounded-full"} />
				</div>
			</div>
			<div>
				<h2 className="card-title text-base-content">{name}</h2>
				<p className="text-base-content/70">{description}</p>
			</div>
			<div className="ml-auto mr-2">
				{configuredState ? (
					<>
						<button
							className="btn btn-sm btn-ghost mr-2"
							onClick={() => remove(id)}
						>
							<X className="h-8 w-8" />
						</button>
						<span
							className="badge badge-success"
							onClick={() => setOpen(!open)}
						>
							Configured
						</span>
					</>
				) : (
					<span
						className="badge badge-error"
						onClick={() => setOpen(!open)}
					>
						Not Configured
					</span>
				)}
			</div>
		</div>
	);
};
