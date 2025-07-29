import React, { useEffect } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Modal, Form, Input, Button } from 'antd';

const CategoryModal = ({ visible, onCancel, onFinish, initialValues }) => {
    const [form] = Form.useForm();
    const isEditing = !!initialValues;

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }
    }, [visible, initialValues, form]);

    return (
        <Modal
            title={isEditing ? 'Cập nhật thư mục' : 'Thêm thư mục mới'}
            open={visible}
            onCancel={onCancel}
            footer={null}
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item name="name" label="Tên thư mục" rules={[{ required: true, message: 'Vui lòng nhập tên thư mục!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}>
                    <Input.TextArea rows={4} />
                </Form.Item>
                <Form.Item style={{ textAlign: 'right' }}>
                    <Button onClick={onCancel} style={{ marginRight: 8 }}>Hủy</Button>
                    <Button type="primary" htmlType="submit">
                        {isEditing ? 'Lưu' : 'Tạo'}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CategoryModal;