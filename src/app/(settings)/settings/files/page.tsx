import { getLogtoContext } from '@logto/next/server-actions';
import { Download, Image } from 'lucide-react';
import Link from 'next/link';

import { redirect } from 'next/navigation';
import { logtoConfig } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

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
    await redirect('/login');
  }

  type AttachmentWithFileType = Attachment & { fileType: string };
  type FileWithFileType = File & { fileType: string };

  const attachments: Attachment[] = await prisma.attachment.findMany({
    where: { userId: claims?.sub },
    orderBy: { createdAt: 'desc' },
  });

  const files: File[] = await prisma.file.findMany({
    where: { userId: claims?.sub },
    orderBy: { createdAt: 'desc' },
  });

  const attachmentsWithFileType: AttachmentWithFileType[] = attachments.map(
    (attachment) => ({
      ...attachment,
      fileType: attachment.url.split('.').pop() || 'unknown',
    })
  );

  const filesWithFileType: FileWithFileType[] = files.map((file) => ({
    ...file,
    fileType: file.url.split('.').pop() || 'unknown',
  }));

  return (
    <div className="container mx-auto p-4">
      <h1 className={'text-4xl text-base-content'}>Files</h1>
      <h2 className={'mt-5 mb-2 text-base-content text-xl'}>Attachments</h2>
      <div className="grid grid-cols-4 gap-2">
        {attachmentsWithFileType.map((attachment) => (
          <div
            className="card items-center bg-base-200 p-4 shadow-xl"
            key={attachment.id}
          >
            {attachment.fileType === 'jpg' ||
            attachment.fileType === 'png' ||
            attachment.fileType === 'jpeg' ? (
              <img
                alt={attachment.url}
                className="mb-2 h-32 w-full object-cover"
                src={attachment.url}
              />
            ) : (
              <div className="mb-2 flex h-32 w-full items-center justify-center bg-gray-200">
                <span className="text-gray-500">Preview unavailable</span>
              </div>
            )}
            <p className="text-center text-base-content/50 text-sm">
              Uploaded at: {new Date(attachment.createdAt).toLocaleString()}
            </p>
            <p className="text-center text-base-content/70 text-sm">
              File Type: {attachment.fileType}
            </p>
            <a href={attachment.url} rel="noopener noreferrer" target="_blank">
              <div className="mt-2 flex items-center justify-center">
                <button className="btn btn-primary">
                  {attachment.fileType === 'jpg' ||
                  attachment.fileType === 'png' ||
                  attachment.fileType === 'jpeg' ? (
                    <Image className="mr-2" />
                  ) : (
                    <Download className="mr-2" />
                  )}
                  Download
                </button>
                <Link
                  className="btn btn-secondary ml-2"
                  href={`/chat/${attachment.chatId}`}
                >
                  View Chat
                </Link>
              </div>
            </a>
          </div>
        ))}
        {attachments.length === 0 && (
          <p className="text-base-content/70">No attachments found.</p>
        )}
      </div>
      <h2 className={'mt-5 mb-2 text-base-content text-xl'} id={'files'}>
        Files
      </h2>
      <div className="grid grid-cols-3 gap-2">
        {filesWithFileType.map((file) => (
          <div
            className="card items-center bg-base-200 p-4 shadow-xl"
            key={file.id}
          >
            {file.fileType === 'jpg' ||
            file.fileType === 'png' ||
            file.fileType === 'jpeg' ? (
              <img
                alt={file.name || file.url}
                className="mb-2 h-64 w-full object-cover"
                src={file.url}
              />
            ) : (
              <div className="mb-2 flex h-32 w-full items-center justify-center bg-gray-200">
                <span className="text-gray-500">Preview unavailable</span>
              </div>
            )}
            <p className="text-center text-base-content/50 text-sm">
              Uploaded at: {new Date(file.createdAt).toLocaleString()}
            </p>
            <p className="text-center text-base-content/70 text-sm">
              {file.description}
            </p>
            <a href={file.url} rel="noopener noreferrer" target="_blank">
              <div className="mt-2 flex items-center justify-center">
                <button className="btn btn-primary">
                  {file.fileType === 'jpg' ||
                  file.fileType === 'png' ||
                  file.fileType === 'jpeg' ? (
                    <Image className="mr-2" />
                  ) : (
                    <Download className="mr-2" />
                  )}
                  Download
                </button>
                {file.chatId && (
                  <Link
                    className="btn btn-secondary ml-2"
                    href={`/chat/${file.chatId}`}
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
