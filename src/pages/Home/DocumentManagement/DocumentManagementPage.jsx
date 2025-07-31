import React, { useEffect, useState } from 'react';
import { Table, Button, Space, Popconfirm, Modal, Form, Input, Dropdown, Menu } from 'antd';
import { DownloadOutlined, EyeOutlined, DeleteOutlined, PlusOutlined, DownOutlined, CheckCircleOutlined, ScanOutlined } from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext'; // Adjusted import
import { showSuccessToast, showErrorToast } from '../../../utils/toast'; // Adjusted import
import UploadDocumentModal from './UploadModal'; // Adjusted import - using existing UploadModal
import FileViewerModal from './FilePreviewModal'; // Adjusted import - using existing FilePreviewModal
import DownloadMultipleModal from '../../../components/DownloadMultipleModal'; // Placeholder import
import CheckWatermarkModal from '../../../components/CheckWatermarkModal'; // Placeholder import

const DocumentManagementPage = () => {
  const { token } = useAuth(); // Adjusted to use AuthContext
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isCheckLocalModalVisible, setIsCheckLocalModalVisible] = useState(false);
  const [currentFileId, setCurrentFileId] = useState(null);
  const [currentFileName, setCurrentFileName] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [downloadWithWatermark, setDownloadWithWatermark] = useState(false);
  const [filePassword, setFilePassword] = useState(undefined);
  const [passwordForm] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isDownloadMultipleModalVisible, setIsDownloadMultipleModalVisible] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/v1/documents/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        showErrorToast('Không thể lấy danh sách tài liệu.');
      }
    } catch (error) {
      showErrorToast('Lỗi khi lấy danh sách tài liệu.');
      console.error('Lỗi khi lấy danh sách tài liệu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDocuments();
    }
  }, [token]);

  const handleDownloadRequest = (fileId, fileName, withWatermark) => {
    setCurrentFileId(fileId);
    setCurrentFileName(fileName);
    setCurrentAction('download');
    setDownloadWithWatermark(withWatermark);
    setIsPasswordModalVisible(true);
  };

  const handleView = (fileId, fileName) => {
    setCurrentFileId(fileId);
    setCurrentFileName(fileName);
    setCurrentAction('view');
    setIsPasswordModalVisible(true);
  };

  const handleDelete = async (fileId, fileName) => {
    try {
      const response = await fetch(`http://localhost:8080/api/v1/documents/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.ok) {
        showSuccessToast(`${fileName} đã được xóa thành công!`);
        fetchDocuments(); // Refresh the list
      } else {
        showErrorToast(`Không thể xóa ${fileName}.`);
      }
    } catch (error) {
      showErrorToast(`Lỗi khi xóa ${fileName}.`);
      console.error('Lỗi khi xóa tài liệu:', error);
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedRowKeys.length === 0) {
      showErrorToast('Vui lòng chọn ít nhất một tài liệu để xóa.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/v1/documents/delete-multiple', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(selectedRowKeys),
      });

      if (response.ok) {
        showSuccessToast(`${selectedRowKeys.length} tài liệu đã được xóa thành công!`);
        setSelectedRowKeys([]); // Clear selection
        fetchDocuments(); // Refresh the list
      } else {
        showErrorToast('Không thể xóa các tài liệu đã chọn.');
      }
    } catch (error) {
      showErrorToast('Lỗi khi xóa nhiều tài liệu.');
      console.error('Lỗi khi xóa nhiều tài liệu:', error);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields();
      const password = values.password;

      if (currentAction === 'download') {
        const url = `http://localhost:8080/api/v1/documents/${currentFileId}/retrieve?password=${password}&withWatermark=${downloadWithWatermark}`;
        try {
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const blob = await response.blob();
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = currentFileName;
            if (contentDisposition && contentDisposition.indexOf('filename=') !== -1) {
              filename = contentDisposition.split('filename=')[1].replace(/"/g, '');
            }
            const a = document.createElement('a');
            a.href = window.URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(a.href);
            showSuccessToast(`Đang tải xuống tài liệu...`);
          } else {
            showErrorToast('Không thể tải xuống tài liệu. Vui lòng kiểm tra mật khẩu hoặc thử lại sau.');
          }
        } catch (error) {
          showErrorToast('Lỗi khi tải xuống tài liệu.');
          console.error('Lỗi khi tải xuống tài liệu:', error);
        }
        setIsPasswordModalVisible(false);
        passwordForm.resetFields();
      } else if (currentAction === 'view') {
        setFilePassword(password);
        setIsPasswordModalVisible(false);
        passwordForm.resetFields();
      }
    } catch (errorInfo) {
      showErrorToast('Vui lòng nhập mật khẩu.');
    }
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Kích thước (bytes)',
      dataIndex: 'storageCapacity',
      key: 'storageCapacity',
    },
    {
      title: 'Thời gian tải lên',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => new Date(text).toLocaleString(),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => {
        const downloadMenu = (
          <Menu onClick={({ key }) => handleDownloadRequest(record.fileId, record.title, key === 'with-wm')}>
            <Menu.Item key="with-wm">Có Watermark</Menu.Item>
            <Menu.Item key="without-wm">Không có Watermark</Menu.Item>
          </Menu>
        );

        return (
          <Space size="middle">
            <Dropdown overlay={downloadMenu}>
              <Button>
                Tải xuống <DownOutlined />
              </Button>
            </Dropdown>
            <Button icon={<EyeOutlined />} onClick={() => handleView(record.fileId, record.title)}>
              Xem
            </Button>
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa tài liệu này không?"
              onConfirm={() => handleDelete(record.fileId, record.title)}
              okText="Có"
              cancelText="Không"
            >
              <Button icon={<DeleteOutlined />} danger>
                Xóa
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16, justifyContent: 'space-between', width: '100%' }}>
        <h1>Danh sách tài liệu</h1>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsUploadModalVisible(true)}>
            Thêm tài liệu
          </Button>
          <Button type="default" icon={<ScanOutlined />} onClick={() => setIsCheckLocalModalVisible(true)}>
            Kiểm tra File Local
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa các tài liệu đã chọn không?"
            onConfirm={handleDeleteMultiple}
            okText="Có"
            cancelText="Không"
            disabled={selectedRowKeys.length === 0}
          >
            <Button type="default" danger disabled={selectedRowKeys.length === 0}>
              Xóa đã chọn ({selectedRowKeys.length})
            </Button>
          </Popconfirm>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={() => {
              setIsDownloadMultipleModalVisible(true);
            }}
            disabled={selectedRowKeys.length === 0}
          >
            Tải xuống đã chọn ({selectedRowKeys.length})
          </Button>
        </Space>
      </Space>
      <Table 
        rowSelection={rowSelection}
        columns={columns} 
        dataSource={documents} 
        rowKey="fileId" 
        loading={loading} 
      />

      <UploadDocumentModal
        open={isUploadModalVisible}
        onCancel={() => setIsUploadModalVisible(false)}
        onSuccess={() => {
          setIsUploadModalVisible(false);
          fetchDocuments();
        }}
      />

      <CheckWatermarkModal 
        open={isCheckLocalModalVisible}
        onCancel={() => setIsCheckLocalModalVisible(false)}
      />

      <Modal
        title="Nhập mật khẩu"
        open={isPasswordModalVisible}
        onOk={handlePasswordSubmit}
        onCancel={() => {
          setIsPasswordModalVisible(false);
          passwordForm.resetFields();
          setCurrentFileId(null);
          setCurrentFileName(null);
          setCurrentAction(null);
        }}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            label="Mật khẩu"
            name="password"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      {currentAction === 'view' && currentFileId && currentFileName && (
        <FileViewerModal
          open={!isPasswordModalVisible && !!currentFileId}
          onCancel={() => {
            setCurrentFileId(null);
            setCurrentFileName(null);
            setCurrentAction(null);
            setFilePassword(undefined);
          }}
          fileId={currentFileId}
          fileName={currentFileName}
          password={filePassword}
        />
      )}

      <DownloadMultipleModal
        visible={isDownloadMultipleModalVisible}
        onCancel={() => {
          setIsDownloadMultipleModalVisible(false);
          setSelectedRowKeys([]);
        }}
        selectedFileIds={selectedRowKeys}
        documents={documents}
      />
    </div>
  );
};

export default DocumentManagementPage;
