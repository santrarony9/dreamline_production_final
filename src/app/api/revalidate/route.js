import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request) {
    const session = await getServerSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const path = body.path || "/";

        // Revalidate the specified path
        revalidatePath(path);

        // Also revalidate the homepage always (most common use case)
        if (path !== "/") {
            revalidatePath("/");
        }

        console.log("Revalidated path:", path);
        return NextResponse.json({ revalidated: true, path });
    } catch (error) {
        console.error("Revalidation error:", error);
        return NextResponse.json({ error: "Revalidation failed: " + error.message }, { status: 500 });
    }
}
