import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import { Result, Button, Spin } from 'antd';
import axiosInstance from '../../api/axiosInstance';

const AcceptInvitationPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading'); // loading, success, error
    const [errorMessage, setErrorMessage] = useState('');
    const effectRan = useRef(false);

    useEffect(() => {
        if (effectRan.current === true) {
            return;
        }

        const orgId = searchParams.get('orgId');
        const deptId = searchParams.get('deptId');
        const userEmail = searchParams.get('email');

        if (!orgId || !deptId || !userEmail) {
            setStatus('error');
            setErrorMessage('Đường dẫn mời không hợp lệ.');
            return;
        }

        const accept = async () => {
            try {
                await axiosInstance.get(`/invitation/accept`, { params: { orgId, deptId, userEmail } });
                setStatus('success');
            } catch (error) {
                setStatus('error');
                setErrorMessage(error.response?.data?.message || 'Chấp nhận lời mời thất bại.');
            }
        };
        accept();

        return () => {
            effectRan.current = true;
        };
    }, []);

    if (status === 'loading') {
        return <Spin tip="Đang xử lý lời mời..." fullscreen />;
    }

    if (status === 'success') {
        return (
            <Result
                status="success"
                title="Tham gia tổ chức thành công!"
                subTitle="Bạn đã là thành viên của tổ chức. Vui lòng đăng nhập để tiếp tục."
                extra={<Button type="primary" onClick={() => navigate('/login')}>Đăng nhập</Button>}
            />
        );
    }

    return (
        <Result
            status="error"
            title="Thao tác thất bại"
            subTitle={errorMessage}
            extra={<Button onClick={() => navigate('/')}>Về trang chủ</Button>}
        />
    );
};

export default AcceptInvitationPage;