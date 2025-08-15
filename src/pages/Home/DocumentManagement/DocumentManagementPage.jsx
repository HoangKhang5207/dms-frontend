import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Modal,
  Form,
  Input,
  Dropdown,
  Menu,
  message,
} from "antd";
import {
  DownloadOutlined,
  EyeOutlined,
  DeleteOutlined,
  PlusOutlined,
  DownOutlined,
  CheckCircleOutlined,
  ScanOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext";
import UploadDocumentModal from "./UploadModal";
import FileViewerModal from "./FilePreviewModal";
import DownloadMultipleModal from "../../../components/DownloadMultipleModal";
import CheckWatermarkModal from "../../../components/CheckWatermarkModal";
import AccessTypeTag from "../../../components/AccessTypeTag";
import ShareModal from "../../../components/ABACShareModal/ShareModal";
import axiosInstance from "../../../api/axiosInstance";

const DocumentManagementPage = () => {
  const { token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [isCheckLocalModalVisible, setIsCheckLocalModalVisible] =
    useState(false);
  const [currentFileId, setCurrentFileId] = useState(null);
  const [currentFileName, setCurrentFileName] = useState(null);
  const [currentAction, setCurrentAction] = useState(null);
  const [downloadWithWatermark, setDownloadWithWatermark] = useState(false);
  const [filePassword, setFilePassword] = useState(undefined);
  const [passwordForm] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isDownloadMultipleModalVisible, setIsDownloadMultipleModalVisible] =
    useState(false);
  const [showABACShareModal, setShowABACShareModal] = useState(false);
  const [documentToShare, setDocumentToShare] = useState(null);
  const [rejectingDoc, setRejectingDoc] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/documents/all",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        // Đọc text thô để chẩn đoán khi backend trả về JSON lẫn tạp (HTML/logs/NDJSON)
        const raw = await response.text();
        let data;
        try {
          data = JSON.parse(raw);
        } catch (e) {
          // Thử trích mảng JSON đầu tiên trong chuỗi (từ '[' ... cặp ']' tương ứng)
          try {
            const start = raw.indexOf("[");
            const end = raw.lastIndexOf("]");
            if (start !== -1 && end !== -1 && end > start) {
              const jsonArray = raw.substring(start, end + 1);
              data = JSON.parse(jsonArray);
              // Log ngắn gọn để theo dõi lỗi backend, cắt bớt để tránh console quá dài
              console.warn("/documents/all trả về kèm tạp, đã trích mảng JSON đầu tiên. Preview:", raw.slice(0, 1024));
            } else {
              throw e;
            }
          } catch (e2) {
            console.error("Parse JSON thất bại. Preview response (2KB):", raw.slice(0, 2048));
            throw e2;
          }
        }
        // Chuẩn hóa trường để UI hiện tại dùng được cả camelCase & snake_case
        const normalized = (Array.isArray(data) ? data : []).map((d) => ({
          ...d,
          // map snake_case aliases used across UI
          file_id: d.file_id ?? d.fileId ?? d.id,
          created_at: d.created_at ?? d.createdAt,
          updated_at: d.updated_at ?? d.updatedAt,
          access_type: d.access_type ?? d.accessType,
          category_id: d.category_id ?? d.category?.id,
          storage_unit: d.storage_unit ?? d.storageUnit,
          original_filename: d.original_filename ?? d.originalFilename,
        }));
        setDocuments(normalized);
      } else {
        message.error("Không thể lấy danh sách tài liệu.");
      }
    } catch (error) {
      message.error("Lỗi khi lấy danh sách tài liệu.");
      console.error("Lỗi khi lấy danh sách tài liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDoc = async (doc) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/documents/${doc.id || doc.file_id}/submit`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        message.success("Đã trình duyệt tài liệu");
        fetchDocuments();
      } else {
        message.error("Trình duyệt thất bại");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi trình duyệt");
    }
  };

  const handleApproveDoc = async (doc) => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/documents/${doc.id || doc.file_id}/approve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        message.success("Đã phê duyệt tài liệu");
        fetchDocuments();
      } else {
        message.error("Phê duyệt thất bại");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi phê duyệt");
    }
  };

  const openRejectModal = (doc) => {
    setRejectingDoc(doc);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectingDoc) return;
    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/documents/${rejectingDoc.id || rejectingDoc.file_id}/reject?reason=${encodeURIComponent(
          rejectReason || ""
        )}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.ok) {
        message.success("Đã từ chối tài liệu");
        setRejectingDoc(null);
        setRejectReason("");
        fetchDocuments();
      } else {
        message.error("Từ chối thất bại");
      }
    } catch (e) {
      console.error(e);
      message.error("Lỗi khi từ chối");
    }
  };

  const fetchCategories = async () => {
    try {
      // Lấy org của user
      const me = await axiosInstance.get("/users/me");
      const orgId = me?.data?.organization?.id || me?.data?.organizationId;
      if (!orgId) {
        console.warn("Không tìm thấy organizationId trong /users/me");
        setCategories([]);
        return;
      }
      // Lấy danh sách phòng ban theo org, chọn phòng ban đầu tiên
      const deptsRes = await axiosInstance.get(`/departments/organization/${orgId}`);
      const departments = deptsRes?.data || [];
      if (!departments.length) {
        setCategories([]);
        return;
      }
      const deptId = departments[0]?.id;
      // Lấy categories theo phòng ban (lấy số lượng lớn)
      const catsPage = await axiosInstance.get(`/departments/${deptId}/categories`, { params: { page: 0, size: 1000 } });
      const cats = catsPage?.data?.content || catsPage?.data || [];
      setCategories(cats);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách categories:", error);
      setCategories([]);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDocuments();
      fetchCategories();
    }
  }, [token]);

  const handleDownloadRequest = (fileId, fileName, withWatermark) => {
    setCurrentFileId(fileId);
    setCurrentFileName(fileName);
    setCurrentAction("download");
    setDownloadWithWatermark(withWatermark);
    setIsPasswordModalVisible(true);
  };

  const handleView = (fileId, fileName) => {
    setCurrentFileId(fileId);
    setCurrentFileName(fileName);
    setCurrentAction("view");
    setIsPasswordModalVisible(true);
  };

  const handleDelete = async (docId, fileName) => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/v1/documents/${docId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        message.success(`${fileName} đã được xóa thành công!`);
        fetchDocuments(); // Refresh the list
      } else {
        message.error(`Không thể xóa ${fileName}.`);
      }
    } catch (error) {
      message.error(`Lỗi khi xóa ${fileName}.`);
      console.error("Lỗi khi xóa tài liệu:", error);
    }
  };

  const handleDeleteMultiple = async () => {
    if (selectedRowKeys.length === 0) {
      message.error("Vui lòng chọn ít nhất một tài liệu để xóa.");
      return;
    }

    try {
      // selectedRowKeys hiện đang chứa file_id (UUID) do rowKey="file_id"
      // Cần ánh xạ sang danh sách id (số) để xóa theo yêu cầu mới
      const ids = documents
        .filter((d) => selectedRowKeys.includes(d.file_id))
        .map((d) => d.id)
        .filter((id) => id != null);

      if (!ids.length) {
        message.error("Không tìm thấy ID tương ứng để xóa.");
        return;
      }

      const response = await fetch(
        "http://localhost:8080/api/v1/documents/delete-multiple",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(ids),
        }
      );

      if (response.ok) {
        message.success(
          `${ids.length} tài liệu đã được xóa thành công!`
        );
        setSelectedRowKeys([]); // Clear selection
        fetchDocuments(); // Refresh the list
      } else {
        message.error("Không thể xóa các tài liệu đã chọn.");
      }
    } catch (error) {
      message.error("Lỗi khi xóa nhiều tài liệu.");
      console.error("Lỗi khi xóa nhiều tài liệu:", error);
    }
  };

  const handlePasswordSubmit = async () => {
    try {
      const values = await passwordForm.validateFields();
      const password = values.password;

      if (currentAction === "download") {
        const url = `http://localhost:8080/api/v1/documents/${currentFileId}/retrieve?password=${password}&withWatermark=${downloadWithWatermark}`;

        try {
          const response = await fetch(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const blob = await response.blob();
            const contentDisposition = response.headers.get(
              "Content-Disposition"
            );
            let filename = currentFileName;
            if (
              contentDisposition &&
              contentDisposition.indexOf("filename=") !== -1
            ) {
              filename = contentDisposition
                .split("filename=")[1]
                .replace(/"/g, "");
            }
            const a = document.createElement("a");
            a.href = window.URL.createObjectURL(blob);
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(a.href);
            message.success(`Đang tải xuống tài liệu...`);
          } else {
            message.error(
              "Không thể tải xuống tài liệu. Vui lòng kiểm tra mật khẩu hoặc thử lại sau."
            );
          }
        } catch (error) {
          message.error("Lỗi khi tải xuống tài liệu.");
          console.error("Lỗi khi tải xuống tài liệu:", error);
        }
        setIsPasswordModalVisible(false);
        passwordForm.resetFields();
      } else if (currentAction === "view") {
        setFilePassword(password);
        setIsPasswordModalVisible(false);
        passwordForm.resetFields();
      }
    } catch {
      message.error("Vui lòng nhập mật khẩu.");
    }
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const getCategoryName = (categoryId) => {
    if (!categoryId) return "Không xác định";
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Không xác định";
  };

  const columns = [
    {
      title: "Tiêu đề",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Loại tài liệu",
      key: "category",
      render: (_, record) => {
        // Hỗ trợ cả dạng có object category và dạng category_id
        const catName = record?.category?.name;
        if (catName) return catName;
        const catId = record?.category?.id || record?.category_id;
        return getCategoryName(catId);
      },
    },
    {
      title: "Truy cập",
      key: "access",
      render: (_, record) => (
        <AccessTypeTag accessType={record.accessType ?? record.access_type} />
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Kích thước",
      dataIndex: "storage_unit",
      key: "storage_unit",
      render: (text) => text || "N/A",
    },
    {
      title: "Thời gian tải lên",
      key: "createdAt",
      render: (_, record) => {
        const ts = record.createdAt ?? record.created_at;
        return ts ? new Date(ts).toLocaleString("vi-VN") : "N/A";
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        const downloadMenu = (
          <Menu
            onClick={({ key }) =>
              handleDownloadRequest(
                record.file_id,
                record.title,
                key === "with-wm"
              )
            }
          >
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
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleView(record.file_id, record.title)}
            >
              Xem
            </Button>
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="submit" onClick={() => handleSubmitDoc(record)}>
                    Trình duyệt
                  </Menu.Item>
                  <Menu.Item key="approve" onClick={() => handleApproveDoc(record)}>
                    Phê duyệt
                  </Menu.Item>
                  <Menu.Item key="reject" onClick={() => openRejectModal(record)}>
                    Từ chối
                  </Menu.Item>
                </Menu>
              }
            >
              <Button icon={<CheckCircleOutlined />}>Duyệt</Button>
            </Dropdown>
            <Button
              icon={<ShareAltOutlined />}
              onClick={() => handleShareDocument(record)}
            >
              Chia sẻ
            </Button>
            <Popconfirm
              title="Bạn có chắc chắn muốn xóa tài liệu này không?"
              onConfirm={() => handleDelete(record.id, record.title)}
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

  const handleShareDocument = (record) => {
    setDocumentToShare(record);
    setShowABACShareModal(true);
  };

  const handleCloseABACShareModal = () => {
    setShowABACShareModal(false);
    setDocumentToShare(null);
  };

  return (
    <div>
      <Space
        style={{
          marginBottom: 16,
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <h1>Danh sách tài liệu</h1>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsUploadModalVisible(true)}
          >
            Thêm tài liệu
          </Button>
          <Button
            type="default"
            icon={<ScanOutlined />}
            onClick={() => setIsCheckLocalModalVisible(true)}
          >
            Kiểm tra File Local
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa các tài liệu đã chọn không?"
            onConfirm={handleDeleteMultiple}
            okText="Có"
            cancelText="Không"
            disabled={selectedRowKeys.length === 0}
          >
            <Button
              type="default"
              danger
              disabled={selectedRowKeys.length === 0}
            >
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
        rowKey="file_id"
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
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Lý do từ chối"
        open={!!rejectingDoc}
        onOk={confirmReject}
        onCancel={() => setRejectingDoc(null)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Input.TextArea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          placeholder="Nhập lý do từ chối"
        />
      </Modal>

      {currentAction === "view" && currentFileId && currentFileName && (
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

      {documentToShare && (
        <ShareModal
          visible={showABACShareModal}
          onCancel={handleCloseABACShareModal}
          documentId={documentToShare.file_id}
          documentInfo={documentToShare}
        />
      )}
    </div>
  );
};

export default DocumentManagementPage;
