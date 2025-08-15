import React, { useEffect, useState } from "react";
import { Table, Space, Button, message } from "antd";
import { EyeOutlined, ShareAltOutlined } from "@ant-design/icons";
import { useAuth } from "../../contexts/AuthContext";
import AccessTypeTag from "../../components/AccessTypeTag";
import axiosInstance from "../../api/axiosInstance";

const SharedDocumentsPage = () => {
  const { token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const fetchSharedDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/documents/sharing/shared",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const documentsArray = Array.isArray(data) ? data : [];
        setDocuments(documentsArray);
      } else {
        message.error("Không thể lấy danh sách tài liệu được chia sẻ.");
        setDocuments([]);
      }
    } catch (error) {
      message.error("Lỗi khi lấy danh sách tài liệu được chia sẻ.");
      console.error("Lỗi khi lấy danh sách tài liệu được chia sẻ:", error);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const me = await axiosInstance.get("/users/me");
      const orgId = me?.data?.organization?.id || me?.data?.organizationId;
      if (!orgId) {
        console.warn("Không tìm thấy organizationId trong /users/me");
        setCategories([]);
        return;
      }
      const deptsRes = await axiosInstance.get(`/departments/organization/${orgId}`);
      const departments = deptsRes?.data || [];
      if (!departments.length) {
        setCategories([]);
        return;
      }
      const deptId = departments[0]?.id;
      const catsPage = await axiosInstance.get(`/departments/${deptId}/categories`, { params: { page: 0, size: 1000 } });
      const cats = catsPage?.data?.content || catsPage?.data || [];
      setCategories(cats);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách categories:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSharedDocuments();
      fetchCategories();
    }
  }, [token]);

  const handleView = async (fileId, fileName) => {
    try {
      const url = `http://localhost:8080/api/v1/documents/${fileId}/retrieve?withWatermark=false`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const fileUrl = window.URL.createObjectURL(blob);
        window.open(fileUrl, "_blank");
      } else {
        message.error("Không thể xem tài liệu. Vui lòng thử lại sau.");
      }
    } catch (error) {
      message.error("Lỗi khi xem tài liệu.");
      console.error("Lỗi khi xem tài liệu:", error);
    }
  };

  const handleShare = (fileId, fileName) => {
    message.info("Chức năng chia sẻ sẽ được triển khai sau");
  };

  const hasPermission = (permissions, permission) => {
    return (
      permissions &&
      Array.isArray(permissions) &&
      permissions.includes(permission)
    );
  };

  const getAccessTypeText = (accessType) => {
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

  const getCategoryName = (categoryId, categoryName) => {
    // Ưu tiên sử dụng categoryName từ backend nếu có
    if (categoryName) {
      return categoryName;
    }
    // Fallback về việc tìm trong danh sách categories
    if (categoryId) {
      const category = categories.find((cat) => cat.id === categoryId);
      return category ? category.name : "Không xác định";
    }
    return "Không xác định";
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
        // Hỗ trợ cả object category và trường rời rạc
        const catName = record?.category?.name || record?.categoryName;
        if (catName) return catName;
        const catId = record?.category?.id || record?.categoryId || record?.category_id;
        return getCategoryName(catId, undefined);
      },
    },
    {
      title: "Phòng ban",
      key: "department",
      render: (_, record) => record.departmentName || "N/A",
    },
    {
      title: "Truy cập",
      key: "access",
      render: (_, record) => <AccessTypeTag accessType={record.accessType} />,
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
    },
    {
      title: "Kích thước",
      key: "storage_unit",
      render: (_, record) => {
        const capacity = record.storageCapacity;
        const unit = record.storageUnit;
        if (!capacity && !unit) return "N/A";
        return `${capacity || 0} ${unit || "KB"}`;
      },
    },
    {
      title: "Chia sẻ bởi",
      key: "sharedBy",
      render: (_, record) => {
        const sharedBy = record.sharedBy;
        if (!sharedBy) return "N/A";
        return `${sharedBy.firstName} ${sharedBy.lastName} (${sharedBy.email})`;
      },
    },
    {
      title: "Thời gian chia sẻ",
      dataIndex: "sharedAt",
      key: "sharedAt",
      render: (text) => (text ? new Date(text).toLocaleString("vi-VN") : "N/A"),
    },
    {
      title: "Hết hạn",
      dataIndex: "expiryDate",
      key: "expiryDate",
      render: (text) => {
        if (!text) return "Không có";
        const expiryDate = new Date(text);
        const now = new Date();
        const isExpired = expiryDate < now;
        return (
          <span style={{ color: isExpired ? "#ff4d4f" : "#52c41a" }}>
            {expiryDate.toLocaleString("vi-VN")}
            {isExpired && " (Đã hết hạn)"}
          </span>
        );
      },
    },
    {
      title: "Quyền hạn",
      key: "permissions",
      render: (_, record) => {
        const permissions = record.permissions || [];
        return (
          <Space direction="vertical" size="small">
            {hasPermission(permissions, "documents:share:readonly") && (
              <span style={{ color: "#1890ff" }}>Chỉ đọc</span>
            )}
            {hasPermission(permissions, "documents:share:forwardable") && (
              <span style={{ color: "#52c41a" }}>Có thể chia sẻ</span>
            )}
            {hasPermission(permissions, "documents:share:timebound") && (
              <span style={{ color: "#fa8c16" }}>Có thời hạn</span>
            )}
            {hasPermission(permissions, "documents:share:external") && (
              <span style={{ color: "#eb2f96" }}>Chia sẻ ngoại bộ</span>
            )}
            {hasPermission(permissions, "documents:share:orgscope") && (
              <span style={{ color: "#722ed1" }}>Chia sẻ nội bộ</span>
            )}
          </Space>
        );
      },
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => {
        const permissions = record.permissions || [];
        const canRead = hasPermission(permissions, "documents:share:readonly");
        const canShare = hasPermission(
          permissions,
          "documents:share:forwardable"
        );
        const canExternal = hasPermission(
          permissions,
          "documents:share:external"
        );
        const canOrgScope = hasPermission(
          permissions,
          "documents:share:orgscope"
        );

        if (!canRead && !canShare && !canExternal && !canOrgScope) {
          return <span style={{ color: "#999" }}>Không có quyền</span>;
        }

        return (
          <Space size="middle">
            {canRead && (
              <Button
                icon={<EyeOutlined />}
                onClick={() => handleView(record.file_id, record.title)}
              >
                Xem
              </Button>
            )}
            {(canShare || canExternal || canOrgScope) && (
              <Button
                icon={<ShareAltOutlined />}
                onClick={() => handleShare(record.file_id, record.title)}
              >
                Chia sẻ
              </Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <Space
        style={{
          marginBottom: 16,
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <h1>Tài liệu được chia sẻ với tôi</h1>
      </Space>
      <Table
        columns={columns}
        dataSource={documents}
        rowKey="file_id"
        loading={loading}
      />
    </div>
  );
};

export default SharedDocumentsPage;
