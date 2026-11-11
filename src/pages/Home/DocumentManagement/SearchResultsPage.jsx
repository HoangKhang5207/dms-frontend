import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import { Table, Typography, Button, Space, Tag, Empty, Tooltip, Popconfirm } from 'antd';
import { ArrowLeftOutlined, StarOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useSearch } from '../../../contexts/SearchContext';
import { getFileIcon } from '../../../utils/fileIcons'; // Import helper icon
import GlobalSearch from '../../../components/GlobalSearch/GlobalSearch';
import ActiveFiltersForm from '../../../components/GlobalSearch/ActiveFiltersForm';
import FilePreviewModal from './FilePreviewModal';

const { Title, Text } = Typography;

const SearchResultsPage = () => {
    const navigate = useNavigate();
    const { searchResults, searchParams, loading, pagination, performSearch } = useSearch();
    const [previewFile, setPreviewFile] = useState(null);

    const handlePreview = (record) => {
        setPreviewFile(record);
    };

    const handleTableChange = (page) => {
        performSearch(searchParams, page.current - 1, page.pageSize);
    };
    
    const columns = [
        { 
            title: 'Tiêu đề tài liệu', 
            dataIndex: 'title', 
            key: 'title', 
            width: 250,
            ellipsis: { showTitle: false },
            render: (title) => (
                <Tooltip placement="topLeft" title={title}>
                    {title}
                </Tooltip>
            )
        },
        {
            title: 'Tên tài liệu',
            dataIndex: 'file_path',
            key: 'file_path',
            width: 250,
            ellipsis: { showTitle: false },
            render: (text, record) => (
                <Space>
                    <Tooltip placement="topLeft" title={record.original_filename}>
                        <Button
                            type="text"
                            icon={getFileIcon(record.type)}
                            onClick={() => handlePreview(record)}
                        >
                            <span style={{display: 'inline-block', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', verticalAlign: 'middle', whiteSpace: 'nowrap'}}>
                                {record.original_filename}
                            </span>
                        </Button>
                    </Tooltip>

                </Space>
            )
        },
        { title: 'Chủ sở hữu', dataIndex: 'created_by', key: 'created_by', width: 250 },
        { title: 'Tạo lúc', dataIndex: 'created_at', key: 'created_at', render: (text) => new Date(text).toLocaleString('vi-VN'), width: 150 },
        { title: 'Kích thước', dataIndex: 'storage_unit', key: 'storage_unit', width: 120 },
        {
            title: 'Hành động',
            key: 'action',
            fixed: 'right', // Cố định cột hành động ở bên phải
            width: 150,
            render: () => (
                <Space>
                    <Tooltip title="Đánh dấu sao"><Button icon={<StarOutlined />} /></Tooltip>
                    <Tooltip title="Chỉnh sửa metadata"><Button icon={<EditOutlined />} /></Tooltip>
                    <Tooltip title="Chức năng xóa chưa được hỗ trợ bởi backend">
                        <Popconfirm title="Xóa tài liệu này?" disabled>
                            <Button icon={<DeleteOutlined />} danger disabled />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        }
    ];

    return (
        <div>
            <Title level={3} style={{ marginBottom: 16 }}>Tìm kiếm tài liệu</Title>

            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)} 
                style={{ marginBottom: 16 }}
            >
                Quay về
            </Button>

            {/* Thêm GlobalSearch vào đây */}
            <div style={{ margin: '16px 0' }}>
                <GlobalSearch />
            </div>

            <ActiveFiltersForm />

            <Title level={4}>Kết quả tìm kiếm</Title>
            {!loading && pagination?.total > 0 && (
                <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                    Tìm thấy <strong>{pagination.total}</strong> kết quả phù hợp.
                </Text>
            )}

            {/* SỬA LỖI VỠ LAYOUT: Bọc Table trong một div */}
            <div style={{ overflowX: 'auto' }}>
                <Table
                    columns={columns}
                    dataSource={searchResults}
                    rowKey="id"
                    loading={loading}
                    pagination={pagination}
                    scroll={{ x: 1600 }}
                    onChange={handleTableChange}
                    locale={{ emptyText: <Empty description="Không tìm thấy tài liệu nào phù hợp." /> }}
                />
            </div>
            <FilePreviewModal open={!!previewFile} documentId={previewFile?.id}
                fileName={previewFile?.original_filename} onCancel={() => setPreviewFile(null)} />
        </div>
    );
};

export default SearchResultsPage;