import React, { useEffect } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Modal, Form, Input, Button } from 'antd';

const DepartmentModal = ({ visible, onCancel, onFinish, initialValues }) => {
    const [form] = Form.useForm();

    // Set giá trị cho form khi chế độ là "chỉnh sửa"
    useEffect(() => {
        if (initialValues) {
            form.setFieldsValue(initialValues);
        } else {
            form.resetFields();
        }
    }, [initialValues, form]);

    const isEditing = !!initialValues;

    return (
        <Modal
            title={isEditing ? 'Chỉnh sửa Phòng ban' : 'Thêm Phòng ban mới'}
            open={visible}
            onCancel={onCancel}
            footer={null} // Tùy chỉnh footer bên dưới
        >
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    name="name"
                    label="Tên phòng ban"
                    rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban!' }]}
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
                        {isEditing ? 'Lưu thay đổi' : 'Tạo'}
                    </Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default DepartmentModal;