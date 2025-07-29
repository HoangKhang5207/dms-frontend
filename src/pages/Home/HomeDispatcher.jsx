import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '@ant-design/v5-patch-for-react-19';
import { Spin } from 'antd';
import { useAuth } from '../../contexts/AuthContext';
import axiosInstance from '../../api/axiosInstance';

const HomeDispatcher = () => {
    const navigate = useNavigate();
    const { fullUser, loading: authLoading } = useAuth();
    

    useEffect(() => {
        // Chỉ thực hiện khi đã load xong thông tin auth
        if (authLoading) {
            return;
        }
        const checkOrganizationStatus = async () => {
            if (!fullUser) {
                 // Nếu không có user sau khi auth, chuyển về login
                navigate('/login', { replace: true });
                return;
            };

            // console.log(user);

            // 1. Nếu user đã thuộc một tổ chức -> vào trang chính
            if (fullUser.organization_id) {
                navigate('/home/dashboard', { replace: true });
                return;
            }

            // 2. Nếu chưa, kiểm tra xem có yêu cầu đang chờ duyệt không
            try {
                // GET /api/v1/organizations/check-pending-request
                const response = await axiosInstance.get('/organizations/check-pending-request');
                const hasPendingRequest = response.data?.has_pending_request;

                if (hasPendingRequest) {
                    navigate('/home/pending-organization', { replace: true });
                } else {
                    navigate('/home/no-organization', { replace: true });
                }
            } catch (error) {
                console.error("Failed to check organization status:", error);
                // Mặc định chuyển đến trang chưa có tổ chức nếu có lỗi
                navigate('/home/no-organization', { replace: true });
            }
        };

        checkOrganizationStatus();
    }, [fullUser, authLoading, navigate]);

    // Hiển thị loading trong khi kiểm tra
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Spin size="large" tip="Đang tải dữ liệu người dùng..." />
        </div>
    );
};

export default HomeDispatcher;