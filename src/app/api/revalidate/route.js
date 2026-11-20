import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const path = body.path || "/";

        // Revalidate the specified path
        revalidatePath(path);

        // Revalidate root layout so Navbar, Mega Menu & Footer sync immediately
        revalidatePath('/', 'layout');

        // Also revalidate homepage and services hub
        if (path !== "/") {
            revalidatePath("/");
        }
        revalidatePath("/services");
        revalidatePath("/portfolio");

        console.log("[Revalidate] Successfully purged cache for:", path, "and root layout");
        return NextResponse.json({ revalidated: true, path, layout: true });
    } catch (error) {
        return safeErrorResponse(error, "Revalidation");
    }
}
