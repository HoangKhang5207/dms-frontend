import React, { useState } from 'react';
import { Upload, Button, Form, Input, Modal } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext'; // Adjusted
import { showSuccessToast, showErrorToast } from '../../../utils/toast'; // Adjusted

const UploadModal = ({ open, onCancel, onSuccess }) => {
  const { token } = useAuth(); // Adjusted
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('files', file.originFileObj);
    });
    const password = form.getFieldValue('password');
    formData.append('password', password);

    setUploading(true);
    if (!token) {
      showErrorToast('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
      setUploading(false);
      return;
    }
    try {
      const response = await fetch('http://localhost:8080/api/v1/documents/upload-multiple', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setFileList([]);
        form.resetFields();
        showSuccessToast('Tệp đã được tải lên thành công!');
        onSuccess();
      } else {
        const errorText = await response.text();
        showErrorToast(`Tải lên thất bại: ${errorText}`);
      }
    } catch (error) {
      showErrorToast('Lỗi khi tải lên tệp.');
      console.error('Lỗi khi tải lên tệp:', error);
    } finally {
      setUploading(false);
    }
  };

  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    beforeUpload: () => false,
    fileList,
    multiple: true,
  };

  return (
    <Modal
      title="Tải lên tài liệu"
      open={open}
      onOk={handleUpload}
      onCancel={onCancel}
      confirmLoading={uploading}
      okText={uploading ? 'Đang tải lên' : 'Tải lên'}
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Chọn tệp">
          <Upload.Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">Kéo và thả tệp vào đây hoặc nhấp để chọn tệp</p>
            <p className="ant-upload-hint">
              Hỗ trợ tải lên một hoặc nhiều tệp.
            </p>
          </Upload.Dragger>
        </Form.Item>
        <Form.Item 
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UploadModal;
