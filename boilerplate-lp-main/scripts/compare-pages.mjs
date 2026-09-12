import { mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';
import { chromium } from '@playwright/test';
await mkdir('qa', { recursive: true });
const tutor = process.argv.includes('--tutor');
const suffix = tutor ? '-tutor' : '';
const browser = await chromium.launch({ channel: 'chrome', headless: true });

for (const [name, url] of process.env.LOCAL_ONLY
    ? [['local', 'http://127.0.0.1:8000']]
    : [
          ['reference', 'https://toefl.fullbrightindonesia.org/c10-lp'],
          ['local', 'http://127.0.0.1:8000'],
      ]) {
    for (const width of [1440, 390]) {
        const page = await browser.newPage({
            viewport: { width, height: 900 },
            deviceScaleFactor: 1,
        });
        const errors = [];
        page.on('pageerror', (e) => errors.push(e.message));
        await page.goto(url + (tutor ? '?mode=tutor' : ''), {
            waitUntil: 'domcontentloaded',
        });
        await page.waitForSelector('#pricing');
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(3000);
        await page.screenshot({
            path: `qa/${name}-${width}${suffix}.png`,
            fullPage: true,
        });
        const data = await page.evaluate(() => ({
            title: document.title,
            width: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
            sections: [...document.querySelectorAll('section')].map((e) => ({
                id: e.id,
                rect: e.getBoundingClientRect().toJSON(),
            })),
            elements: [...document.querySelectorAll('body *')]
                .filter((e) => e instanceof HTMLElement)
                .map((e) => ({
                    tag: e.tagName,
                    text: e.innerText?.replace(/\s+/g, ' ').trim(),
                    class: e.className,
                    style: e.getAttribute('style'),
                    src: e.getAttribute('src'),
                    rect: e.getBoundingClientRect().toJSON(),
                })),
            brokenImages: [...document.images]
                .filter((e) => e.complete && !e.naturalWidth)
                .map((e) => e.src),
        }));
        await writeFile(
            `qa/${name}-${width}${suffix}-dom.json`,
            JSON.stringify({ ...data, errors }, null, 2),
        );
        await page.close();
    }
}

await browser.close();
