import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // Importa useNavigate para redirigir
import axios from 'axios'; // Importa Axios directamente
import { Apiurl } from '../../services/Apirest'; // Importa la URL base del API
import './Registro.css'; // Archivo CSS personalizado

const Registro = () => {
    const location = useLocation(); // Obtén el estado de navegación
    const navigate = useNavigate(); // Hook para redirigir
    const planIdSeleccionado = location.state?.planId || ''; // Obtén el planId del estado de navegación

    const [formData, setFormData] = useState({
        nombre: '',
        direccion: '',
        telefono: '',
        email_admin: '',
        username_admin: '',
        plan_id: planIdSeleccionado, // Inicializa con el plan seleccionado
    });

    const [planes, setPlanes] = useState([]); // Estado para almacenar los planes
    const [costoPlan, setCostoPlan] = useState(''); // Estado para mostrar el costo del plan
    const [mensaje, setMensaje] = useState('');

    useEffect(() => {
        // Obtener los planes desde el backend
        const fetchPlanes = async () => {
            try {
                const response = await axios.get(`${Apiurl}planes/`);
                setPlanes(response.data);

                // Si hay un plan seleccionado, actualiza el costo del plan
                if (planIdSeleccionado) {
                    const planSeleccionado = response.data.find((plan) => plan.id === parseInt(planIdSeleccionado));
                    setCostoPlan(planSeleccionado ? planSeleccionado.precio : '');
                }
            } catch (error) {
                console.error('Error al obtener los planes:', error);
            }
        };
        fetchPlanes();
    }, [planIdSeleccionado]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        // Si el campo modificado es el plan_id, actualiza el costo del plan
        if (name === 'plan_id') {
            const planSeleccionado = planes.find((plan) => plan.id === parseInt(value));
            setCostoPlan(planSeleccionado ? planSeleccionado.precio : '');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${Apiurl}registro-empresa/`, formData);
            setMensaje(`Registro exitoso: ${response.data.nombre}`);
            navigate('/login'); // Redirigir al login después del registro
        } catch (error) {
            console.error('Error al registrar la empresa:', error);
            setMensaje('Hubo un problema al registrar la empresa.');
        }
    };

    return (
        <div className="registro-container container py-5">
            <h1 className="text-center mb-4 registro-title text-black-50">Registro</h1>
            <form onSubmit={handleSubmit} className="registro-form mx-auto">
                <div className="mb-3">
                    <label htmlFor="nombre" className="form-label">Nombre de la Empresa</label>
                    <input
                        type="text"
                        className="form-control"
                        id="nombre"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="direccion" className="form-label">Dirección</label>
                    <input
                        type="text"
                        className="form-control"
                        id="direccion"
                        name="direccion"
                        value={formData.direccion}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="telefono" className="form-label">Teléfono</label>
                    <input
                        type="text"
                        className="form-control"
                        id="telefono"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="email_admin" className="form-label">Correo Electrónico</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email_admin"
                        name="email_admin"
                        value={formData.email_admin}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="username_admin" className="form-label">Nombre de Usuario</label>
                    <input
                        type="text"
                        className="form-control"
                        id="username_admin"
                        name="username_admin"
                        value={formData.username_admin}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="plan_id" className="form-label">Plan</label>
                    <select
                        className="form-select"
                        id="plan_id"
                        name="plan_id"
                        value={formData.plan_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione un plan</option>
                        {planes.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                                {plan.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="costo_plan" className="form-label">Costo del Plan</label>
                    <input
                        type="text"
                        className="form-control"
                        id="costo_plan"
                        name="costo_plan"
                        value={costoPlan}
                        readOnly
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100 registro-button">Registrar Empresa</button>
            </form>
        </div>
    );
};

export default Registro;