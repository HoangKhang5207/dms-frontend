import React, { useState, useEffect } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Modal, Form, Input, Button, Select, DatePicker, Tabs, Space } from 'antd';
import { FileOutlined } from '@ant-design/icons';
import { useOrganization } from '../../contexts/OrganizationContext';
import { useSearch } from '../../contexts/SearchContext';
import dayjs from 'dayjs';
import { getFileIcon } from '../../utils/fileIcons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const fileTypes = ['pdf', 'docx', 'xlsx', 'pptx', 'png', 'jpg'];

const AdvancedSearchModal = ({ visible, onCancel }) => {
    const [form] = Form.useForm();
    const { members } = useOrganization(); // Lấy danh sách thành viên để lọc theo chủ sở hữu
    const { performSearch, performKeywordSearch, searchParams } = useSearch();
    const [isCustomType, setIsCustomType] = useState(false);

    useEffect(() => {
        if (visible) {
            const isCustom = searchParams?.type && !fileTypes.includes(searchParams.type);
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
    }, [visible, searchParams, form]);

    // const handleKeywordSearchFinish = (values) => {
    //     const params = {
    //         and_keywords: values.and_keywords?.split(' ').filter(Boolean),
    //         or_keywords: values.or_keywords?.split(' ').filter(Boolean),
    //         not_keywords: values.not_keywords?.split(' ').filter(Boolean),
    //     };
    //     performKeywordSearch(params);
    //     onCancel();
    // };

    const handleTypeChange = (value) => {
        setIsCustomType(value === 'custom');
        if (value !== 'custom') {
            form.setFieldsValue({ customType: undefined });
        }
    };

    const handleFinish = (values) => {
        const params = {
            title: values.title,
            type: values.type === 'custom' ? values.customType : values.type,
            createdBy: values.createdBy,
            // Chuyển đổi định dạng ngày sang ISO String mà backend yêu cầu
            createdFromDate: values.dateRange ? dayjs(values.dateRange[0]).startOf('day').toISOString() : undefined,
            createdToDate: values.dateRange ? dayjs(values.dateRange[1]).endOf('day').toISOString() : undefined,
        };

        performSearch(params);
        onCancel(); // Đóng modal sau khi tìm kiếm
    };


    const tabItems = [
        {
            key: '1',
            label: 'Tài liệu',
            children: (
                <Form form={form} layout="vertical" onFinish={handleFinish}>
                    <Form.Item name="title" label="Tên tài liệu">
                        <Input placeholder="Nhập một phần hoặc toàn bộ tên tài liệu" />
                    </Form.Item>

                    <Form.Item name="type" label="Loại tài liệu">
                        <Select allowClear placeholder="Chọn loại tài liệu" onChange={handleTypeChange}>
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
                                <Input placeholder="txt, zip, ..." />
                            </Form.Item>
                    )}

                    <Form.Item name="createdBy" label="Chủ sở hữu">
                        <Select 
                            showSearch
                            allowClear 
                            placeholder="Chọn hoặc tìm kiếm chủ sở hữu"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                        >
                            {members.map(member => (
                                <Option key={member.id} value={member.email}>
                                    {`${member.first_name} (${member.email})`}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="dateRange" label="Ngày tạo">
                        <RangePicker style={{ width: '100%' }} placeholder={['Từ ngày', 'Đến ngày']} />
                    </Form.Item>
                </Form>
            ),
        },
        // Các tab khác có thể được thêm vào đây
        // {
        //     key: '2',
        //     label: 'Tìm kiếm Boolean',
        //     children: (
        //         <Form layout="vertical" onFinish={handleKeywordSearchFinish}>
        //             <Form.Item name="and_keywords" label="Chứa TẤT CẢ các từ">
        //                 <Input placeholder="ví dụ: báo cáo quý 3" />
        //             </Form.Item>
        //             <Form.Item name="or_keywords" label="Chứa BẤT KỲ từ nào">
        //                 <Input placeholder="ví dụ: hợp đồng marketing" />
        //             </Form.Item>
        //             <Form.Item name="not_keywords" label="KHÔNG chứa từ nào">
        //                 <Input placeholder="ví dụ: bản nháp" />
        //             </Form.Item>
        //             {/* <Form.Item>
        //                 <Button type="primary" htmlType="submit" style={{ float: 'right' }}>Tìm kiếm</Button>
        //             </Form.Item> */}
        //         </Form>
        //     ),
        // },
    ];

    return (
        <Modal
            title="Tìm kiếm tài liệu nâng cao"
            open={visible}
            onCancel={onCancel}
            footer={[
                <Button key="reset" onClick={() => form.resetFields()}>Đặt lại</Button>,
                <Button key="search" type="primary" onClick={() => form.submit()}>Tìm kiếm</Button>,
            ]}
        >
            <Tabs defaultActiveKey="1" items={tabItems} />
        </Modal>
    );
};

export default AdvancedSearchModal;