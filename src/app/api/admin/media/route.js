import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Wedding from "@/models/Wedding";
import Journal from "@/models/Journal";
import Content from "@/models/Content";
import TechProject from "@/models/TechProject";

export const dynamic = 'force-dynamic';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { safeErrorResponse } from "@/lib/error-handler";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();

        // Fetch all potential image sources
        const [weddings, journals, content, techProjects] = await Promise.all([
            Wedding.find().lean(),
            Journal.find().lean(),
            Content.findOne().lean(),
            TechProject.find().lean()
        ]);

        const images = new Set();

        // Helper to add image to set if it's a valid URL string
        const addImage = (url) => {
            if (url && typeof url === 'string' && url.startsWith('http')) {
                images.add(url);
            }
        };

        // 1. Weddings
        weddings.forEach(w => {
            addImage(w.coverImage);
            addImage(w.img);
            if (w.images) w.images.forEach(addImage);
            if (w.storyChapters) {
                w.storyChapters.forEach(chapter => {
                    if (chapter.images) chapter.images.forEach(addImage);
                });
            }
        });

        // 2. Journals
        journals.forEach(j => addImage(j.image));

        // 3. Tech Projects
        techProjects.forEach(t => addImage(t.img));

        // 4. Content
        if (content) {
            // Home
            addImage(content.home?.hero?.backgroundImage);
            addImage(content.home?.expertise?.image);
            addImage(content.home?.quote?.backgroundImage);
            if (content.home?.partners) content.home.partners.forEach(p => addImage(p.image));

            // Luxury
            addImage(content.luxury?.testimonial?.image);
            if (content.luxury?.sparkCarousel) content.luxury.sparkCarousel.forEach(addImage);

            // About
            addImage(content.about?.founder?.image);
            if (content.about?.team?.members) content.about.team.members.forEach(m => addImage(m.image));
            addImage(content.about?.bts?.videoImage);

            // Projects (Legacy)
            if (content.projects) content.projects.forEach(p => addImage(p.img));
            
            // Split Gallery
            if (content.splitGallery) content.splitGallery.forEach(addImage);
        }

        // Convert set to array and sort by timestamp in filename (Old to New)
        const sortedImages = Array.from(images).sort((a, b) => {
            const getTimestamp = (url) => {
                const fileName = url.split('/').pop();
                const match = fileName.match(/^(\d+)-/);
                return match ? parseInt(match[1]) : 0;
            };
            return getTimestamp(b) - getTimestamp(a);
        });

        return NextResponse.json(sortedImages);
    } catch (err) {
        return safeErrorResponse(err, "Media");
    }
}
