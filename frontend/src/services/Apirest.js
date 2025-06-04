import axios from "axios";

export const Apiurl = 'http://localhost:8000/api/';

const apiClient = axios.create({
    baseURL: Apiurl,
});

// Función para renovar el token de acceso
export const refreshAccessToken = async () => {
    try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) {
            console.error("No refresh token found");
            return null; // No eliminar tokens aquí
        }

        const response = await axios.post(`${Apiurl}token/refresh/`, {
            refresh: refreshToken,
        });

        // Guardar el nuevo access token en localStorage
        localStorage.setItem("access_token", response.data.access);
        return response.data.access;
    } catch (error) {
        console.error("Error al renovar el token:", error);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
        throw error;
    }
};

// Interceptor para manejar el token
apiClient.interceptors.request.use(
    async (config) => {
        let token = localStorage.getItem("access_token");

        if (isTokenExpired(token)) {
            try {
                token = await refreshAccessToken();
            } catch (error) {
                console.error("Error al renovar el token:", error);
                window.location.href = "/";
                return Promise.reject(error);
            }
        }

        config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error)
);

// Función para verificar si el token ha expirado
const isTokenExpired = (token) => {
    if (!token) return true;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
};

export default apiClient;