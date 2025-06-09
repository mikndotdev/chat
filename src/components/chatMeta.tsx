"use client";
import React from "react";

export function ChatMeta({ createdAt }: { createdAt: string }) {
	const localTime = new Date(createdAt).toLocaleString();
	return (
		<p>
			<strong>Created At:</strong> {localTime}
		</p>
	);
}
