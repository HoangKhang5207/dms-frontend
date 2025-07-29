import axios from 'axios';
import { tokenService } from '../services/tokenService';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:8080/api/v1', // URL backend của bạn
});

// Interceptor để thêm token vào header của mỗi request
axiosInstance.interceptors.request.use(
    (config) => {
        const token = tokenService.getAccessToken();
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý refresh token khi access token hết hạn
axiosInstance.interceptors.response.use(
    (res) => {
        return res;
    },
    async (err) => {
        const originalConfig = err.config;

        if (originalConfig.url !== '/auth/login' && err.response) {
            // Access Token đã hết hạn
            if (err.response.status === 401 && !originalConfig._retry) {
                originalConfig._retry = true;

                try {
                    const refreshToken = tokenService.getRefreshToken();
                    if (!refreshToken) {
                        tokenService.removeTokens();
                        window.location = '/login';
                        return Promise.reject("Refresh token not found.");
                    }

                    const rs = await axios.post('http://localhost:8080/api/v1/auth/refresh-token', {
                        refresh_token: refreshToken,
                    });

                    const { access_token, refresh_token } = rs.data;
                    tokenService.setTokens(access_token, refresh_token);
                    
                    originalConfig.headers['Authorization'] = 'Bearer ' + access_token;

                    return axiosInstance(originalConfig);
                } catch (_error) {
                    tokenService.removeTokens();
                    window.location = '/login';
                    return Promise.reject(_error);
                }
            }
        }

        return Promise.reject(err);
    }
);

export default axiosInstance;