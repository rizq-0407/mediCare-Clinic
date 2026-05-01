import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:8080/api"
});

// Add a request interceptor to attach the JWT token to every request
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Add a response interceptor to handle expired tokens (403/401)
API.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRequest = error.config && error.config.url && error.config.url.includes('/auth/');
        
        if (error.response && (error.response.status === 401 || error.response.status === 403) && !isAuthRequest) {
            console.error("Session expired or unauthorized. Logging out...");
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default API;