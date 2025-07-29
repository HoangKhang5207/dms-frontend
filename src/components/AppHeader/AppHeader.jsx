import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Layout, Button, Row, Col, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import './AppHeader.css';

const { Header } = Layout;

const AppHeader = () => {
  const navigate = useNavigate();

  return (
    <Header className="app-header">
      <Row justify="space-between" align="middle" style={{ height: '100%' }}>
        <Col>
          <div className="logo" onClick={() => navigate('/')}>
            <img src="/src/assets/logo.png" alt="GENADATA Logo" />
            <span>GENADATA</span>
          </div>
        </Col>
        <Col>
          <Space size="large">
            <a href="#tinh-nang" className="header-link">Tính năng</a>
            <a href="#lien-he" className="header-link">Liên hệ</a>
            <Button type="primary" onClick={() => navigate('/login')}>
              Đăng nhập
            </Button>
          </Space>
        </Col>
      </Row>
    </Header>
  );
};

export default AppHeader;