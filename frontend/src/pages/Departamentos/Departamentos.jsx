import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/Apirest";
import { Modal, Button, Form, Table } from "react-bootstrap";

const Departamentos = () => {
    const [departamentos, setDepartamentos] = useState([]);
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();

    // Obtener departamentos
    const fetchDepartamentos = async () => {
        try {
            const response = await apiClient.get("departamentos/");
            setDepartamentos(response.data);
        } catch (error) {
            console.error("Error al obtener departamentos:", error);
        }
    };

    // Crear o editar departamento
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            nombre: formData.nombre,
            descripcion: formData.descripcion,
        };

        if (isEditing) {
            await apiClient.put(`departamentos/${editId}/`, payload);
        } else {
            await apiClient.post("departamentos/", payload);
        }

        fetchDepartamentos();
        resetForm();
        setShowModal(false);
    };

    // Eliminar departamento
    const deleteDepartamento = async (id) => {
        try {
            await apiClient.delete(`departamentos/${id}/`);
            fetchDepartamentos();
        } catch (error) {
            console.error("Error al eliminar departamento:", error);
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
        <div className="container mt-4">
            <h1 className="mb-4 text-primary">Gestión de Departamentos</h1>
            <div className="d-flex justify-content-between mb-3">
                <div>
                    <Button
                        variant="secondary"
                        className="me-2"
                        onClick={() => navigate("/dashboard/cargos")}
                    >
                        Cargos
                    </Button>
                    <Button
                        variant="secondary"
                        className="me-2"
                        onClick={() => navigate("/dashboard/cargos_departamentos")} // Redirigir a CargosDepartamentos
                    >
                        Cargo Departamento
                    </Button>
                </div>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    Crear Departamento
                </Button>
            </div>
            <Table striped bordered hover responsive className="table-sm">
                <thead className="table-primary">
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {departamentos.map((departamento) => (
                        <tr key={departamento.id}>
                            <td>{departamento.nombre}</td>
                            <td>{departamento.descripcion}</td>
                            <td>
                                <Button
                                    variant="link"
                                    className="p-0"
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
                                    <i className="bi bi-three-dots" style={{ fontSize: "1.5rem" }}></i>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal para crear/editar departamentos */}
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
                    <Modal.Title>{isEditing ? "Editar Departamento" : "Crear Departamento"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
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
                    </Modal.Body>
                    <Modal.Footer>
                        {isEditing && (
                            <Button
                                variant="danger"
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            `¿Estás seguro de que deseas eliminar el departamento "${formData.nombre}"?`
                                        )
                                    ) {
                                        deleteDepartamento(editId);
                                        setShowModal(false);
                                    }
                                }}
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
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Departamentos;