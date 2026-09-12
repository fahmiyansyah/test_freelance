import { chromium } from 'playwright';

const url = process.argv[2];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(1500);

const info = await page.evaluate(() => {
    const el = document.getElementById('testimonials');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const top = rect.top + window.scrollY;
    // find first element containing an actual photo (img or background-image) within/after this section
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_ELEMENT);
    let firstPhotoTop = null;
    let node = walker.currentNode;
    while (node) {
        const style = window.getComputedStyle(node);
        const hasImg = node.tagName === 'IMG';
        const hasBg = style.backgroundImage && style.backgroundImage !== 'none';
        if (hasImg || hasBg) {
            const r = node.getBoundingClientRect();
            firstPhotoTop = r.top + window.scrollY;
            break;
        }
        node = walker.nextNode();
    }
    return { sectionTop: top, firstPhotoTop, sectionOuterHTML: el.outerHTML.slice(0, 200) };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
