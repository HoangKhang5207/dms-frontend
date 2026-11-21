// Intercepted fixtures only. This does not establish real DMS/model integration.
// node scripts/qa/gaa-browser.cjs <existing-playwright-package> <base-url> <output-outside-watched-tree>
const { chromium } = require(process.argv[2] || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const base = process.argv[3] || 'http://127.0.0.1:5175';
const output = path.resolve(process.argv[4] || '../gaa-ui-evidence');
const user = {id:999,email:'qa@example.invalid',first_name:'Kiểm thử',last_name:'AquaDocs',status:1,organization_id:1,department_id:1,is_organization_manager:true,is_dept_manager:true};
const subject = {sub:'999',org:'1',dept:'1',roles:[],perms:['gaa.analytics','gaa.search','gaa.export'],denied_perms:[],areas:['Đông Sơn'],area_unrestricted:false,mfa:true,mfa_simulated:true};
const result = {accepted:true,request_id:'fixture-only',result_id:'fixture-result',intent:'data_analysis',answer:'Tổng chiều dài: 9 378,5 m.',
  result_kind:'table', result:{columns:['Phường','Tổng chiều dài (m)','Ghi chú'],rows:[['Đông Sơn',9378.5,'<img src=x onerror="window.bad=1">']]},
  charts:[],chart_data:[{kind:'bar',orientation:'horizontal',labels:['Đông Sơn'],series:[{name:'Chiều dài',values:[9378.5],color:'#0068ff'}],title:'Chiều dài theo phường',x_label:'m',y_label:'Phường'}],
  model_provider:'local',cloud_tokens:0,
  citations:[],policy_notes:['Dữ liệu giả lập kiểm thử giao diện.'],trace:[
    {agent:'gateway',status:'ok',ms:12,detail:{column_policy:'Không chuyển cột tọa độ.',policy_reasons:['ABAC: lọc phường = Đông Sơn']}},
    {agent:'sandbox',status:'ok',ms:20,detail:{network:'none'}}],plan:{queries:[{dataset:'doan_cong',columns:['phuong','chieu_dai_m'],filters:[]}]}};

(async () => {
  fs.mkdirSync(output,{recursive:true});
  const report={mode:'INTERCEPTED_FIXTURES_NOT_LIVE',checks:[],pageErrors:[],unexpected:[]};
  let lastPage;
  const browser=await chromium.launch({executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try {
    for (const [width,height] of [[1440,900],[390,844]]) {
      const context=await browser.newContext({viewport:{width,height}});
      const access=[Buffer.from('{}').toString('base64url'),Buffer.from(JSON.stringify({sub:user.email,exp:4102444800})).toString('base64url'),'fixture'].join('.');
      await context.addInitScript(token=>localStorage.setItem('accessToken',token),access);
      let perms=[...subject.perms], askStatus=200, delay=0, exportStatus=200;
      await context.route('http://localhost:8080/**',async route=>{
        const request=route.request(), url=new URL(request.url());
        const headers={'access-control-allow-origin':new URL(base).origin,'access-control-allow-headers':'*'};
        const respond=(body,status=200)=>route.fulfill({status,headers,contentType:'application/json',body:JSON.stringify(body)});
        if(request.method()==='OPTIONS') return route.fulfill({status:204,headers});
        if(url.pathname==='/api/v1/users/me') return respond(user);
        if(url.pathname==='/api/v1/organizations/1') return respond({id:1,name:'AquaDocs · QA',status:1,limit_data:1073741824,data_used:0,percent_data_used:0});
        if(url.pathname==='/api/v1/departments/organization/1') return respond([{id:1,name:'Vận hành',status:1}]);
        if(url.pathname==='/api/v1/organizations/1/members') return respond({content:[user],number:0,size:10,totalElements:1,totalPages:1});
        if(url.pathname==='/api/v1/search-history/keywords') return respond([]);
        if(url.pathname==='/api/webdoc/context') return respond({...subject,perms});
        if(url.pathname==='/api/webdoc/ask') {
          assert.equal(JSON.parse(request.postData()).question.length>0,true);
          if(delay) await new Promise(resolve=>setTimeout(resolve,delay));
          try { return await respond(askStatus===200 ? result : {message:'fixture denied'},askStatus); } catch(error) { if(!request.failure()) throw error; return; }
        }
        if(url.pathname.startsWith('/api/webdoc/results/')) return exportStatus===200
          ? route.fulfill({status:200,headers,contentType:'text/csv',body:'Phường,Tổng\nĐông Sơn,9378.5\n'}) : respond({message:'denied'},exportStatus);
        report.unexpected.push(url.pathname); return respond({message:'Unexpected fixture request'},500);
      });
      const page=await context.newPage();
      lastPage=page;
      page.on('pageerror',error=>report.pageErrors.push(error.message));
      const check=(name,pass)=>{report.checks.push({width,name,pass});assert.ok(pass,`${width}: ${name}`);};
      await page.goto(base+'/home/agent-analysis');
      await page.getByRole('textbox',{name:'Câu hỏi'}).fill('Tổng chiều dài cống D600 theo phường');
      await page.getByRole('button',{name:'Phân tích',exact:true}).click();
      await page.getByText('Tổng chiều dài: 9 378,5 m.',{exact:true}).waitFor();
      check('markup inert',await page.evaluate(()=>!window.bad && !document.querySelector('.gaa-table img')));
      check('Vietnamese value',await page.getByRole('cell',{name:'9 378,5',exact:true}).count()>0);
      const bar=page.locator('svg rect[role=button]').first();await bar.focus();await bar.press('Enter');
      check('keyboard chart value',await page.locator('.gaa-chart-value').innerText().then(text=>text.includes('9 378,5')));
      check('page has no horizontal overflow',await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
      await page.getByText('Các bước xử lý',{exact:true}).click();
      await page.getByText('Mô hình nội bộ. Token đám mây: 0.',{exact:true}).waitFor({timeout:5000});
      check('trace internal model and zero cloud tokens visible',true);
      await page.getByText('Không chuyển cột tọa độ.',{exact:true}).waitFor();
      await page.getByText('ABAC: lọc phường = Đông Sơn',{exact:true}).waitFor();
      check('trace actual column and ward policy visible',true);
      await page.getByText('Mạng sandbox: none',{exact:true}).waitFor();
      check('trace sandbox network visible',true);
      await page.screenshot({path:path.join(output,`allowed-${width}.png`),fullPage:true});
      const download=page.waitForEvent('download');await page.getByRole('button',{name:'Xuất CSV',exact:true}).click();await download;
      check('export download',true);
      exportStatus=403;
      const refreshed=page.waitForResponse(response=>response.url().endsWith('/api/webdoc/context'));
      await page.getByRole('button',{name:'Xuất XLSX',exact:true}).click();
      await refreshed;
      await page.getByRole('textbox',{name:'Câu hỏi'}).waitFor();
      await page.getByText('Quyền truy cập đã thay đổi. Vui lòng kiểm tra quyền và gửi lại câu hỏi.',{exact:true}).waitFor();
      check('export denial survives context refresh',true);
      check('export rejection clears previous result',await page.getByText('Tổng chiều dài: 9 378,5 m.',{exact:true}).count()===0);
      askStatus=503;await page.getByRole('textbox',{name:'Câu hỏi'}).fill('Thử dịch vụ lỗi');await page.getByRole('button',{name:'Phân tích',exact:true}).click();
      await page.getByText('Dịch vụ phân tích đang không sẵn sàng. Vui lòng thử lại.',{exact:true}).waitFor();check('503 visible',true);
      askStatus=403;perms=[];await page.getByRole('textbox',{name:'Câu hỏi'}).fill('Kiểm tra thu hồi quyền');
      await page.getByRole('button',{name:'Phân tích',exact:true}).click();
      await page.getByText('Bạn chưa có quyền phân tích tài liệu',{exact:true}).waitFor();check('revoked permission denies next request',true);
      await page.reload();await page.getByText('Bạn chưa có quyền phân tích tài liệu',{exact:true}).waitFor();check('direct route denied',true);
      await page.screenshot({path:path.join(output,`denied-${width}.png`),fullPage:true});
      perms=[...subject.perms];askStatus=200;delay=1000;await page.reload();await page.getByRole('textbox',{name:'Câu hỏi'}).fill('Đến muộn');
      const pendingRequest=page.waitForRequest(request=>request.url().endsWith('/api/webdoc/ask'));
      await page.getByRole('button',{name:'Phân tích',exact:true}).click();await pendingRequest;
      await page.getByRole('button',{name:'Tài khoản người dùng'}).click();await page.getByRole('menuitem',{name:'Đăng xuất'}).click();
      await page.waitForURL('**/login');await page.waitForTimeout(1200);
      check('late response after logout absent',await page.getByText('Tổng chiều dài: 9 378,5 m.',{exact:true}).count()===0);
      await context.close();
    }
    assert.deepEqual(report.pageErrors,[]);assert.deepEqual(report.unexpected,[]);
    console.log(JSON.stringify({checks:report.checks.length,passed:report.checks.filter(c=>c.pass).length,mode:report.mode}));
  } finally {if(lastPage && !lastPage.isClosed()) report.lastBody=await lastPage.locator('body').innerText(); fs.writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
