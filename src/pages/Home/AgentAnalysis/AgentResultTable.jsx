import { Table } from 'antd';
import { cellText } from './agentResults';

export default function AgentResultTable({ table }) {
  const columns = table.columns.map((name, index) => ({ title: name, dataIndex: String(index), key: String(index),
    render: value => <span className="gaa-cell">{cellText(value)}</span> }));
  const rows = table.rows.map((row, index) => ({ key: index, ...Object.fromEntries(row.map((value, cell) => [String(cell), value])) }));
  return <div role="region" aria-label="Bảng kết quả phân tích" tabIndex={0} className="gaa-table">
    <Table columns={columns} dataSource={rows} pagination={{ defaultPageSize: 20, showSizeChanger: true }} scroll={{ x: 'max-content' }} size="small" />
  </div>;
}
