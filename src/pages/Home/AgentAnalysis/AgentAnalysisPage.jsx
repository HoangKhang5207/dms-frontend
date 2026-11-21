import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Form, Input, Result, Space, Spin, Typography } from 'antd';
import { useGaa } from '../../../contexts/useGaa';
import { askAgent, exportResult } from '../../../api/gaaApi';
import { validateResult, errorMessage } from './agentResults';
import AgentResultTable from './AgentResultTable';
import AgentChart from './AgentChart';
import AgentTrace from './AgentTrace';
import './AgentAnalysis.css';

function AnalysisWorkspace({ capabilities, refresh, onDenied }) {
  const [output, setOutput] = useState(null), [pending, setPending] = useState(false), [error, setError] = useState(null);
  const [exporting, setExporting] = useState(false);
  const request = useRef(null), generation = useRef(0);
  const active = useRef(true);
  const cancelOnLeave = useCallback(() => { active.current = false; ++generation.current; request.current?.abort(); }, []);
  useEffect(() => { active.current = true; return cancelOnLeave; }, [cancelOnLeave]);
  const canExport = capabilities.perms.includes('gaa.export');
  async function submit({ question }) {
    if (request.current) return;
    const controller = new AbortController(), ticket = ++generation.current;
    request.current = controller;
    setPending(true); setOutput(null); setError(null); onDenied(null);
    try {
      const response = validateResult(await askAgent(question.trim(), { signal: controller.signal }));
      if (active.current && ticket === generation.current) setOutput(response);
    } catch (failure) {
      if (active.current && !controller.signal.aborted) {
        if (failure.response?.status === 403) { onDenied(errorMessage(failure)); refresh(); }
        else setError(errorMessage(failure));
      }
    } finally {
      if (active.current && ticket === generation.current) { setPending(false); request.current = null; }
    }
  }
  async function download(format, chartIndex = 0) {
    if (exporting || !canExport || !output?.result_id) return;
    const controller = new AbortController(); request.current = controller;
    setExporting(true); setError(null); onDenied(null);
    try {
      const response = await exportResult(output.result_id, format, { signal: controller.signal, chartIndex });
      if (!active.current || controller.signal.aborted) return;
      const url = URL.createObjectURL(response.data), anchor = document.createElement('a');
      anchor.href = url; anchor.download = `aquadocs-result.${format}`; anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (failure) {
      if (active.current && !controller.signal.aborted) {
        if (failure.response?.status === 403) { setOutput(null); onDenied(errorMessage(failure)); refresh(); }
        else setError(errorMessage(failure));
      }
    } finally { if (active.current) { setExporting(false); request.current = null; } }
  }
  return <section className="gaa-workspace" aria-labelledby="gaa-heading">
    <div><Typography.Title level={2} id="gaa-heading">Phân tích tài liệu</Typography.Title>
      <Typography.Paragraph type="secondary">Đặt câu hỏi về tài liệu và dữ liệu trong phạm vi bạn được cấp quyền.</Typography.Paragraph></div>
    {capabilities.mfa_simulated && <Alert type="info" showIcon message="MFA đang được mô phỏng trong môi trường kiểm thử." />}
    <Card><Form layout="vertical" onFinish={submit}>
      <Form.Item name="question" label="Câu hỏi của bạn" rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập câu hỏi.' }, { max: 2000, message: 'Tối đa 2.000 ký tự.' }]}>
        <Input.TextArea rows={3} maxLength={2000} showCount disabled={pending || exporting} placeholder="Ví dụ: Tổng chiều dài cống D600 theo từng phường là bao nhiêu?" />
      </Form.Item>
      <Space wrap><Button type="primary" htmlType="submit" aria-label="Phân tích" aria-busy={pending} loading={pending} disabled={exporting}>Phân tích</Button>
        {pending && <Button onClick={() => { ++generation.current; request.current?.abort(); request.current = null; setPending(false); }}>Hủy chờ</Button>}</Space>
    </Form></Card>
    <div aria-live="polite">{pending && <p>Đang phân tích câu hỏi…</p>}{error && <Alert type="error" showIcon message={error} />}</div>
    {output && <Card title="Kết quả">
      <p className="gaa-answer">{typeof output.answer === 'string' ? output.answer : 'Yêu cầu đã được xử lý.'}</p>
      {!output.accepted && <Alert type="warning" showIcon message="Chưa có kết quả được chấp nhận. Bạn có thể điều chỉnh câu hỏi và thử lại." />}
      {output.accepted && output.result_kind === 'table' && <AgentResultTable table={output.result} />}
      {output.accepted && output.result_kind === 'value' && <pre className="gaa-value">{JSON.stringify(output.result, null, 2)}</pre>}
      {Array.isArray(output.citations) && output.citations.length > 0 && <ul aria-label="Nguồn trích dẫn">{output.citations.map((citation, i) => <li key={i}>{String(citation.ma)} · trang {String(citation.trang)}</li>)}</ul>}
      {Array.isArray(output.policy_notes) && output.policy_notes.length > 0 && <details><summary>Phạm vi dữ liệu và lưu ý</summary><ul>{output.policy_notes.map((note, i) => <li key={i}>{String(note)}</li>)}</ul></details>}
      {output.accepted && output.chart_data.filter(Boolean).map((chart, i) => <AgentChart key={i} chart={chart} />)}
      {output.plan && <details><summary>Kế hoạch truy vấn</summary><pre className="gaa-value">{JSON.stringify(output.plan, null, 2)}</pre></details>}
      <details><summary>Các bước xử lý</summary><AgentTrace trace={Array.isArray(output.trace) ? output.trace : []} modelProvider={output.model_provider} cloudTokens={output.cloud_tokens} /></details>
      {canExport && output.accepted && output.result_id && <div className="gaa-exports"><Space wrap>
        <Button disabled={exporting || pending} onClick={() => download('csv')}>Xuất CSV</Button>
        <Button disabled={exporting || pending} onClick={() => download('xlsx')}>Xuất XLSX</Button>
        {output.charts.map((_, i) => <Button key={i} disabled={exporting || pending} onClick={() => download('png', i)}>Xuất PNG {i + 1}</Button>)}
      </Space><p>Kết quả có hiệu lực tối đa 5 phút. Quyền truy cập được kiểm tra lại khi xuất.</p></div>}
    </Card>}
  </section>;
}

export default function AgentAnalysisPage() {
  const gaa = useGaa();
  const [denial, setDenial] = useState(null);
  const onDenied = message => setDenial(message ? { identity: gaa.identity, message } : null);
  if (!gaa.enabled) return <Result status="404" title="Tính năng chưa được bật" />;
  if (gaa.loading) return <div className="gaa-loading"><Spin tip="Đang kiểm tra quyền"><div /></Spin></div>;
  if (gaa.error) return <Alert type="error" showIcon message={gaa.error} action={<Button onClick={() => gaa.refresh()}>Thử lại</Button>} />;
  const allowed = gaa.capabilities?.perms.some(permission => ['gaa.search','gaa.analytics'].includes(permission));
  return <>
    {denial?.identity === gaa.identity && <Alert type="error" showIcon message={denial.message} />}
    {allowed ? <AnalysisWorkspace key={`${gaa.identity}|${JSON.stringify(gaa.capabilities)}`} capabilities={gaa.capabilities} refresh={gaa.refresh} onDenied={onDenied} />
      : <Result status="403" title="Bạn chưa có quyền phân tích tài liệu" />}
  </>;
}
