import React, { useState } from 'react';
import { Modal, Upload, Button, message, List, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { useAuth } from '../contexts/AuthContext';

const { Text } = Typography;

const CheckWatermarkModal = ({ open, onCancel }) => {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [foundWatermarks, setFoundWatermarks] = useState([]);
  const [hasWatermarkResult, setHasWatermarkResult] = useState(null);

  const handleCheck = async () => {
    if (!file) {
      showErrorToast('Vui lòng chọn một file để kiểm tra.');
      return;
    }

    setLoading(true);
    if (!token) {
      showErrorToast('Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.');
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8080/api/v1/documents/check-local-watermark', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setHasWatermarkResult(data.hasWatermark);
        setFoundWatermarks(data.foundWatermarks || []);

        if (data.hasWatermark) {
          showSuccessToast('Kiểm tra thành công: Tệp này CÓ chứa watermark.');
        } else {
          showErrorToast('Kiểm tra thành công: Không tìm thấy watermark trong tệp.');
        }
      } else {
        showErrorToast('Đã xảy ra lỗi trong quá trình kiểm tra.');
      }
    } catch (error) {
      showErrorToast('Lỗi kết nối đến server.');
      console.error('Error checking local watermark:', error);
    } finally {
      setLoading(false);
      setFile(null);
    }
  };

  const props = {
    onRemove: () => {
      setFile(null);
    },
    beforeUpload: (file) => {
      setFile(file);
      return false;
    },
    fileList: file ? [file] : [],
    maxCount: 1,
  };

  const handleModalClose = () => {
    setFoundWatermarks([]);
    setHasWatermarkResult(null);
    setFile(null);
    onCancel();
  };

  return (
    <Modal
      title="Kiểm tra Watermark trên File Local"
      open={open}
      onCancel={handleModalClose}
      footer={[
        <Button key="back" onClick={handleModalClose}>
          Đóng
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleCheck} disabled={!file}>
          Kiểm tra
        </Button>,
      ]}
    >
      <Upload.Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <UploadOutlined />
        </p>
        <p className="ant-upload-text">Nhấn hoặc kéo file vào khu vực này để tải lên</p>
        <p className="ant-upload-hint">
          Chỉ hỗ trợ kiểm tra cho các file .pdf và .docx.
        </p>
      </Upload.Dragger>

      {hasWatermarkResult !== null && (
        <div style={{ marginTop: 20 }}>
          <Text strong>Kết quả kiểm tra:</Text>
          <Text type={hasWatermarkResult ? "success" : "danger"}>
            {hasWatermarkResult ? " CÓ watermark" : " KHÔNG có watermark"}
          </Text>
          {foundWatermarks.length > 0 && (
            <>
              <Text strong style={{ display: 'block', marginTop: 10 }}>Các watermark tìm thấy:</Text>
              <List
                size="small"
                bordered
                dataSource={foundWatermarks}
                renderItem={(item) => <List.Item>{item}</List.Item>}
              />
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

export default CheckWatermarkModal;
