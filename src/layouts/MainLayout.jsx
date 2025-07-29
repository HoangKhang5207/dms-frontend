import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Layout, FloatButton } from 'antd';
import { Outlet } from 'react-router-dom';
import AppHeader from '../components/AppHeader/AppHeader';
import AppFooter from '../components/AppFooter/AppFooter';
import './MainLayout.css'; // Import file CSS cho Layout

const { Content } = Layout;

const MainLayout = () => {
  return (
    <Layout className="main-layout">
      {/* Header được đặt trong Layout.Header của antd để dễ dàng tùy chỉnh */}
      <Layout.Header className="fixed-header">
        <AppHeader />
      </Layout.Header>
      
      {/* Content có padding top bằng chiều cao của header để không bị che khuất */}
      <Content className="main-content">
        <Outlet />
      </Content>
      
      <AppFooter />

      {/* Nút quay về đầu trang */}
      <FloatButton.BackTop duration={600} />
    </Layout>
  );
};

export default MainLayout;