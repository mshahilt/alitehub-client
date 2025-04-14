import axios, { AxiosInstance } from "axios";
const adminAxiosInstance: AxiosInstance = axios.create({
    baseURL: "http://localhost:5000/admin",
    headers: {
        "Content-Type": "application/json",
    },
});

export default adminAxiosInstance;
