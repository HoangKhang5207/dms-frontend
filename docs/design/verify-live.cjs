// REAL backend only. Requires scripts/qa runtime; never records credentials, tokens or email bodies.
const { chromium } = require(process.argv[2]);
const fs = require('node:fs');
const path = require('node:path');
const credentials = JSON.parse(fs.readFileSync('.runtime.local/credentials.json', 'utf8'));
const output = path.join(__dirname, 'qa/reverification/live');
fs.mkdirSync(output, { recursive: true });
const phase = process.argv[3] || 'account';
const report = { mode: 'REAL_ISOLATED_BACKEND', phase, checks: [], responses: [], errors: [] };
const check = (name, pass, detail) => report.checks.push({ name, pass, detail });
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.on('response', response => {
    if (response.url().startsWith('http://localhost:8080/api/')) report.responses.push({ path: new URL(response.url()).pathname, method: response.request().method(), status: response.status() });
  });
  page.on('pageerror', e => report.errors.push(e.message));
  try {
    if (phase === 'account') {
      await page.goto('http://localhost:5173/register', { waitUntil: 'networkidle' });
      await page.getByLabel('Họ và tên đệm', { exact: true }).fill('AquaDocs');
      await page.getByLabel('Tên', { exact: true }).fill('QA');
      await page.getByLabel('Giới tính', { exact: true }).click();
      await page.locator('.ant-select-item-option-content').getByText('Nam', { exact: true }).click();
      await page.getByLabel('Email', { exact: true }).fill(credentials.email);
      await page.getByLabel('Mật khẩu', { exact: true }).fill(credentials.password);
      await page.getByLabel('Xác nhận mật khẩu', { exact: true }).fill(credentials.password);
      await page.getByRole('button', { name: 'Đăng ký', exact: true }).click();
      await page.waitForURL('**/verify-email-message', { timeout: 30000 });
      check('Real signup reaches verification notice', true);
      await page.screenshot({ path: path.join(output, 'signup-notice.png') });
      const messages = await (await context.request.get('http://127.0.0.1:58025/api/v1/messages')).json();
      const message = messages.messages.find(m => m.To.some(to => to.Address === credentials.email));
      check('SMTP captured verification email locally', Boolean(message));
      const mail = await (await context.request.get(`http://127.0.0.1:58025/api/v1/message/${message.ID}`)).json();
      check('Email subject uses AquaDocs', /AquaDocs/i.test(mail.Subject), 'Existing backend email branding; no mail body recorded');
      const link = mail.HTML.match(/href="(http:\/\/localhost:5173\/verifired[^"\s]*)"/)[1].replaceAll('&amp;', '&');
      await page.goto(link, { waitUntil: 'networkidle' });
      await page.getByText('Xác Thực Thành Công!', { exact: true }).waitFor();
      check('Real email verification activates account', true);
    }
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
    await page.getByLabel('Email', { exact: true }).fill(credentials.email);
    await page.getByLabel('Mật khẩu', { exact: true }).fill(credentials.password);
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await page.waitForURL('**/home/**', { timeout: 30000 });
    check('Real login opens protected workspace', true);
    await page.screenshot({ path: path.join(output, `${phase}-workspace.png`) });
    const token = await page.evaluate(() => localStorage.getItem('accessToken'));
    const headers = { Authorization: `Bearer ${token}` };
    const meResponse = await context.request.get('http://localhost:8080/api/v1/users/me', { headers });
    const me = await meResponse.json();
    check('Signed session returns current account', meResponse.ok() && me.email === credentials.email);
    if (phase === 'transfers') {
      await page.goto('http://localhost:5173/home/document-management', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: /Thêm tài liệu/ }).click();
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('Phòng ban').click();
      await page.locator('.ant-select-item-option-content').first().click();
      await dialog.getByLabel('Thư mục').click();
      await page.locator('.ant-select-item-option-content').getByText('QA water samples', { exact: true }).click();
      await dialog.getByLabel('Mật khẩu').fill(credentials.file_password);
      await dialog.locator('input[type=file]').setInputFiles(path.join(__dirname, 'qa/reverification/sample.pdf'));
      const responseEvent = page.waitForResponse(r => r.url().endsWith('/documents/upload-multiple') && r.request().method() === 'POST');
      await dialog.getByRole('button', { name: 'Tải lên', exact: true }).click();
      const response = await responseEvent;
      check('Real encrypted multi-upload succeeds', response.ok(), { status: response.status() });
      check('Real upload failure retains entered data', response.ok() || await dialog.getByLabel('Mật khẩu').inputValue() === credentials.file_password);
      await page.screenshot({ path: path.join(output, 'multi-upload-live.png') });
    }
    if (phase === 'workspace' || phase === 'seeded') {
      await page.goto('http://localhost:5173/home/organization/info', { waitUntil: 'networkidle' });
      check('Real organization detail renders', await page.getByText('AquaDocs QA', { exact: true }).count() > 0);
      await page.goto('http://localhost:5173/home/document-management', { waitUntil: 'networkidle' });
      const all = await (await context.request.get('http://localhost:8080/api/v1/documents/all', { headers })).json();
      check('Live document IDs are stable and unique', all.every(d => d.id != null) && new Set(all.map(d => d.id)).size === all.length);
      check('Live documents expose UUID required for encrypted retrieval', all.every(d => d.fileId != null), 'Backend /documents/all currently returns numeric id, not fileId');
      await page.screenshot({ path: path.join(output, 'documents-live.png') });
      let categoryUrl;
      if (phase === 'workspace') {
      const folderName = `QA water operations ${Date.now()}`;
      await page.goto('http://localhost:5173/home/document-management/1', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: /Thêm thư mục/ }).click();
      let dialog = page.getByRole('dialog');
      await dialog.getByLabel('Tên thư mục', { exact: true }).fill(folderName);
      await dialog.getByLabel('Mô tả', { exact: true }).fill('Disposable water operations test folder');
      await dialog.getByRole('button', { name: 'Tạo', exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
      await page.getByRole('link', { name: folderName }).click();
      categoryUrl = page.url();
      check('Real category creation and navigation', /\/1\/\d+$/.test(categoryUrl));
      await page.getByRole('button', { name: /Thêm File/ }).click();
      dialog = page.getByRole('dialog');
      await dialog.getByLabel('Tiêu đề tài liệu').fill('AquaDocs QA water report');
      await dialog.locator('input[type=file]').setInputFiles(path.join(__dirname, 'qa/reverification/sample.pdf'));
      await dialog.getByRole('button', { name: 'Tải lên', exact: true }).click();
      await dialog.waitFor({ state: 'hidden', timeout: 30000 });
      check('Real metadata PDF upload appears in category', await page.getByText('AquaDocs QA water report', { exact: true }).isVisible());
      } else {
        const sampleResponse = await context.request.get('http://localhost:8080/api/v1/documents/filter?title=AquaDocs%20QA%20sample%20report', { headers });
        const sample = (await sampleResponse.json()).content.find(d => d.title === 'AquaDocs QA sample report');
        categoryUrl = `http://localhost:5173/home/document-management/${sample.department_id}/${sample.category_id}`;
        await page.goto(categoryUrl, { waitUntil: 'networkidle' });
        check('Explicit QA sample record loads from database', await page.getByText('AquaDocs QA sample report', { exact: true }).isVisible());
      }
      const dialog = page.getByRole('dialog');
      await page.getByRole('button', { name: /sample.pdf/ }).click();
      await page.locator('[role=status]').waitFor({ state: 'visible' });
      await page.waitForFunction(() => !document.querySelector('[role=status]'), null, { timeout: 60000 });
      check('Real PDF preview renders', !await dialog.getByText(/Không thể xem tệp/).isVisible());
      const downloadEvent = page.waitForEvent('download');
      await dialog.getByRole('button', { name: /Tải xuống/ }).click();
      const download = await downloadEvent;
      await download.saveAs('.runtime.local/downloaded-sample.pdf');
      check('Real download matches original PDF bytes', fs.readFileSync('.runtime.local/downloaded-sample.pdf').equals(fs.readFileSync(path.join(__dirname, 'qa/reverification/sample.pdf'))));
      await page.screenshot({ path: path.join(output, 'preview-real-pdf.png') });
      await dialog.getByRole('button', { name: 'Đóng', exact: true }).click();
      const sampleTitle = phase === 'seeded' ? 'AquaDocs QA sample report' : 'AquaDocs QA water report';
      await page.getByRole('textbox', { name: 'Tìm kiếm tài liệu', exact: true }).fill(sampleTitle);
      await page.getByRole('textbox', { name: 'Tìm kiếm tài liệu', exact: true }).press('Enter');
      await page.waitForURL('**/document-management/search');
      await page.getByText(sampleTitle, { exact: true }).waitFor();
      check('Real title search returns sample document', true);
      await page.screenshot({ path: path.join(output, 'search-real.png') });
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(categoryUrl, { waitUntil: 'networkidle' });
      check('Real category data fits mobile viewport', await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      await page.screenshot({ path: path.join(output, 'category-real-390.png') });
      const refreshToken = await page.evaluate(() => localStorage.getItem('refreshToken'));
      const refresh = await context.request.post('http://localhost:8080/api/v1/auth/refresh-token', { data: { refresh_token: refreshToken } });
      check('Real Redis-backed refresh rotates session', refresh.ok() && Boolean((await refresh.json()).access_token));
      const anonymous = await context.request.get('http://localhost:8080/api/v1/users/me');
      check('Backend rejects anonymous session', [401, 403].includes(anonymous.status()));
    }
    check('No uncaught frontend exceptions', report.errors.length === 0);
  } catch (e) {
    // Avoid writing request URLs containing reset/access tokens.
    report.errors.push(e.message.replace(/(token=)[^\s"&]+/gi, '$1[REDACTED]'));
    await page.screenshot({ path: path.join(output, `${phase}-failure.png`) }).catch(() => {});
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(output, `${phase}-results.json`), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ phase, checks: report.checks.length, failed: report.checks.filter(c => !c.pass), errors: report.errors, statuses: report.responses.reduce((out, r) => {out[r.status] = (out[r.status] || 0) + 1; return out;}, {}) }, null, 2));
    if (report.errors.length || report.checks.some(c => !c.pass)) process.exitCode = 1;
  }
})();
