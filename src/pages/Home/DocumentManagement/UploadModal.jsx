import React, { useState } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Modal, Form, Input, Button, Select, Upload, message, Space, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { getFileIcon } from '../../../utils/fileIcons';

const { Dragger } = Upload;
const { Option } = Select;

const UploadModal = ({ visible, onCancel, onFinish }) => {
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [loading, setLoading] = useState(false);

    const draggerProps = {
        name: 'file',
        multiple: false,
        fileList,
        beforeUpload: (file) => {
            setFileList([file]);
            // Tự động điền tiêu đề bằng tên file (không có đuôi)
            const title = file.name.substring(0, file.name.lastIndexOf('.'));
            form.setFieldsValue({ title: title });
            return false;
        },
        onRemove: () => {
            setFileList([]);
        },
        // Tùy chỉnh hiển thị file đã chọn
        itemRender: (originNode, file) => (
             <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                <Space>
                    {getFileIcon(file.name)}
                    <Typography.Text>{file.name}</Typography.Text>
                </Space>
            </div>
        )
    };

    const handleFinish = async (values) => {
        if (fileList.length === 0) {
            message.error('Vui lòng chọn một file để tải lên!');
            return;
        }
        setLoading(true);
        // onFinish giờ đây sẽ trả về một promise
        const success = await onFinish(values, fileList[0]);
        setLoading(false);
        if (success) {
            // Reset form và file list nếu thành công
            form.resetFields();
            setFileList([]);
        }
    };

    const handleCancel = () => {
        // Reset thủ công khi người dùng nhấn Hủy
        form.resetFields();
        setFileList([]);
        onCancel();
    };

    return (
        <Modal 
            title="Thêm tệp mới" 
            open={visible} 
            onCancel={handleCancel} 
            footer={null}
            destroyOnClose 
        >
            <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ access_type: 2 }}>
                <Dragger {...draggerProps}><p className="ant-upload-drag-icon"><InboxOutlined /></p><p>Nhấp hoặc kéo tệp vào khu vực này</p></Dragger>
                <Form.Item name="access_type" style={{ marginTop: 16 }} label="Phạm vi chia sẻ" rules={[{ required: true }]}>
                    <Select>
                        <Option value={2}>Toàn bộ tổ chức</Option>
                        <Option value={3}>Chỉ phòng ban</Option>
                        <Option value={4}>Riêng tư</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="title" label="Tiêu đề tài liệu" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!'}]} style={{ marginTop: 16 }}>
                    <Input />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea />
                </Form.Item>
                <Form.Item style={{ textAlign: 'right' }}>
                    <Button onClick={handleCancel} style={{ marginRight: 8 }}>Hủy</Button>
                    <Button type="primary" htmlType="submit" loading={loading}>Tải lên</Button>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default UploadModal;