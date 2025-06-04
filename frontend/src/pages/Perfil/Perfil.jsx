import React, { useState, useEffect } from 'react';
import ThemeCustomizer from '../../themes/ThemeCustomizer';
import { FaUser, FaEnvelope, FaUserShield } from 'react-icons/fa';
import apiClient from '../../services/Apirest';

const Perfil = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await apiClient.get('security/user/');
                setUser(response.data);
            } catch (error) {
                console.error('Error al cargar los datos del usuario:', error);
            }
        };

        fetchUserData();
    }, []);

    if (!user) {
        return <p>Cargando datos del usuario...</p>;
    }

    return (
        <div className="perfil-container">
            <h2>Perfil de Usuario</h2>
            <div className="informacion-usuario">
                <p><FaUser className="icon" /><strong>Usuario:</strong> {user.username}</p>
                <p><FaEnvelope className="icon" /><strong>Email:</strong> {user.email}</p>
                <p><FaUserShield className="icon" /><strong>Cargo:</strong> {user.groups && user.groups.join(', ')}</p>
            </div>
            <ThemeCustomizer />
        </div>
    );
};

export default Perfil;