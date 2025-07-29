import React, { useState, useEffect, useCallback } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Table, Tag, Typography, Alert, Dropdown, Menu, Button, Space } from 'antd';
import { EllipsisOutlined, UserSwitchOutlined, UserDeleteOutlined } from '@ant-design/icons';
import axiosInstance from '../../../../api/axiosInstance';
import { useAuth } from '../../../../contexts/AuthContext'; // Import useAuth
import { useOrganization } from '../../../../contexts/OrganizationContext';

const { Text } = Typography;

const DepartmentMembers = ({ departmentId, departmentName }) => {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { fullUser } = useAuth(); 
    const { organization, updateDeptManagerRole } = useOrganization();

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get(`/departments/${departmentId}/members`);
            setMembers(response.data.content);
        } catch (error) {
            console.error(`Failed to fetch members for department ${departmentId}:`, error);
        } finally {
            setLoading(false);
        }
    }, [departmentId]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleRoleChange = async (targetUser, isManager) => {
        const success = await updateDeptManagerRole(organization.id, targetUser.email, isManager);
        if (success) {
            fetchMembers(); // Tải lại danh sách thành viên để cập nhật UI
        }
    };

    const getRoleTag = (user) => {
        if (user.is_organization_manager) {
            return <Tag color="gold">Quản lý tổ chức</Tag>;
        }
        if (user.is_dept_manager) {
            return <Tag color="purple">Quản lý phòng ban</Tag>;
        }
        return <Text>Thành viên</Text>;
    };

    const columns = [
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Họ và tên đệm', dataIndex: 'last_name', key: 'last_name' },
        { title: 'Tên', dataIndex: 'first_name', key: 'first_name' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => status === 1 
                ? <Tag color="success">Hoạt động</Tag> 
                : <Tag color="default">Chưa kích hoạt</Tag>
        },
        {
            title: 'Chức vụ',
            key: 'role',
            render: (_, record) => getRoleTag(record)
        },
    ];

    // Chỉ Quản lý tổ chức mới thấy cột Hành động
    if (fullUser?.is_organization_manager) {
        columns.push({
            title: 'Hành động',
            key: 'action',
            align: 'center',
            render: (_, record) => {
                // Vô hiệu hóa hành động nếu user là chính mình
                const isSelf = record.email === fullUser.email;

                const menu = (
                    <Menu>
                        {record.is_dept_manager ? (
                            <Menu.Item 
                                key="revoke" 
                                icon={<UserDeleteOutlined />} 
                                onClick={() => handleRoleChange(record, false)}
                                disabled={isSelf}
                            >
                                Bãi nhiệm Quản lý phòng ban
                            </Menu.Item>
                        ) : (
                            <Menu.Item 
                                key="assign" 
                                icon={<UserSwitchOutlined />} 
                                onClick={() => handleRoleChange(record, true)}
                                disabled={isSelf}
                            >
                                Gán quyền Quản lý phòng ban
                            </Menu.Item>
                        )}
                    </Menu>
                );

                return (
                    <Dropdown overlay={menu} trigger={['click']}>
                        <Button type="text" icon={<EllipsisOutlined />} />
                    </Dropdown>
                );
            },
        });
    }
    
    if (loading) {
        return <p>Đang tải danh sách thành viên...</p>;
    }

    if (members.length === 0) {
        return <Alert message={`Chưa có thành viên nào trong phòng ban "${departmentName}".`} type="info" />;
    }

    return (
        <>
            <Typography.Title level={5} style={{ marginBottom: 16 }}>Thành viên phòng {departmentName}</Typography.Title>
            <Table
                columns={columns}
                dataSource={members}
                rowKey="id"
                pagination={false}
                loading={loading}
            />
        </>
    );
};

export default DepartmentMembers;