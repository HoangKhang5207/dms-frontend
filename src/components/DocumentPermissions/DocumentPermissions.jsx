import React, { useState, useEffect } from "react";
import {
  Card,
  Tag,
  Space,
  Typography,
  Button,
  Modal,
  List,
  Descriptions,
  Badge,
  Tooltip,
  Divider,
} from "antd";
import {
  EyeOutlined,
  LockOutlined,
  ShareAltOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  TeamOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { toast } from "react-toastify";
import axiosInstance from "../../api/axiosInstance";
import "./DocumentPermissions.css";

const { Title, Text, Paragraph } = Typography;

const DocumentPermissions = ({ documentId, documentInfo }) => {
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState([]);
  const [accessRights, setAccessRights] = useState({});
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (documentId) {
      loadPermissions();
    }
  }, [documentId]);

  const loadPermissions = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/api/abac/documents/${documentId}/all-permissions`
      );
      setPermissions(response.data.permissions || []);
      setAccessRights(response.data.accessRights || {});
    } catch (error) {
      console.error("Error loading permissions:", error);
      toast.error("Không thể tải thông tin quyền truy cập");
    } finally {
      setLoading(false);
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

  return (
    <div className="document-permissions">
      <Card
        title={
          <Space>
            <LockOutlined />
            Quyền truy cập tài liệu
          </Space>
        }
        loading={loading}
        extra={
          <Button
            type="link"
            icon={<InfoCircleOutlined />}
            onClick={() => setShowDetails(true)}
          >
            Chi tiết
          </Button>
        }
      >
        {documentInfo && (
          <div className="document-info mb-3">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Title level={5}>Tài liệu: {documentInfo.title}</Title>
              <Space>
                <Text type="secondary">Loại truy cập:</Text>
                <Tag color={getAccessTypeColor(documentInfo.accessType)}>
                  {getAccessTypeLabel(documentInfo.accessType)}
                </Tag>
              </Space>
            </Space>
          </div>
        )}

        <Divider />

        <div className="permissions-section">
          <Title level={5}>Quyền được cấp:</Title>
          {permissions.length > 0 ? (
            <Space wrap>
              {permissions.map((permission, index) => (
                <Tag
                  key={index}
                  color={getPermissionColor(permission)}
                  icon={getPermissionIcon(permission)}
                >
                  {getPermissionLabel(permission)}
                </Tag>
              ))}
            </Space>
          ) : (
            <Text type="secondary">Chưa có quyền nào được cấp</Text>
          )}
        </div>

        <Divider />

        <div className="access-rights-section">
          <Title level={5}>Quyền truy cập chi tiết:</Title>
          <List
            size="small"
            dataSource={Object.entries(accessRights)}
            renderItem={([right, value]) => (
              <List.Item>
                <Space>
                  <Badge status={value ? "success" : "default"} text={right} />
                  <Text type="secondary">
                    {value ? "Có quyền" : "Không có quyền"}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        </div>
      </Card>

      {/* Detailed Modal */}
      <Modal
        title="Chi tiết quyền truy cập"
        open={showDetails}
        onCancel={() => setShowDetails(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetails(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {documentInfo && (
          <Descriptions title="Thông tin tài liệu" bordered column={1}>
            <Descriptions.Item label="Tiêu đề">
              {documentInfo.title}
            </Descriptions.Item>
            <Descriptions.Item label="Loại truy cập">
              <Tag color={getAccessTypeColor(documentInfo.accessType)}>
                {getAccessTypeLabel(documentInfo.accessType)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Người tạo">
              {documentInfo.createdBy}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">
              {new Date(documentInfo.createdAt).toLocaleDateString("vi-VN")}
            </Descriptions.Item>
          </Descriptions>
        )}

        <Divider />

        <Descriptions title="Quyền truy cập" bordered column={1}>
          {permissions.map((permission, index) => (
            <Descriptions.Item
              key={index}
              label={getPermissionLabel(permission)}
            >
              <Space>
                {getPermissionIcon(permission)}
                <Text>{permission}</Text>
              </Space>
            </Descriptions.Item>
          ))}
        </Descriptions>

        <Divider />

        <Descriptions title="Quyền chi tiết" bordered column={1}>
          {Object.entries(accessRights).map(([right, value]) => (
            <Descriptions.Item key={right} label={right}>
              <Badge
                status={value ? "success" : "default"}
                text={value ? "Có quyền" : "Không có quyền"}
              />
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Modal>
    </div>
  );
};

export default DocumentPermissions;
