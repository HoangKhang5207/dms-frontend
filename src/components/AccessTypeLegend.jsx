import React from "react";
import { Card, Row, Col, Typography, Space, Tag } from "antd";
import {
  GlobalOutlined,
  TeamOutlined,
  LockOutlined,
  UserOutlined,
} from "@ant-design/icons";
import AccessTypeTag from "./AccessTypeTag";

const { Text, Title } = Typography;

const AccessTypeLegend = () => {
  const accessTypes = [
    {
      type: 1,
      title: "Ngoại bộ",
      description: "Có thể truy cập từ bên ngoài tổ chức",
      examples: "Tài liệu công khai, thông báo, báo cáo ngoại bộ",
      icon: <GlobalOutlined />,
      color: "blue",
      bgColor: "#e6f7ff",
      borderColor: "#91d5ff",
    },
    {
      type: 2,
      title: "Công khai",
      description: "Tất cả thành viên tổ chức có thể truy cập",
      examples: "Quy định nội bộ, tài liệu đào tạo, thông báo chung",
      icon: <TeamOutlined />,
      color: "green",
      bgColor: "#f6ffed",
      borderColor: "#b7eb8f",
    },
    {
      type: 3,
      title: "Nội bộ",
      description: "Chỉ thành viên trong phòng ban có thể truy cập",
      examples: "Tài liệu dự án, báo cáo nội bộ, kế hoạch phòng ban",
      icon: <TeamOutlined />,
      color: "orange",
      bgColor: "#fff7e6",
      borderColor: "#ffd591",
    },
    {
      type: 4,
      title: "Riêng tư",
      description: "Chỉ người tạo và người được chia sẻ có thể truy cập",
      examples: "Tài liệu cá nhân, bản nháp, thông tin nhạy cảm",
      icon: <LockOutlined />,
      color: "red",
      bgColor: "#fff2f0",
      borderColor: "#ffccc7",
    },
  ];

  return (
    <Card
      title={
        <Space>
          <Title level={5} style={{ margin: 0 }}>
            Giải thích loại truy cập
          </Title>
          <Text type="secondary" style={{ fontSize: "12px" }}>
            Hướng dẫn sử dụng
          </Text>
        </Space>
      }
      size="small"
      style={{ marginBottom: 16 }}
      bodyStyle={{ padding: "16px" }}
    >
      <Row gutter={[16, 16]}>
        {accessTypes.map((accessType) => (
          <Col xs={24} sm={12} md={6} key={accessType.type}>
            <Card
              size="small"
              style={{
                border: `1px solid ${accessType.borderColor}`,
                backgroundColor: accessType.bgColor,
                borderRadius: "8px",
                transition: "all 0.3s ease",
              }}
              bodyStyle={{ padding: "12px" }}
              hoverable
            >
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <div style={{ textAlign: "center", marginBottom: 8 }}>
                  <AccessTypeTag accessType={accessType.type} />
                </div>
                <div>
                  <Title
                    level={5}
                    style={{ margin: "0 0 4px 0", fontSize: "14px" }}
                  >
                    {accessType.title}
                  </Title>
                  <Text
                    type="secondary"
                    style={{
                      fontSize: "11px",
                      display: "block",
                      marginBottom: "8px",
                      lineHeight: "1.4",
                    }}
                  >
                    {accessType.description}
                  </Text>
                  <div
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.6)",
                      padding: "6px 8px",
                      borderRadius: "4px",
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    <Text
                      type="secondary"
                      style={{
                        fontSize: "10px",
                        fontStyle: "italic",
                        color: "#666",
                      }}
                    >
                      <Text strong style={{ fontSize: "10px" }}>
                        Ví dụ:
                      </Text>{" "}
                      {accessType.examples}
                    </Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default AccessTypeLegend;
