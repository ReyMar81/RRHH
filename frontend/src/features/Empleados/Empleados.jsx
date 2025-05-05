import React, { useEffect, useState } from "react";
import { Apiurl } from "../services/apirest";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import "./Empleados.css";

const Empleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        ci: "",
        fecha_nacimiento: "",
        genero: "",
        direccion: "",
        estado_civil: "",
        telefono: "",
        cargo: "",
        correo_personal: "",
        departamento_id: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Obtener empleados
    const fetchEmpleados = async () => {
        try {
            const response = await axios.get(`${Apiurl}empleados/`);
            setEmpleados(response.data);
        } catch (error) {
            console.error("Error al obtener empleados:", error);
        }
    };

    // Crear empleado
    const createEmpleado = async () => {
        try {
            await axios.post(`${Apiurl}empleados/`, formData);
            fetchEmpleados();
            resetForm();
            setShowModal(false);
        } catch (error) {
            console.error("Error al crear empleado:", error);
        }
    };

    // Editar empleado
    const updateEmpleado = async () => {
        try {
            await axios.put(`${Apiurl}empleados/${editId}/`, formData);
            fetchEmpleados();
            resetForm();
            setIsEditing(false);
            setEditId(null);
            setShowModal(false);
        } catch (error) {
            console.error("Error al actualizar empleado:", error);
        }
    };

    // Eliminar empleado
    const deleteEmpleado = async (id) => {
        try {
            await axios.delete(`${Apiurl}empleados/${id}/`);
            fetchEmpleados();
        } catch (error) {
            console.error("Error al eliminar empleado:", error);
        }
    };

    // Manejar el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            updateEmpleado();
        } else {
            createEmpleado();
        }
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            nombre: "",
            apellidos: "",
            ci: "",
            fecha_nacimiento: "",
            genero: "",
            direccion: "",
            estado_civil: "",
            telefono: "",
            cargo: "",
            correo_personal: "",
            departamento_id: "",
        });
    };

    // Cargar empleados al montar el componente
    useEffect(() => {
        fetchEmpleados();
    }, []);

    return (
        <div className="empleados-container">
            <h1>Gestión de Empleados</h1>
            <Button variant="primary" onClick={() => setShowModal(true)}>
                Crear Empleado
            </Button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellidos</th>
                        <th>CI</th>
                        <th>Fecha Nacimiento</th>
                        <th>Género</th>
                        <th>Dirección</th>
                        <th>Estado Civil</th>
                        <th>Teléfono</th>
                        <th>Cargo</th>
                        <th>Correo Personal</th>
                        <th>Departamento</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map((empleado) => (
                        <tr key={empleado.id}>
                            <td>{empleado.id}</td>
                            <td>{empleado.nombre}</td>
                            <td>{empleado.apellidos}</td>
                            <td>{empleado.ci}</td>
                            <td>{empleado.fecha_nacimiento}</td>
                            <td>{empleado.genero}</td>
                            <td>{empleado.direccion}</td>
                            <td>{empleado.estado_civil}</td>
                            <td>{empleado.telefono}</td>
                            <td>{empleado.cargo}</td>
                            <td>{empleado.correo_personal}</td>
                            <td>{empleado.departamento_id}</td>
                            <td>
                                <Button
                                    variant="warning"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setEditId(empleado.id);
                                        setFormData({ ...empleado });
                                        setShowModal(true);
                                    }}
                                >
                                    Editar
                                </Button>
                                <Button variant="danger" onClick={() => deleteEmpleado(empleado.id)}>
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal para crear/editar empleados */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Editar Empleado" : "Crear Empleado"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        {Object.keys(formData).map((key) => (
                            <Form.Group className="mb-3" key={key}>
                                <Form.Label>{key.replace("_", " ").toUpperCase()}</Form.Label>
                                <Form.Control
                                    type={key === "fecha_nacimiento" ? "date" : "text"}
                                    name={key}
                                    placeholder={key}
                                    value={formData[key]}
                                    onChange={handleChange}
                                    required={key !== "departamento_id"}
                                />
                            </Form.Group>
                        ))}
                        <Button variant="primary" type="submit">
                            {isEditing ? "Actualizar" : "Crear"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Empleados;