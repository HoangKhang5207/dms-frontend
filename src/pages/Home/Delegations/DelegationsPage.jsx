import React, { useState } from "react";
import { Table, Space, Button, Input, Modal, Form, DatePicker, Select, message } from "antd";
import axiosInstance from "../../../api/axiosInstance";

const DelegationsPage = () => {
  const [docId, setDocId] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Doc ID", dataIndex: "docId", key: "docId" },
    { title: "From", dataIndex: "fromUserId", key: "fromUserId" },
    { title: "To", dataIndex: "toUserId", key: "toUserId" },
    { title: "Permission", dataIndex: "permission", key: "permission" },
    { title: "Từ ngày", dataIndex: "fromDate", key: "fromDate", render: (t) => (t ? new Date(t).toLocaleString("vi-VN") : "-") },
    { title: "Đến ngày", dataIndex: "toDate", key: "toDate", render: (t) => (t ? new Date(t).toLocaleString("vi-VN") : "-") },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button danger onClick={() => revoke(record.id)}>Thu hồi</Button>
        </Space>
      )
    }
  ];

  const search = async () => {
    if (!docId) {
      message.warning("Nhập Doc ID để tra cứu");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/delegations/document/${docId}`);
      setData(res.data || []);
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi tải danh sách ủy quyền");
    } finally {
      setLoading(false);
    }
  };

  const revoke = async (id) => {
    try {
      await axiosInstance.delete(`/delegations/${id}`);
      message.success("Đã thu hồi ủy quyền");
      search();
    } catch (e) {
      console.error(e);
      message.error("Thu hồi thất bại");
    }
  };

  const openCreate = () => {
    setOpenModal(true);
  };

  const onCreate = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        docId: Number(values.docId),
        toUserId: values.toUserId,
        permission: values.permission,
        fromDate: values.range?.[0]?.toISOString?.() || null,
        toDate: values.range?.[1]?.toISOString?.() || null,
      };
      await axiosInstance.post("/delegations", payload);
      message.success("Tạo ủy quyền thành công");
      setOpenModal(false);
      form.resetFields();
      setDocId(values.docId.toString());
      search();
    } catch (e) {
      if (e?.errorFields) return; // validate error
      console.error(e);
      message.error("Tạo ủy quyền thất bại");
    }
  };

  return (
    <div>
      <h1>Quản lý Ủy quyền</h1>
      <Space style={{ marginBottom: 16 }}>
        <Input placeholder="Doc ID" value={docId} onChange={(e) => setDocId(e.target.value)} style={{ width: 200 }} />
        <Button type="primary" onClick={search}>Tải danh sách</Button>
        <Button onClick={openCreate}>Tạo ủy quyền</Button>
      </Space>
      <Table rowKey={(r) => r.id} columns={columns} dataSource={data} loading={loading} />

      <Modal
        open={openModal}
        title="Tạo ủy quyền"
        onOk={onCreate}
        onCancel={() => setOpenModal(false)}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="docId" label="Doc ID" rules={[{ required: true, message: "Nhập Doc ID" }]}>
            <Input placeholder="VD: 123" />
          </Form.Item>
          <Form.Item name="toUserId" label="User nhận ủy quyền" rules={[{ required: true }]}>
            <Input placeholder="VD: user-pk" />
          </Form.Item>
          <Form.Item name="permission" label="Quyền" rules={[{ required: true }]}>
            <Select
              placeholder="Chọn quyền"
              options={[
                { value: "documents:approve", label: "documents:approve" },
                { value: "documents:read", label: "documents:read" },
                { value: "documents:share", label: "documents:share" },
              ]}
            />
          </Form.Item>
          <Form.Item name="range" label="Khoảng thời gian">
            <DatePicker.RangePicker showTime />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DelegationsPage;
