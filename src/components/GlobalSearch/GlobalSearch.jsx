import React, { useState, useEffect } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Input, Button, Space } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import { useSearch } from '../../contexts/SearchContext';
import AdvancedSearchModal from './AdvancedSearchModal';

const GlobalSearch = () => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const { performSearch, searchParams } = useSearch();
    const [keyword, setKeyword] = useState(searchParams?.title || '');

    useEffect(() => {
        setKeyword(searchParams?.title || '');
    }, [searchParams?.title]);

    const handleSimpleSearch = () => {
        // Tạo object params mới dựa trên state hiện tại và từ khóa mới
        const newParams = { ...searchParams, title: keyword };
        performSearch(newParams);
    };

    return (
        <>
            <Space.Compact style={{ width: '100%' }}>
                <Input
                    size="large"
                    placeholder="Tìm kiếm tài liệu theo từ khóa..."
                    prefix={<SearchOutlined />}
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    onPressEnter={handleSimpleSearch}
                    allowClear
                />
                <Button 
                    size="large"
                    icon={<FilterOutlined />} 
                    onClick={() => setIsModalVisible(true)}
                />
            </Space.Compact>

            <AdvancedSearchModal
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
            />
        </>
    );
};

export default GlobalSearch;