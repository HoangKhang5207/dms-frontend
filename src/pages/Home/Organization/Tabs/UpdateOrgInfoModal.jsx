import React, { useEffect } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Modal, Form, Input, Button } from 'antd';

const UpdateOrgInfoModal = ({ visible, onCancel, onFinish, initialValues }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible && initialValues) {
            form.setFieldsValue(initialValues);
        }
    }, [visible, initialValues, form]);

    return (
        <Modal
            title="Chỉnh sửa thông tin tổ chức"
            open={visible}
            onCancel={onCancel}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="name"
                    label="Tên tổ chức"
                    rules={[{ required: true, message: 'Vui lòng nhập tên tổ chức!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="description"
                    label="Mô tả"
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                >
                    <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item style={{ textAlign: 'right' }}>
                    <Button onClick={onCancel} style={{ marginRight: 8 }}>Hủy</Button>
                    <Button type="primary" htmlType="submit">
                        Lưu thay đổi
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UpdateOrgInfoModal;