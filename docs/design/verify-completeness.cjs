// Intercepted contracts, not live backend integration. Preserves earlier evidence.
const { chromium } = require(process.argv[2]);
const fs = require('node:fs');
const path = require('node:path');
const fixture = require('./verify-application.cjs');
const output = path.join(__dirname, 'qa/reverification');
fs.mkdirSync(output, { recursive: true });
const report = { mode: 'MOCKED_BACKEND_NOT_LIVE', checks: [], errors: [], requests: [] };
const check = (name, pass, detail) => report.checks.push({ name, pass, detail });
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const context = await browser.newContext();
  let servePdf = false;
  let metadataOnly = false;
  const token = `${Buffer.from('{}').toString('base64url')}.${Buffer.from(JSON.stringify({ sub: fixture.user.email, exp: 4102444800 })).toString('base64url')}.fixture`;
  await context.addInitScript(token => localStorage.setItem('accessToken', token), token);
  await context.route('http://localhost:8080/**', async route => {
    const req = route.request();
    const p = new URL(req.url()).pathname.replace('/api/v1', '');
    const headers = { 'access-control-allow-origin': 'http://localhost:5173', 'access-control-allow-headers': '*' };
    if (req.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
    if (req.method() === 'DELETE') {
      report.requests.push({ p, method: 'DELETE' });
      return route.fulfill({ status: 204, headers });
    }
    const data = {
      '/users/me': fixture.user, '/organizations/1': fixture.organization,
      '/departments/organization/1': fixture.departments,
      '/organizations/1/members': fixture.pageOf([fixture.user, fixture.member]),
      '/departments/1/categories': fixture.pageOf(fixture.categories),
      '/categories/1/documents': fixture.pageOf([fixture.document]),
      '/documents/all': metadataOnly ? [{ id: 71, title: 'Metadata only', originalFilename: 'sample.pdf', type: 'pdf', createdAt: '2026-01-01' }, { id: 72, title: 'Second metadata record', type: 'pdf', createdAt: '2026-01-01' }] : [fixture.document], '/search-history/keywords': [],
      '/documents/filter': fixture.pageOf([fixture.document]),
    };
    if (p.endsWith('/download') || p.endsWith('/retrieve')) {
      report.requests.push({ p, authorization: req.headers().authorization === `Bearer ${token}` });
      return servePdf
        ? route.fulfill({ status: 200, headers, contentType: 'application/pdf', body: fs.readFileSync(path.join(output, 'sample.pdf')) })
        : route.fulfill({ status: 503, headers, body: 'Fixture preview unavailable' });
    }
    if (req.method() === 'POST') {
      const body = req.postDataBuffer()?.toString() || '';
      report.requests.push({ p, category: body.includes('name="categoryId"'), metadata: body.includes('name="metadata"'), file: body.includes('sample.txt') });
      return route.fulfill({ status: 200, headers, contentType: 'application/json', body: '{}' });
    }
    return route.fulfill({ status: p in data ? 200 : 500, headers, contentType: 'application/json', body: JSON.stringify(data[p] ?? { message: 'Unexpected fixture' }) });
  });
  const page = await context.newPage();
  page.on('pageerror', e => report.errors.push(e.message));
  try {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
      await page.goto('http://localhost:5173/home/document-management/1/1', { waitUntil: 'networkidle' });
      await page.screenshot({ path: path.join(output, `initial-${width}.png`) });
      await page.getByRole('button', { name: /Thêm File/ }).click();
      const dialog = page.getByRole('dialog');
      check(`${width}: category upload opens`, await dialog.count() === 1);
      const beforeInvalidSubmit = report.requests.length;
      await dialog.getByRole('button', { name: 'Tải lên', exact: true }).click();
      await dialog.getByText('Vui lòng nhập tiêu đề.').waitFor();
      await dialog.getByText('Vui lòng chọn ít nhất một tệp.').waitFor();
      check(`${width}: required metadata and file validation`, await dialog.getByText('Vui lòng nhập tiêu đề.').isVisible() && await dialog.getByText('Vui lòng chọn ít nhất một tệp.').isVisible());
      check(`${width}: invalid upload sends no request`, report.requests.length === beforeInvalidSubmit);
      await page.screenshot({ path: path.join(output, `category-upload-validation-${width}.png`) });
      await dialog.getByLabel('Tiêu đề tài liệu').fill('QA document');
      await dialog.locator('input[type=file]').setInputFiles({ name: 'sample.txt', mimeType: 'text/plain', buffer: Buffer.from('AquaDocs QA fixture') });
      await dialog.getByRole('button', { name: 'Tải lên', exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
      const feedback = await page.locator('.ant-message-notice-content').last().evaluate(e => ({ color: getComputedStyle(e).color, font: getComputedStyle(e).fontFamily }));
      check(`${width}: static feedback inherits AquaDocs theme`, feedback.color === 'rgb(16, 37, 82)' && feedback.font.includes('Be Vietnam Pro'), feedback);
      check(`${width}: category upload submits existing metadata contract`, report.requests.some(r => r.p === '/documents' && r.metadata && r.file));
      await page.getByRole('button', { name: /bao-cao-van-hanh.pdf/ }).click();
      await dialog.getByText(/Không thể xem tệp/).waitFor();
      check(`${width}: one preview, authenticated numeric download`, await dialog.count() === 1 && report.requests.some(r => r.p === '/documents/1/download' && r.authorization));
      check(`${width}: unavailable file cannot download`, await dialog.getByRole('button', { name: /Tải xuống/ }).isDisabled());
      const requestsBefore = report.requests.length;
      await dialog.getByRole('button', { name: 'Thử lại', exact: true }).click();
      await page.waitForTimeout(400);
      check(`${width}: preview retry sends another request`, report.requests.length > requestsBefore);
      await page.screenshot({ path: path.join(output, `preview-error-${width}.png`) });
      await dialog.getByRole('button', { name: 'Đóng', exact: true }).click();
      await page.goto('http://localhost:5173/home/document-management', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: /Thêm tài liệu/ }).click();
      await dialog.getByRole('button', { name: 'Tải lên', exact: true }).click();
      await dialog.getByText('Vui lòng chọn phòng ban.').waitFor();
      check(`${width}: multi upload validates destination`, await dialog.getByText('Vui lòng chọn phòng ban.').isVisible());
      await dialog.getByLabel('Phòng ban').click();
      await page.locator('.ant-select-item-option-content').getByText('Vận hành', { exact: true }).click();
      await dialog.getByLabel('Thư mục').click();
      await page.locator('.ant-select-item-option-content').getByText('Hồ sơ vận hành', { exact: true }).click();
      await dialog.getByLabel('Mật khẩu').fill('QA-only');
      await dialog.locator('input[type=file]').setInputFiles({ name: 'sample.txt', mimeType: 'text/plain', buffer: Buffer.from('AquaDocs QA fixture') });
      await page.screenshot({ path: path.join(output, `multi-upload-${width}.png`) });
      await dialog.getByRole('button', { name: 'Tải lên', exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
      check(`${width}: multi upload sends category and file`, report.requests.some(r => r.p === '/documents/upload-multiple' && r.category && r.file));
      await page.goto('http://localhost:5173/home/document-management/1/1', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Tìm kiếm nâng cao', exact: true }).click();
      await dialog.getByPlaceholder('Từ ngày').click();
      await page.waitForTimeout(400);
      const geometry = await page.locator('.ant-picker-panel-container:visible').evaluate(e => { const r = e.getBoundingClientRect(); return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, viewport: innerWidth, viewportHeight: innerHeight }; });
      check(`${width}: range calendar fits viewport`, geometry.left >= 0 && geometry.right <= width && geometry.top >= 0 && geometry.bottom <= geometry.viewportHeight, geometry);
      await page.screenshot({ path: path.join(output, `calendar-${width}.png`) });
      const dates = page.locator('.ant-picker-panel:visible').first().locator('.ant-picker-cell-in-view .ant-picker-cell-inner');
      await dates.nth(9).click();
      await dates.nth(14).click();
      check(`${width}: calendar selects date range`, Boolean(await dialog.getByPlaceholder('Từ ngày').inputValue()) && Boolean(await dialog.getByPlaceholder('Đến ngày').inputValue()));
    }
    await page.keyboard.press('Escape');
    await page.goto('http://localhost:5173/home/document-management/search', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Tìm kiếm nâng cao', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Tìm kiếm', exact: true }).click();
    await page.getByRole('button', { name: /bao-cao-van-hanh.pdf/ }).click();
    await page.getByRole('dialog').getByText(/Không thể xem tệp/).waitFor();
    check('Search has one authenticated preview', await page.getByRole('dialog').count() === 1);
    servePdf = true;
    await page.getByRole('dialog').getByRole('button', { name: 'Thử lại', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: /Tải xuống/ }).waitFor({ state: 'visible' });
    await page.waitForFunction(() => !document.querySelector('[role=status]'), { timeout: 60000 });
    check('PDF renderer completes without error', !await page.getByRole('dialog').getByText(/Không thể xem tệp/).isVisible());
    const downloadEvent = page.waitForEvent('download');
    await page.getByRole('dialog').getByRole('button', { name: /Tải xuống/ }).click();
    const download = await downloadEvent;
    check('Preview downloads authorized blob with filename', download.suggestedFilename() === 'bao-cao-van-hanh.pdf');
    await page.screenshot({ path: path.join(output, 'preview-pdf-390.png') });
    metadataOnly = true;
    await page.goto('http://localhost:5173/home/document-management', { waitUntil: 'networkidle' });
    check('Missing UUID disables preview instead of sending undefined', await page.getByRole('button', { name: /Xem$/ }).first().isDisabled());
    await page.getByRole('row').filter({ hasText: 'Metadata only' }).getByRole('checkbox').check();
    check('Numeric row ID selects only one record', await page.getByRole('button', { name: 'Xóa đã chọn (1)', exact: true }).isEnabled());
    check('Missing UUID disables multi-download', await page.getByRole('button', { name: /Tải xuống đã chọn \(1\)/ }).isDisabled());
    await page.screenshot({ path: path.join(output, 'metadata-only-390.png') });
    await page.getByRole('row').filter({ hasText: 'Metadata only' }).getByRole('button', { name: /Xóa/ }).click();
    await page.getByRole('button', { name: 'Có', exact: true }).click();
    await page.waitForTimeout(300);
    check('Deletion uses numeric document ID, not missing UUID', report.requests.some(r => r.method === 'DELETE' && r.p === '/documents/71'));
  } catch (e) { report.errors.push(e.stack); }
  finally {
    await browser.close();
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify({ checks: report.checks.length, failed: report.checks.filter(c => !c.pass), errors: report.errors }, null, 2));
    if (report.errors.length || report.checks.some(c => !c.pass)) process.exitCode = 1;
  }
})();
