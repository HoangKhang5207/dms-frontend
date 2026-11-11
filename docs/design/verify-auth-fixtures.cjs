// Browser fixtures only. Does not authenticate against or send requests to a real backend.
// Run: node docs/design/verify-auth-fixtures.cjs <playwright-package> [base-url]
const { chromium } = require(process.argv[2] || 'playwright');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
    const browser = await chromium.launch({
        executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',
        headless: true,
    });
    const base = process.argv[3] || 'http://localhost:5173';
    const output = path.resolve(__dirname, process.argv[4] || 'qa/refinement');
    fs.mkdirSync(output, { recursive: true });
    const report = { mode: 'MOCKED_BACKEND_CONTRACTS_NOT_LIVE_INTEGRATION', checks: [], pageErrors: [] };
    const token = phase => [
        Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url'),
        Buffer.from(JSON.stringify({ sub: 'qa@example.invalid', exp: Math.floor(Date.now() / 1000) + 3600, phase })).toString('base64url'),
        'fixture-only',
    ].join('.');
    const oldAccess = token('initial');
    const newAccess = token('refreshed');
    const user = {
        id: 999999, email: 'qa@example.invalid', first_name: 'QA', last_name: 'Fixture', status: 1,
        gender: false, organization_id: null, department_id: null,
        is_organization_manager: false, is_dept_manager: false,
    };
    const check = (name, pass) => report.checks.push({ name, pass });

    try {
        for (const scenario of ['authenticated', 'refresh', 'expired', 'service-error']) {
            const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
            await context.addInitScript(({ oldAccess, refresh }) => {
                // Seed once per context, so a reload after logout cannot silently reseed the session.
                if (!sessionStorage.getItem('qa-fixture-seeded')) {
                    localStorage.setItem('accessToken', oldAccess);
                    if (refresh) localStorage.setItem('refreshToken', 'fixture-refresh-only');
                    sessionStorage.setItem('qa-fixture-seeded', 'yes');
                }
            }, { oldAccess, refresh: scenario === 'refresh' });
            let refreshCalls = 0;
            let validRefreshBody = true;
            let userCalls = 0;
            let authorizedUserCalls = 0;
            let releaseUser;
            const userGate = new Promise(resolve => { releaseUser = resolve; });
            await context.route('http://localhost:8080/api/v1/**', async route => {
                const request = route.request();
                const url = new URL(request.url());
                const headers = { 'access-control-allow-origin': new URL(base).origin, 'access-control-allow-headers': '*' };
                const respond = (status, body) => route.fulfill({ status, contentType: 'application/json', headers, body: JSON.stringify(body) });
                if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
                if (url.pathname === '/api/v1/users/me') {
                    userCalls += 1;
                    const bearer = request.headers().authorization;
                    if (bearer === `Bearer ${oldAccess}` || bearer === `Bearer ${newAccess}`) authorizedUserCalls += 1;
                    if (scenario === 'authenticated') {
                        await userGate;
                        return respond(200, user);
                    }
                    if (scenario === 'service-error') return respond(503, { status: 503, message: 'Fixture unavailable' });
                    if (scenario === 'refresh' && bearer === `Bearer ${newAccess}`) return respond(200, user);
                    return respond(401, { status: 401, message: 'Fixture expired' });
                }
                if (url.pathname === '/api/v1/auth/refresh-token') {
                    refreshCalls += 1;
                    validRefreshBody &&= request.postDataJSON().refresh_token === 'fixture-refresh-only';
                    return respond(200, { access_token: newAccess, refresh_token: 'fixture-refreshed-only' });
                }
                // Unexpected API use is a failing fixture condition, never forwarded to an external service.
                report.checks.push({ name: `${scenario}: no unexpected API ${url.pathname}`, pass: false });
                return respond(500, { message: 'Unexpected fixture request' });
            });
            const page = await context.newPage();
            page.on('pageerror', error => report.pageErrors.push({ scenario, message: error.message }));
            await page.goto(base, { waitUntil: 'domcontentloaded' });
            if (scenario === 'authenticated') {
                await page.waitForRequest(request => new URL(request.url()).pathname === '/api/v1/users/me');
                check('Loading: CTA withheld until user data resolves', await page.locator('.aquadocs-introduction .ant-btn').count() === 0);
                releaseUser();
            }
            if (scenario === 'expired') {
                // StrictMode may initialize two requests, causing the unchanged interceptor
                // to assign window.location twice. Wait for stable UI across both navigations.
                await page.locator('.login-form-container').waitFor();
                check('Expired session: existing interceptor redirects to login', new URL(page.url()).pathname === '/login');
                check('Expired session: stored tokens removed', await page.evaluate(() => !localStorage.getItem('accessToken') && !localStorage.getItem('refreshToken')));
            } else {
                const cta = page.locator('.aquadocs-introduction .ant-btn');
                await cta.waitFor();
                check(`${scenario}: landing CTA follows auth state`, await cta.getAttribute('href') === (scenario === 'service-error' ? '/login' : '/home'));
                if (scenario === 'refresh') {
                    check('Refresh: snake_case request and response handled', refreshCalls > 0 && validRefreshBody);
                    check('Refresh: rotated tokens stored', await page.evaluate(() => localStorage.getItem('refreshToken') === 'fixture-refreshed-only'));
                }
                if (scenario === 'service-error') {
                    check('Service error: existing logout fallback clears tokens', await page.evaluate(() => !localStorage.getItem('accessToken')));
                }
                if (scenario === 'authenticated') {
                    await page.evaluate(() => document.fonts.ready);
                    await page.locator('.aquadocs-banner').evaluate(image => image.decode());
                    await page.waitForTimeout(700);
                    await page.screenshot({ path: path.join(output, 'home-authenticated-fixture.png') });
                }
            }
            check(`${scenario}: users/me request retains Bearer header`, userCalls > 0 && authorizedUserCalls === userCalls);
            await context.close();
        }
        check('Fixtures: no uncaught browser errors', report.pageErrors.length === 0);
    } finally {
        fs.writeFileSync(path.join(output, 'auth-fixture-results.json'), JSON.stringify(report, null, 2));
        await browser.close();
    }
    console.log(JSON.stringify(report, null, 2));
    if (report.checks.some(check => !check.pass)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
