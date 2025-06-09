"use server";

import { getLogtoContext } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const client = new S3Client({
    region: process.env.S3_REGION,
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    },
});

export async function addAttachment(data: FormData, chatId: string) {
    const { claims } = await getLogtoContext(logtoConfig);

    if (!claims) {
        throw new Error("User not authenticated");
    }

    const file = data.get("file") as File;

    if (!file) {
        throw new Error("No file provided");
    }

    if (file.size > 8 * 1024 * 1024) {
        throw new Error("File size exceeds the limit of 8MB");
    }

    const name = file.name.replace(/[^a-zA-Z0-9._-]/g, "_"); // Sanitize file name

    const key = `${process.env.S3_UPLOAD_DIR}/${claims.sub}/${chatId}/${name}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type,
    });

    await client.send(command);

    const url = `${process.env.S3_PUBLIC_URL}/${key}`;

    await prisma.attachment.create({
        data: {
            url: url,
            chat: { connect: { id: chatId } },
            User: { connect: { id: claims.sub } },
        },
    });

    return { key, url };
}