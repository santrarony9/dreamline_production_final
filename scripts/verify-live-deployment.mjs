async function testServicePages() {
  const res1 = await fetch('https://dreamlineproduction.com/services/birthday-photography-kolkata/');
  const html1 = await res1.text();
  console.log('=== BIRTHDAY PHOTOGRAPHY PAGE ===');
  console.log('HTTP Status:', res1.status);
  console.log('Heading "Birthday Photography Videos":', html1.includes('Birthday Photography Videos'));
  console.log('Video 1 (il4uufxfxKY):', html1.includes('il4uufxfxKY'));
  console.log('Video 2 (KxySjtXaRN0):', html1.includes('KxySjtXaRN0'));
  console.log('Thumbnail 1 (img.youtube.com/vi/il4uufxfxKY):', html1.includes('img.youtube.com/vi/il4uufxfxKY'));
  console.log('Thumbnail 2 (img.youtube.com/vi/KxySjtXaRN0):', html1.includes('img.youtube.com/vi/KxySjtXaRN0'));
  console.log('16:9 Aspect Ratio ("aspect-video"):', html1.includes('aspect-video'));

  const res2 = await fetch('https://dreamlineproduction.com/services/other-social-events-kolkata/');
  const html2 = await res2.text();
  console.log('\n=== OTHER SOCIAL EVENTS PAGE ===');
  console.log('HTTP Status:', res2.status);
  console.log('Heading "Other Social Events Videos":', html2.includes('Other Social Events Videos'));
  console.log('Video (fduCdqVPOfY):', html2.includes('fduCdqVPOfY'));
  console.log('Thumbnail (img.youtube.com/vi/fduCdqVPOfY):', html2.includes('img.youtube.com/vi/fduCdqVPOfY'));
  console.log('16:9 Aspect Ratio ("aspect-video"):', html2.includes('aspect-video'));

  console.log('\n=== STRICT SERVICE ISOLATION CHECKS ===');
  console.log('Birthday page contains other video (fduCdqVPOfY):', html1.includes('fduCdqVPOfY'));
  console.log('Other Social page contains birthday video (il4uufxfxKY):', html2.includes('il4uufxfxKY'));
  console.log('Other Social page contains birthday video (KxySjtXaRN0):', html2.includes('KxySjtXaRN0'));

  const res3 = await fetch('https://dreamlineproduction.com/services/wedding-photography-kolkata/');
  const html3 = await res3.text();
  console.log('Wedding page contains any social video:', html3.includes('il4uufxfxKY') || html3.includes('KxySjtXaRN0') || html3.includes('fduCdqVPOfY'));

  const resCorp = await fetch('https://dreamlineproduction.com/services/documentary-film-production-kolkata/');
  console.log('\n=== DOCUMENTARY FILM PAGE ===');
  console.log('HTTP Status:', resCorp.status);
}

testServicePages();
