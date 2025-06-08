import { redirect } from "next/navigation";
import { getLogtoContext, signIn } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";

export async function GET() {
	const { claims } = await getLogtoContext(logtoConfig);

	if (!claims) {
		await signIn(logtoConfig);
	}
	return redirect("/chat");
}
