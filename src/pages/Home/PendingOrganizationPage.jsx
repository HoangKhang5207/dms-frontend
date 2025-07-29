import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Button, Result, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Paragraph } = Typography;

const PendingOrganizationPage = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <Result
                status="info"
                title="Yêu cầu của bạn đang chờ duyệt"
                subTitle={
                    <Paragraph>
                        Yêu cầu tạo tổ chức đã được gửi thành công. Quản trị viên hệ thống sẽ xem xét và phê duyệt trong thời gian sớm nhất. 
                        <br/>
                        Bạn sẽ nhận được thông báo qua email khi yêu cầu được xử lý. Vui lòng kiểm tra lại sau.
                    </Paragraph>
                }
                extra={[
                    <Button key="logout" onClick={handleLogout}>
                        Đăng xuất
                    </Button>,
                ]}
            />
        </div>
    );
};

export default PendingOrganizationPage;