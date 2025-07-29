import React, { createContext, useState, useEffect, useContext } from 'react';
import '@ant-design/v5-patch-for-react-19';
import { tokenService } from '../services/tokenService';
import axiosInstance from '../api/axiosInstance';
import { message } from 'antd';

// Tạo Context
const AuthContext = createContext(null);

// Tạo Provider
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [fullUser, setFullUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Hàm mới để fetch thông tin user chi tiết
    const fetchFullUserData = async () => {
        try {
            const response = await axiosInstance.get('/users/me');
            setFullUser(response.data);
            return response.data;
        } catch (error) {
            console.error("Failed to fetch full user data:", error);
            // Có thể logout nếu không fetch được thông tin
            logout(); 
            return null;
        }
    };

    useEffect(() => {
        const initializeAuth = async () => {
            const accessToken = tokenService.getAccessToken();
            if (accessToken) {
                const userDataFromToken = tokenService.getUser();
                setUser(userDataFromToken);
                setIsAuthenticated(true);
                await fetchFullUserData(); // Fetch thông tin chi tiết khi load app
            }
            setLoading(false);
        };
        initializeAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axiosInstance.post('/auth/login', { email, password });
            const { access_token, refresh_token } = response.data;

            tokenService.setTokens(access_token, refresh_token);
            const userDataFromToken = tokenService.getUser();
            setUser(userDataFromToken);
            setIsAuthenticated(true);
            await fetchFullUserData();

            message.success('Đăng nhập thành công!');
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Email hoặc mật khẩu không chính xác.';
            message.error(errorMessage);
            console.error("Login failed:", error);
            return false;
        }
    };

    const logout = () => {
        tokenService.removeTokens();
        setUser(null);
        setFullUser(null);
        setIsAuthenticated(false);
        // Chuyển hướng về trang login, có thể thực hiện ở component
    };

    const register = async (values) => {
        try {
            // Backend yêu cầu firstName, lastName, email, password, gender [cite: 282, 283, 284, 285]
            const payload = {
                first_name: values.firstName,
                last_name: values.lastName,
                email: values.email,
                password: values.password,
                gender: values.gender,
            };
            await axiosInstance.post('/auth/signup', payload); // [cite: 27]
            message.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.');
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Đăng ký thất bại, email có thể đã tồn tại.';
            message.error(errorMessage);
            console.error("Registration failed:", error);
            return false;
        }
    };

    const requestPasswordReset = async (email) => {
        try {
            // POST /api/v1/auth/reset-password/request
            await axiosInstance.post('/auth/reset-password/request', { email });
            // Để tránh lộ thông tin email nào tồn tại trong hệ thống,
            // chúng ta luôn trả về true. Backend sẽ chỉ gửi email nếu nó tồn tại.
            return true;
        } catch (error) {
            console.error("Request password reset failed:", error);
            // Vẫn trả về true để không cho kẻ tấn công biết email nào không tồn tại.
            return true;
        }
    };

    const resetPassword = async (token, newPassword) => {
        try {
            // Backend endpoint: POST /api/v1/reset-password
            // Yêu cầu token trong header: Authorization: Bearer <reset_token>
            await axiosInstance.post(
                '/reset-password',
                { new_password: newPassword },
                {
                    // Ghi đè header mặc định của axiosInstance cho request này
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            message.success('Đặt lại mật khẩu thành công!');
            return true;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Token không hợp lệ hoặc đã hết hạn.';
            message.error(errorMessage);
            console.error("Reset password failed:", error);
            return false;
        }
    };

    const value = {
        user,
        fullUser,
        isAuthenticated,
        loading,
        login,
        logout,
        register,
        requestPasswordReset,
        resetPassword,
    };

    // Chỉ render children khi đã kiểm tra xong token
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Custom hook để sử dụng AuthContext dễ dàng hơn
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    return useContext(AuthContext);
};