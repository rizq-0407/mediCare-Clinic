import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080/api"
});

// Add a request interceptor to attach the JWT token to every request
// EXCEPT auth endpoints (login/register) which should never send a token
API.interceptors.request.use((config) => {
    const isAuthEndpoint = config.url && config.url.startsWith("/auth/");
    if (!isAuthEndpoint) {
        const token = sessionStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;