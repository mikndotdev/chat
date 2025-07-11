import { getLogtoContext } from '@logto/next/server-actions';
import { redirect } from 'next/navigation';
import { logtoConfig } from '@/lib/auth';

export async function GET() {
  const { claims } = await getLogtoContext(logtoConfig);

  if (!claims) {
    return redirect('/home');
  }
  return redirect('/chat');
}
