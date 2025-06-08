import { redirect } from "next/navigation";
import { getLogtoContext, signOut } from "@logto/next/server-actions";
import { logtoConfig } from "@/lib/auth";

export async function GET() {
	const { claims } = await getLogtoContext(logtoConfig);

	if (claims) {
		await signOut(logtoConfig);
	}
	return redirect("/");
}
