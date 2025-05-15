import axios, { AxiosInstance } from "axios";
import { setupInterceptors } from "./interceptor";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

setupInterceptors(axiosInstance);

export default axiosInstance;
