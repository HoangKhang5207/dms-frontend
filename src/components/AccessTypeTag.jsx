import React from "react";
import { Tag, Tooltip } from "antd";
import {
  GlobalOutlined,
  TeamOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";

const AccessTypeTag = ({ accessType }) => {
  const getAccessTypeConfig = (type) => {
    switch (type) {
      case 1: // EXTERNAL
        return {
          color: "blue",
          icon: <GlobalOutlined />,
          text: "Ngoại bộ",
          description: "Có thể truy cập từ bên ngoài tổ chức",
        };
      case 2: // PUBLIC
        return {
          color: "green",
          icon: <TeamOutlined />,
          text: "Công khai",
          description: "Tất cả thành viên tổ chức có thể truy cập",
        };
      case 3: // INTERNAL
        return {
          color: "orange",
          icon: <TeamOutlined />,
          text: "Nội bộ",
          description: "Chỉ thành viên trong phòng ban có thể truy cập",
        };
      case 4: // PRIVATE
        return {
          color: "red",
          icon: <LockOutlined />,
          text: "Riêng tư",
          description: "Chỉ người tạo và người được chia sẻ có thể truy cập",
        };
      default:
        return {
          color: "default",
          icon: <UserOutlined />,
          text: "Không xác định",
          description: "Loại truy cập không xác định",
        };
    }
  };

  const config = getAccessTypeConfig(accessType);

  return (
    <Tooltip
      title={config.description}
      placement="top"
      mouseEnterDelay={0.5}
      overlayStyle={{
        fontSize: "12px",
        lineHeight: "1.4",
      }}
    >
      <Tag
        color={config.color}
        icon={config.icon}
        style={{
          borderRadius: "6px",
          fontWeight: "500",
          fontSize: "12px",
          padding: "4px 8px",
          cursor: "pointer",
          transition: "all 0.3s ease",
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
        }}
      >
        {config.text}
      </Tag>
    </Tooltip>
  );
};

export default AccessTypeTag;
