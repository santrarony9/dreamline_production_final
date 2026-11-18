import mongoose from 'mongoose';

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const navItems = await db.collection('navigationitems').find({}).toArray();
  console.log('Total navigation items in DB:', navItems.length);
  
  const corporateItems = navItems.filter(i => (i.group || '').toUpperCase() === 'CORPORATE');
  console.log('Corporate items count:', corporateItems.length);
  corporateItems.sort((a,b) => (a.order || 0) - (b.order || 0));
  corporateItems.forEach((c, idx) => {
    console.log(`[${idx+1}] title: "${c.title}", order: ${c.order}, active: ${c.isActive}, url: "${c.url}", desc: "${c.description}"`);
  });

  const allCorporateLike = navItems.filter(i => 
    (i.title || '').toLowerCase().includes('documentary') || 
    (i.url || '').toLowerCase().includes('documentary')
  );
  console.log('\nDocumentary items in navigationitems:', allCorporateLike);

  const servicePages = await db.collection('servicepages').find({
    $or: [
      { slug: { $regex: 'documentary', $options: 'i' } },
      { title: { $regex: 'documentary', $options: 'i' } },
      { category: { $regex: 'corporate', $options: 'i' } }
    ]
  }).toArray();
  console.log('\nCorporate/Documentary in servicepages:', servicePages.map(s => ({ title: s.title, slug: s.slug, category: s.category })));

  await mongoose.disconnect();
}

main().catch(console.error);
