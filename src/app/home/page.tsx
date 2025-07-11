import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <div className="flex h-screen flex-col items-center justify-center text-center">
        <h1 className="font-bold text-4xl text-base-content">
          The GPT Wrapper
        </h1>
        <h1 className="mt-2 text-2xl text-base-content">for your AI</h1>
        <p className="mt-5 text-gray-500 text-sm">
          Chat with your own models. All free and opensource.
        </p>
        <div className="mt-8">
          <Link href="/chat">
            <button className={'btn btn-secondary'}>Get Started</button>
          </Link>
        </div>
      </div>
    </main>
  );
}
