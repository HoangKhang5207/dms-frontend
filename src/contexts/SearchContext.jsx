import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import '@ant-design/v5-patch-for-react-19';
import { message } from 'antd';

const SearchContext = createContext(null);

export const SearchProvider = ({ children }) => {
    const navigate = useNavigate();
    const [searchResults, setSearchResults] = useState([]);
    const [searchParams, setSearchParams] = useState({});
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({});

    // Hàm mới: chỉ cập nhật state của params
    const updateSearchParams = useCallback((newParams) => {
        setSearchParams(prevParams => ({ ...prevParams, ...newParams }));
    }, []);

    const performSearch = useCallback(async (paramsToSearch, page = 0, size = 10) => {
        setLoading(true);
        // Cập nhật state trước khi tìm kiếm
        setSearchParams(paramsToSearch); 

        const activeParams = Object.entries(paramsToSearch).reduce((acc, [key, value]) => {
            if (value) acc[key] = value;
            return acc;
        }, {});
        
        try {
            const response = await axiosInstance.get('/documents/filter', { 
                params: { ...activeParams, page, size }
            });
            setSearchResults(response.data.content);
            setPagination({
                current: response.data.number + 1,
                pageSize: response.data.size,
                total: response.data.totalElements,
            });
            navigate('/home/document-management/search');
        } catch (error) {
            message.error('Tìm kiếm thất bại.');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const performKeywordSearch = useCallback(async (params, page = 0, size = 10) => {
        setLoading(true);
        setSearchParams(params);
        try {
            // POST /api/v1/documents/search
            const response = await axiosInstance.post('/documents/search', params, { params: { page, size } });
            // ... (xử lý kết quả tương tự performSearch)
            setSearchResults(response.data.content);
            setPagination({
                current: response.data.number + 1,
                pageSize: response.data.size,
                total: response.data.totalElements,
            });
            
            // Tự động chuyển đến trang kết quả
            navigate('/home/document-management/search');
        } catch (error) {
            message.error('Tìm kiếm thất bại.');
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const value = useMemo(() => ({
        searchResults,
        searchParams,
        loading,
        pagination,
        updateSearchParams,
        performSearch,
        performKeywordSearch,
    }), [searchResults, searchParams, loading, pagination, updateSearchParams, performSearch, performKeywordSearch]);

    return (
        <SearchContext.Provider value={value}>
            {children}
        </SearchContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSearch = () => {
    return useContext(SearchContext);
};