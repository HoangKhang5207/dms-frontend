export default function AgentTrace({ trace = [], modelProvider, cloudTokens }) {
  return <>
    {modelProvider === 'local' && cloudTokens === 0 && <p>Mô hình nội bộ. Token đám mây: 0.</p>}
    <ol className="gaa-trace">{trace.slice(0, 100).map((step, index) => <li key={index}>
    <strong>{String(step.title || step.agent || 'Bước xử lý')}</strong> · {String(step.status || '')}
    {typeof step.ms === 'number' && Number.isFinite(step.ms) && <span> · {step.ms} ms</span>}
    {step.model && <span> · {String(step.model)}</span>}
    {step.agent === 'gateway' && typeof step.detail?.column_policy === 'string' && <p>{step.detail.column_policy.slice(0, 500)}</p>}
    {step.agent === 'gateway' && Array.isArray(step.detail?.policy_reasons) && <ul>{step.detail.policy_reasons.filter(reason => typeof reason === 'string').slice(0, 10).map((reason, i) => <li key={i}>{reason.slice(0, 500)}</li>)}</ul>}
    {step.agent === 'sandbox' && ['none', 'unavailable'].includes(step.detail?.network) && <p>Mạng sandbox: {step.detail.network}</p>}
  </li>)}</ol></>;
}
