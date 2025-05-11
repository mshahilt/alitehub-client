import axios, { AxiosInstance } from "axios";
import { setupInterceptors } from "./interceptor";

const adminAxiosInstance: AxiosInstance = axios.create({
    baseURL: "http://localhost:3000/admin",
    headers: {
        "Content-Type": "application/json",
    },
});

setupInterceptors(adminAxiosInstance);

export default adminAxiosInstance;
