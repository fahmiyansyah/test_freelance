import { chromium } from '@playwright/test';
const browser = await chromium.launch({ channel: 'chrome', headless: true });

for (const url of [
    'https://toefl.fullbrightindonesia.org/c10-lp',
    'http://127.0.0.1:8000',
]) {
    const page = await browser.newPage({
        viewport: { width: 390, height: 900 },
    });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('h1');
    console.log(
        url,
        await page.evaluate(() =>
            [
                'body',
                'h1',
                'h1 span',
                '#agitation h2',
                '#agitation p',
                '#value h2',
                '#value h2 span',
                '#lms h2',
                '#lms h2 span',
                '#faq h2',
                '#pricing h2',
            ].map((sel) => {
                const e = document.querySelector(sel),
                    s = getComputedStyle(e);

                return {
                    sel,
                    font: s.font,
                    fontFamily: s.fontFamily,
                    lineHeight: s.lineHeight,
                    letterSpacing: s.letterSpacing,
                    height: e.getBoundingClientRect().height,
                };
            }),
        ),
    );
    const cdp = await page.context().newCDPSession(page);
    const { root } = await cdp.send('DOM.getDocument');
    const { nodeId } = await cdp.send('DOM.querySelector', {
        nodeId: root.nodeId,
        selector: 'h1',
    });
    await cdp.send('DOM.enable');
    await cdp.send('CSS.enable');
    console.log(await cdp.send('CSS.getPlatformFontsForNode', { nodeId }));
    await page.close();
}

await browser.close();
