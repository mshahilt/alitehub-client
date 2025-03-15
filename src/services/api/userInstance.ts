import axios, { AxiosInstance } from "axios";
import { setupInterceptors } from "./interceptor";

const axiosInstance: AxiosInstance = axios.create({
    baseURL: "https://fd92-103-170-228-58.ngrok-free.app/",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
});

setupInterceptors(axiosInstance);

export default axiosInstance;
