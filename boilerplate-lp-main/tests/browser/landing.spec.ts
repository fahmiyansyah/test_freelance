import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('landing page renders assets, responsive layout, pricing, FAQ and lightbox', async ({
    page,
}) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('TOEFL 500+');
    await expect(page.locator('#pricing')).toHaveCount(1);
    expect(
        await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
        ),
    ).toBe(true);
    // Images must decode, rather than merely have valid URLs in the markup.
    await expect
        .poll(() =>
            page
                .locator('img[src="/assets/hero-consultant.png"]')
                .evaluate((el) => (el as HTMLImageElement).naturalWidth),
        )
        .toBeGreaterThan(0);
    await page
        .locator('#pricing')
        .getByRole('button', { name: 'Dibimbing Tutor' })
        .click();
    await expect(page.locator('#pricing')).toContainText('Starter');
    await expect(page.locator('#pricing')).toHaveCount(1);
    await page
        .locator('#pricing')
        .getByRole('button', { name: 'Belajar Sendiri' })
        .click();
    await expect(page.locator('#pricing')).toContainText('Self-Study LMS');
    const faq = page
        .locator('#faq button')
        .filter({ hasText: 'Belajar Mandiri (LMS)' });
    await faq.click();
    expect(
        (await page.locator('header').boundingBox())?.y,
    ).toBeGreaterThanOrEqual(0);
    const question = page
        .locator('#faq button')
        .filter({ hasText: 'Apa' })
        .first();
    await question.click();
    await page.locator('#proof [class*="cursor:pointer"]').first().click();
    await expect(page.locator('[style*="height: 80vh"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[style*="height: 80vh"]')).toHaveCount(0);
    expect(errors).toEqual([]);
});

test('WhatsApp and checkout clicks reach the Laravel tracking endpoint', async ({
    page,
    context,
}) => {
    // Do not navigate to the client's checkout or WhatsApp during automated QA.
    await context.route('https://wa.me/**', (route) =>
        route.fulfill({ status: 200, body: 'QA destination' }),
    );
    await context.route('https://member.fullbrightindonesia.com/**', (route) =>
        route.fulfill({ status: 200, body: 'QA destination' }),
    );
    await page.goto('/?utm_source=trial-qa');

    for (const [selector, eventType] of [
        ['#pricing a[href*="wa.me"]', 'whatsapp_lead'],
        [
            '#pricing a[href*="member.fullbrightindonesia.com"]',
            'direct_checkout',
        ],
    ]) {
        const responsePromise = page.waitForResponse((response) => {
            if (!response.url().endsWith('/analytics/track')) {
                return false;
            }

            return response
                .request()
                .postDataJSON()
                ?.events?.some(
                    (event: { event_type: string }) =>
                        event.event_type === eventType,
                );
        });
        await page.locator(selector).first().click();
        expect((await responsePromise).ok()).toBe(true);

        for (const popup of context.pages()) {
            if (popup !== page) {
                await popup.close();
            }
        }
    }
});

test('local admin can open analytics dashboard', async ({ page }) => {
    let credentials: { email: string; password: string };

    try {
        credentials = JSON.parse(await readFile('.local-admin.json', 'utf8'));
    } catch {
        test.skip(
            true,
            'Create a local admin and .local-admin.json to run the dashboard smoke test.',
        );

        return;
    }

    await page.goto('/login');
    await page.getByLabel('Email address').fill(credentials.email);
    await page
        .getByLabel('Password', { exact: true })
        .fill(credentials.password);
    await page.getByRole('button', { name: 'Log in', exact: true }).click();
    await expect(page).toHaveURL(/\/admin/);
    await expect(page.locator('body')).toContainText('Analytics');
});

test('video previews start playback and dismiss their overlays', async ({
    page,
}) => {
    await page.goto('/');
    await page
        .getByRole('button', { name: 'Putar video tampilan LMS' })
        .click();
    await expect(
        page.getByRole('button', { name: 'Putar video tampilan LMS' }),
    ).toHaveCount(0, { timeout: 15000 });
    await expect
        .poll(() =>
            page
                .locator('#lms video')
                .evaluate((video) => (video as HTMLVideoElement).paused),
        )
        .toBe(false);
    await page
        .locator('#lms video')
        .evaluate((video) => (video as HTMLVideoElement).pause());
    await page.locator('#testimonials video').locator('..').click();
    await expect(
        page.getByText('Putar video testimoni', { exact: true }),
    ).toHaveCount(0);
    await expect
        .poll(() =>
            page
                .locator('#testimonials video')
                .evaluate((video) => (video as HTMLVideoElement).paused),
        )
        .toBe(false);
});
