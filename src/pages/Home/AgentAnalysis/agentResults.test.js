import test from 'node:test';
import assert from 'node:assert/strict';
import { apiRoot, formatViNumber, cellText, validateResult, validateChart, barLayout } from './agentResults.js';

test('exact large integer identifiers require text across results and charts', () => {
  assert.equal(cellText('1152921504606846976'), '1152921504606846976');
  assert.doesNotThrow(() => cellText(999999999999999));
  for (const value of [1000000000000000, -1000000000000000, 2 ** 60]) {
    assert.throws(() => cellText(value));
    assert.throws(() => validateResult({accepted:true,result_kind:'value',result:{id:value},charts:[],chart_data:[]}));
    assert.throws(() => validateChart({kind:'bar',orientation:'vertical',labels:['id'],series:[{values:[value],color:'#0068ff'}]}));
  }
});

test('Vietnamese numbers, null, markup text and API root preserve contracts', () => {
  assert.equal(formatViNumber(9378.5), '9 378,5');
  assert.equal(cellText(null), '—');
  assert.equal(cellText('<img src=x onerror=alert(1)>'), '<img src=x onerror=alert(1)>');
  assert.throws(() => formatViNumber(Infinity));
  assert.equal(apiRoot('http://localhost:8080/api/v1'), 'http://localhost:8080');
  assert.equal(apiRoot('/dms/api/v1/'), '/dms');
});

test('typed dynamic table rejects malformed, duplicate and nonfinite cells', () => {
  const output = { accepted: true, result_kind:'table', result:{columns:['Phường','m³'],rows:[['Đông Sơn',9378.5]]}, charts:[],chart_data:[] };
  assert.equal(validateResult(output).result.rows[0][0], 'Đông Sơn');
  for (const result of [{columns:['x'], rows:[[Infinity]]}, {columns:['x'],rows:[[1,2]]},
    {columns:['x','x'],rows:[]}, {columns:['x'],rows:[[{}]]}, {columns:['x'],rows:[],html:'bad'}]) {
    assert.throws(() => validateResult({...output,result}));
  }
  assert.throws(() => validateResult({...output,accepted:false,result:output.result}));
});

test('chart only admits finite bars, text labels and literal safe colors', () => {
  const chart = {kind:'bar',orientation:'horizontal',labels:['Đông Sơn'],series:[{name:'Tổng',values:[42],color:'#0068ff'}], title:'Nước',x_label:'m³',y_label:'Phường'};
  assert.equal(validateChart(chart).series[0].values[0],42);
  for (const change of [{url:'https://evil.invalid'}, {series:[{values:[Infinity],color:'#0068ff'}]},
    {series:[{values:[1],color:'url(https://evil.invalid)'}]}, {labels:['A','B']}, {kind:'svg'}]) {
    assert.throws(() => validateChart({...chart,...change}));
  }
});

test('TC15 stacked bars retain material boundaries and totals', () => {
  const chart = {kind:'bar',orientation:'horizontal',stacked:true,labels:['Hàm Rồng'],
    series:[{name:'BTCT',values:[959.1],color:'#0068ff'},{name:'HDPE',values:[426.5],color:'#00b890'}]};
  const layout = barLayout(validateChart(chart));
  assert.equal(layout.max,1385.6);
  assert.deepEqual(layout.bars.map(bar => [bar.start,bar.end]),[[0,959.1],[959.1,1385.6]]);
  assert.throws(() => validateChart({...chart,stacked:'true'}));
});
