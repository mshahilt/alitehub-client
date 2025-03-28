import axios, { AxiosInstance } from "axios";
import { setupInterceptors } from "./interceptor";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: "https://api.alitehub.site/",
    headers: {
        "Content-Type": "application/json",
},
    withCredentials: true,
});

setupInterceptors(axiosInstance);

export default axiosInstance;
