import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Form,
  Alert,
  Checkbox,
  Select,
  DatePicker,
  Input,
  Space,
  Typography,
  Card,
  Row,
  Col,
  Tag,
  Spin,
  message,
} from "antd";
import {
  ShareAltOutlined,
  UserOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  TeamOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../api/axiosInstance";
import "./ShareModal.css";

const { Option } = Select;
const { Text, Title } = Typography;

const ShareModal = ({ visible, onCancel, documentId, documentInfo }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [shareableUsers, setShareableUsers] = useState([]);
  const [permissionTypes, setPermissionTypes] = useState([]);
  const [currentAccessType, setCurrentAccessType] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);

  const accessTypeConfig = {
    1: { label: "Ngoại bộ", color: "blue", icon: <GlobalOutlined /> },
    2: { label: "Công khai", color: "green", icon: <TeamOutlined /> },
    3: { label: "Nội bộ", color: "orange", icon: <TeamOutlined /> },
    4: { label: "Riêng tư", color: "red", icon: <UserOutlined /> },
  };

  useEffect(() => {
    if (visible && documentId) {
      loadUsers();
      loadShareableUsers();
      loadPermissionTypes();
      if (documentInfo) {
        setCurrentAccessType(documentInfo.access_type);
      }
    }
  }, [visible, documentId, documentInfo]);

  // Theo dõi thay đổi của permission types để hiển thị/ẩn trường thời hạn
  const handlePermissionChange = (values) => {
    setSelectedPermissions(values);
  };

  // Kiểm tra có cần hiển thị trường thời hạn không
  const shouldShowExpiryDate = selectedPermissions.includes(
    "documents:share:timebound"
  );

  const loadUsers = async () => {
    try {
      const response = await axiosInstance.get("/users");
      setUsers(response.data || []);
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    }
  };

  const loadShareableUsers = async () => {
    try {
      const response = await axiosInstance.get(
        `/abac/documents/${documentId}/shareable-users`
      );
      setShareableUsers(response.data || []);
    } catch (error) {
      console.error("Error loading shareable users:", error);
      setShareableUsers([]);
    }
  };

  const loadPermissionTypes = async () => {
    try {
      const response = await axiosInstance.get("/abac/permission-types");
      setPermissionTypes(response.data || []);
    } catch (error) {
      console.error("Error loading permission types:", error);
      setPermissionTypes([]);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const shareData = {
        targetUserIds: values.targetUserIds || [],
        permissionTypes: values.permissionTypes || [],
        expiryDate: values.expiryDate
          ? values.expiryDate.format("YYYY-MM-DD HH:mm:ss")
          : null,
      };

      const response = await axiosInstance.post(
        `/abac/documents/${documentId}/share`,
        shareData
      );

      if (response.status === 200) {
        const responseData = response.data;
        if (responseData.success) {
          message.success(
            responseData.message || "Chia sẻ tài liệu thành công!"
          );
          form.resetFields();
          onCancel();
        } else {
          message.error(responseData.message || "Lỗi khi chia sẻ tài liệu");
        }
      }
    } catch (error) {
      console.error("Error sharing document:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        message.error(error.response.data.message);
      } else {
        message.error("Lỗi khi chia sẻ tài liệu. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const getAccessTypeDisplay = () => {
    if (!currentAccessType) return null;

    const config = accessTypeConfig[currentAccessType];
    if (!config) return null;

    return (
      <Tag color={config.color} icon={config.icon}>
        {config.label}
      </Tag>
    );
  };

  return (
    <Modal
      title={
        <Space>
          <ShareAltOutlined />
          <span>Chia sẻ tài liệu</span>
        </Space>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      className="abac-share-modal"
      style={{ top: 20 }}
      destroyOnClose
      maskClosable={false}
      keyboard={false}
    >
      <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
        {documentInfo && (
          <Card size="small" style={{ marginBottom: 16 }}>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <Title level={5} style={{ margin: 0 }}>
                  {documentInfo.title}
                </Title>
                <Text type="secondary">ID: {documentInfo.file_id}</Text>
              </Col>
              <Col>{getAccessTypeDisplay()}</Col>
            </Row>
          </Card>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            targetUserIds: [],
            permissionTypes: [],
          }}
        >
          <Form.Item
            label={
              <Space>
                <UserOutlined />
                <span>Chọn người dùng</span>
              </Space>
            }
            name="targetUserIds"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ít nhất một người dùng!",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn người dùng để chia sẻ"
              loading={users.length === 0}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {shareableUsers.map((user) => (
                <Option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <Space>
                <ExclamationCircleOutlined />
                <span>Loại quyền truy cập</span>
              </Space>
            }
            name="permissionTypes"
            rules={[
              {
                required: true,
                message: "Vui lòng chọn ít nhất một loại quyền!",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Chọn loại quyền truy cập"
              loading={permissionTypes.length === 0}
              onChange={handlePermissionChange}
            >
              {permissionTypes.map((permission) => (
                <Option key={permission.type} value={permission.type}>
                  <Space>
                    {permission.icon && <span>{permission.icon}</span>}
                    <span>{permission.label}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          {shouldShowExpiryDate && (
            <Form.Item
              label={
                <Space>
                  <ClockCircleOutlined />
                  <span>Ngày hết hạn</span>
                </Space>
              }
              name="expiryDate"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày hết hạn!",
                },
              ]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                placeholder="Chọn ngày hết hạn"
                style={{ width: "100%" }}
              />
            </Form.Item>
          )}

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<ShareAltOutlined />}
              >
                Chia sẻ
              </Button>
              <Button onClick={onCancel}>Hủy</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

export default ShareModal;
