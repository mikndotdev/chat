import Link from "next/link";

export default function Home() {
	return (
		<main>
			<div className="h-screen flex flex-col items-center justify-center text-center">
				<h1 className="text-base-content font-bold text-4xl">
					The GPT Wrapper
				</h1>
				<h1 className="text-base-content text-2xl mt-2">for your AI</h1>
				<p className="text-gray-500 text-sm mt-5">
					Chat with your own models. All free and opensource.
				</p>
				<div className="mt-8">
					<Link href="/chat">
						<button className={"btn btn-secondary"}>
							Get Started
						</button>
					</Link>
				</div>
			</div>
		</main>
	);
}
