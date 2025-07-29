import React, {useState} from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Descriptions, Tag, Progress, Card, Row, Col, Typography, Space, Button } from 'antd';
import {
    CheckCircleOutlined,
    SyncOutlined,
    CloseCircleOutlined,
    BankOutlined,
    UserOutlined,
    ClockCircleOutlined,
    InfoCircleOutlined,
    FileTextOutlined,
    RobotOutlined,
    EditOutlined
} from '@ant-design/icons';
import { useOrganization } from '../../../../contexts/OrganizationContext';
import { useAuth } from '../../../../contexts/AuthContext';
import UpdateOrgInfoModal from './UpdateOrgInfoModal';

const { Text } = Typography;

// Helper function để format bytes sang GB
const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const InfoTab = () => {
    const { organization, loading, updateOrganization } = useOrganization();
    const { fullUser } = useAuth();
    const [isModalVisible, setIsModalVisible] = useState(false);

    if (loading || !organization) {
        return <p>Đang tải thông tin tổ chức...</p>;
    }

    const handleModalFinish = async (values) => {
        const success = await updateOrganization(organization.id, values);
        if (success) {
            setIsModalVisible(false); // Đóng modal nếu cập nhật thành công
        }
    };

    // Nút Chỉnh sửa chỉ hiển thị cho Quản lý tổ chức
    const editButton = fullUser?.is_organization_manager ? (
        <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => setIsModalVisible(true)}
        >
            Chỉnh sửa
        </Button>
    ) : null;

    const getStatusTag = (status) => {
        switch (status) {
            case 0: // Pending
                return <Tag icon={<SyncOutlined spin />} color="processing">Đang chờ duyệt</Tag>;
            case 1: // Approved
                return <Tag icon={<CheckCircleOutlined />} color="success">Đang hoạt động</Tag>;
            case 2: // Rejected
                return <Tag icon={<CloseCircleOutlined />} color="error">Đã từ chối</Tag>;
            case 3: // Suspended
                return <Tag icon={<CloseCircleOutlined />} color="warning">Đã bị đình chỉ</Tag>;
            default:
                return <Tag color="default">Không xác định</Tag>;
        }
    };

    return (
        <>
            <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                    <Card title="Thông tin cơ bản" extra={editButton}>
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label={<Space><BankOutlined /> Tên tổ chức</Space>}>{organization.name}</Descriptions.Item>
                            <Descriptions.Item label={<Space><UserOutlined /> Người tạo</Space>}>{organization.created_by}</Descriptions.Item>
                            <Descriptions.Item label={<Space><ClockCircleOutlined /> Tạo lúc</Space>}>
                                {new Date(organization.created_at).toLocaleString('vi-VN')}
                            </Descriptions.Item>
                            <Descriptions.Item label={<Space><InfoCircleOutlined /> Trạng thái</Space>}>{getStatusTag(organization.status)}</Descriptions.Item>
                            <Descriptions.Item label={<Space><FileTextOutlined /> Mô tả tổ chức</Space>}>{organization.description}</Descriptions.Item>
                            <Descriptions.Item label={<Space><RobotOutlined /> Sử dụng OpenAI</Space>}>
                                {organization.is_openai ? <Tag color="blue">Đang sử dụng</Tag> : <Tag>Không sử dụng</Tag>}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="Thống kê">
                        <div style={{ marginBottom: 16 }}>
                            <Text strong>Dung lượng lưu trữ</Text>
                            <Progress 
                                percent={organization.percent_data_used} 
                                format={() => `${formatBytes(organization.data_used)} / ${formatBytes(organization.limit_data)}`} 
                            />
                        </div>
                        <div>
                            <Text strong>Token OpenAI</Text>
                            <Progress 
                                percent={(organization.token_used * 100) / (organization.limit_token || 1)} 
                                format={() => `${organization.token_used || 0} / ${organization.limit_token || 0}`} 
                                status="exception"
                            />
                        </div>
                    </Card>
                </Col>
            </Row>

            <UpdateOrgInfoModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onFinish={handleModalFinish}
                initialValues={{ 
                    name: organization.name, 
                    description: organization.description 
                }}
            />
        </>
    );
};

export default InfoTab;