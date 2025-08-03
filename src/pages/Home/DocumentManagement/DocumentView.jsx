import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "@ant-design/v5-patch-for-react-19";
import {
  Table,
  Button,
  Space,
  Popconfirm,
  Tooltip,
  Typography,
  Breadcrumb,
  Row,
  Col,
  message,
} from "antd";
import {
  HomeOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  StarOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import axiosInstance from "../../../api/axiosInstance";
import { useDocument } from "../../../contexts/DocumentContext";
import { useOrganization } from "../../../contexts/OrganizationContext";
import { getFileIcon } from "../../../utils/fileIcons"; // Import helper mới
import FilePreviewModal from "./FilePreviewModal"; // Import Modal mới
import GlobalSearch from "../../../components/GlobalSearch/GlobalSearch";
import UploadModal from "./UploadModal";
import AccessTypeTag from "../../../components/AccessTypeTag";
import ShareModal from "../../../components/ABACShareModal/ShareModal";

const DocumentView = () => {
  const { departmentId, categoryId } = useParams();
  const { departments } = useOrganization();
  const {
    documents,
    fetchDocumentsByCategory,
    uploadDocument,
    loading,
    categories,
    fetchCategoriesByDept,
    documentPagination,
  } = useDocument();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [documentToShare, setDocumentToShare] = useState(null);

  const handlePreview = (record) => {
    const fileUrl = `${axiosInstance.defaults.baseURL.replace(
      "/api/v1",
      ""
    )}/storage/${record.file_path}`;
    console.log("Previewing file:", fileUrl);
    setPreviewFile({
      url: fileUrl,
      name: record.original_filename,
    });
  };

  useEffect(() => {
    // Luôn fetch danh sách tài liệu của thư mục này
    fetchDocumentsByCategory(categoryId);

    // KIỂM TRA VÀ FETCH DANH SÁCH THƯ MỤC NẾU CẦN
    if (categories.length === 0) {
      fetchCategoriesByDept(departmentId);
    }
  }, [
    categoryId,
    departmentId,
    fetchDocumentsByCategory,
    fetchCategoriesByDept,
    categories.length,
  ]);

  const currentDepartment = departments.find((d) => d.id == departmentId);
  const currentCategory = categories.find((c) => c.id == categoryId);

  const handleUploadFinish = async (values, file) => {
    const metadata = {
      ...values,
      category_id: parseInt(categoryId),
    };
    const formData = new FormData();
    formData.append("file", file);
    formData.append("metadata", JSON.stringify(metadata));

    const success = await uploadDocument(formData, departmentId);
    if (success) {
      setIsModalVisible(false);
      // Fetch lại document sau khi upload thành công
      fetchDocumentsByCategory(categoryId);
    }

    return success;
  };

  const handleCancelUpload = () => {
    setIsModalVisible(false);
  };

  const handleShareDocument = (record) => {
    setDocumentToShare(record);
    setShowShareModal(true);
  };

  const handleCloseShareModal = () => {
    setShowShareModal(false);
    setDocumentToShare(null);
  };

  const handleTableChange = (pagination) => {
    fetchDocumentsByCategory(
      categoryId,
      pagination.current - 1,
      pagination.pageSize
    );
  };

  const columns = [
    {
      title: "Tiêu đề tài liệu",
      dataIndex: "title",
      key: "title",
      width: 250,
      ellipsis: { showTitle: false },
      render: (title) => (
        <Tooltip placement="topLeft" title={title}>
          {title}
        </Tooltip>
      ),
    },
    {
      title: "Tên tài liệu",
      dataIndex: "file_path",
      key: "file_path",
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
              <span
                style={{
                  display: "inline-block",
                  maxWidth: 250,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  verticalAlgin: "middle",
                  whiteSpace: "nowrap",
                }}
              >
                {record.original_filename}
              </span>
            </Button>
          </Tooltip>
          <FilePreviewModal
            visible={!!previewFile}
            file={previewFile}
            onCancel={() => setPreviewFile(null)}
          />
        </Space>
      ),
    },
    {
      title: "Chủ sở hữu",
      dataIndex: "created_by",
      key: "created_by",
      width: 200,
    },
    {
      title: "Loại truy cập",
      dataIndex: "access_type",
      key: "access_type",
      width: 120,
      render: (accessType) => <AccessTypeTag accessType={accessType} />,
    },
    {
      title: "Tạo lúc",
      dataIndex: "created_at",
      key: "created_at",
      render: (text) => (text ? new Date(text).toLocaleString("vi-VN") : "N/A"),
      width: 150,
    },
    {
      title: "Kích thước",
      dataIndex: "storage_unit",
      key: "storage_unit",
      render: (text) => text || "N/A",
      width: 120,
    },
    {
      title: "Hành động",
      key: "action",
      fixed: "right", // Cố định cột hành động ở bên phải
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Chia sẻ tài liệu">
            <Button
              icon={<ShareAltOutlined />}
              onClick={() => handleShareDocument(record)}
            />
          </Tooltip>
          <Tooltip title="Đánh dấu sao">
            <Button icon={<StarOutlined />} />
          </Tooltip>
          <Tooltip title="Chỉnh sửa metadata">
            <Button icon={<EditOutlined />} />
          </Tooltip>
          <Tooltip title="Chức năng xóa chưa được hỗ trợ bởi backend">
            <Popconfirm title="Xóa tài liệu này?" disabled>
              <Button icon={<DeleteOutlined />} danger disabled />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Breadcrumb style={{ marginBottom: 16 }}>
        <Breadcrumb.Item>
          <Link to="/home/dashboard">
            <HomeOutlined />
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to="/home/document-management">Quản lý tài liệu</Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <Link to={`/home/document-management/${departmentId}`}>
            {currentDepartment?.name}
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>{currentCategory?.name}</Breadcrumb.Item>
      </Breadcrumb>

      {/* Thanh tìm kiếm toàn cục */}
      <div style={{ marginBottom: 16 }}>
        <GlobalSearch />
      </div>

      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Typography.Title level={4}>
            Tài liệu trong {currentCategory?.name}
          </Typography.Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            Thêm File
          </Button>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={documents}
        rowKey="id"
        loading={loading}
        pagination={documentPagination}
        onChange={handleTableChange}
        scroll={{ x: 1600 }}
      />
      <UploadModal
        visible={isModalVisible}
        onCancel={handleCancelUpload}
        onFinish={handleUploadFinish}
        category={currentCategory}
      />
      <FilePreviewModal
        visible={!!previewFile}
        file={previewFile}
        onCancel={() => setPreviewFile(null)}
      />

      {/* ABAC Share Modal */}
      {documentToShare && (
        <ShareModal
          visible={showShareModal}
          onCancel={handleCloseShareModal}
          documentId={documentToShare.file_id}
          documentInfo={documentToShare}
        />
      )}
    </div>
  );
};

export default DocumentView;
