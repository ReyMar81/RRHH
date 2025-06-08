import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Modal, Form } from "react-bootstrap";

const Categoria = () => {
    const [categorias, setCategorias] = useState([]);
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
    });
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [message, setMessage] = useState("");

    // Obtener el id de la empresa desde localStorage
    const empresaId = localStorage.getItem("empresa_id");

    // Obtener categorías desde el backend
    const fetchCategorias = async () => {
        try {
            const response = await apiClient.get(`categorias/?empresa_id=${empresaId}`);
            setCategorias(response.data);
        } catch (error) {
            console.error("Error al obtener categorías:", error);
        }
    };

    // Crear o editar categoría
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
            empresa_id: empresaId, // Asociar la categoría a la empresa
        };

        try {
            if (isEditing) {
                await apiClient.put(`categorias/${editId}/`, payload);
                setMessage("Categoría actualizada con éxito.");
            } else {
                await apiClient.post("categorias/", payload);
                setMessage("Categoría creada con éxito.");
            }
            fetchCategorias();
            resetForm();
            setShowModal(false);
        } catch (error) {
            console.error("Error al guardar la categoría:", error);
            setMessage("Error al guardar la categoría.");
        }
    };

    // Eliminar categoría
    const deleteCategoria = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar esta categoría?")) {
            try {
                await apiClient.delete(`categorias/${id}/?empresa_id=${empresaId}`);
                fetchCategorias();
                setMessage("Categoría eliminada con éxito.");
                setShowModal(false);
            } catch (error) {
                console.error("Error al eliminar categoría:", error);
                setMessage("Error al eliminar la categoría.");
            }
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
        setIsEditing(false);
        setEditId(null);
    };

    // Cargar categorías al montar el componente
    useEffect(() => {
        fetchCategorias();
    }, []);

    return (
        <div className="container mt-4">
            <h1 className="mb-4 ">Gestión de Categorías</h1>
            <div className="d-flex justify-content-between mb-3">
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    Crear Categoría
                </Button>
            </div>
            <Table striped bordered hover responsive>
                <thead className="table-primary">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {categorias.map((categoria) => (
                        <tr key={categoria.id}>
                            <td>{categoria.id}</td>
                            <td>{categoria.nombre}</td>
                            <td>{categoria.descripcion || "—"}</td>
                            <td>
                                <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setEditId(categoria.id);
                                        setFormData({
                                            nombre: categoria.nombre,
                                            descripcion: categoria.descripcion,
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

            {/* Modal para crear/editar categoría */}
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
                    <Modal.Title>{isEditing ? "Editar Categoría" : "Crear Categoría"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombre"
                                placeholder="Nombre de la categoría"
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
                                placeholder="Descripción de la categoría"
                                value={formData.descripcion}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-between">
                            {isEditing && (
                                <Button
                                    variant="danger"
                                    onClick={() => deleteCategoria(editId)}
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

export default Categoria;