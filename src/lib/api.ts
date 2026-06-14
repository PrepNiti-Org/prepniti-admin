import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_ADMIN_API_URL || "http://localhost:8081/api",
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    const token = Cookies.get("admin_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const extractionApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_EXTRACTION_API_URL || "http://localhost:8002/api",
});
