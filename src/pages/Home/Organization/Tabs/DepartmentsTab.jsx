import React, { useEffect, useState, useMemo } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Table, Button, Space, Popconfirm, Tag, Input, Row, Col, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, StarFilled } from '@ant-design/icons';
import { useOrganization } from '../../../../contexts/OrganizationContext';
import { useAuth } from '../../../../contexts/AuthContext';
import DepartmentModal from './DepartmentModal';
import DepartmentMembers from './DepartmentMembers';

const DepartmentsTab = () => {
    const { fullUser } = useAuth();
    const { 
        organization, 
        departments, 
        fetchDepartments, 
        createDepartment,
        updateDepartment,
        deleteDepartment,
        loading 
    } = useOrganization();
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (organization) {
            fetchDepartments(organization.id);
        }
    }, [organization, fetchDepartments]);

    // Lọc danh sách phòng ban dựa trên searchTerm
    const filteredDepartments = useMemo(() => {
        if (!searchTerm) {
            return departments; // Nếu không có từ khóa, hiển thị tất cả
        }
        return departments.filter(dept =>
            dept.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, departments]);

    const handleAdd = () => {
        setEditingDepartment(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingDepartment(record);
        setIsModalVisible(true);
    };

    const handleDelete = (record) => {
        deleteDepartment(record.id, organization.id);
    };

    const handleModalFinish = async (values) => {
        let success = false;
        if (editingDepartment) {
            // Chế độ sửa
            success = await updateDepartment(editingDepartment.id, organization.id, values);
        } else {
            // Chế độ thêm mới
            success = await createDepartment(organization.id, values);
        }
        if (success) {
            setIsModalVisible(false);
        }
    };

    const columns = [
        { 
            title: 'Tên phòng ban', 
            dataIndex: 'name', 
            key: 'name',
            render: (text, record) => {
                const isManagerOfThisDept = (fullUser?.is_dept_manager && record.id === fullUser.department_id) || record.id === fullUser.department_id;
                // Nếu user là quản lý của phòng ban này hoặc chỉ là thành viên, thêm hint
                if (isManagerOfThisDept) {
                    return (
                        <Tooltip title="Đây là phòng ban của bạn">
                            <span style={{ fontWeight: 500, color: '#1677ff' }}>
                                {text} <StarFilled style={{ color: '#faad14', marginLeft: 4 }} />
                            </span>
                        </Tooltip>
                    );
                }
                return text;
            }
        },
        { 
            title: 'Mô tả', 
            dataIndex: 'description', 
            key: 'description', 
            ellipsis: { showTitle: false },
            render: (desc) => (
                <Tooltip placement="topLeft" title={desc}>
                    {desc}
                </Tooltip>
            )
        },
        { title: 'Người tạo', dataIndex: 'created_by', key: 'created_by', width: 300 },
        { 
            title: 'Tạo lúc', 
            dataIndex: 'created_at', 
            key: 'created_at',
            width: 200,
            render: (text) => new Date(text).toLocaleString('vi-VN')
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => status === 1 
                ? <Tag color="success">Hoạt động</Tag> 
                : <Tag color="error">Không hoạt động</Tag>
        },
    ];

    // Cột Hành động sẽ hiển thị cho cả Org Manager và Dept Manager
    if (fullUser?.is_organization_manager || fullUser?.is_dept_manager) {
        columns.push({
            title: 'Hành động',
            key: 'action',
            fixed: 'right',
            render: (_, record) => {
                // Logic phân quyền cho từng nút
                const canEdit = fullUser?.is_organization_manager || 
                              (fullUser?.is_dept_manager && record.id === fullUser.department_id);
                
                // Giả định chỉ Org Manager mới được xóa phòng ban để đảm bảo an toàn
                const canDelete = fullUser?.is_organization_manager;

                return (
                    <Space size="middle">
                        <Tooltip title="Chỉnh sửa">
                            <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} disabled={!canEdit} />
                        </Tooltip>
                        <Tooltip title={canDelete ? "Xóa" : "Chỉ quản lý tổ chức được xóa"}>
                            <Popconfirm
                                title="Bạn có chắc muốn xóa phòng ban này?"
                                onConfirm={() => handleDelete(record)}
                                okText="Xóa"
                                cancelText="Hủy"
                                disabled={!canDelete}
                            >
                                <Button icon={<DeleteOutlined />} danger disabled={!canDelete} />
                            </Popconfirm>
                        </Tooltip>
                    </Space>
                )
            },
        });
    }

    return (
        <div>
            <Row justify="space-between" style={{ marginBottom: 16 }}>
                <Col>
                    {/* Ô tìm kiếm */}
                    <Input
                        placeholder="Tìm kiếm phòng ban theo tên..."
                        prefix={<SearchOutlined />}
                        allowClear
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: 300 }}
                    />
                </Col>
                <Col>
                    {/* Chỉ Quản lý tổ chức mới thấy nút Thêm */}
                    {fullUser?.is_organization_manager && (
                        <Button 
                            type="primary" 
                            icon={<PlusOutlined />} 
                            onClick={handleAdd} 
                        >
                            Thêm phòng ban
                        </Button>
                    )}
                </Col>
            </Row>
            
            <Table 
                columns={columns} 
                dataSource={filteredDepartments}
                rowKey="id"
                loading={loading}
                scroll={{ x: 'max-content' }}
                // --- BỔ SUNG TÍNH NĂNG MỞ RỘNG HÀNG ---
                expandable={{
                    // Component sẽ được render khi mở rộng
                    expandedRowRender: (record) => (
                        <DepartmentMembers 
                            departmentId={record.id} 
                            departmentName={record.name} 
                        />
                    ),
                    // Quản lý tổ chức hoặc Quản lý phòng ban đều có thể xem thành viên
                    rowExpandable: (record) => fullUser?.is_organization_manager || fullUser?.is_dept_manager,
                }}
            />
            <DepartmentModal 
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onFinish={handleModalFinish}
                initialValues={editingDepartment}
            />
        </div>
    );
};

export default DepartmentsTab;