export function apiRoot(baseURL = '') {
  return baseURL.replace(/\/api\/v1\/?$/, '').replace(/\/$/, '');
}

function interoperableNumber(value) {
  return typeof value === 'number' && Number.isFinite(value)
    && (!Number.isInteger(value) || Math.abs(value) <= 999999999999999);
}

export function formatViNumber(value) {
  if (!interoperableNumber(value)) throw new Error('Giá trị số không hợp lệ.');
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 12 }).format(value).replace(/\./g, ' ');
}

export function cellText(value) {
  if (value === null) return '—';
  if (typeof value === 'number') return formatViNumber(value);
  if (typeof value === 'string') return value;
  throw new Error('Ô dữ liệu không hợp lệ.');
}

export function validateChart(chart) {
  if (!chart || chart.kind !== 'bar' || !['horizontal', 'vertical'].includes(chart.orientation)
    || Object.keys(chart).some(key => !['kind','orientation','labels','series','title','x_label','y_label','stacked'].includes(key))
    || (chart.stacked !== undefined && typeof chart.stacked !== 'boolean')
    || !Array.isArray(chart.labels) || chart.labels.length > 500 || chart.labels.some(label => typeof label !== 'string' || label.length > 200)
    || !Array.isArray(chart.series) || chart.series.length > 20
    || ['title','x_label','y_label'].some(key => chart[key] !== undefined && (typeof chart[key] !== 'string' || chart[key].length > 200))) throw new Error('Biểu đồ không hợp lệ.');
  for (const series of chart.series) {
    if (!series || Object.keys(series).some(key => !['name','color','values'].includes(key))
      || (series.name !== undefined && (typeof series.name !== 'string' || series.name.length > 200))
      || !/^#[0-9a-f]{6}$/i.test(series.color) || !Array.isArray(series.values) || series.values.length !== chart.labels.length
      || series.values.some(value => !interoperableNumber(value))) throw new Error('Chuỗi biểu đồ không hợp lệ.');
  }
  return chart;
}

export function barLayout(chart) {
  const positive = chart.labels.map(() => 0), negative = chart.labels.map(() => 0);
  const bars = chart.series.flatMap((series, s) => series.values.map((value, i) => {
    const start = chart.stacked ? (value >= 0 ? positive[i] : negative[i]) : 0;
    const end = start + value;
    if (value >= 0) positive[i] = end; else negative[i] = end;
    return { series, s, i, value, start, end };
  }));
  return { bars, min: Math.min(0, ...bars.map(bar => bar.start), ...bars.map(bar => bar.end)),
    max: Math.max(0, ...bars.map(bar => bar.start), ...bars.map(bar => bar.end)) };
}

function jsonValue(value, depth = 0) {
  if (depth > 15) throw new Error('Kết quả quá phức tạp.');
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return;
  if (interoperableNumber(value)) return;
  if (Array.isArray(value)) { value.forEach(item => jsonValue(item, depth + 1)); return; }
  if (value && typeof value === 'object') { Object.values(value).forEach(item => jsonValue(item, depth + 1)); return; }
  throw new Error('Kết quả không hợp lệ.');
}

export function validateResult(output) {
  if (!output || typeof output.accepted !== 'boolean') throw new Error('Trạng thái kết quả không hợp lệ.');
  if (!output.accepted) {
    if (output.result != null || output.charts?.length || output.chart_data?.length) throw new Error('Kết quả chưa được chấp nhận.');
    return output;
  }
  if (!output || typeof output !== 'object' || typeof output.accepted !== 'boolean') throw new Error('Phản hồi không hợp lệ.');
  if (!output.accepted) return output;
  if (output.result_kind === 'table') {
    const table = output.result;
    if (!table || Object.keys(table).some(key => !['columns','rows','n_rows'].includes(key))
      || !Array.isArray(table.columns) || table.columns.length > 100 || new Set(table.columns).size !== table.columns.length
      || table.columns.some(column => typeof column !== 'string' || !column || column.length > 200)
      || !Array.isArray(table.rows) || table.rows.length > 5000
      || (table.n_rows !== undefined && table.n_rows !== table.rows.length)
      || table.rows.some(row => !Array.isArray(row) || row.length !== table.columns.length)) throw new Error('Bảng kết quả không hợp lệ.');
    table.rows.forEach(row => row.forEach(cellText));
  } else if (output.result_kind === 'value') jsonValue(output.result);
  else throw new Error('Loại kết quả không được hỗ trợ.');
  if (!Array.isArray(output.charts) || output.charts.length > 4 || !Array.isArray(output.chart_data) || output.chart_data.length > 4) throw new Error('Biểu đồ không hợp lệ.');
  output.chart_data.filter(Boolean).forEach(validateChart);
  if (new TextEncoder().encode(JSON.stringify(output)).length > 10 * 1024 * 1024) throw new Error('Kết quả vượt giới hạn.');
  return output;
}

export function errorMessage(error) {
  const status = error.response?.status;
  return ({403:'Quyền truy cập đã thay đổi. Vui lòng kiểm tra quyền và gửi lại câu hỏi.',404:'Không tìm thấy kết quả.',
    410:'Kết quả đã hết hạn. Vui lòng gửi lại câu hỏi.',429:'Bạn đã đạt giới hạn yêu cầu. Vui lòng thử lại sau một phút.',
    503:'Dịch vụ phân tích đang không sẵn sàng. Vui lòng thử lại.'})[status] || 'Không thể xử lý yêu cầu. Vui lòng thử lại.';
}
