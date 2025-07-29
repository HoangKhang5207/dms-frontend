import React, { useState, useEffect } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Form, Select, DatePicker, Button, Space, Input } from 'antd';
import { FileOutlined } from '@ant-design/icons';
import { useSearch } from '../../contexts/SearchContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import dayjs from 'dayjs';
import { getFileIcon } from '../../utils/fileIcons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const fileTypes = ['pdf', 'docx', 'xlsx', 'pptx', 'png', 'jpg'];

const ActiveFiltersForm = () => {
    const [form] = Form.useForm();
    const { searchParams, performSearch } = useSearch();
    const { members } = useOrganization();
    const [isCustomType, setIsCustomType] = useState(false);

    // Đồng bộ form với state từ context
    useEffect(() => {
        if (searchParams) {
            const isCustom = searchParams.type && !fileTypes.includes(searchParams.type);
            setIsCustomType(isCustom);

            form.setFieldsValue({
                title: searchParams.title,
                createdBy: searchParams.createdBy,
                type: isCustom ? 'custom' : searchParams.type,
                customType: isCustom ? searchParams.type : undefined,
                dateRange: (searchParams.createdFromDate && searchParams.createdToDate) 
                    ? [dayjs(searchParams.createdFromDate), dayjs(searchParams.createdToDate)] 
                    : null,
            });
        }
    }, [searchParams, form]);

    const handleTypeChange = (value) => {
        setIsCustomType(value === 'custom');
        if (value !== 'custom') {
            form.setFieldsValue({ customType: undefined });
        }
    };

    const handleApplyFilters = () => {
        const values = form.getFieldsValue();
        const params = {
            title: values.title,
            createdBy: values.createdBy,
            type: values.type === 'custom' ? values.customType : values.type,
            createdFromDate: values.dateRange ? dayjs(values.dateRange[0]).startOf('day').toISOString() : undefined,
            createdToDate: values.dateRange ? dayjs(values.dateRange[1]).endOf('day').toISOString() : undefined,
        };
        performSearch(params);
    };
    
    return (
        <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
            <Form.Item name="type" label="Loại" style={{ marginBottom: 8 }}>
                <Select allowClear placeholder="Tất cả" style={{ width: 200 }} onChange={handleTypeChange}>
                    {fileTypes.map(type => (
                        <Option key={type} value={type}>
                            <Space>
                                {getFileIcon(`.${type}`)}
                                {type.toUpperCase()}
                            </Space>
                        </Option>
                    ))}
                    <Option key="custom" value="custom">
                        <Space>
                            <FileOutlined />
                            Nhập loại khác...
                        </Space>
                    </Option>
                </Select>
            </Form.Item>
            
            {isCustomType && (
                <Form.Item
                    name="customType"
                    label="Nhập loại file (ví dụ: txt, zip, rar)"
                    rules={[{ required: true, message: 'Vui lòng nhập loại file!' }]}
                >
                    <Input placeholder="zip" />
                </Form.Item>
            )}

            <Form.Item name="createdBy" label="Chủ sở hữu" style={{ marginBottom: 8 }}>
                <Select
                    showSearch
                    allowClear
                    style={{ width: 300 }}
                    placeholder="Chủ sở hữu"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                >
                    {members.map(m => <Option key={m.id} value={m.email}>{`${m.email}`}</Option>)}
                </Select>
            </Form.Item>

            <Form.Item name="dateRange" label="Ngày tạo" style={{ marginBottom: 8 }}>
                <RangePicker placeholder={['Từ ngày', 'Đến ngày']} />
            </Form.Item>

            <Form.Item style={{ marginBottom: 8 }}>
                <Button type="primary" onClick={handleApplyFilters}>Áp dụng</Button>
            </Form.Item>
        </Form>
    );
};

export default ActiveFiltersForm;