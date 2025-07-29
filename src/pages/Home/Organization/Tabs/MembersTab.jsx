import React, { useEffect, useState, useMemo } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Table, Button, Input, Row, Col, Tag, Typography, Dropdown, Menu, Popconfirm, Space, Tooltip } from 'antd';
import { PlusOutlined, SearchOutlined, EllipsisOutlined, UpSquareOutlined, DownSquareOutlined, DeleteOutlined } from '@ant-design/icons';
import { useAuth } from '../../../../contexts/AuthContext';
import { useOrganization } from '../../../../contexts/OrganizationContext';
import InviteMembersModal from './InviteMembersModal';

const { Text } = Typography;

const MembersTab = () => {
    const { fullUser } = useAuth();
    const { 
        organization, 
        members, 
        memberPagination, 
        fetchMembers, 
        departments, 
        loading,
        assignOrgManagerRole,
        revokeOrgManagerRole,
        removeUserFromOrg
    } = useOrganization();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [searchTerm, setSearchTerm] = useState(''); // State cho tìm kiếm
    const [filters, setFilters] = useState({});

    useEffect(() => {
        if (organization) {
            fetchMembers(organization.id);
        }
    }, [organization, fetchMembers]);

    // Tạo một map để tra cứu tên phòng ban hiệu quả
    const departmentMap = useMemo(() => {
        return departments.reduce((acc, dept) => {
            acc[dept.id] = dept.name;
            return acc;
        }, {});
    }, [departments]);
    
    // Lọc và tìm kiếm danh sách thành viên
    const filteredAndSearchedMembers = useMemo(() => {
        let filtered = [...members];

        // Áp dụng bộ lọc chức danh
        const roleFilters = filters.role || [];
        if (roleFilters.length > 0) {
            filtered = filtered.filter(member => {
                if (roleFilters.includes('org_manager')) {
                    if (member.is_organization_manager) return true;
                }
                if (roleFilters.includes('member')) {
                    if (!member.is_organization_manager) return true;
                }
                return false;
            });
        }

        // Áp dụng tìm kiếm theo email
        if (searchTerm) {
            filtered = filtered.filter(member =>
                member.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [members, searchTerm, filters]);

    const handleAction = async (action, record) => {
        let success = false;
        switch (action) {
            case 'assign_org_manager':
                success = await assignOrgManagerRole(organization.id, record.email);
                break;
            case 'revoke_org_manager':
                success = await revokeOrgManagerRole(organization.id, record.email);
                break;
            case 'remove_user':
                success = await removeUserFromOrg(organization.id, record.email);
                break;
            default:
                break;
        }
        if (success) {
            fetchMembers(organization.id, memberPagination.current - 1, memberPagination.pageSize); // Tải lại dữ liệu
        }
    };

    const handleTableChange = (pagination, filters) => {
        setFilters(filters); // Cập nhật state của bộ lọc
        // Logic phân trang nếu cần
        fetchMembers(organization.id, pagination.current - 1, pagination.pageSize);
    };

    const getRoleText = (user) => {
        if (user.is_organization_manager) return <Tag color="gold">Quản lý tổ chức</Tag>;
        return 'Người tham gia';
    };

    const columns = [
        { 
            title: 'Email', 
            dataIndex: 'email', 
            key: 'email', 
            sorter: (a, b) => a.email.localeCompare(b.email),
            render: (email) => (
                <Tooltip placement="topLeft" title={email}>
                    {email}
                </Tooltip>
            )
        },
        { 
            title: 'Họ và tên đệm', 
            key: 'last_name', 
            render: (_, record) => `${record.last_name}`
        },
        { title: 'Tên thành viên', key: 'first_name', render: (_, record) => `${record.first_name}` },
        { 
            title: 'Chức danh', 
            key: 'role', 
            render: (_, record) => getRoleText(record),
            filters: [
                { text: 'Quản lý tổ chức', value: 'org_manager' },
                { text: 'Người tham gia', value: 'member' },
            ],
        },
        { 
            title: 'Phòng ban', 
            dataIndex: 'department_id', 
            key: 'department',
            // Dùng map để hiển thị tên phòng ban
            render: (deptId) => departmentMap[deptId] || ''
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'status', 
            key: 'status', 
            render: (status) => status === 1 ? <Tag color="success">Hoạt động</Tag> : <Tag>Chưa kích hoạt</Tag>
        },
        { 
            title: 'Ngày tham gia', 
            dataIndex: 'created_at', 
            key: 'created_at',
            render: (text) => new Date(text).toLocaleString('vi-VN')
        },
    ];

    // Chỉ Quản lý tổ chức mới có thể thấy và thực hiện các hành động
    if (fullUser?.is_organization_manager) {
        columns.push({
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            align: 'center',
            render: (_, record) => {
                // Các điều kiện phân quyền
                const isSelf = record.email === fullUser.email;
                const isOrgCreator = record.email === organization.created_by;
                const amITheOrgCreator = fullUser.email === organization.created_by;

                const menuItems = [];

                // Logic gán/bãi nhiệm quyền Quản lý tổ chức
                if (record.is_organization_manager) {
                    menuItems.push({
                        key: 'revoke_org_manager',
                        label: 'Bãi nhiệm Quản lý tổ chức',
                        icon: <DownSquareOutlined />,
                        // Chỉ người tạo tổ chức mới được bãi nhiệm, và không được bãi nhiệm chính người tạo
                        disabled: isSelf || isOrgCreator || !amITheOrgCreator,
                        onClick: () => handleAction('revoke_org_manager', record)
                    });
                } else {
                    menuItems.push({
                        key: 'assign_org_manager',
                        label: 'Gán quyền Quản lý tổ chức',
                        icon: <UpSquareOutlined />,
                        disabled: isSelf,
                        onClick: () => handleAction('assign_org_manager', record)
                    });
                }

                // Logic xóa thành viên
                menuItems.push({
                    key: 'remove_user',
                    label: (
                        <Popconfirm
                            title={`Xóa ${record.email} khỏi tổ chức?`}
                            description="Hành động này không thể hoàn tác."
                            onConfirm={() => handleAction('remove_user', record)}
                            okText="Xóa"
                            cancelText="Hủy"
                            // Vô hiệu hóa Popconfirm nếu không đủ quyền
                            disabled={isSelf || isOrgCreator}
                        >
                            {/* Bọc text trong span để Popconfirm hoạt động với item bị disabled */}
                            <span style={{ color: (isSelf || isOrgCreator) ? 'rgba(0, 0, 0, 0.25)' : 'red' }}>
                                Xóa khỏi tổ chức
                            </span>
                        </Popconfirm>
                    ),
                    icon: <DeleteOutlined />,
                    danger: true,
                    // Vô hiệu hóa Menu.Item để ngăn onClick
                    disabled: isSelf || isOrgCreator,
                });

                return (
                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <Button type="text" icon={<EllipsisOutlined />} />
                    </Dropdown>
                );
            }
        });
    }

    return (
        <div>
            <Row justify="space-between" style={{ marginBottom: 16 }}>
                <Col>
                    <Input
                        placeholder="Tìm kiếm thành viên theo email..."
                        prefix={<SearchOutlined />}
                        allowClear
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: 300 }}
                    />
                </Col>
                <Col>
                    {fullUser?.is_organization_manager && (
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={() => setIsModalVisible(true)}
                        >
                            Mời thành viên
                        </Button>
                    )}
                </Col>
            </Row>
            <Table
                columns={columns}
                dataSource={filteredAndSearchedMembers}
                rowKey="id"
                loading={loading}
                pagination={false}
                onChange={handleTableChange}
                scroll={{ x: 'max-content' }}
            />
            <InviteMembersModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
            />
        </div>
    );
};

export default MembersTab;