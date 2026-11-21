import { useId, useState } from 'react';
import { formatViNumber, barLayout } from './agentResults';
import AgentResultTable from './AgentResultTable';

export default function AgentChart({ chart }) {
  const id = useId();
  const [active, setActive] = useState('Chọn hoặc di chuyển đến một cột để xem giá trị.');
  const horizontal = chart.orientation === 'horizontal';
  const { bars, min, max } = barLayout(chart);
  const range = max - min || 1;
  const width = horizontal ? 700 : Math.max(700, chart.labels.length * 75);
  const height = horizontal ? Math.max(260, chart.labels.length * 55 + 80) : 350;
  const left = horizontal ? 180 : 65, top = 30, plotWidth = width - left - 30, plotHeight = height - top - 70;
  const x = value => left + (value - min) / range * plotWidth;
  const y = value => top + (max - value) / range * plotHeight;
  const category = (horizontal ? plotHeight : plotWidth) / Math.max(1, chart.labels.length);
  const thickness = category * 0.7 / (chart.stacked ? 1 : Math.max(1, chart.series.length));
  const rows = chart.labels.map((label, i) => [label, ...chart.series.map(series => series.values[i])]);
  return <figure className="gaa-chart">
    <figcaption>{chart.title || 'Biểu đồ kết quả'}</figcaption>
    <div className="gaa-chart-scroll" role="region" aria-label="Biểu đồ có thể cuộn" tabIndex={0}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ minWidth: width, width: '100%' }} role="group" aria-labelledby={`${id}-title`}>
        <title id={`${id}-title`}>{chart.title || 'Biểu đồ cột'}</title>
        <line x1={horizontal ? x(0) : left} y1={top} x2={horizontal ? x(0) : left} y2={top + plotHeight} className="gaa-axis" />
        <line x1={left} y1={horizontal ? top + plotHeight : y(0)} x2={left + plotWidth} y2={horizontal ? top + plotHeight : y(0)} className="gaa-axis" />
        {chart.labels.map((label, i) => <text key={i} x={horizontal ? left - 12 : left + category * (i + 0.5)} y={horizontal ? top + category * (i + 0.5) : height - 40}
          textAnchor={horizontal ? 'end' : 'middle'} className="gaa-axis-label">{label.length > 24 ? label.slice(0, 23) + '…' : label}</text>)}
        {bars.map(({ series, s, i, value, start, end }) => {
          const text = `${chart.labels[i]} · ${series.name || 'Giá trị'}: ${formatViNumber(value)}`;
          const offset = category * i + category * 0.15 + (chart.stacked ? 0 : s * thickness);
          return <rect key={`${s}-${i}`} tabIndex={0} role="button" aria-label={text} aria-describedby={`${id}-value`} fill={series.color}
            x={horizontal ? Math.min(x(start), x(end)) : left + offset} y={horizontal ? top + offset : Math.min(y(start), y(end))}
            width={horizontal ? Math.max(0, Math.abs(x(end) - x(start))) : thickness} height={horizontal ? thickness : Math.max(0, Math.abs(y(end) - y(start)))}
            onFocus={() => setActive(text)} onMouseEnter={() => setActive(text)} onClick={() => setActive(text)}
            onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActive(text); } }}><title>{text}</title></rect>;
        })}
        <text x={left + plotWidth / 2} y={height - 8} textAnchor="middle" className="gaa-axis-label">{chart.x_label || ''}</text>
        <text x={6} y={16} className="gaa-axis-label">{chart.y_label || ''}</text>
      </svg>
    </div>
    <p id={`${id}-value`} aria-live="polite" className="gaa-chart-value">{active}</p>
    <ul className="gaa-legend">{chart.series.map((series, i) => <li key={i}><span style={{ background: series.color }} />{series.name || 'Giá trị'}</li>)}</ul>
    <details><summary>Xem dữ liệu biểu đồ dạng bảng</summary><AgentResultTable table={{ columns: ['Nhãn', ...chart.series.map((series, i) => series.name || `Giá trị ${i + 1}`)], rows }} /></details>
  </figure>;
}
