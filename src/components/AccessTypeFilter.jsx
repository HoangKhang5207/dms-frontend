import React from "react";
import { Select, Space, Typography, Tag } from "antd";
import {
  GlobalOutlined,
  TeamOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AccessTypeTag from "./AccessTypeTag";

const { Option } = Select;
const { Text } = Typography;

const AccessTypeFilter = ({
  value,
  onChange,
  placeholder = "Chọn loại truy cập",
  style = {},
}) => {
  const accessTypes = [
    {
      value: 1,
      label: "Ngoại bộ",
      description: "Có thể truy cập từ bên ngoài tổ chức",
      icon: <GlobalOutlined />,
      color: "blue",
    },
    {
      value: 2,
      label: "Công khai",
      description: "Tất cả thành viên tổ chức có thể truy cập",
      icon: <TeamOutlined />,
      color: "green",
    },
    {
      value: 3,
      label: "Nội bộ",
      description: "Chỉ thành viên trong phòng ban có thể truy cập",
      icon: <TeamOutlined />,
      color: "orange",
    },
    {
      value: 4,
      label: "Riêng tư",
      description: "Chỉ người tạo và người được chia sẻ có thể truy cập",
      icon: <LockOutlined />,
      color: "red",
    },
  ];

  const handleChange = (selectedValue) => {
    onChange?.(selectedValue);
  };

  return (
    <Select
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      style={{ minWidth: 200, ...style }}
      allowClear
      showSearch
      filterOption={(input, option) =>
        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
      }
      dropdownStyle={{
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      }}
    >
      {accessTypes.map((type) => (
        <Option key={type.value} value={type.value}>
          <Space>
            <Tag
              color={type.color}
              icon={type.icon}
              style={{
                borderRadius: "4px",
                fontSize: "11px",
                padding: "2px 6px",
              }}
            >
              {type.label}
            </Tag>
            <div>
              <Text strong style={{ fontSize: "12px" }}>
                {type.label}
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: "10px" }}>
                {type.description}
              </Text>
            </div>
          </Space>
        </Option>
      ))}
    </Select>
  );
};

export default AccessTypeFilter;
