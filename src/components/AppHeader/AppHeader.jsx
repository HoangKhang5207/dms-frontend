import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Layout, Button, Row, Col, Space } from 'antd';
import { Link } from 'react-router-dom';
import AquaDocsBrand from '../AquaDocsBrand/AquaDocsBrand';
import './AppHeader.css';

const { Header } = Layout;

const AppHeader = () => {
  return (
    <Header className="app-header">
      <Row justify="space-between" align="middle" style={{ height: '100%' }}>
        <Col>
          <Link className="logo" to="/" aria-label="AquaDocs AI — Trang chủ">
            <AquaDocsBrand />
          </Link>
        </Col>
        <Col>
          <nav aria-label="Điều hướng chính">
            <Space size="large">
              <Link to="/#tinh-nang" className="header-link">Tính năng</Link>
              <Link to="/#lien-he" className="header-link">Liên hệ</Link>
              <Button type="primary" href="/login">
                Đăng nhập
              </Button>
            </Space>
          </nav>
        </Col>
      </Row>
    </Header>
  );
};

export default AppHeader;
