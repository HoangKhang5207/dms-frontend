import React, { useState, useEffect } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Grid, Drawer, Button } from 'antd';
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
    MenuOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SwapOutlined,
    FolderOutlined
} from '@ant-design/icons';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useOrganization } from '../../contexts/OrganizationContext';
import AquaDocsBrand from '../../components/AquaDocsBrand/AquaDocsBrand';
import './DashboardLayout.css';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

const DashboardLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { fullUser, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const screens = Grid.useBreakpoint();
    const isMobile = screens.lg === false;
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

    const words = getLastInitials(`${fullUser?.last_name || ''} ${fullUser?.first_name || ''}`);


    // Tên viết tắt của user cho Avatar
    const userInitials = fullUser ? `${words[words.length - 1]}${words[0]}` : 'G';

    const navigateTo = (destination) => {
        navigate(destination);
        setMobileMenuOpen(false);
    };

    const navigation = (
                <Menu
                    mode="inline"
                    theme="dark"
                    // Sử dụng key động
                    selectedKeys={[selectedKey]}
                    openKeys={openKeys}
                    onOpenChange={onOpenChange}
                >
                    <Menu.Item key="1" icon={<HomeOutlined />} onClick={() => navigateTo('/home')}>
                        Trang chủ
                    </Menu.Item>
                    <Menu.SubMenu key="sub1" icon={<TeamOutlined />} title="Tổ chức của tôi">
                        <Menu.Item key="2" onClick={() => navigateTo('/home/organization/info')}>Thông tin chung</Menu.Item>
                        <Menu.Item key="3" onClick={() => navigateTo('/home/organization/departments')}>Phòng ban</Menu.Item>
                        <Menu.Item key="4" onClick={() => navigateTo('/home/organization/members')}>Thành viên</Menu.Item>
                    </Menu.SubMenu>
                    <Menu.Item key="5" icon={<FolderOutlined />} onClick={() => navigateTo(`/home/document-management/${fullUser?.department_id || ''}`)}>Quản lý thư mục</Menu.Item>
                    <Menu.Item key="6" icon={<FileOutlined />} onClick={() => navigateTo('/home/document-management')}>Quản lý tài liệu</Menu.Item>
                    <Menu.Item key="7" icon={<StarOutlined />}>Được đánh dấu</Menu.Item>
                    <Menu.Item key="8" icon={<ShareAltOutlined />}>Được chia sẻ với tôi</Menu.Item>
                </Menu>
    );

    return (
        <Layout className={`dashboard-layout${isMobile ? ' dashboard-mobile' : ''}`}>
            {!isMobile && (
                <Sider
                    theme="dark"
                    collapsible
                    trigger={null}
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    className="dashboard-sider"
                    width={240}
                >
                    <Link to="/home" className="logo-dashboard" aria-label="AquaDocs AI — Không gian làm việc">
                        <AquaDocsBrand compact={collapsed} />
                    </Link>
                    {navigation}
                    <Button
                        type="text"
                        className="sidebar-collapse"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        aria-label={collapsed ? 'Mở rộng điều hướng' : 'Thu gọn điều hướng'}
                        onClick={() => setCollapsed(value => !value)}
                    />
                </Sider>
            )}
            <Drawer
                title={<Link to="/home" onClick={() => setMobileMenuOpen(false)} aria-label="AquaDocs AI — Không gian làm việc"><AquaDocsBrand /></Link>}
                placement="left"
                width={280}
                open={isMobile && mobileMenuOpen}
                onClose={() => setMobileMenuOpen(false)}
                className="aquadocs-navigation-drawer"
                styles={{ body: { background: '#081e4b', padding: '16px 8px' } }}
            >
                {navigation}
            </Drawer>
            <Layout className="site-layout">
                <Header className="site-layout-header">
                    <div className="header-left">
                        {isMobile && (
                            <Button
                                type="text"
                                icon={<MenuOutlined />}
                                aria-label="Mở điều hướng"
                                aria-expanded={mobileMenuOpen}
                                onClick={() => setMobileMenuOpen(true)}
                            />
                        )}
                        <div className="workspace-identity">
                            <span className="org-name-tag" title={orgName}>{orgName}</span>
                            <span className="user-role-text">{userRole}</span>
                        </div>
                    </div>
                    <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                        <Button type="text" className="account-trigger" aria-label="Tài khoản người dùng">
                            <Space>
                                <Avatar style={{ backgroundColor: '#0068ff' }}>{userInitials}</Avatar>
                                <Text className="account-name">{fullUser ? `${fullUser.last_name} ${fullUser.first_name}` : 'Khách'}</Text>
                            </Space>
                        </Button>
                    </Dropdown>
                </Header>
                <Content className="site-layout-content-wrapper">
                    <main className="site-layout-content">
                        <Outlet />
                    </main>
                </Content>
            </Layout>
        </Layout>
    );
};

export default DashboardLayout;
