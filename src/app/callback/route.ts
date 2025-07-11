import { handleSignIn } from '@logto/next/server-actions';
import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { logtoConfig } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  await handleSignIn(logtoConfig, searchParams);

  redirect('/');
}
