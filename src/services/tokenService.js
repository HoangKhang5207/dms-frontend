import { jwtDecode } from 'jwt-decode';

export const tokenService = {
    setTokens: (accessToken, refreshToken) => {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    },
    getAccessToken: () => {
        return localStorage.getItem('accessToken');
    },
    getRefreshToken: () => {
        return localStorage.getItem('refreshToken');
    },
    removeTokens: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
    },
    getUser: () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return null;
        try {
            // Backend của bạn cần trả về thông tin user trong token
            // Ví dụ: email, is_admin
            return jwtDecode(token);
        } catch (error) {
            return null;
        }
    }
};