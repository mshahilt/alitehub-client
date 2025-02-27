import { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";
import axiosInstance from "./userInstance";

export const refreshToken = async (): Promise<string | null> => {
    try {
        const response = await axiosInstance.post("/auth/refresh-token", {}, { withCredentials: true });
        return response.data.accessToken;
    } catch (error) {
        console.error("Refresh token request failed", error);
        return null;
    }
};

export const setupInterceptors = (axiosInstance: AxiosInstance) => {
    axiosInstance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = token 
            }
            return config;
        },
        (error: AxiosError) => {
            console.error("Axios request interceptor error", error);
            return Promise.reject(error);
        }
    );

    axiosInstance.interceptors.response.use(
        (response) => response,
        async (error: AxiosError) => {
            const originalRequest = error.config;

            if (originalRequest && error.response?.status === 401 && originalRequest.url !== "/auth/refresh-token") {
                try {
                    console.log("Access token expired. Attempting to refresh...");

                    const newToken = await refreshToken();

                    if (newToken) {
                        localStorage.setItem("token", newToken);
                        originalRequest.headers.Authorization = newToken
                        return axiosInstance(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed, logging out...", refreshError);
                    localStorage.removeItem("token");
                    window.location.href = "/login";
                }
            }

            return Promise.reject(error);
        }
    );
};
