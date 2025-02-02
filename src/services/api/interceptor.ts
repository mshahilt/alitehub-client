import { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from "axios";

export const setupInterceptors = (axiosInstance: AxiosInstance) => {
    axiosInstance.interceptors.request.use(
        (config: InternalAxiosRequestConfig) => {
            const token = localStorage.getItem("token");
            if (token) {
                config.headers.Authorization = token;
            }
            console.log("Request Interceptor:", config);
            return config;
        },
        (error: AxiosError) => {
            console.error("Something went wrong in axios interceptor", error);
            return Promise.reject(error);
        }
    );
};
