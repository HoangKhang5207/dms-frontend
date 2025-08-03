import React, { useState, useEffect } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Layout, Menu, Avatar, Dropdown, Space, Typography } from 'antd';
import {
    HomeOutlined,
    TeamOutlined,
    SolutionOutlined,
    FileOutlined,
    StarOutlined,
    ShareAltOutlined,
    UserOutlined,
    LogoutOutlined,
    SettingOutlined,
    SwapOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import './DashboardLayout.css';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { fullUser, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const { fetchOrganizationDetails } = useOrganization();

    const [orgName, setOrgName] = useState('Chưa tham gia tổ chức');
    const [userRole, setUserRole] = useState('Người dùng');
    
    const [openKeys, setOpenKeys] = useState([]);

    // Xác định key của menu item và submenu dựa trên URL
    const getCurrentKeys = () => {
        const path = location.pathname;
        if (path.startsWith('/home/organization')) {
            // Nếu là các trang con của "Tổ chức của tôi"
            const subKey = path.split('/')[3];
            let selectedKey;
            switch(subKey) {
                case 'info': selectedKey = '2'; break;
                case 'departments': selectedKey = '3'; break;
                case 'members': selectedKey = '4'; break;
                default: selectedKey = '2';
            }
            return { selectedKey, openKey: 'sub1' };
        }
        if (path.startsWith('/home/document-management')) { // Thêm điều kiện này
            return { selectedKey: '5', openKey: null };
        }
        if (path.startsWith('/home/shared')) {
            return { selectedKey: '7', openKey: null };
        }
        // Các trường hợp khác
        switch (path) {
            case '/home':
            case '/home/dashboard':
                return { selectedKey: '1', openKey: null };
            default:
                return { selectedKey: '1', openKey: null };
        }
    };

    const { selectedKey, openKey } = getCurrentKeys();

    useEffect(() => {
        // Mở SubMenu tương ứng khi key thay đổi
        if (openKey) {
            setOpenKeys([openKey]);
        }
    }, [openKey]);

    const onOpenChange = (keys) => {
        setOpenKeys(keys);
    };

    useEffect(() => {
        const loadUserData = async () => {
            if (fullUser) {
                // Xác định vai trò từ fullUser
                if (fullUser.is_organization_manager) {
                    setUserRole('Quản lý tổ chức');
                } else if (fullUser.is_dept_manager) {
                    setUserRole('Quản lý phòng ban');
                } else {
                    setUserRole('Người dùng');
                }

                // Lấy tên tổ chức bằng cách gọi hàm mới
                if (fullUser.organization_id) {
                    const orgData = await fetchOrganizationDetails(fullUser.organization_id);
                    if (orgData) {
                        setOrgName(orgData.name);
                    }
                } else {
                    setOrgName('Chưa tham gia tổ chức');
                }
            }
        };

        loadUserData();
    }, [fullUser, fetchOrganizationDetails]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { key: 'profile', icon: <UserOutlined />, label: 'Thông tin tài khoản' },
        { key: 'change-password', icon: <SwapOutlined />, label: 'Đổi mật khẩu' },
        { key: 'settings', icon: <SettingOutlined />, label: 'Cài đặt' },
        { type: 'divider' },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Đăng xuất', onClick: handleLogout },
    ];

    const getLastInitials = (fullName, count = 2) => {
        // 1. Tách chuỗi và loại bỏ khoảng trắng thừa
        const parts = fullName.trim().split(/\s+/);
        
        // 2. Lấy n phần tử cuối
        //    Nếu tổng số từ < n thì lấy hết
        const lastParts = parts.slice(-count);
        
        // 3. Lấy ký tự đầu mỗi từ
        return lastParts.map(word => word.charAt(0));
    }

    const words = getLastInitials(fullUser.last_name + ' ' + fullUser.first_name);

    const userMenu = <Menu items={menuItems} />;
    
    // Tên viết tắt của user cho Avatar
    const userInitials = fullUser ? `${words[words.length - 1]}${words[0]}` : 'G';

    return (
        <Layout className="dashboard-layout">
            <Sider 
                theme="light" 
                collapsible 
                collapsed={collapsed} 
                onCollapse={(value) => setCollapsed(value)}
                className="dashboard-sider"
                width={240}
            >
                <div className="logo-dashboard">
                    <img src='/src/assets/logo.png' className="logo-dashboard-img" />
                    <span className="logo-dashboard-text">Genadata</span>
                </div>
                <Menu 
                    mode="inline"
                    // Sử dụng key động
                    selectedKeys={[selectedKey]} 
                    openKeys={openKeys}
                    onOpenChange={onOpenChange}
                >
                    <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => navigate('/home')}>
                        Trang chủ
                    </Menu.Item>
                    <Menu.SubMenu key="sub1" icon={<TeamOutlined />} title="Tổ chức của tôi">
                        <Menu.Item key="2" onClick={() => navigate('/home/organization/info')}>Thông tin chung</Menu.Item>
                        <Menu.Item key="3" onClick={() => navigate('/home/organization/departments')}>Phòng ban</Menu.Item>
                        <Menu.Item key="4" onClick={() => navigate('/home/organization/members')}>Thành viên</Menu.Item>
                    </Menu.SubMenu>
                    <Menu.Item key="5" icon={<FileOutlined />} onClick={() => navigate('/home/document-management')}>Quản lý tài liệu</Menu.Item>
                    <Menu.Item key="6" icon={<StarOutlined />}>Được đánh dấu</Menu.Item>
                    <Menu.Item key="7" icon={<ShareAltOutlined />} onClick={() => navigate('/home/shared')}>Được chia sẻ với tôi</Menu.Item>
                </Menu>
            </Sider>
            <Layout className="site-layout">
                <Header className="site-layout-header">
                    <div className="header-left">
                        <span className="org-name-tag">{orgName}</span>
                        <span className="user-role-text">{userRole}</span>
                    </div>
                    <div className="header-right">
                        <Dropdown overlay={userMenu} trigger={['click']}>
                            <a onClick={(e) => e.preventDefault()}>
                                <Space>
                                    <Avatar style={{ backgroundColor: '#f56a00' }}>{userInitials}</Avatar>
                                    <Text>{fullUser ? `${fullUser.last_name} ${fullUser.first_name}` : 'Guest'}</Text>
                                </Space>
                            </a>
                        </Dropdown>
                    </div>
                </Header>
                <Content className="site-layout-content-wrapper">
                    <div className="site-layout-content">
                        <Outlet />
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;