import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import { List, Card, Typography } from 'antd';
import { FolderOpenOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useOrganization } from '../../../contexts/OrganizationContext';
import { useAuth } from '../../../contexts/AuthContext';
import GlobalSearch from '../../../components/GlobalSearch/GlobalSearch';

const { Title, Text } = Typography;

const DocumentManagementPage = () => {
    const { departments, loading } = useOrganization();
    const { fullUser } = useAuth();

    // Tìm tên phòng ban của người dùng
    const userDepartmentName = fullUser?.department_id 
        ? departments.find(d => d.id === fullUser.department_id)?.name 
        : null;

    return (
        <div>
            {/* Thanh tìm kiếm toàn cục */}
            <div style={{ marginBottom: 16 }}>
                <GlobalSearch />
            </div>

            <Title level={4} style={{ marginBottom: 4 }}>Quản lý tài liệu</Title>
            {/* Hiển thị subtitle nếu có */}
            {userDepartmentName && (
                <Text type="secondary">Phòng ban của bạn: <strong>{userDepartmentName}</strong></Text>
            )}
            <p style={{ marginTop: 16 }}>Vui lòng chọn một phòng ban để xem các thư mục và tài liệu.</p>
            <List
                grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 5, xxl: 6 }}
                dataSource={departments.filter(d => d.status === 1)} // Chỉ hiển thị phòng ban đang hoạt động
                loading={loading}
                renderItem={(dept) => (
                    <List.Item>
                        <Link to={`/home/document-management/${dept.id}`}>
                            <Card hoverable>
                                <Card.Meta
                                    avatar={<FolderOpenOutlined style={{ fontSize: '32px', color: '#1677ff' }} />}
                                    title={dept.name}
                                    description={dept.description}
                                />
                            </Card>
                        </Link>
                    </List.Item>
                )}
            />
        </div>
    );
};

export default DocumentManagementPage;