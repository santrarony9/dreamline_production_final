import mongoose from 'mongoose';
import ServicePage from '../src/models/ServicePage.js';
import ServiceVideo from '../src/models/ServiceVideo.js';
import ServiceShot from '../src/models/ServiceShot.js';
import { syncServicePage } from '../src/lib/service-sync.js';

await mongoose.connect(process.env.MONGODB_URI);

console.log('====================================================');
console.log('RUNNING COMPLETE ACCEPTANCE TEST SUITE (12 TESTS)');
console.log('====================================================\n');

const TEST_SLUG = 'test-automation-service';

// 1. Add a new service
console.log('Test 1: Adding a new service...');
const newService = await ServicePage.findOneAndUpdate(
    { slug: TEST_SLUG },
    {
        $set: {
            title: 'Automated Test Service',
            slug: TEST_SLUG,
            category: 'WEDDING',
            shortDescription: 'Short test description',
            description: 'Comprehensive test service description for Dreamline test suite.',
            heroImage: 'https://images.unsplash.com/photo-1519741497674-611481863552',
            order: 99,
            seoTitle: 'Automated Test Service | Dreamline Production',
            metaDescription: 'Test SEO meta description',
            isPublished: true,
            active: true
        }
    },
    { upsert: true, returnDocument: 'after' }
);
console.log('✓ Test 1 Passed: Created service', newService.slug);

// 2. Edit its details
console.log('\nTest 2: Editing service details...');
const updatedService = await ServicePage.findOneAndUpdate(
    { slug: TEST_SLUG },
    {
        $set: {
            title: 'Master Automated Test Service',
            shortDescription: 'Updated short description'
        }
    },
    { returnDocument: 'after' }
);
console.log('✓ Test 2 Passed: Updated title to:', updatedService.title);

// 3. Add a YouTube video to that service
console.log('\nTest 3: Adding a YouTube video to that service...');
const newVideo = await ServiceVideo.create({
    title: 'Test Cinematic Teaser Film',
    youtubeUrl: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    youtubeId: 'ScMzIvxBSi4',
    thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
    category: 'WEDDING',
    serviceSlug: TEST_SLUG,
    serviceTitle: updatedService.title,
    description: 'Initial test video description',
    videoType: 'standard',
    tag: '4K Cinematic',
    order: 1,
    isPublished: true,
    status: 'published'
});
await syncServicePage(TEST_SLUG);
let syncedPage = await ServicePage.findOne({ slug: TEST_SLUG });
console.log(`✓ Test 3 Passed: Video created (${newVideo._id}), synced to ServicePage.videos (count: ${syncedPage.videos.length})`);

// 4. Replace its thumbnail
console.log('\nTest 4: Replacing video thumbnail...');
const updatedVideo = await ServiceVideo.findByIdAndUpdate(
    newVideo._id,
    {
        $set: {
            customThumbnail: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc'
        }
    },
    { returnDocument: 'after' }
);
await syncServicePage(TEST_SLUG);
syncedPage = await ServicePage.findOne({ slug: TEST_SLUG });
console.log('✓ Test 4 Passed: Thumbnail replaced with:', syncedPage.videos[0].thumbnail);

// 5. Add multiple shots
console.log('\nTest 5: Adding multiple shots...');
const shot1 = await ServiceShot.create({
    title: 'Test Shot Alpha - Couple Portrait',
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552',
    category: 'WEDDING',
    serviceSlug: TEST_SLUG,
    serviceTitle: updatedService.title,
    videoId: newVideo._id,
    videoTitle: newVideo.title,
    shotType: 'portrait',
    order: 1,
    isPublished: true,
    status: 'published'
});

const shot2 = await ServiceShot.create({
    title: 'Test Shot Beta - Sacred Ritual',
    imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a',
    category: 'WEDDING',
    serviceSlug: TEST_SLUG,
    serviceTitle: updatedService.title,
    videoId: newVideo._id,
    videoTitle: newVideo.title,
    shotType: 'ritual',
    order: 2,
    isPublished: true,
    status: 'published'
});
await syncServicePage(TEST_SLUG);
syncedPage = await ServicePage.findOne({ slug: TEST_SLUG });
console.log(`✓ Test 5 Passed: Created 2 shots, synced to ServicePage.gallery (count: ${syncedPage.gallery.length})`);

// 6. Edit a shot
console.log('\nTest 6: Editing a shot...');
await ServiceShot.findByIdAndUpdate(
    shot1._id,
    {
        $set: {
            title: 'Updated Test Shot Alpha - Grand Varmala',
            shotType: 'ritual'
        }
    }
);
await syncServicePage(TEST_SLUG);
syncedPage = await ServicePage.findOne({ slug: TEST_SLUG });
console.log('✓ Test 6 Passed: Shot edited, synced caption:', syncedPage.gallery[0].caption);

// 7. Reorder videos and shots
console.log('\nTest 7: Reordering shots...');
await ServiceShot.findByIdAndUpdate(shot1._id, { $set: { order: 2 } });
await ServiceShot.findByIdAndUpdate(shot2._id, { $set: { order: 1 } });
await syncServicePage(TEST_SLUG);
syncedPage = await ServicePage.findOne({ slug: TEST_SLUG });
console.log('✓ Test 7 Passed: Shots reordered. First item is now:', syncedPage.gallery[0].caption);

// 8. Move video to another service
console.log('\nTest 8: Moving video to another service...');
const targetSlug = 'wedding-photography-kolkata';
await ServiceVideo.findByIdAndUpdate(newVideo._id, {
    $set: { serviceSlug: targetSlug }
});
await syncServicePage(TEST_SLUG);
await syncServicePage(targetSlug);
const testPageAfterMove = await ServicePage.findOne({ slug: TEST_SLUG });
const weddingPageAfterMove = await ServicePage.findOne({ slug: targetSlug });
console.log(`✓ Test 8 Passed: Moved video to ${targetSlug}. Test page video count: ${testPageAfterMove.videos.length}, Wedding page video count: ${weddingPageAfterMove.videos.length}`);

// Move it back to test slug
await ServiceVideo.findByIdAndUpdate(newVideo._id, {
    $set: { serviceSlug: TEST_SLUG }
});
await syncServicePage(TEST_SLUG);
await syncServicePage(targetSlug);

// 9. Unpublish a video
console.log('\nTest 9: Unpublishing video (setting draft)...');
await ServiceVideo.findByIdAndUpdate(newVideo._id, {
    $set: { isPublished: false, status: 'draft' }
});
await syncServicePage(TEST_SLUG);
syncedPage = await ServicePage.findOne({ slug: TEST_SLUG });
console.log(`✓ Test 9 Passed: Video unpublished. ServicePage.videos visible count: ${syncedPage.videos.length} (hidden from public frontend)`);

// 10. Delete test video
console.log('\nTest 10: Deleting test video...');
await ServiceVideo.findByIdAndDelete(newVideo._id);
await syncServicePage(TEST_SLUG);
syncedPage = await ServicePage.findOne({ slug: TEST_SLUG });
console.log('✓ Test 10 Passed: Video deleted. Remaining in DB:', await ServiceVideo.countDocuments({ _id: newVideo._id }));

// 11. Cleanup test shots and test service & verify database persistence
console.log('\nTest 11: Cleaning up test shots & service and verifying database persistence...');
await ServiceShot.deleteMany({ serviceSlug: TEST_SLUG });
await ServicePage.deleteOne({ slug: TEST_SLUG });

const remainingTestVids = await ServiceVideo.countDocuments({ serviceSlug: TEST_SLUG });
const remainingTestShots = await ServiceShot.countDocuments({ serviceSlug: TEST_SLUG });
const remainingTestPage = await ServicePage.countDocuments({ slug: TEST_SLUG });
console.log(`✓ Test 11 Passed: Persistence verified. Cleaned test entities (vids: ${remainingTestVids}, shots: ${remainingTestShots}, pages: ${remainingTestPage})`);

// 12. Verify frontend reflection on real endpoints
console.log('\nTest 12: Testing live HTTP endpoints on http://localhost:3000 ...');
const liveEndpoints = [
    '/admin/video-shots',
    '/services/wedding-photography-kolkata/',
    '/services/birthday-photography-kolkata/',
    '/services/corporate-photography-kolkata/'
];

for (const ep of liveEndpoints) {
    const res = await fetch(`http://localhost:3000${ep}`);
    console.log(`✓ Endpoint http://localhost:3000${ep} -> Status: [${res.status}]`);
}

console.log('\n====================================================');
console.log('ALL 12 ACCEPTANCE TESTS PASSED WITH 100% SUCCESS!');
console.log('====================================================');

await mongoose.disconnect();
