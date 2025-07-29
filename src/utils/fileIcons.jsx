import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import {
    FileOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FileExcelOutlined,
    FilePptOutlined,
    FileImageOutlined,
    FileZipOutlined
} from '@ant-design/icons';

export const getFileIcon = (filename, props = {}) => {
    const extension = filename?.split('.').pop().toLowerCase();

    switch (extension) {
        case 'pdf':
            return <FilePdfOutlined style={{ color: '#c32b36' }} {...props} />;
        case 'doc':
        case 'docx':
            return <FileWordOutlined style={{ color: '#1c65b9' }} {...props} />;
        case 'xls':
        case 'xlsx':
            return <FileExcelOutlined style={{ color: '#108546' }} {...props} />;
        case 'ppt':
        case 'pptx':
            return <FilePptOutlined style={{ color: '#ED6C47' }} {...props} />;
        case 'png':
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'bmp':
            return <FileImageOutlined style={{ color: '#cf8910' }} {...props} />;
        case 'txt':
            return <FileOutlined style={{ color: '#9E9E9E' }} {...props} />;
        case 'zip':
        case 'rar':
            return <FileZipOutlined style={{ color: '#b37feb' }} {...props} />;
        default:
            return <FileOutlined {...props} />;
    }
};