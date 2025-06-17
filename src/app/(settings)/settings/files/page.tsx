import { prisma } from "@/lib/prisma";
import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";

import { redirect } from "next/navigation";
import Link from "next/link";

import { Image, Download } from "lucide-react";

type Attachment = {
	id: string;
	userId: string;
	url: string;
	createdAt: Date;
	chatId: string;
	fileType?: string;
};

type File = {
	id: string;
	userId: string;
	url: string;
	createdAt: Date;
	chatId?: string;
	name?: string;
	description?: string | null;
	fileType?: string;
};

export default async function Home() {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		await redirect("/login");
	}

	type AttachmentWithFileType = Attachment & { fileType: string };
	type FileWithFileType = File & { fileType: string };

	let attachments: Attachment[] = await prisma.attachment.findMany({
		where: { userId: claims?.sub },
		orderBy: { createdAt: "desc" },
	});

	let files: File[] = await prisma.file.findMany({
		where: { userId: claims?.sub },
		orderBy: { createdAt: "desc" },
	});

	const attachmentsWithFileType: AttachmentWithFileType[] = attachments.map(
		(attachment) => ({
			...attachment,
			fileType: attachment.url.split(".").pop() || "unknown",
		}),
	);

	const filesWithFileType: FileWithFileType[] = files.map((file) => ({
		...file,
		fileType: file.url.split(".").pop() || "unknown",
	}));

	return (
		<div className="container mx-auto p-4">
			<h1 className={"text-base-content text-4xl"}>Files</h1>
			<h2 className={"text-base-content text-xl mt-5 mb-2"}>
				Attachments
			</h2>
			<div className="grid gap-2 grid-cols-4">
				{attachmentsWithFileType.map((attachment) => (
					<div
						key={attachment.id}
						className="card bg-base-200 shadow-xl items-center p-4"
					>
						{attachment.fileType === "jpg" ||
						attachment.fileType === "png" ||
						attachment.fileType === "jpeg" ? (
							<img
								src={attachment.url}
								alt={attachment.url}
								className="w-full h-32 object-cover mb-2"
							/>
						) : (
							<div className="w-full h-32 bg-gray-200 flex items-center justify-center mb-2">
								<span className="text-gray-500">
									Preview unavailable
								</span>
							</div>
						)}
						<p className="text-sm text-base-content/50 text-center">
							Uploaded at:{" "}
							{new Date(attachment.createdAt).toLocaleString()}
						</p>
						<p className="text-sm text-base-content/70 text-center">
							File Type: {attachment.fileType}
						</p>
						<a
							href={attachment.url}
							target="_blank"
							rel="noopener noreferrer"
						>
							<div className="flex items-center justify-center mt-2">
								<button className="btn btn-primary">
									{attachment.fileType === "jpg" ||
									attachment.fileType === "png" ||
									attachment.fileType === "jpeg" ? (
										<Image className="mr-2" />
									) : (
										<Download className="mr-2" />
									)}
									Download
								</button>
								<Link
									href={`/chat/${attachment.chatId}`}
									className="ml-2 btn btn-secondary"
								>
									View Chat
								</Link>
							</div>
						</a>
					</div>
				))}
				{attachments.length === 0 && (
					<p className="text-base-content/70">
						No attachments found.
					</p>
				)}
			</div>
			<h2 className={"text-base-content text-xl mt-5 mb-2"} id={"files"}>
				Files
			</h2>
			<div className="grid gap-2 grid-cols-3">
				{filesWithFileType.map((file) => (
					<div
						key={file.id}
						className="card bg-base-200 shadow-xl items-center p-4"
					>
						{file.fileType === "jpg" ||
						file.fileType === "png" ||
						file.fileType === "jpeg" ? (
							<img
								src={file.url}
								alt={file.name || file.url}
								className="w-full h-64 object-cover mb-2"
							/>
						) : (
							<div className="w-full h-32 bg-gray-200 flex items-center justify-center mb-2">
								<span className="text-gray-500">
									Preview unavailable
								</span>
							</div>
						)}
						<p className="text-sm text-base-content/50 text-center">
							Uploaded at:{" "}
							{new Date(file.createdAt).toLocaleString()}
						</p>
						<p className="text-sm text-base-content/70 text-center">
							{file.description}
						</p>
						<a
							href={file.url}
							target="_blank"
							rel="noopener noreferrer"
						>
							<div className="flex items-center justify-center mt-2">
								<button className="btn btn-primary">
									{file.fileType === "jpg" ||
									file.fileType === "png" ||
									file.fileType === "jpeg" ? (
										<Image className="mr-2" />
									) : (
										<Download className="mr-2" />
									)}
									Download
								</button>
								{file.chatId && (
									<Link
										href={`/chat/${file.chatId}`}
										className="ml-2 btn btn-secondary"
									>
										View Chat
									</Link>
								)}
							</div>
						</a>
					</div>
				))}
				{files.length === 0 && (
					<p className="text-base-content/70">No files found.</p>
				)}
			</div>
		</div>
	);
}
