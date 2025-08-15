import React, { useEffect, useState } from "react";
import { Table, DatePicker, Input, Select, Space, Button } from "antd";
import dayjs from "dayjs";
import axiosInstance from "../../../api/axiosInstance";

const { RangePicker } = DatePicker;

const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    userId: "",
    docId: "",
    action: "",
    from: null,
    to: null,
  });

  const columns = [
    { title: "Thời gian", dataIndex: "createdAt", key: "createdAt", render: (t) => (t ? new Date(t).toLocaleString("vi-VN") : "-") },
    { title: "User", dataIndex: "userId", key: "userId" },
    { title: "Tài liệu", dataIndex: "docId", key: "docId" },
    { title: "Hành động", dataIndex: "action", key: "action" },
    { title: "Chi tiết", dataIndex: "details", key: "details" },
  ];

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.userId) params.userId = filters.userId;
      if (filters.docId) params.docId = filters.docId;
      if (filters.action) params.action = filters.action;
      if (filters.from) params.from = dayjs(filters.from).toISOString();
      if (filters.to) params.to = dayjs(filters.to).toISOString();

      const res = await axiosInstance.get("/audit-logs", { params });
      setLogs(res.data?.content || res.data || []);
    } catch (e) {
      console.error("Fetch audit logs error", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <h1>Audit Logs</h1>
      <Space wrap style={{ marginBottom: 16 }}>
        <Input
          placeholder="User ID"
          value={filters.userId}
          onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
          style={{ width: 180 }}
        />
        <Input
          placeholder="Doc ID"
          value={filters.docId}
          onChange={(e) => setFilters({ ...filters, docId: e.target.value })}
          style={{ width: 180 }}
        />
        <Select
          allowClear
          placeholder="Action"
          value={filters.action || undefined}
          onChange={(v) => setFilters({ ...filters, action: v || "" })}
          style={{ width: 200 }}
          options={[
            { value: "READ", label: "READ" },
            { value: "SHARE", label: "SHARE" },
            { value: "APPROVE", label: "APPROVE" },
            { value: "REJECT", label: "REJECT" },
            { value: "SUBMIT", label: "SUBMIT" },
            { value: "DELEGATE", label: "DELEGATE" },
            { value: "DOWNLOAD", label: "DOWNLOAD" },
          ]}
        />
        <RangePicker
          showTime
          value={filters.from && filters.to ? [dayjs(filters.from), dayjs(filters.to)] : null}
          onChange={(vals) =>
            setFilters({
              ...filters,
              from: vals?.[0]?.toDate() || null,
              to: vals?.[1]?.toDate() || null,
            })
          }
        />
        <Button type="primary" onClick={fetchLogs}>Tìm kiếm</Button>
      </Space>
      <Table
        rowKey={(r, i) => r.id || i}
        columns={columns}
        dataSource={logs}
        loading={loading}
      />
    </div>
  );
};

export default AuditLogsPage;
