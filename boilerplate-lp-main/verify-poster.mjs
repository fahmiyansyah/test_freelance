import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto('http://localhost:8000/', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.evaluate(() => {
    document.getElementById('lms')?.scrollIntoView();
    const v = document.querySelector('video[poster]');
    v?.scrollIntoView({ block: 'center' });
});
await page.waitForTimeout(1000);
const video = await page.$('video[poster]');
await video.screenshot({ path: '/private/tmp/claude-501/-Users-fahmiyansyah-Project-test-freelance/03e86682-919f-4141-badd-14c1f52b77ad/scratchpad/poster-verify.png' });
console.log('done');
await browser.close();
