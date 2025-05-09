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
            throw new Error("No refresh token found");
        }

        const response = await axios.post(`${Apiurl}token/refresh/`, {
            refresh: refreshToken,
        });

        // Guardar el nuevo access token en localStorage
        localStorage.setItem("access_token", response.data.access);
        return response.data.access;
    } catch (error) {
        console.error("Error al renovar el token:", error);
        // Redirigir al login si el refresh token también ha expirado
        window.location.href = "/";
        throw error;
    }
};

// Interceptor para manejar el token
apiClient.interceptors.request.use(
    async (config) => {
        let token = localStorage.getItem("access_token");

        // Verificar si el token ha expirado
        if (isTokenExpired(token)) {
            token = await refreshAccessToken();
        }

        // Agregar el token al encabezado Authorization
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