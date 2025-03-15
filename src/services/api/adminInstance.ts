import axios, { AxiosInstance } from "axios";
const adminAxiosInstance: AxiosInstance = axios.create({
    baseURL: "https://de13-103-170-228-58.ngrok-free.app/admin",
    headers: {
        "Content-Type": "application/json",
    },
});

export default adminAxiosInstance;
