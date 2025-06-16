"use client";
import { useState } from "react";
export function ChatMeta({
	createdAt,
	model,
	title,
}: { createdAt: string; model: string; title: string; id: string }) {
	const localTime = new Date(createdAt).toLocaleString();
	const [name, setName] = useState(title);
	return (
		<>
			<h1 className="text-2xl font-bold mb-2">{name}</h1>
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
