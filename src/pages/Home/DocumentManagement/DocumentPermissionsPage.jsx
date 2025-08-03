import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  Typography,
  Card,
  Tag,
  Modal,
  Popconfirm,
  Tooltip,
  Divider,
  Row,
  Col,
  Statistic,
  Alert,
} from "antd";
import {
  ShareAltOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  LockOutlined,
  UserOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  TeamOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import axiosInstance from "../../../api/axiosInstance";
import ShareModal from "../../../components/ABACShareModal/ShareModal";
import "./DocumentPermissionsPage.css";

const { Title, Text } = Typography;

const DocumentPermissionsPage = () => {
  const { documentId } = useParams();
  const [loading, setLoading] = useState(false);
  const [documentInfo, setDocumentInfo] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);

  useEffect(() => {
    if (documentId) {
      loadDocumentInfo();
      loadPermissions();
    }
  }, [documentId]);

  const loadDocumentInfo = async () => {
    try {
      const response = await axiosInstance.get(`/api/documents/${documentId}`);
      setDocumentInfo(response.data);
    } catch (error) {
      console.error("Error loading document info:", error);
      toast.error("Không thể tải thông tin tài liệu");
    }
  };

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/api/abac/documents/${documentId}/all-permissions`
      );
      setPermissions(response.data || []);
    } catch (error) {
      console.error("Error loading permissions:", error);
      toast.error("Không thể tải danh sách quyền truy cập");
    } finally {
      setLoading(false);
    }
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    loadPermissions(); // Refresh permissions after sharing
  };

  const handleEditPermission = (permission) => {
    setEditingPermission(permission);
  };

  const handleDeletePermission = async (permissionId) => {
    try {
      await axiosInstance.delete(
        `/api/abac/documents/${documentId}/permissions/${permissionId}`
      );
      toast.success("Đã xóa quyền truy cập");
      loadPermissions();
    } catch (error) {
      console.error("Error deleting permission:", error);
      toast.error("Không thể xóa quyền truy cập");
    }
  };

  const getPermissionIcon = (permission) => {
    switch (permission) {
      case "documents:share:readonly":
        return <EyeOutlined />;
      case "documents:share:forwardable":
        return <ShareAltOutlined />;
      case "documents:share:timebound":
        return <ClockCircleOutlined />;
      case "documents:share:external":
        return <GlobalOutlined />;
      case "documents:share:orgscope":
        return <TeamOutlined />;
      default:
        return <LockOutlined />;
    }
  };

  const getPermissionColor = (permission) => {
    switch (permission) {
      case "documents:share:readonly":
        return "blue";
      case "documents:share:forwardable":
        return "green";
      case "documents:share:timebound":
        return "orange";
      case "documents:share:external":
        return "purple";
      case "documents:share:orgscope":
        return "cyan";
      default:
        return "default";
    }
  };

  const getPermissionLabel = (permission) => {
    switch (permission) {
      case "documents:share:readonly":
        return "Chỉ đọc";
      case "documents:share:forwardable":
        return "Có thể chia sẻ tiếp";
      case "documents:share:timebound":
        return "Có thời hạn";
      case "documents:share:external":
        return "Chia sẻ ngoài tổ chức";
      case "documents:share:orgscope":
        return "Trong phạm vi tổ chức";
      default:
        return permission;
    }
  };

  const getAccessTypeLabel = (accessType) => {
    switch (accessType) {
      case 1:
        return "Ngoại bộ";
      case 2:
        return "Công khai";
      case 3:
        return "Nội bộ";
      case 4:
        return "Riêng tư";
      default:
        return "Không xác định";
    }
  };

  const getAccessTypeColor = (accessType) => {
    switch (accessType) {
      case 1:
        return "purple";
      case 2:
        return "green";
      case 3:
        return "blue";
      case 4:
        return "red";
      default:
        return "default";
    }
  };

  const columns = [
    {
      title: "Người dùng",
      dataIndex: "userName",
      key: "userName",
      render: (text, record) => (
        <Space>
          <UserOutlined />
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary">{record.userEmail}</Text>
        </Space>
      ),
    },
    {
      title: "Quyền truy cập",
      dataIndex: "permission",
      key: "permission",
      render: (permission) => (
        <Tag
          color={getPermissionColor(permission)}
          icon={getPermissionIcon(permission)}
        >
          {getPermissionLabel(permission)}
        </Tag>
      ),
    },
    {
      title: "Ngày hết hạn",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (date) =>
        date ? new Date(date).toLocaleDateString("vi-VN") : "Không có thời hạn",
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Tooltip title="Chỉnh sửa quyền">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEditPermission(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa quyền truy cập này?"
            description="Bạn có chắc chắn muốn xóa quyền truy cập này không?"
            onConfirm={() => handleDeletePermission(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Tooltip title="Xóa quyền">
              <Button type="link" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="document-permissions-page">
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={24}>
            <Title level={3}>
              <LockOutlined /> Quản lý quyền truy cập tài liệu
            </Title>
          </Col>
        </Row>

        {documentInfo && (
          <Card size="small" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Statistic
                  title="Tài liệu"
                  value={documentInfo.title}
                  prefix={<InfoCircleOutlined />}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Loại truy cập"
                  value={getAccessTypeLabel(documentInfo.accessType)}
                  valueStyle={{
                    color: getAccessTypeColor(documentInfo.accessType),
                  }}
                />
              </Col>
              <Col xs={24} sm={6}>
                <Statistic
                  title="Số quyền đã cấp"
                  value={permissions.length}
                  suffix="quyền"
                />
              </Col>
            </Row>
          </Card>
        )}

        <Row justify="space-between" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={4}>Danh sách quyền truy cập</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<ShareAltOutlined />}
              onClick={handleShare}
            >
              Chia sẻ mới
            </Button>
          </Col>
        </Row>

        {permissions.length === 0 ? (
          <Alert
            message="Chưa có quyền truy cập nào"
            description="Tài liệu này chưa được chia sẻ với ai. Hãy sử dụng nút 'Chia sẻ mới' để bắt đầu."
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={permissions}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} của ${total} quyền`,
            }}
          />
        )}
      </Card>

      {/* ABAC Share Modal */}
      {documentInfo && (
        <ShareModal
          visible={showShareModal}
          onCancel={handleCloseShareModal}
          documentId={documentInfo.file_id}
          documentInfo={documentInfo}
        />
      )}

      {/* Edit Permission Modal */}
      <Modal
        title="Chỉnh sửa quyền truy cập"
        open={!!editingPermission}
        onCancel={() => setEditingPermission(null)}
        footer={[
          <Button key="cancel" onClick={() => setEditingPermission(null)}>
            Hủy
          </Button>,
          <Button key="save" type="primary">
            Lưu thay đổi
          </Button>,
        ]}
      >
        {editingPermission && (
          <div>
            <p>Chỉnh sửa quyền cho: {editingPermission.userName}</p>
            {/* Add form for editing permission */}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentPermissionsPage;
