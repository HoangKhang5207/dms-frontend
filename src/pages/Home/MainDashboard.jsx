import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Input, Button, Row, Col, Typography, Card, Space, Tag } from 'antd';
import { SearchOutlined, FileTextOutlined } from '@ant-design/icons';
import './MainDashboard.css';
import GlobalSearch from '../../components/GlobalSearch/GlobalSearch';

const { Title, Text } = Typography;

// Dữ liệu giả cho "Các tệp gần đây"
const recentFiles = [
    {
        id: 1,
        icon: <FileTextOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
        name: 'URD_WebQuanLyTaiLieu.pdf',
        owner: 'dangquocthai214@gm...',
        date: '25/07/2025 22:14'
    }
];

const MainDashboard = () => {
    return (
        <div className="main-dashboard">
            <Row justify="space-between" align="middle" className="dashboard-header">
                <Col flex="auto">
                    <GlobalSearch />
                </Col>
                <Col>
                    <Button type="primary" size="large" icon={<SearchOutlined />}>
                        Tìm kiếm bằng AI
                    </Button>
                </Col>
            </Row>

            <Title level={4} style={{ marginTop: 24 }}>Các tệp gần đây</Title>
            <Row gutter={[16, 16]}>
                {recentFiles.map(file => (
                    <Col key={file.id} xs={24} sm={12} md={8} lg={6}>
                        <Card hoverable className="file-card">
                            <div className="file-card-icon">{file.icon}</div>
                            <Title level={5} ellipsis={{ rows: 2 }} className="file-card-name">{file.name}</Title>
                            <Space direction="vertical" size="small" style={{ marginTop: 'auto' }}>
                                <Text type="secondary" className="file-card-owner">{file.owner}</Text>
                                <Text type="secondary">{file.date}</Text>
                            </Space>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default MainDashboard;