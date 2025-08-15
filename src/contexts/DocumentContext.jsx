import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import axiosInstance from '../api/axiosInstance';
import '@ant-design/v5-patch-for-react-19';
import { message } from 'antd';

const DocumentContext = createContext(null);

export const DocumentProvider = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [documentPagination, setDocumentPagination] = useState({});
    
    const fetchCategoriesByDept = useCallback(async (deptId, searchTerm = '') => {
        if (!deptId) return;
        setLoading(true);
        try {
            let response;
            if (searchTerm.trim() !== '') {
                // API tìm kiếm: GET /api/v1/departments/{id}/categories/search?name=...
                response = await axiosInstance.get(`/departments/${deptId}/categories/search`, {
                    params: { name: searchTerm }
                });
                 // API tìm kiếm trả về List, không phải Page
                setCategories(response.data);
            } else {
                // API lấy tất cả
                response = await axiosInstance.get(`/departments/${deptId}/categories`);
                setCategories(response.data.content);
            }
        } catch {
            message.error('Không thể tải danh sách loại tài liệu.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategoryById = useCallback(async (categoryId) => {
        if (!categoryId) return;
        setLoading(true);
        try {
            // Gọi API lấy thông tin category theo ID
            const response = await axiosInstance.get(`/categories/${categoryId}`);
            return response.data;
        } catch {
            message.error('Không thể tải thông tin loại tài liệu.');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchDocumentsByCategory = useCallback(async (categoryId, page = 0, size = 10) => {
        if (!categoryId) return;
        setLoading(true);
        try {
            // Gọi API mới: GET /api/v1/categories/{id}/documents
            const response = await axiosInstance.get(`/categories/${categoryId}/documents`, {
                params: { page, size }
            });
            setDocuments(response.data.content);
            setDocumentPagination({
                current: response.data.number + 1,
                pageSize: response.data.size,
                total: response.data.totalElements,
            });

        } catch {
            message.error('Không thể tải danh sách tài liệu.');
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = useCallback(async (deptId, values) => {
        try {
            await axiosInstance.post('/categories', { ...values, department_id: deptId });
            message.success('Tạo loại tài liệu thành công!');
            await fetchCategoriesByDept(deptId);
            return true;
        } catch (error) {
            message.error(error.response?.data?.message || 'Tạo loại tài liệu thất bại.');
            return false;
        }
    }, [fetchCategoriesByDept]);

    const updateCategory = useCallback(async (categoryId, deptId, values) => {
        try {
            await axiosInstance.patch(`/categories/${categoryId}`, values);
            message.success('Cập nhật loại tài liệu thành công!');
            await fetchCategoriesByDept(deptId);
            return true;
        } catch (error) {
            message.error(error.response?.data?.message || 'Cập nhật loại tài liệu thất bại.');
            return false;
        }
    }, [fetchCategoriesByDept]);

    const deleteCategory = useCallback(async (categoryId, deptId) => {
        try {
            await axiosInstance.patch(`/categories/${categoryId}/status`, { status: 2 }); // 2 = Inactive
            message.success('Xóa loại tài liệu thành công!');
            await fetchCategoriesByDept(deptId);
            return true;
        } catch {
            message.error('Xóa loại tài liệu thất bại.');
            return false;
        }
    }, [fetchCategoriesByDept]);

    const uploadDocument = useCallback(async (formData, deptId) => {
        try {
            // POST /api/v1/documents - Content-Type: multipart/form-data
            await axiosInstance.post('/documents', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            message.success('Tải lên tài liệu thành công!');
            // Tải lại danh sách loại tài liệu để cập nhật (có thể có tài liệu mới)
            await fetchCategoriesByDept(deptId); 
            return true;
        } catch (error) {
            message.error(error.response?.data?.message || 'Tải lên thất bại.');
            return false;
        }
    }, [fetchCategoriesByDept]); 

    const value = useMemo(() => ({
        loading,
        categories,
        documents,
        documentPagination,
        fetchCategoriesByDept,
        fetchCategoryById,
        fetchDocumentsByCategory,
        createCategory,
        updateCategory,
        deleteCategory,
        uploadDocument,
    }), [loading, categories, documents, documentPagination, fetchCategoriesByDept, fetchCategoryById, fetchDocumentsByCategory, createCategory, updateCategory, deleteCategory, uploadDocument]);

    return (
        <DocumentContext.Provider value={value}>
            {children}
        </DocumentContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useDocument = () => {
    return useContext(DocumentContext);
};