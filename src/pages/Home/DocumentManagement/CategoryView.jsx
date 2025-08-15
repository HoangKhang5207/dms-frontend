import React, { useEffect, useState } from 'react';
import { useDebounce } from '../../../hooks/useDebounce'; // Import hook mới
import { useParams, Link } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import { Table, Row, Col, Button, Space, Popconfirm, Tooltip, Typography, Breadcrumb, Input } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined, FolderOpenOutlined, SearchOutlined } from '@ant-design/icons';
import { useDocument } from '../../../contexts/DocumentContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useOrganization } from '../../../contexts/OrganizationContext';
import CategoryModal from './CategoryModal';
import GlobalSearch from '../../../components/GlobalSearch/GlobalSearch';

const { Text } = Typography;

const CategoryView = () => {
    const { departmentId } = useParams();
    const { fullUser } = useAuth();
    const { departments } = useOrganization();
    const { categories, fetchCategoriesByDept, createCategory, updateCategory, deleteCategory, loading } = useDocument();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500); // Debounce 500ms

    useEffect(() => {
        // Effect này sẽ chạy khi departmentId hoặc debouncedSearchTerm thay đổi
        fetchCategoriesByDept(departmentId, debouncedSearchTerm);
    }, [departmentId, debouncedSearchTerm, fetchCategoriesByDept]);

    const currentDepartment = departments.find(d => d.id == departmentId);

    const canManage = fullUser?.is_organization_manager || (fullUser?.is_dept_manager && fullUser.department_id == departmentId);

    const handleModalFinish = async (values) => {
        let success;
        if (editingCategory) {
            success = await updateCategory(editingCategory.id, departmentId, values);
        } else {
            success = await createCategory(departmentId, values);
        }
        if (success) {
            setIsModalVisible(false);
        }
    };
    
    const columns = [
        { 
            title: 'Tên loại tài liệu', 
            dataIndex: 'name', 
            key: 'name',
            render: (text, record) => (
                <Link to={`/home/document-management/${departmentId}/${record.id}`}>
                    <Space>
                        <FolderOpenOutlined />
                        <Text>{text}</Text>
                    </Space>
                </Link>
            )
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
        { 
            title: 'Chủ sở hữu', 
            dataIndex: 'created_by', 
            key: 'created_by',
            ellipsis: { showTitle: false },
            render: (cb) => (
                <Tooltip placement="topLeft" title={cb}>
                    {cb}
                </Tooltip>
            )
        },
        { title: 'Tạo lúc', dataIndex: 'created_at', key: 'created_at', render: (text) => new Date(text).toLocaleString('vi-VN')},
    ];

    if (canManage) {
        columns.push({
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => { setEditingCategory(record); setIsModalVisible(true); }} />
                    <Popconfirm title="Xóa loại tài liệu này?" 
                                okText="Xóa"
                                cancelText="Hủy" 
                                onConfirm={() => deleteCategory(record.id, departmentId)}>
                        <Button icon={<DeleteOutlined />} danger />
                    </Popconfirm>
                </Space>
            ),
        });
    }

    return (
        <div>
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item><Link to="/home/dashboard"><HomeOutlined /></Link></Breadcrumb.Item>
                <Breadcrumb.Item><Link to="/home/document-management">Quản lý tài liệu</Link></Breadcrumb.Item>
                <Breadcrumb.Item>{currentDepartment?.name || 'Phòng ban'}</Breadcrumb.Item>
            </Breadcrumb>

            {/* Thanh tìm kiếm toàn cục */}
            <div style={{ marginBottom: 16 }}>
                <GlobalSearch />
            </div>
            
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Typography.Title level={4} style={{ margin: 0 }}>
                        Loại tài liệu trong {currentDepartment?.name}
                    </Typography.Title>
                </Col>
                <Col flex="auto" style={{ marginLeft: 24, marginRight: 24 }}>
                    {/* Thêm ô tìm kiếm */}
                    <Input
                        placeholder="Tìm kiếm loại tài liệu theo tên..."
                        prefix={<SearchOutlined />}
                        allowClear
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </Col>
                <Col>
                    {canManage && (
                        <Button type="primary" icon={<PlusOutlined />} onClick={() => { setEditingCategory(null); setIsModalVisible(true); }}>
                            Thêm loại tài liệu
                        </Button>
                    )}
                </Col>
            </Row>

            <Table columns={columns} dataSource={categories} rowKey="id" loading={loading} scroll={{ x: 'max-content' }} />
            <CategoryModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onFinish={handleModalFinish}
                initialValues={editingCategory}
            />
        </div>
    );
};

export default CategoryView;