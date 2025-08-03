import React from "react";
import { Card, Row, Col, Progress, Typography, Tag, Space } from "antd";
import {
  GlobalOutlined,
  TeamOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AccessTypeTag from "./AccessTypeTag";

const { Text } = Typography;

const AccessTypeQuickStats = ({ documents = [] }) => {
  const stats = documents.reduce((acc, doc) => {
    const accessType = doc.access_type || 4; // Default to PRIVATE
    acc[accessType] = (acc[accessType] || 0) + 1;
    return acc;
  }, {});

  const total = documents.length;
  const accessTypes = [
    {
      type: 1,
      icon: <GlobalOutlined />,
      color: "blue",
      name: "Ngoại bộ",
      bgColor: "#e6f7ff",
      borderColor: "#91d5ff",
    },
    {
      type: 2,
      icon: <TeamOutlined />,
      color: "green",
      name: "Công khai",
      bgColor: "#f6ffed",
      borderColor: "#b7eb8f",
    },
    {
      type: 3,
      icon: <TeamOutlined />,
      color: "orange",
      name: "Nội bộ",
      bgColor: "#fff7e6",
      borderColor: "#ffd591",
    },
    {
      type: 4,
      icon: <LockOutlined />,
      color: "red",
      name: "Riêng tư",
      bgColor: "#fff2f0",
      borderColor: "#ffccc7",
    },
  ];

  return (
    <Card
      title={
        <Space>
          <Text strong>Thống kê nhanh</Text>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Tổng cộng: {total} tài liệu
          </Text>
        </Space>
      }
      size="small"
      style={{ marginBottom: 16 }}
      bodyStyle={{ padding: "16px" }}
    >
      <Row gutter={[16, 16]}>
        {accessTypes.map((accessType) => {
          const count = stats[accessType.type] || 0;
          const percentage = total > 0 ? (count / total) * 100 : 0;

          return (
            <Col xs={24} sm={12} md={6} key={accessType.type}>
              <Card
                size="small"
                style={{
                  textAlign: "center",
                  border: `1px solid ${accessType.borderColor}`,
                  backgroundColor: accessType.bgColor,
                  borderRadius: "8px",
                  transition: "all 0.3s ease",
                }}
                bodyStyle={{ padding: "12px" }}
                hoverable
              >
                <div style={{ marginBottom: 8 }}>
                  <Tag
                    color={accessType.color}
                    icon={accessType.icon}
                    style={{
                      borderRadius: "6px",
                      fontSize: "11px",
                      padding: "4px 8px",
                    }}
                  >
                    {accessType.name}
                  </Tag>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <AccessTypeTag accessType={accessType.type} />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Space direction="vertical" size="small">
                    <Text
                      strong
                      style={{
                        fontSize: "18px",
                        color:
                          accessType.color === "default"
                            ? "#595959"
                            : undefined,
                      }}
                    >
                      {count}
                    </Text>
                    <Text type="secondary" style={{ fontSize: "11px" }}>
                      / {total} tài liệu
                    </Text>
                  </Space>
                </div>
                <Progress
                  percent={percentage}
                  size="small"
                  strokeColor={
                    accessType.color === "default" ? "#d9d9d9" : undefined
                  }
                  showInfo={false}
                  style={{ marginBottom: 4 }}
                />
                <Text type="secondary" style={{ fontSize: "10px" }}>
                  {percentage.toFixed(1)}%
                </Text>
              </Card>
            </Col>
          );
        })}
      </Row>
    </Card>
  );
};

export default AccessTypeQuickStats;
