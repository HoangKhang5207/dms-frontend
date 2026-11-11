import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Layout, Row, Col, Typography } from 'antd';
import './AppFooter.css';

const { Footer } = Layout;
const { Text } = Typography;

const AppFooter = () => {
  return (
    <Footer className="app-footer">
      <Row justify="center" align="middle">
        <Col>
          <Text className="footer-text">
            AquaDocs AI · Đồng hành cùng ngành nước hiện đại
          </Text>
        </Col>
      </Row>
    </Footer>
  );
};

export default AppFooter;
