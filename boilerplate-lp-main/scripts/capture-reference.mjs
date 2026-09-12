import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from '@playwright/test';
await mkdir('qa', { recursive: true });
const browser = await chromium.launch({ channel: 'chrome', headless: true });

for (const width of [1440, 390]) {
    const page = await browser.newPage({
        viewport: { width, height: 900 },
        deviceScaleFactor: 1,
    });
    await page.goto('https://toefl.fullbrightindonesia.org/c10-lp', {
        waitUntil: 'networkidle',
    });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
        path: `qa/reference-${width}.png`,
        fullPage: true,
    });
    const data = await page.evaluate(() => ({
        title: document.title,
        fonts: [...document.fonts].map((f) => ({
            family: f.family,
            weight: f.weight,
            status: f.status,
        })),
        sections: [...document.querySelectorAll('section')].map((e) => ({
            id: e.id,
            rect: e.getBoundingClientRect().toJSON(),
        })),
        text: document.body.innerText,
        html: document.documentElement.outerHTML,
    }));
    await writeFile(
        `qa/reference-${width}.json`,
        JSON.stringify(data, null, 2),
    );
    await page.close();
}

await browser.close();
