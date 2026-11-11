// Run: node docs/design/verify.cjs <path-to-playwright-package> [base-url] [output-directory]
const { chromium } = require(process.argv[2] || 'playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
    const output = path.resolve(__dirname, process.argv[4] || 'qa');
    fs.mkdirSync(output, { recursive: true });
    const browser = await chromium.launch({
        executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        headless: true,
    });
    const base = process.argv[3] || 'http://127.0.0.1:5173';
    const page = await browser.newPage({ deviceScaleFactor: 1 });
    const report = { viewports: [], checks: [], errors: [], failedRequests: [] };
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('requestfailed', request => report.failedRequests.push({ url: request.url(), failure: request.failure() }));
    const check = (name, pass, detail) => {
        report.checks.push({ name, pass, detail });
    };
    try {
        for (const [width, height] of [[1672, 1005], [1440, 900], [768, 1024], [390, 844]]) {
            await page.setViewportSize({ width, height });
            await page.goto(base, { waitUntil: 'networkidle' });
            await page.evaluate(() => document.fonts.ready);
            await page.locator('.aquadocs-banner').evaluate(image => image.decode());
            await page.waitForTimeout(700);
            const geometry = await page.evaluate(() => {
                const image = document.querySelector('.aquadocs-banner');
                const box = image.getBoundingClientRect();
                return {
                    width: box.width, height: box.height, top: box.top,
                    naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight,
                    overflow: document.documentElement.scrollWidth > innerWidth,
                    fontLoaded: [...document.fonts].some(font => font.family.includes('Be Vietnam Pro') && font.status === 'loaded'),
                };
            });
            report.viewports.push({ viewportWidth: width, viewportHeight: height, ...geometry });
            check(`No overflow ${width}`, !geometry.overflow);
            check(`Landing uses AquaDocs identity ${width}`, await page.getByRole('link', { name: 'AquaDocs AI — Trang chủ' }).isVisible());
            await page.screenshot({ path: path.join(output, `home-${width}.png`), fullPage: true });
            if (width === 1672) {
                await page.locator('.aquadocs-banner').screenshot({ path: path.join(output, 'banner-1672.png') });
            }
        }
        await page.locator('.aquadocs-introduction .ant-btn').click();
        await page.waitForURL('**/login');
        check('Guest CTA opens login', new URL(page.url()).pathname === '/login');
        check('Login uses shared AquaDocs identity', await page.getByRole('link', { name: 'AquaDocs AI — Trang chủ' }).isVisible()
            && await page.getByText('AquaDocs AI · Đồng hành cùng ngành nước hiện đại', { exact: true }).isVisible());
        await page.getByRole('link', { name: 'Tính năng', exact: true }).click();
        await page.waitForURL('**/#tinh-nang');
        await page.waitForTimeout(1000);
        check('Feature anchor from login', await page.locator('#tinh-nang').evaluate(e => Math.abs(e.getBoundingClientRect().top - 80) < 4));
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
        await page.getByRole('link', { name: 'Tính năng', exact: true }).click();
        await page.waitForTimeout(1000);
        check('Repeated feature anchor scrolls again', await page.locator('#tinh-nang').evaluate(e => Math.abs(e.getBoundingClientRect().top - 80) < 4));
        await page.getByRole('link', { name: 'Liên hệ', exact: true }).click();
        await page.waitForTimeout(1000);
        check('Contact anchor visible', await page.locator('#lien-he').evaluate(e => e.getBoundingClientRect().top >= 64 && e.getBoundingClientRect().top < innerHeight));
        await page.locator('#lien-he').getByRole('button', { name: 'Gửi', exact: true }).click();
        await page.waitForFunction(() => document.querySelectorAll('#lien-he .ant-form-item-explain-error').length === 3);
        check('Contact required validation', await page.locator('#lien-he .ant-form-item-explain-error').count() === 3);
        await page.locator('#email').fill('invalid-email');
        await page.locator('#lien-he').getByRole('button', { name: 'Gửi', exact: true }).click();
        check('Contact email validation', await page.getByText('Email không hợp lệ!', { exact: true }).isVisible());
        await page.getByRole('link', { name: 'AquaDocs AI — Trang chủ' }).click();
        await page.waitForURL(base + '/');
        check('Logo returns home', new URL(page.url()).pathname === '/');
        await page.keyboard.press('Tab');
        check('Keyboard focus reaches link', await page.evaluate(() => document.activeElement.tagName === 'A'));
        check('Landing footer uses AquaDocs', await page.getByText('AquaDocs AI · Đồng hành cùng ngành nước hiện đại', { exact: true }).isVisible());
        await page.setViewportSize({ width: 320, height: 844 });
        check('No overflow 320', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.goto(base + '/home/document-management');
        await page.waitForURL('**/login');
        check('Protected documents redirects guest', new URL(page.url()).pathname === '/login');
        await page.goto(base + '/register');
        check('Register route renders', await page.locator('form').count() > 0);
        await page.goto(base + '/forgot-password');
        check('Forgot password route renders', await page.locator('form').count() > 0);
        check('No uncaught browser errors', report.errors.length === 0, report.errors);
    } finally {
        fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
        await browser.close();
    }
    console.log(JSON.stringify(report, null, 2));
    if (report.checks.some(check => !check.pass)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
