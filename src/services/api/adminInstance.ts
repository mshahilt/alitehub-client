import axios, { AxiosInstance } from "axios";
const adminAxiosInstance: AxiosInstance = axios.create({
    baseURL: "https://api.alitehub.site/admin",
    headers: {
        "Content-Type": "application/json",
    },
});

export default adminAxiosInstance;
