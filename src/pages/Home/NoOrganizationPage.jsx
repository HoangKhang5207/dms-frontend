import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Button, Typography, Space } from 'antd';
import { useNavigate } from 'react-router-dom';
import './NoOrganizationPage.css';

const { Title, Paragraph } = Typography;

const NoOrganizationPage = () => {
    const navigate = useNavigate();

    return (
        <div className="no-org-container">
            <div className="no-org-content">
                <img src="/src/assets/no-org-illustration.svg" alt="No Organization" className="no-org-image" />
                <Title level={3}>Bạn chưa tham gia tổ chức nào</Title>
                <Paragraph type="secondary">
                    Hãy tạo tổ chức của riêng bạn để bắt đầu quản lý tài liệu.
                </Paragraph>
                <Button type="primary" size="large" onClick={() => navigate('/home/create-organization')}>
                    Tạo tổ chức
                </Button>
            </div>
        </div>
    );
};

export default NoOrganizationPage;