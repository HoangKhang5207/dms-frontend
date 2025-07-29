import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Tabs } from 'antd';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const OrganizationPage = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Xác định tab đang active dựa trên URL
    const activeKey = location.pathname.split('/').pop();

    const items = [
        {
            key: 'info',
            label: 'Thông tin chung',
        },
        {
            key: 'departments',
            label: 'Phòng ban',
        },
        {
            key: 'members',
            label: 'Thành viên',
        },
    ];

    const onTabChange = (key) => {
        navigate(`/home/organization/${key}`);
    };

    return (
        <div>
            <Tabs activeKey={activeKey} items={items} onChange={onTabChange} />
            <div style={{ marginTop: '24px' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default OrganizationPage;