// All backend requests are intercepted. Screenshots do not establish live backend integration.
// node docs/design/verify-application.cjs <playwright-package> before|after [base-url]
const { chromium } = require(process.argv[2] || 'playwright');
const fs = require('node:fs');
const path = require('node:path');

const routes = [
    ['landing', '/'], ['login', '/login'], ['register', '/register'], ['forgot', '/forgot-password'],
    ['reset', '/reset-password?token=fixture-only'], ['reset-invalid', '/reset-password'],
    ['verify-message', '/verify-email-message'], ['verify-success', '/verifired?email=qa@example.invalid'],
    ['verify-invalid', '/verifired'], ['invitation-success', '/accepted-join?orgId=1&deptId=1&email=qa@example.invalid'],
    ['invitation-invalid', '/accepted-join'], ['dashboard', '/home/dashboard'],
    ['no-organization', '/home/no-organization'], ['create-organization', '/home/create-organization'],
    ['pending-organization', '/home/pending-organization'], ['organization-info', '/home/organization/info'],
    ['departments', '/home/organization/departments'], ['members', '/home/organization/members'],
    ['documents', '/home/document-management'], ['categories', '/home/document-management/1'],
    ['category-documents', '/home/document-management/1/1'], ['search', '/home/document-management/search'],
];
const organization = {
    id: 1, name: 'Cấp thoát nước · QA', description: 'Dữ liệu minh họa kiểm thử giao diện, không phải dữ liệu thật.',
    status: 1, created_by: 'qa@example.invalid', created_at: '2026-01-01T09:00:00',
    limit_data: 10737418240, data_used: 1073741824, percent_data_used: 10,
    limit_token: 10000, token_used: 1000, is_openai: false,
};
const departments = [{ id: 1, name: 'Vận hành', description: 'Phòng vận hành hệ thống nước', status: 1, created_by: 'qa@example.invalid', created_at: '2026-01-01T09:00:00' }];
const user = { id: 999, email: 'qa@example.invalid', first_name: 'Kiểm thử', last_name: 'AquaDocs', status: 1, organization_id: 1, department_id: 1, is_organization_manager: true, is_dept_manager: true };
const member = { ...user, id: 998, email: 'member@example.invalid', first_name: 'Thành viên', is_organization_manager: false, is_dept_manager: false, created_at: '2026-01-01T09:00:00' };
const categories = [{ id: 1, name: 'Hồ sơ vận hành', description: 'Dữ liệu kiểm thử', status: 1, department_id: 1, created_by: 'qa@example.invalid', created_at: '2026-01-01T09:00:00' }];
const document = { id: 1, fileId: 1, title: 'Báo cáo vận hành tháng 10', type: 'pdf', original_filename: 'bao-cao-van-hanh.pdf', file_path: 'fixture.pdf', created_by: 'qa@example.invalid', createdAt: '2026-01-01T09:00:00', created_at: '2026-01-01T09:00:00', storageCapacity: 2048, storage_unit: '2 KB' };
const pageOf = content => ({ content, number: 0, size: 10, totalElements: content.length, totalPages: 1 });

module.exports = { organization, departments, user, member, categories, document: document, pageOf };

if (require.main === module) (async () => {
    const stage = process.argv[3] || 'after';
    const base = process.argv[4] || 'http://localhost:5173';
    const output = process.env.AQUADOCS_QA_OUTPUT
        ? path.resolve(process.env.AQUADOCS_QA_OUTPUT)
        : path.join(__dirname, 'qa/application', stage);
    fs.mkdirSync(output, { recursive: true });
    if (stage === 'before' && fs.existsSync(path.join(output, 'results.json'))) {
        throw new Error('Preserved baseline already exists; use a separate output snapshot for a new baseline.');
    }
    const report = { mode: 'MOCKED_BACKEND_NOT_LIVE', stage, screens: [], checks: [], pageErrors: [], unexpectedApi: [] };
    const captureScreens = process.argv[5] !== 'interactions';
    const onlyAuth = process.argv[5] === 'auth-only';
    const authScreens = ['login', 'register', 'forgot'];
    if (!captureScreens || onlyAuth) {
        const previous = JSON.parse(fs.readFileSync(path.join(output, 'results.json'), 'utf8'));
        report.screens = onlyAuth ? previous.screens.filter(screen => !authScreens.includes(screen.name)) : previous.screens;
        report.checks = onlyAuth
            ? previous.checks.filter(check => !/^(login|register|forgot)( \d+:|: mobile)/.test(check.name))
            : previous.checks.filter(check => /: no page overflow|: no legacy product branding/.test(check.name));
        report.pageErrors = previous.pageErrors;
        report.unexpectedApi = previous.unexpectedApi;
    }
    const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
    const accessToken = [Buffer.from('{}').toString('base64url'), Buffer.from(JSON.stringify({ sub: user.email, exp: 4102444800 })).toString('base64url'), 'fixture-only'].join('.');
    const context = await browser.newContext({ deviceScaleFactor: 1 });
    let screenName = '';
    let emptyDocuments = false;
    let manager = true;
    let delayDocuments = false;
    const check = (name, pass, detail) => report.checks.push({ name, pass, detail });
    await context.addInitScript(({ accessToken }) => {
        if (location.pathname.startsWith('/home')) localStorage.setItem('accessToken', accessToken);
        else { localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken'); }
    }, { accessToken });
    await context.route('http://localhost:8080/**', async route => {
        const request = route.request();
        const url = new URL(request.url());
        const headers = { 'access-control-allow-origin': new URL(base).origin, 'access-control-allow-headers': '*' };
        const respond = body => route.fulfill({ status: 200, headers, contentType: 'application/json', body: JSON.stringify(body) });
        if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
        const p = url.pathname.replace('/api/v1', '');
        if (p === '/users/me') return respond({ ...user, organization_id: /^(no|create|pending)-organization$/.test(screenName) ? null : 1, is_organization_manager: manager, is_dept_manager: manager });
        if (p === '/organizations/1') return respond(organization);
        if (p === '/departments/organization/1') return respond(departments);
        if (p === '/organizations/1/members' || p === '/departments/1/members') return respond(pageOf([user, member]));
        if (p === '/organizations/check-pending-request') return respond({ has_pending_request: false });
        if (p === '/departments/1/categories') return respond(pageOf(categories));
        if (p === '/departments/1/categories/search') return respond(categories);
        if (p === '/categories/1') return respond(categories[0]);
        if (p === '/categories/1/documents') return respond(pageOf([document]));
        if (p === '/documents/all') {
            if (delayDocuments) await new Promise(resolve => setTimeout(resolve, 1500));
            return respond(emptyDocuments ? [] : [document]);
        }
        if (p === '/documents/filter' || p === '/documents/search') return respond(pageOf([document]));
        if (p === '/auth/email/verify' || p === '/invitation/accept' || p === '/auth/reset-password/request' || p === '/reset-password') return respond('Fixture successful');
        if (p === '/search-history/keywords') return respond([]);
        report.unexpectedApi.push({ screen: screenName, method: request.method(), path: p });
        return route.fulfill({ status: 500, headers, contentType: 'application/json', body: JSON.stringify({ message: 'Unexpected fixture request' }) });
    });
    const page = await context.newPage();
    page.on('pageerror', error => report.pageErrors.push({ screen: screenName, message: error.message }));
    try {
        if (captureScreens) for (const [width, height] of [[1440, 900], [390, 844]]) {
            await page.setViewportSize({ width, height });
            for (const [name, route] of routes) {
                if (onlyAuth && !authScreens.includes(name)) continue;
                screenName = name;
                await page.goto(base + route, { waitUntil: 'networkidle' });
                await page.evaluate(() => document.fonts.ready);
                await page.waitForTimeout(600);
                const geometry = await page.evaluate(() => ({
                    overflow: document.documentElement.scrollWidth > innerWidth,
                    scrollWidth: document.documentElement.scrollWidth,
                    title: document.title,
                    legacyBrand: /GENADATA|Genadata|Genadata Search/.test(document.body.innerText),
                    bodyText: document.body.innerText.slice(0, 180),
                }));
                report.screens.push({ name, route, width, height, ...geometry });
                await page.screenshot({ path: path.join(output, `${name}-${width}.png`), fullPage: true });
                if (stage === 'after') {
                    check(`${name} ${width}: no page overflow`, !geometry.overflow, geometry.scrollWidth);
                    check(`${name} ${width}: no legacy product branding`, !geometry.legacyBrand);
                    if (!route.startsWith('/home')) {
                        check(`${name} ${width}: source brand visible`, await page.getByRole('link', { name: 'AquaDocs AI — Trang chủ', exact: true }).isVisible());
                    }
                    if (width === 390 && ['login', 'register', 'forgot'].includes(name)) {
                        check(`${name}: mobile prioritizes form`, !await page.locator('.aquadocs-auth-artwork').isVisible());
                    }
                }
            }
        }
        if (stage === 'after' && !onlyAuth) {
            await page.setViewportSize({ width: 390, height: 844 });
            screenName = 'documents';
            await page.goto(base + '/home/document-management', { waitUntil: 'networkidle' });
            await page.getByRole('button', { name: 'Mở điều hướng', exact: true }).click();
            check('Mobile navigation drawer opens', await page.getByRole('dialog').isVisible());
            await page.getByRole('dialog').getByRole('menuitem', { name: /Trang chủ/ }).click();
            await page.waitForURL('**/home/dashboard');
            await page.waitForTimeout(700);
            check('Mobile menu navigates and dismisses', await page.getByRole('dialog').count() === 0);
            await page.setViewportSize({ width: 1440, height: 900 });
            await page.goto(base + '/home/document-management', { waitUntil: 'networkidle' });
            await page.getByRole('button', { name: 'Thu gọn điều hướng', exact: true }).click();
            await page.waitForTimeout(300);
            check('Desktop collapse preserves content offset', await page.locator('.site-layout').evaluate(e => getComputedStyle(e).marginLeft === '80px'));
            await page.getByRole('button', { name: 'Mở rộng điều hướng', exact: true }).click();
            check('Selection actions disabled without selection', await page.getByRole('button', { name: 'Xóa đã chọn (0)', exact: true }).isDisabled());
            await page.getByRole('button', { name: /Thêm tài liệu/ }).click();
            await page.getByRole('dialog').waitFor();
            check('Upload dialog opens', await page.getByRole('dialog').getByText('Chọn tệp', { exact: true }).isVisible());
            await page.screenshot({ path: path.join(output, 'upload-dialog.png') });
            await page.getByRole('button', { name: 'Hủy', exact: true }).click();
            await page.getByRole('button', { name: /Xem$/ }).click();
            check('Preview password dialog opens', await page.getByRole('dialog').getByText('Nhập mật khẩu', { exact: true }).isVisible());
            await page.getByRole('button', { name: 'Hủy', exact: true }).click();
            await page.getByRole('checkbox').first().check();
            check('Selection enables actions', await page.getByRole('button', { name: 'Xóa đã chọn (1)', exact: true }).isEnabled());
            emptyDocuments = true;
            await page.reload({ waitUntil: 'networkidle' });
            check('Document empty state renders', await page.locator('.ant-empty').isVisible());
            await page.screenshot({ path: path.join(output, 'documents-empty.png') });
            emptyDocuments = false;
            delayDocuments = true;
            await page.reload({ waitUntil: 'domcontentloaded' });
            await page.locator('.ant-spin-spinning').first().waitFor();
            check('Document loading state renders', await page.locator('.ant-spin-spinning').count() > 0);
            await page.screenshot({ path: path.join(output, 'documents-loading.png') });
            await page.waitForLoadState('networkidle');
            delayDocuments = false;
            screenName = 'dashboard';
            await page.goto(base + '/home/dashboard', { waitUntil: 'networkidle' });
            await page.getByPlaceholder('Tìm kiếm tài liệu theo từ khóa...').fill('vận hành');
            await page.getByPlaceholder('Tìm kiếm tài liệu theo từ khóa...').press('Enter');
            await page.waitForURL('**/home/document-management/search');
            await page.getByText('Báo cáo vận hành tháng 10', { exact: true }).waitFor();
            check('Existing search navigates with results', await page.getByText('Báo cáo vận hành tháng 10', { exact: true }).isVisible());
            await page.goto(base + '/home/organization/departments', { waitUntil: 'networkidle' });
            await page.getByRole('button', { name: /Thêm phòng ban/ }).click();
            check('Department modal opens', await page.getByRole('dialog').isVisible());
            await page.screenshot({ path: path.join(output, 'department-dialog.png') });
            await page.getByRole('button', { name: 'Hủy', exact: true }).click();
            manager = false;
            await page.reload({ waitUntil: 'networkidle' });
            check('Member cannot see department create action', await page.getByRole('button', { name: /Thêm phòng ban/ }).count() === 0);
            manager = true;
            await page.goto(base + '/login', { waitUntil: 'networkidle' });
            await page.locator('form').getByRole('button', { name: 'Đăng nhập', exact: true }).click();
            await page.waitForFunction(() => document.querySelectorAll('.ant-form-item-explain-error').length >= 2);
            check('Login required validation retained', await page.locator('.ant-form-item-explain-error').count() >= 2);
            await page.goto(base + '/forgot-password', { waitUntil: 'networkidle' });
            await page.getByPlaceholder('Nhập email của bạn').fill('qa@example.invalid');
            await page.getByRole('button', { name: 'Gửi yêu cầu', exact: true }).click();
            await page.getByText('Yêu Cầu Đã Được Gửi!', { exact: true }).waitFor();
            check('Forgot-password success state retained', true);
            await page.screenshot({ path: path.join(output, 'forgot-success.png') });

            const captureDialog = async name => {
                const dialog = page.getByRole('dialog');
                await dialog.waitFor();
                await page.waitForTimeout(350);
                check(`${name}: dialog content fits`, await dialog.evaluate(e => e.scrollWidth <= e.clientWidth + 1));
                await dialog.screenshot({ path: path.join(output, `${name}.png`) });
                await page.keyboard.press('Escape');
                await dialog.waitFor({ state: 'hidden' });
            };
            for (const width of [1440, 390]) {
                await page.setViewportSize({ width, height: 900 });
                screenName = 'dashboard';
                await page.goto(base + '/home/dashboard', { waitUntil: 'networkidle' });
                await page.getByRole('button', { name: 'Tìm kiếm nâng cao', exact: true }).click();
                await captureDialog(`advanced-search-${width}`);
                screenName = 'organization-info';
                await page.goto(base + '/home/organization/info', { waitUntil: 'networkidle' });
                await page.getByRole('button', { name: /Chỉnh sửa/ }).click();
                await captureDialog(`organization-edit-${width}`);
                screenName = 'members';
                await page.goto(base + '/home/organization/members', { waitUntil: 'networkidle' });
                await page.getByRole('button', { name: /Mời thành viên/ }).click();
                await page.getByRole('button', { name: /Thêm thành viên/ }).click();
                await captureDialog(`invite-member-${width}`);
                screenName = 'create-organization';
                await page.goto(base + '/home/create-organization', { waitUntil: 'networkidle' });
                await page.getByText('Điều khoản', { exact: true }).click();
                await captureDialog(`terms-${width}`);
                screenName = 'categories';
                await page.goto(base + '/home/document-management/1', { waitUntil: 'networkidle' });
                await page.getByRole('button', { name: /Thêm thư mục/ }).click();
                await captureDialog(`category-create-${width}`);
                screenName = 'documents';
                await page.goto(base + '/home/document-management', { waitUntil: 'networkidle' });
                await page.getByRole('button', { name: /Kiểm tra File Local/ }).click();
                check(`Watermark ${width}: action disabled without a file`, await page.getByRole('button', { name: 'Kiểm tra', exact: true }).isDisabled());
                await captureDialog(`watermark-${width}`);
                await page.getByRole('checkbox').first().check();
                await page.getByRole('button', { name: /Tải xuống đã chọn \(1\)/ }).click();
                await captureDialog(`multiple-download-${width}`);
            }
            await page.goto(base + '/register', { waitUntil: 'networkidle' });
            await page.getByLabel('Mật khẩu', { exact: true }).fill('Valid!234');
            await page.getByLabel('Xác nhận mật khẩu', { exact: true }).fill('Different!234');
            await page.getByRole('button', { name: 'Đăng ký', exact: true }).click();
            await page.getByText('Mật khẩu xác nhận không khớp!', { exact: true }).waitFor();
            check('Registration password mismatch validation retained', true);
            await page.screenshot({ path: path.join(output, 'register-validation-390.png'), fullPage: true });
            await page.goto(base + '/reset-password?token=fixture-only', { waitUntil: 'networkidle' });
            await page.getByLabel('Mật khẩu mới', { exact: true }).fill('Valid!234');
            await page.getByLabel('Xác nhận mật khẩu mới', { exact: true }).fill('Valid!234');
            await page.getByRole('button', { name: 'Đặt lại mật khẩu', exact: true }).click();
            await page.getByText('Đặt Lại Mật Khẩu Thành Công!', { exact: true }).waitFor();
            check('Reset-password success state retains AquaDocs shell', await page.getByRole('link', { name: 'AquaDocs AI — Trang chủ', exact: true }).isVisible());
            await page.screenshot({ path: path.join(output, 'reset-success-390.png'), fullPage: true });
            await page.emulateMedia({ reducedMotion: 'reduce' });
            await page.goto(base + '/login', { waitUntil: 'networkidle' });
            check('Reduced-motion route renders without entry translation', await page.locator('.main-content > div').evaluate(e => getComputedStyle(e).opacity === '1' && getComputedStyle(e).transform === 'none'));
            check('No uncaught browser errors', report.pageErrors.length === 0, report.pageErrors);
            check('No unexpected API requests', report.unexpectedApi.length === 0, report.unexpectedApi);
        }
    } finally {
        fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
        await browser.close();
    }
    console.log(JSON.stringify({ stage, screens: report.screens.length, checks: report.checks.length, failed: report.checks.filter(c => !c.pass), pageErrors: report.pageErrors, unexpectedApi: report.unexpectedApi }, null, 2));
    if (stage === 'after' && report.checks.some(c => !c.pass)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exitCode = 1; });
