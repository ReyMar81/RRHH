import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importa Axios directamente
import { Apiurl } from '../../services/Apirest'; // Importa la URL base del API
import './Suscripciones.css'; // Archivo CSS personalizado

const PAISES = [
    { value: "BOL", label: "Bolivia" }
    // Puedes agregar más países si tu backend los soporta
];

const Suscripciones = () => {
    const [planes, setPlanes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Obtener los planes desde el backend
        const fetchPlanes = async () => {
            try {
                const response = await axios.get(`${Apiurl}planes/`);
                setPlanes(response.data);
            } catch (error) {
                console.error('Error al obtener los planes:', error);
            }
        };
        fetchPlanes();
    }, []);

    return (
        <div className="suscripciones-page container py-5">
            <h1 className="text-center mb-4">Planes de Suscripción</h1>
            <div className="row">
                {Array.isArray(planes) && planes.map((plan) => (
                    <div key={plan.id} className="col-md-6 mb-4">
                        <div className="card shadow border-primary">
                            <div className="card-body text-center">
                                <h5 className="card-title fw-bold">{plan.nombre}</h5>
                                <p className="card-text">
                                    Duración: {plan.cantidad_duracion} {plan.tipo_de_duracion === 'd' ? 'día(s)' : plan.tipo_de_duracion === 'm' ? 'mes(es)' : 'año(s)'}
                                </p>
                                <p className="card-text fw-bold">Precio: ${plan.precio}</p>
                                <button
                                    className="btn btn-primary w-100"
                                    onClick={() => navigate('/registro', { state: { planId: plan.id } })}
                                >
                                    Comprar ahora
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Suscripciones;