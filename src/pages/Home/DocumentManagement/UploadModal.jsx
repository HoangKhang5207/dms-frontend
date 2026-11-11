import React, { useEffect, useState } from 'react';
import { Upload, Form, Input, Modal, Select, Alert } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useOrganization } from '../../../contexts/OrganizationContext';
import axiosInstance from '../../../api/axiosInstance';
import { showSuccessToast, showErrorToast } from '../../../utils/toast';

const UploadModal = ({ open, onCancel, onSuccess, onFinish, category }) => {
  const { token } = useAuth();
  const { departments } = useOrganization();
  const [form] = Form.useForm();
  const fileList = Form.useWatch('files', form) || [];
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categoryError, setCategoryError] = useState(false);
  const departmentId = Form.useWatch('departmentId', form);
  const metadataUpload = Boolean(onFinish);

  useEffect(() => {
    if (!open || metadataUpload || !departmentId) return;
    const controller = new AbortController();
    setLoadingCategories(true);
    setCategoryError(false);
    const load = async () => {
      try {
        let page = 0;
        let result = [];
        let response;
        do {
          response = await axiosInstance.get(`/departments/${departmentId}/categories`, {
            params: { page, size: 100 }, signal: controller.signal,
          });
          result = result.concat(response.data.content || []);
          page += 1;
        } while (page < (response.data.totalPages || 1));
        if (!controller.signal.aborted) setCategories(result);
      } catch {
        if (!controller.signal.aborted) setCategoryError(true);
      } finally {
        if (!controller.signal.aborted) setLoadingCategories(false);
      }
    };
    load();
    return () => controller.abort();
  }, [open, metadataUpload, departmentId]);

  const handleUpload = async () => {
    let values;
    try { values = await form.validateFields(); } catch { return; }
    if (!fileList.length) return;
    if (!token) {
      showErrorToast('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
      return;
    }
    setUploading(true);
    try {
      if (metadataUpload) {
        const metadata = { ...values };
        delete metadata.files;
        if (!await onFinish(metadata, fileList[0].originFileObj || fileList[0])) return;
      } else {
        const formData = new FormData();
        fileList.forEach(file => formData.append('files', file.originFileObj || file));
        formData.append('password', values.password);
        formData.append('categoryId', values.categoryId);
        const response = await fetch(`${axiosInstance.defaults.baseURL}/documents/upload-multiple`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
        });
        if (!response.ok) throw new Error('upload');
        showSuccessToast('Tệp đã được tải lên thành công!');
        onSuccess?.();
      }
      form.resetFields();
    } catch {
      showErrorToast('Tải lên thất bại. Vui lòng kiểm tra tệp và thử lại.');
    } finally { setUploading(false); }
  };

  return (
    <Modal title={category ? `Thêm tài liệu · ${category.name}` : 'Tải lên tài liệu'}
      open={open} onOk={handleUpload} onCancel={onCancel} confirmLoading={uploading}
      closable={!uploading} maskClosable={!uploading} keyboard={!uploading}
      cancelButtonProps={{ disabled: uploading }} okText={uploading ? 'Đang tải lên' : 'Tải lên'} cancelText="Hủy">
      <Form form={form} layout="vertical" disabled={uploading} initialValues={{ access_type: 2, document_type: '6' }}>
        {!metadataUpload && <>
          <Form.Item label="Phòng ban" name="departmentId" rules={[{ required: true, message: 'Vui lòng chọn phòng ban.' }]}>
            <Select placeholder="Chọn phòng ban" options={departments.map(d => ({ value: d.id, label: d.name }))}
              onChange={() => { setCategories([]); form.resetFields(['categoryId']); }} />
          </Form.Item>
          <Form.Item label="Thư mục" name="categoryId" rules={[{ required: true, message: 'Vui lòng chọn thư mục.' }]}>
            <Select placeholder="Chọn thư mục" disabled={!departmentId || categoryError} loading={loadingCategories}
              options={categories.map(c => ({ value: c.id, label: c.name }))} />
          </Form.Item>
          {categoryError && <Alert type="error" showIcon message="Không thể tải thư mục. Vui lòng chọn lại phòng ban." />}
        </>}
        {metadataUpload && <>
          <Form.Item label="Tiêu đề tài liệu" name="title" rules={[{ required: true, whitespace: true, message: 'Vui lòng nhập tiêu đề.' }]}><Input /></Form.Item>
          <Form.Item label="Mô tả" name="description"><Input.TextArea rows={2} /></Form.Item>
          <Form.Item label="Loại tài liệu" name="document_type" rules={[{ required: true }]}>
            <Select options={['Công văn đi', 'Công văn đến', 'Thông báo', 'Quyết định', 'Tài liệu đào tạo', 'Khác'].map((label, i) => ({ label, value: String(i + 1) }))} />
          </Form.Item>
          <Form.Item label="Phạm vi truy cập" name="access_type" rules={[{ required: true }]}>
            <Select options={[{ value: 1, label: 'Công khai' }, { value: 2, label: 'Trong tổ chức' }, { value: 3, label: 'Trong phòng ban' }, { value: 4, label: 'Riêng tư' }]} />
          </Form.Item>
        </>}
        <Form.Item label="Chọn tệp" name="files" valuePropName="fileList" getValueFromEvent={event => event.fileList}
          rules={[{ type: 'array', required: true, min: 1, message: 'Vui lòng chọn ít nhất một tệp.' }]}>
          <Upload.Dragger beforeUpload={() => false} multiple={!metadataUpload}
            maxCount={metadataUpload ? 1 : undefined} disabled={uploading}>
            <p className="ant-upload-drag-icon"><UploadOutlined /></p>
            <p className="ant-upload-text">Kéo và thả tệp vào đây hoặc nhấp để chọn tệp</p>
            <p className="ant-upload-hint">{metadataUpload ? 'Chọn một tệp tài liệu.' : 'Hỗ trợ tải lên một hoặc nhiều tệp.'}</p>
          </Upload.Dragger>
        </Form.Item>
        {!metadataUpload && <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}>
          <Input.Password autoComplete="new-password" placeholder="Nhập mật khẩu" />
        </Form.Item>}
      </Form>
    </Modal>
  );
};

export default UploadModal;
