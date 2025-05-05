import React, { useEffect, useState } from "react";
import { Apiurl } from "../services/apirest";
import axios from "axios";
import { Modal, Button, Form } from "react-bootstrap";
import "./Departamentos.css";

const Departamentos = () => {
    const [departamentos, setDepartamentos] = useState([]);
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Obtener departamentos
    const fetchDepartamentos = async () => {
        try {
            const response = await axios.get(`${Apiurl}departamento/`);
            setDepartamentos(response.data);
        } catch (error) {
            console.error("Error al obtener departamentos:", error);
        }
    };

    // Crear departamento
    const createDepartamento = async () => {
        try {
            await axios.post(`${Apiurl}departamento/`, formData);
            fetchDepartamentos();
            resetForm();
            setShowModal(false);
        } catch (error) {
            console.error("Error al crear departamento:", error);
        }
    };

    // Editar departamento
    const updateDepartamento = async () => {
        try {
            await axios.put(`${Apiurl}departamento/${editId}/`, formData);
            fetchDepartamentos();
            resetForm();
            setIsEditing(false);
            setEditId(null);
            setShowModal(false);
        } catch (error) {
            console.error("Error al actualizar departamento:", error);
        }
    };

    // Eliminar departamento
    const deleteDepartamento = async (id) => {
        try {
            await axios.delete(`${Apiurl}departamento/${id}/`);
            fetchDepartamentos();
        } catch (error) {
            console.error("Error al eliminar departamento:", error);
        }
    };

    // Manejar el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            updateDepartamento();
        } else {
            createDepartamento();
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
            descripcion: "",
        });
    };

    // Cargar departamentos al montar el componente
    useEffect(() => {
        fetchDepartamentos();
    }, []);

    return (
        <div className="departamentos-container">
            <h1>Gestión de Departamentos</h1>
            <Button variant="primary" onClick={() => setShowModal(true)}>
                Crear Departamento
            </Button>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {departamentos.map((departamento) => (
                        <tr key={departamento.id}>
                            <td>{departamento.id}</td>
                            <td>{departamento.nombre}</td>
                            <td>{departamento.descripcion}</td>
                            <td>
                                <Button
                                    variant="warning"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setEditId(departamento.id);
                                        setFormData({
                                            nombre: departamento.nombre,
                                            descripcion: departamento.descripcion,
                                        });
                                        setShowModal(true);
                                    }}
                                >
                                    Editar
                                </Button>
                                <Button variant="danger" onClick={() => deleteDepartamento(departamento.id)}>
                                    Eliminar
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Modal para crear/editar departamentos */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Editar Departamento" : "Crear Departamento"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombre"
                                placeholder="Nombre del departamento"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="descripcion"
                                placeholder="Descripción del departamento"
                                value={formData.descripcion}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            {isEditing ? "Actualizar" : "Crear"}
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Departamentos;