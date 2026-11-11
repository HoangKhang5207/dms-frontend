// Isolated UI feedback regression. Every backend request is intercepted, including DELETE.
const { chromium } = require(process.argv[2] || 'playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
    const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    const output = path.join(__dirname, 'qa/application/feedback');
    fs.mkdirSync(output, { recursive: true });
    const report = { mode: 'MOCKED_BACKEND_NO_REAL_MUTATIONS', checks: [], unexpected: [], errors: [] };
    let scenario = 'error';
    const check = (name, pass) => report.checks.push({ name, pass });
    page.on('pageerror', error => report.errors.push(error.message));
    await page.addInitScript(() => {
        const payload = btoa(JSON.stringify({ sub: 'qa@example.invalid', exp: 4102444800 }));
        localStorage.setItem('accessToken', `e30.${payload}.fixture-only`);
    });
    await page.route('http://localhost:8080/**', async route => {
        const request = route.request();
        const p = new URL(request.url()).pathname;
        const headers = { 'access-control-allow-origin': 'http://localhost:5173', 'access-control-allow-headers': '*' };
        if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
        if (p.endsWith('/users/me')) return route.fulfill({ status: 200, headers, json: { id: 999, first_name: 'QA', last_name: 'Fixture', organization_id: null, email: 'qa@example.invalid', status: 1 } });
        if (p.endsWith('/documents/all')) return route.fulfill({
            status: scenario === 'error' ? 503 : 200, headers,
            json: scenario === 'error' ? { message: 'Fixture unavailable' } : scenario === 'deleted' ? [] : [{ fileId: 1, title: 'Tài liệu QA', type: 'pdf', storageCapacity: 1024, createdAt: '2026-01-01T09:00:00' }],
        });
        if (p.endsWith('/documents/1') && request.method() === 'DELETE') {
            scenario = 'deleted';
            return route.fulfill({ status: 204, headers });
        }
        report.unexpected.push({ method: request.method(), path: p });
        return route.fulfill({ status: 500, headers, json: { message: 'Unexpected fixture request' } });
    });
    try {
        await page.goto('http://localhost:5173/home/document-management', { waitUntil: 'networkidle' });
        const error = page.getByRole('alert').filter({ hasText: 'Không thể lấy danh sách tài liệu.' }).first();
        await error.waitFor();
        check('API error renders existing error toast', await error.isVisible());
        check('Error feedback fits mobile viewport', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.screenshot({ path: path.join(output, 'documents-error-390.png') });
        scenario = 'populated';
        await page.reload({ waitUntil: 'networkidle' });
        // Table keeps horizontal scrolling; reveal the existing row action normally.
        await page.getByRole('button', { name: /Xóa$/ }).click();
        await page.getByRole('button', { name: 'Có', exact: true }).click();
        const success = page.getByRole('alert').filter({ hasText: 'đã được xóa thành công!' }).first();
        await success.waitFor();
        check('Existing success feedback renders after mocked deletion', await success.isVisible());
        check('Successful action refreshes empty state', await page.locator('.ant-empty').isVisible());
        await page.screenshot({ path: path.join(output, 'documents-success-390.png') });
        check('No unexpected backend requests', report.unexpected.length === 0);
        check('No uncaught errors', report.errors.length === 0);
    } finally {
        fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
        await browser.close();
    }
    console.log(JSON.stringify(report, null, 2));
    if (report.checks.some(check => !check.pass)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
