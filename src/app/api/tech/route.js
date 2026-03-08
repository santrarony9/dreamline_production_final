import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import dbConnect from "@/lib/mongodb";
import TechProject from "@/models/TechProject";

export async function GET() {
    await dbConnect();
    const projects = await TechProject.find().sort({ order: 1, createdAt: -1 }).lean();
    return NextResponse.json(projects);
}

export async function POST(req) {
    try {
        const session = await getServerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { domain } = await req.json();

        if (!domain) {
            return NextResponse.json({ error: "Domain name is required" }, { status: 400 });
        }

        // Clean the domain (remove http/https if user pasted full URL)
        let cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
        let targetUrl = `https://${cleanDomain}`;

        // Create a fallback Thumbnail URL using thum.io
        const imgUrl = `https://image.thum.io/get/width/1200/crop/800/${targetUrl}`;

        // Attempt to extract Title from the actual website via Fetch
        let title = cleanDomain;
        try {
            const res = await fetch(targetUrl, { signal: AbortSignal.timeout(5000) });
            const html = await res.text();

            // Regex to find the <title> tag
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch && titleMatch[1]) {
                title = titleMatch[1].trim().split('|')[0].trim(); // Take the first part of the title
            }
        } catch (error) {
            console.log("Failed to fetch metadata, using domain as title:", error.message);
        }

        await dbConnect();

        const count = await TechProject.countDocuments();

        const newProject = await TechProject.create({
            title,
            domain: targetUrl,
            category: "Web Development",
            img: imgUrl,
            order: count
        });

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        console.error("TechProject Creation Error:", error);
        return NextResponse.json({ error: "Failed to add website" }, { status: 500 });
    }
}
