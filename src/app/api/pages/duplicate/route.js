export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import CustomPage from "@/models/CustomPage";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";
import { checkPageSlugAvailability } from "@/lib/page-redirects";

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json({ error: "Page ID is required" }, { status: 400 });
        }

        const sourcePage = await CustomPage.findById(id).lean();
        if (!sourcePage) {
            return NextResponse.json({ error: "Source page not found" }, { status: 404 });
        }

        // Generate clean unique slug for copy
        let copySlug = `${sourcePage.slug}-copy`;
        let avail = await checkPageSlugAvailability({ slug: copySlug });
        let counter = 2;
        while (!avail.available) {
            copySlug = `${sourcePage.slug}-copy-${counter}`;
            avail = await checkPageSlugAvailability({ slug: copySlug });
            counter++;
        }

        const newPageData = {
            ...sourcePage,
            _id: undefined,
            title: `${sourcePage.title} (Copy)`,
            slug: copySlug,
            status: "draft",
            navigation: {
                inNavbar: false,
                navLabel: "",
                navOrder: 99,
                inFooter: false,
                footerLabel: ""
            },
            aliases: [],
            redirectHistory: [],
            createdAt: undefined,
            updatedAt: undefined
        };

        const clonedPage = await CustomPage.create(newPageData);
        return NextResponse.json(clonedPage, { status: 201 });
    } catch (err) {
        return safeErrorResponse(err, "Page Duplicate");
    }
}
