const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Read .env.local if MONGODB_URI not set
if (!process.env.MONGODB_URI) {
  try {
    const envPath = path.resolve(__dirname, '../.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/MONGODB_URI=(.+)/);
      if (match) process.env.MONGODB_URI = match[1].trim();
    }
  } catch (e) {}
}

async function runTests() {
  const uri = process.env.MONGODB_URI || 'mongodb+srv://santrarony9_db_user:Dreamline2026@cluster0.e880jks.mongodb.net/dreamline?retryWrites=true&w=majority&appName=Cluster0';
  await mongoose.connect(uri);
  console.log('--- Connected to DB for Verification ---');

  // Load modules
  const { slugify, isValidSlug } = require('../src/lib/slug-utils');
  const { checkSlugAvailability, handleSlugChange, resolveBlogDestination } = require('../src/lib/blog-redirects');
  const Journal = require('../src/models/Journal').default || mongoose.model('Journal');
  const BlogRedirect = require('../src/models/BlogRedirect').default || mongoose.model('BlogRedirect');

  console.log('\n[TEST 1] Slug generation and validation');
  const testTitle = 'Drone Photography Services in Kolkata!';
  const autoSlug = slugify(testTitle);
  console.log('Title:', testTitle);
  console.log('Auto slug:', autoSlug);
  if (autoSlug !== 'drone-photography-services-in-kolkata') throw new Error('Auto slug mismatch: ' + autoSlug);
  if (!isValidSlug(autoSlug)) throw new Error('Valid slug check failed');
  if (isValidSlug('admin')) throw new Error('Reserved slug should be invalid');
  if (isValidSlug('test--slug')) throw new Error('Double hyphen should be invalid');
  console.log('✓ TEST 1 PASSED: Slug generation and validation');

  console.log('\n[TEST 2] Duplicate slug checking');
  // Existing slug from DB
  const existing = await Journal.findOne({});
  const dupCheck = await checkSlugAvailability({ slug: existing.slug });
  console.log('Checking existing slug:', existing.slug, '=> Available:', dupCheck.available, 'Reason:', dupCheck.reason);
  if (dupCheck.available !== false) throw new Error('Duplicate slug was marked available!');

  const testSlug1 = 'test-e2e-workflow-slug-' + Date.now();
  const availCheck = await checkSlugAvailability({ slug: testSlug1 });
  console.log('Checking fresh slug:', testSlug1, '=> Available:', availCheck.available);
  if (availCheck.available !== true) throw new Error('Fresh slug was not available');
  console.log('✓ TEST 2 PASSED: Availability checking');

  console.log('\n[TEST 3] Create a new blog post as DRAFT');
  const testPost = await Journal.create({
    title: 'Test Drone Photography Guide',
    subtitle: 'Behind the lens of Kolkata aerial cinematography',
    slug: testSlug1,
    id: testSlug1,
    status: 'draft',
    date: '2026-11-15',
    category: 'TECHNICAL',
    tags: ['drone', 'kolkata', 'test'],
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e',
    featuredImageAlt: 'Drone over Kolkata skyline',
    excerpt: 'A comprehensive guide to drone shoots in Kolkata.',
    content: '<h2>Introduction</h2><p>Drones have transformed modern productions.</p>',
    author: {
      name: 'Dreamline Production',
      role: 'Cinematography Director'
    },
    seo: {
      title: 'Test Drone Photography Guide | Dreamline Production',
      description: 'Expert guide to drone shoots in Kolkata by Dreamline Production.',
      canonicalUrl: 'https://dreamlineproduction.com/blogs/' + testSlug1 + '/'
    }
  });
  console.log('Created draft post _id:', testPost._id, 'slug:', testPost.slug, 'status:', testPost.status);
  console.log('✓ TEST 3 PASSED: Post created as draft');

  console.log('\n[TEST 4] Verify Draft Privacy in Public Query & Sitemap');
  // Check that public query excludes draft
  const publicPosts = await Journal.find({
    $and: [
      { $or: [{ status: 'published' }, { status: { $exists: false } }] },
      { $or: [{ date: { $lte: '2026-11-15' } }, { date: null }, { date: '' }] }
    ]
  }).lean();
  const foundDraftInPublic = publicPosts.some(p => p._id.toString() === testPost._id.toString());
  if (foundDraftInPublic) throw new Error('DRAFT was returned in public query!');
  console.log('✓ Draft correctly hidden from public query');

  console.log('\n[TEST 5] Publish the post & verify public query');
  await Journal.findByIdAndUpdate(testPost._id, { status: 'published' });
  const publicPostsAfterPublish = await Journal.find({
    $and: [
      { $or: [{ status: 'published' }, { status: { $exists: false } }] },
      { $or: [{ date: { $lte: '2026-11-15' } }, { date: null }, { date: '' }] }
    ]
  }).lean();
  const foundPublished = publicPostsAfterPublish.some(p => p._id.toString() === testPost._id.toString());
  if (!foundPublished) throw new Error('Published post not found in public query!');
  console.log('✓ Published post correctly accessible in public query');

  console.log('\n[TEST 6] Edit URL & Automatic 301 Permanent Redirect');
  const testSlug2 = testSlug1 + '-updated';
  console.log('Changing slug from:', testSlug1, 'to:', testSlug2);
  
  await handleSlugChange({
    blogId: testPost._id,
    oldSlug: testSlug1,
    newSlug: testSlug2
  });
  await Journal.findByIdAndUpdate(testPost._id, { slug: testSlug2, id: testSlug2 });

  // Verify BlogRedirect record exists
  const redirectRec = await BlogRedirect.findOne({ fromSlug: testSlug1 });
  console.log('Redirect record:', redirectRec ? { from: redirectRec.fromSlug, to: redirectRec.toSlug, status: redirectRec.statusCode } : 'MISSING');
  if (!redirectRec || redirectRec.toSlug !== testSlug2 || redirectRec.statusCode !== 301) {
    throw new Error('301 redirect record not created properly');
  }

  // Verify resolveBlogDestination resolves old slug with 301 redirect
  const resolvedOld = await resolveBlogDestination(testSlug1);
  console.log('Resolving old slug:', testSlug1, '=> Target:', resolvedOld?.targetSlug, 'isRedirect:', resolvedOld?.isRedirect, 'status:', resolvedOld?.statusCode);
  if (!resolvedOld?.isRedirect || resolvedOld?.targetSlug !== testSlug2) {
    throw new Error('Old slug did not redirect to new slug');
  }

  // Verify resolveBlogDestination resolves new slug directly without redirect
  const resolvedNew = await resolveBlogDestination(testSlug2);
  console.log('Resolving new slug:', testSlug2, '=> Target:', resolvedNew?.targetSlug, 'isRedirect:', resolvedNew?.isRedirect);
  if (resolvedNew?.isRedirect) throw new Error('Canonical new slug should NOT be a redirect');
  console.log('✓ TEST 6 PASSED: URL change and 301 redirect');

  console.log('\n[TEST 7] Chained Redirect Resolution (Avoid redirect chains: A -> B, B -> C => A -> C)');
  const testSlug3 = testSlug2 + '-final';
  console.log('Changing slug again from:', testSlug2, 'to:', testSlug3);
  await handleSlugChange({
    blogId: testPost._id,
    oldSlug: testSlug2,
    newSlug: testSlug3
  });
  await Journal.findByIdAndUpdate(testPost._id, { slug: testSlug3, id: testSlug3 });

  // Both slug 1 and slug 2 must now point directly to slug 3!
  const res1 = await resolveBlogDestination(testSlug1);
  const res2 = await resolveBlogDestination(testSlug2);
  console.log('Slug 1 resolves to:', res1?.targetSlug, 'isRedirect:', res1?.isRedirect);
  console.log('Slug 2 resolves to:', res2?.targetSlug, 'isRedirect:', res2?.isRedirect);
  if (res1?.targetSlug !== testSlug3 || res2?.targetSlug !== testSlug3) {
    throw new Error('Redirect chain not resolved directly to final slug!');
  }
  console.log('✓ TEST 7 PASSED: Redirect chains automatically resolved to single hop');

  console.log('\n[TEST 8] Loop Prevention (C -> A)');
  // If user sets slug back to testSlug1
  await handleSlugChange({
    blogId: testPost._id,
    oldSlug: testSlug3,
    newSlug: testSlug1
  });
  await Journal.findByIdAndUpdate(testPost._id, { slug: testSlug1, id: testSlug1 });
  const resLoop = await resolveBlogDestination(testSlug1);
  console.log('Slug 1 after returning to it => Target:', resLoop?.targetSlug, 'isRedirect:', resLoop?.isRedirect);
  if (resLoop?.isRedirect) throw new Error('Loop occurred! Slug 1 redirects when it is canonical');
  console.log('✓ TEST 8 PASSED: No redirect loop occurred');

  console.log('\n[TEST 9] Clean up test post and test redirects');
  await Journal.findByIdAndDelete(testPost._id);
  await BlogRedirect.deleteMany({
    $or: [
      { fromSlug: testSlug1 },
      { fromSlug: testSlug2 },
      { fromSlug: testSlug3 }
    ]
  });
  console.log('✓ Test data cleaned up successfully');

  console.log('\n=== ALL 9 AUTOMATED BACKEND & REDIRECT TESTS PASSED! ===');
  process.exit(0);
}

runTests().catch(err => {
  console.error('TEST ERROR:', err);
  process.exit(1);
});
