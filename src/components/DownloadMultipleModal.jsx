import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Input, Space, List, Typography } from 'antd';
import { DownloadOutlined, CloseOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext'; // Adjusted
import { showSuccessToast, showErrorToast } from '../utils/toast'; // Adjusted

const DownloadMultipleModal = ({ visible, onCancel, selectedFileIds, documents }) => {
  const { token } = useAuth(); // Adjusted
  const [downloadList, setDownloadList] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    if (visible) {
      const initialList = selectedFileIds.map(fileId => {
        const doc = documents.find(d => d.fileId === fileId);
        const formRef = React.createRef();
        return { ...doc, formRef, validationStatus: 'idle' };
      }).filter(Boolean);
      setDownloadList(initialList);
      setResetKey(prevKey => prevKey + 1);
    }
  }, [visible, selectedFileIds, documents]);

  const handleRemoveFile = (fileId) => {
    setDownloadList(prevList => prevList.filter(item => item.fileId !== fileId));
  };

  const handleValidatePassword = async (itemToValidate) => {
    const password = itemToValidate.formRef.current?.getFieldValue([itemToValidate.fileId, 'password']);
    if (!password) {
      showErrorToast('Vui lòng nhập mật khẩu để xác thực.');
      return;
    }

    setDownloadList(prevList =>
      prevList.map(item =>
        item.fileId === itemToValidate.fileId ? { ...item, validationStatus: 'validating' } : item
      )
    );

    try {
      const response = await fetch('http://localhost:8080/api/v1/documents/validate-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ fileId: itemToValidate.fileId, password: password }),
      });

      const isValid = await response.json();

      setDownloadList(prevList =>
        prevList.map(item =>
          item.fileId === itemToValidate.fileId
            ? { ...item, validationStatus: isValid ? 'success' : 'error' }
            : item
        )
      );
      if (!isValid) {
        showErrorToast('Mật khẩu không đúng.');
      }
    } catch (error) {
      setDownloadList(prevList =>
        prevList.map(item =>
          item.fileId === itemToValidate.fileId ? { ...item, validationStatus: 'error' } : item
        )
      );
      showErrorToast('Lỗi khi xác thực mật khẩu.');
      console.error('Error validating password:', error);
    }
  };

  const handleDownloadAll = async () => {
    setDownloading(true);
    const filesToDownload = downloadList.filter(item => item.validationStatus === 'success');

    if (filesToDownload.length === 0) {
      showErrorToast('Vui lòng xác thực mật khẩu cho ít nhất một tệp để tải xuống.');
      setDownloading(false);
      return;
    }

    try {
      const fileDetails = filesToDownload.map(item => ({
        fileId: item.fileId,
        password: item.formRef.current?.getFieldValue([item.fileId, 'password']) || '',
      }));

      const response = await fetch('http://localhost:8080/api/v1/documents/download-multiple-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(fileDetails),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = response.headers.get('Content-Disposition')?.split('filename=')[1].replace(/"/g, '') || 'documents.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        showSuccessToast(`Đã bắt đầu tải xuống ${filesToDownload.length} tệp dưới dạng ZIP.`);
        setDownloadList([]);
        onCancel();
      } else {
        showErrorToast('Không thể tải xuống các tệp đã chọn.');
      }
    } catch (error) {
      showErrorToast('Lỗi khi tải xuống các tệp.');
      console.error('Error downloading files:', error);
    } finally {
      setDownloading(false);
    }
  };

  const isDownloadButtonEnabled = downloadList.some(item => item.validationStatus === 'success');

  return (
    <Modal
      title="Tải xuống nhiều tài liệu"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownloadAll}
          loading={downloading}
          disabled={!isDownloadButtonEnabled}
        >
          Tải xuống đã chọn
        </Button>,
      ]}
      styles={{ body: { maxHeight: '80vh', overflowY: 'auto' } }}
    >
      <List
        itemLayout="horizontal"
        dataSource={downloadList}
        renderItem={item => (
          <List.Item
            actions={[
              <Button
                type="text"
                icon={<CloseOutlined />}
                aria-label="Bỏ tài liệu khỏi danh sách"
                onClick={() => handleRemoveFile(item.fileId)}
              />,
            ]}
          >
            <List.Item.Meta
              title={item.title}
              description={
                <Space wrap className="aqua-download-validation">
                  <Form ref={item.formRef} layout="inline" key={`${item.fileId}-${resetKey}`}>
                    <Form.Item
                      name={[item.fileId, 'password']}
                      rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                    >
                      <Input.Password placeholder="Mật khẩu" />
                    </Form.Item>
                  </Form>
                  <Button
                    onClick={() => handleValidatePassword(item)}
                    loading={item.validationStatus === 'validating'}
                  >
                    Xác thực
                  </Button>
                  {item.validationStatus === 'success' && (
                    <Typography.Text type="success" icon={<CheckCircleOutlined />}>
                      Mật khẩu đúng
                    </Typography.Text>
                  )}
                  {item.validationStatus === 'error' && (
                    <Typography.Text type="danger" icon={<CloseCircleOutlined />}>
                      Mật khẩu sai
                    </Typography.Text>
                  )}
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default DownloadMultipleModal;
