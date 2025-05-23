import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Modal, Form } from "react-bootstrap";

const Tipos = () => {
    const [tipos, setTipos] = useState([]);
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        es_requerido: false,
        activo: true,
    });
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [message, setMessage] = useState("");

    // Obtener tipos
    const fetchTipos = async () => {
        try {
            const response = await apiClient.get("tipos/");
            setTipos(response.data);
        } catch (error) {
            console.error("Error al obtener tipos:", error);
        }
    };

    // Crear o editar tipo
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await apiClient.put(`tipos/${editId}/`, formData);
                setMessage("Tipo actualizado con éxito.");
            } else {
                await apiClient.post("tipos/", formData);
                setMessage("Tipo creado con éxito.");
            }
            fetchTipos();
            resetForm();
            setShowModal(false);
        } catch (error) {
            console.error("Error al guardar el tipo:", error);
            setMessage("Error al guardar el tipo.");
        }
    };

    // Eliminar tipo
    const deleteTipo = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este tipo?")) {
            try {
                await apiClient.delete(`tipos/${id}/`);
                fetchTipos();
                setMessage("Tipo eliminado con éxito.");
                setShowModal(false);
            } catch (error) {
                console.error("Error al eliminar tipo:", error);
                setMessage("Error al eliminar el tipo.");
            }
        }
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            nombre: "",
            descripcion: "",
            es_requerido: false,
            activo: true,
        });
        setIsEditing(false);
        setEditId(null);
    };

    // Cargar tipos al montar el componente
    useEffect(() => {
        fetchTipos();
    }, []);

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-primary">Gestión de Tipos</h1>
            <div className="d-flex justify-content-between mb-3">
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    Crear Tipo
                </Button>
            </div>
            <Table striped bordered hover responsive>
                <thead className="table-primary">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Requerido</th>
                        <th>Activo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {tipos.map((tipo) => (
                        <tr key={tipo.id}>
                            <td>{tipo.id}</td>
                            <td>{tipo.nombre}</td>
                            <td>{tipo.descripcion || "—"}</td>
                            <td>{tipo.es_requerido ? "Sí" : "No"}</td>
                            <td>{tipo.activo ? "Sí" : "No"}</td>
                            <td>
                                <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setEditId(tipo.id);
                                        setFormData({
                                            nombre: tipo.nombre,
                                            descripcion: tipo.descripcion,
                                            es_requerido: tipo.es_requerido,
                                            activo: tipo.activo,
                                        });
                                        setShowModal(true);
                                    }}
                                >
                                    <i className="bi bi-three-dots" style={{ fontSize: "1.5rem" }}></i>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal para crear/editar tipo */}
            <Modal
                show={showModal}
                onHide={() => {
                    setShowModal(false);
                    resetForm();
                }}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Editar Tipo" : "Crear Tipo"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombre"
                                placeholder="Nombre del tipo"
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
                                placeholder="Descripción del tipo"
                                value={formData.descripcion}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="es_requerido"
                                label="¿Es requerido?"
                                checked={formData.es_requerido}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                name="activo"
                                label="¿Está activo?"
                                checked={formData.activo}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-between">
                            {isEditing && (
                                <Button
                                    variant="danger"
                                    onClick={() => deleteTipo(editId)}
                                >
                                    Eliminar
                                </Button>
                            )}
                            <div>
                                <Button
                                    variant="secondary"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="me-2"
                                >
                                    Cancelar
                                </Button>
                                <Button variant="primary" type="submit">
                                    {isEditing ? "Actualizar" : "Crear"}
                                </Button>
                            </div>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {message && <div className="mt-3 alert alert-info">{message}</div>}
        </div>
    );
};

export default Tipos;