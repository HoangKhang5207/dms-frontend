import React from "react";
import { Card, Row, Col, Statistic, Tag, Space, Typography } from "antd";
import {
  GlobalOutlined,
  TeamOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AccessTypeTag from "./AccessTypeTag";

const { Text } = Typography;

const AccessTypeStats = ({ documents = [] }) => {
  const stats = documents.reduce((acc, doc) => {
    const accessType = doc.access_type || 4; // Default to PRIVATE
    acc[accessType] = (acc[accessType] || 0) + 1;
    return acc;
  }, {});

  const getAccessTypeConfig = (type) => {
    switch (type) {
      case 1: // EXTERNAL
        return {
          icon: <GlobalOutlined />,
          title: "Ngoại bộ",
          color: "blue",
          bgColor: "#e6f7ff",
          borderColor: "#91d5ff",
        };
      case 2: // PUBLIC
        return {
          icon: <TeamOutlined />,
          title: "Công khai",
          color: "green",
          bgColor: "#f6ffed",
          borderColor: "#b7eb8f",
        };
      case 3: // INTERNAL
        return {
          icon: <TeamOutlined />,
          title: "Nội bộ",
          color: "orange",
          bgColor: "#fff7e6",
          borderColor: "#ffd591",
        };
      case 4: // PRIVATE
        return {
          icon: <LockOutlined />,
          title: "Riêng tư",
          color: "red",
          bgColor: "#fff2f0",
          borderColor: "#ffccc7",
        };
      default:
        return {
          icon: <UserOutlined />,
          title: "Không xác định",
          color: "default",
          bgColor: "#f5f5f5",
          borderColor: "#d9d9d9",
        };
    }
  };

  const accessTypes = [1, 2, 3, 4];

  return (
    <Card
      title={
        <Space>
          <Text strong>Thống kê loại truy cập</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Tổng cộng: {documents.length} tài liệu
          </Text>
        </Space>
      }
      style={{ marginBottom: 16 }}
      bodyStyle={{ padding: "16px" }}
    >
      <Row gutter={[16, 16]}>
        {accessTypes.map((type) => {
          const config = getAccessTypeConfig(type);
          const count = stats[type] || 0;
          const percentage =
            documents.length > 0
              ? ((count / documents.length) * 100).toFixed(1)
              : 0;

          return (
            <Col xs={24} sm={12} md={6} key={type}>
              <Card
                size="small"
                style={{
                  textAlign: "center",
                  border: `1px solid ${config.borderColor}`,
                  backgroundColor: config.bgColor,
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                }}
                bodyStyle={{ padding: "12px" }}
                hoverable
              >
                <div style={{ marginBottom: 8 }}>
                  <Tag
                    color={config.color}
                    icon={config.icon}
                    style={{
                      borderRadius: "6px",
                      fontSize: "11px",
                      padding: "4px 8px",
                    }}
                  >
                    {config.title}
                  </Tag>
                </div>
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Số lượng
                    </Text>
                  }
                  value={count}
                  suffix={
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      ({percentage}%)
                    </Text>
                  }
                  valueStyle={{
                    color: config.color === "default" ? "#595959" : undefined,
                    fontSize: "20px",
                    fontWeight: "bold",
                  }}
                />
                <div style={{ marginTop: 8 }}>
                  <AccessTypeTag accessType={type} />
                </div>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
};

export default AccessTypeStats;
