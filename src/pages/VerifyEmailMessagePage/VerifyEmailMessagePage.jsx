import React from 'react';
import '@ant-design/v5-patch-for-react-19';
import { Button, Result, Typography } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';

const { Paragraph, Text } = Typography;

const VerifyEmailMessagePage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email; // Lấy email được truyền từ trang đăng ký

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 134px)' }}>
            <Result
                status="success"
                title="Đăng Ký Thành Công!"
                subTitle={
                    <Paragraph>
                        Chúng tôi đã gửi một liên kết xác thực đến email <Text strong>{email || 'của bạn'}</Text>.
                        <br />
                        Vui lòng kiểm tra hộp thư (bao gồm cả mục spam) và làm theo hướng dẫn để kích hoạt tài khoản.
                    </Paragraph>
                }
                extra={[
                    <Button type="primary" key="login" onClick={() => navigate('/login')}>
                        Đi đến trang Đăng nhập
                    </Button>,
                ]}
            />
        </div>
    );
};

export default VerifyEmailMessagePage;