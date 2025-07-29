import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import { Result, Button, Spin } from 'antd';
import axiosInstance from '../../api/axiosInstance';

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const email = searchParams.get('email');
        if (!email) {
            setStatus('error');
            setErrorMessage('Đường dẫn xác thực không hợp lệ hoặc đã hết hạn.');
            return;
        }

        const verify = async () => {
            try {
                // Backend endpoint: GET /api/v1/auth/email/verify?email=... [cite: 165]
                await axiosInstance.get(`/auth/email/verify?email=${email}`);
                setStatus('success');
            } catch (error) {
                setStatus('error');
                const msg = error.response?.data?.message || 'Có lỗi xảy ra trong quá trình xác thực.';
                setErrorMessage(msg);
            }
        };

        verify();
    }, [searchParams]);

    if (status === 'verifying') {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 134px)' }}>
                <Spin size="large" />
                <p style={{ marginTop: '20px' }}>Đang xác thực tài khoản của bạn...</p>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <Result
                status="success"
                title="Xác Thực Thành Công!"
                subTitle="Tài khoản của bạn đã được kích hoạt. Bây giờ bạn có thể đăng nhập."
                extra={[
                    <Button type="primary" key="console" onClick={() => navigate('/login')}>
                        Đăng nhập ngay
                    </Button>,
                ]}
            />
        );
    }

    return (
        <Result
            status="error"
            title="Xác Thực Thất Bại"
            subTitle={errorMessage}
            extra={[
                <Button key="home" onClick={() => navigate('/')}>
                    Quay về trang chủ
                </Button>,
            ]}
        />
    );
};

export default VerifyEmailPage;