import React, { useState, useEffect } from "react";
import { Upload, Button, Form, Input, Modal, Select, message, Space } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useAuth } from "../../../contexts/AuthContext";
import AccessTypeFilter from "../../../components/AccessTypeFilter";
import axiosInstance from "../../../api/axiosInstance";
import CategoryModal from "./CategoryModal";

const { Option } = Select;

const UploadModal = ({ open, onCancel, onSuccess }) => {
  const { token } = useAuth();
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [deptId, setDeptId] = useState(null);
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);

  // Theo dõi giá trị form để quyết định khi nào cho phép tải lên
  const watchedAccessType = Form.useWatch("accessType", form);
  const watchedCategoryId = Form.useWatch("categoryId", form);
  const watchedPassword = Form.useWatch("password", form);
  const canUpload = Boolean(
    token &&
      deptId &&
      fileList?.length > 0 &&
      watchedCategoryId &&
      watchedAccessType &&
      watchedPassword &&
      !uploading
  );

  // Lấy danh sách categories khi component mount
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  const fetchCategories = async () => {
    try {
      const decodeJwt = (jwt) => {
        try {
          const base64Url = jwt?.split(".")[1];
          if (!base64Url) return {};
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join("")
          );
          return JSON.parse(jsonPayload);
        } catch {
          return {};
        }
      };

      const claims = decodeJwt(token);
      const me = await axiosInstance.get("/users/me");
      const orgId = me?.data?.organization?.id || me?.data?.organizationId || claims?.organizationId || claims?.orgId || claims?.org_id;
      const userDeptId = me?.data?.department?.id || me?.data?.department_id || me?.data?.departmentId || claims?.departmentId || claims?.deptId || claims?.department_id;

      // Trường hợp tốt nhất: người dùng đã có phòng ban
      if (userDeptId) {
        setDeptId(userDeptId);
        const catsPage = await axiosInstance.get(`/departments/${userDeptId}/categories`, { params: { page: 0, size: 1000 } });
        const cats = catsPage?.data?.content || catsPage?.data || [];
        setCategories(cats);
        return;
      }

      // Fallback: lấy phòng ban theo tổ chức nếu user chưa có phòng ban
      if (!orgId) {
        console.warn("Không tìm thấy organizationId trong /users/me và người dùng không có department");
        setCategories([]);
        message.error("Không xác định được tổ chức của người dùng. Vui lòng liên hệ quản trị để cập nhật hồ sơ.");
        return;
      }

      const deptsRes = await axiosInstance.get(`/departments/organization/${orgId}`);
      const departments = deptsRes?.data || [];
      if (!departments.length) {
        setCategories([]);
        message.error("Tổ chức chưa có phòng ban. Vui lòng tạo phòng ban trước.");
        return;
      }
      const deptId = departments[0]?.id;
      setDeptId(deptId);
      const catsPage = await axiosInstance.get(`/departments/${deptId}/categories`, { params: { page: 0, size: 1000 } });
      const cats = catsPage?.data?.content || catsPage?.data || [];
      setCategories(cats);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách categories:", error);
      message.error("Không thể tải danh sách loại tài liệu");
    }
  };

  const handleCreateCategoryFinish = async (values) => {
    if (!deptId) {
      message.error("Không xác định được phòng ban để tạo loại tài liệu.");
      return;
    }
    try {
      const res = await axiosInstance.post("/categories", { ...values, department_id: deptId });
      message.success("Tạo loại tài liệu thành công!");
      setIsCategoryModalVisible(false);
      // Refresh categories and pre-select the newly created one
      await fetchCategories();
      const newId = res?.data?.id;
      if (newId) {
        form.setFieldsValue({ categoryId: newId });
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Tạo loại tài liệu thất bại.");
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files", file.originFileObj);
    });
    const password = form.getFieldValue("password");
    const accessType = form.getFieldValue("accessType");
    const categoryId = form.getFieldValue("categoryId");

    formData.append("password", password);
    formData.append("accessType", accessType);
    formData.append("categoryId", categoryId);

    setUploading(true);
    if (!token) {
      message.error(
        "Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn. Vui lòng đăng nhập lại."
      );
      setUploading(false);
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:8080/api/v1/documents/upload-multiple",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        setFileList([]);
        form.resetFields();
        message.success("Tệp đã được tải lên thành công!");
        onSuccess();
      } else {
        const errorText = await response.text();
        message.error(`Tải lên thất bại: ${errorText}`);
      }
    } catch (error) {
      message.error("Lỗi khi tải lên tệp.");
      console.error("Lỗi khi tải lên tệp:", error);
    } finally {
      setUploading(false);
    }
  };

  const props = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    },
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList);
    },
    beforeUpload: () => false,
    fileList,
    multiple: true,
  };

  return (
    <Modal
      title="Tải lên tài liệu"
      open={open}
      onOk={handleUpload}
      onCancel={onCancel}
      confirmLoading={uploading}
      okText={uploading ? "Đang tải lên" : "Tải lên"}
      okButtonProps={{ disabled: !canUpload }}
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical">
        <Form.Item label="Chọn tệp">
          <Upload.Dragger {...props}>
            <p className="ant-upload-drag-icon">
              <UploadOutlined />
            </p>
            <p className="ant-upload-text">
              Kéo và thả tệp vào đây hoặc nhấp để chọn tệp
            </p>
            <p className="ant-upload-hint">
              Hỗ trợ tải lên một hoặc nhiều tệp.
            </p>
          </Upload.Dragger>
        </Form.Item>

        <Form.Item
          label="Loại truy cập"
          name="accessType"
          rules={[{ required: true, message: "Vui lòng chọn loại truy cập!" }]}
        >
          <AccessTypeFilter placeholder="Chọn loại truy cập" />
        </Form.Item>

        <Form.Item
          label="Loại tài liệu"
          name="categoryId"
          rules={[{ required: true, message: "Vui lòng chọn loại tài liệu!" }]}
        >
          <Space.Compact block>
            <Select placeholder="Chọn loại tài liệu" style={{ width: "100%" }}>
              {categories.map((category) => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
            <Button type="default" onClick={() => setIsCategoryModalVisible(true)} disabled={!deptId} title={!deptId ? "Chưa xác định được phòng ban để tạo loại tài liệu" : undefined}>
              Tạo loại tài liệu mới
            </Button>
          </Space.Compact>
        </Form.Item>

        <Form.Item
          label="Mật khẩu"
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password placeholder="Nhập mật khẩu" />
        </Form.Item>
      </Form>
      <CategoryModal
        visible={isCategoryModalVisible}
        onCancel={() => setIsCategoryModalVisible(false)}
        onFinish={handleCreateCategoryFinish}
        initialValues={null}
      />
    </Modal>
  );
};

export default UploadModal;
