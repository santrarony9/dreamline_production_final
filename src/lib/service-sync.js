import dbConnect from "./mongodb.js";
import ServicePage from "../models/ServicePage.js";
import ServiceVideo from "../models/ServiceVideo.js";
import ServiceShot from "../models/ServiceShot.js";

/**
 * Synchronizes ServiceVideo and ServiceShot collections with the ServicePage document.
 * Keeps frontend SSR/SSG and database queries 100% harmonious and instantaneous.
 *
 * @param {string} serviceSlug - Slug of the service to synchronize.
 */
export async function syncServicePage(serviceSlug) {
    if (!serviceSlug) return null;

    await dbConnect();

    // Query published videos in order
    const publishedVideos = await ServiceVideo.find({
        serviceSlug,
        isPublished: true,
        status: { $ne: 'draft' }
    }).sort({ order: 1, createdAt: 1 }).lean();

    // Query published shots in order
    const publishedShots = await ServiceShot.find({
        serviceSlug,
        isPublished: true,
        status: { $ne: 'draft' }
    }).sort({ order: 1, createdAt: 1 }).lean();

    const formattedVideos = publishedVideos.map((v, idx) => ({
        title: v.title || "",
        url: v.youtubeUrl || "",
        thumbnail: v.customThumbnail || v.thumbnail || "",
        description: v.description || "",
        category: v.tag || v.category || "",
        isFeatured: Boolean(v.isFeatured),
        order: v.order !== undefined ? v.order : idx + 1
    }));

    const formattedGallery = publishedShots.map(s => ({
        url: s.imageUrl || "",
        caption: s.title || "",
        alt: s.description || s.title || ""
    }));

    const updatedPage = await ServicePage.findOneAndUpdate(
        { slug: serviceSlug },
        {
            $set: {
                videos: formattedVideos,
                gallery: formattedGallery
            }
        },
        { returnDocument: 'after' }
    );

    // Revalidate public cache if in Next.js environment
    try {
        const nextCache = await import("next/cache");
        if (nextCache && nextCache.revalidatePath) {
            nextCache.revalidatePath(`/services/${serviceSlug}/`);
            nextCache.revalidatePath('/services/');
            nextCache.revalidatePath('/', 'layout');
        }
    } catch (e) {
        // Safe in standalone node environment
    }

    return updatedPage;
}
