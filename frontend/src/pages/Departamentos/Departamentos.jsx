import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Modal, Button, Form, Table } from "react-bootstrap";

const Departamentos = () => {
    const [departamentos, setDepartamentos] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        cargos: [],
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Obtener departamentos
    const fetchDepartamentos = async () => {
        try {
            const response = await apiClient.get("departamentos/");
            setDepartamentos(response.data);
        } catch (error) {
            console.error("Error al obtener departamentos:", error);
        }
    };

    // Obtener cargos
    const fetchCargos = async () => {
        try {
            const response = await apiClient.get("cargos/");
            setCargos(response.data);
        } catch (error) {
            console.error("Error al obtener cargos:", error);
        }
    };

    // Crear o editar departamento
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            cargos: formData.cargos || [], // Asegúrate de enviar los IDs de los cargos
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
            cargos: [],
        });
    };

    // Cargar departamentos y cargos al montar el componente
    useEffect(() => {
        fetchDepartamentos();
        fetchCargos(); // Cargar cargos al montar el componente
    }, []);

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-primary">Gestión de Departamentos</h1>
            <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    Crear Departamento
                </Button>
            </div>
            <Table striped bordered hover responsive className="table-sm">
                <thead className="table-primary">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Cargos</th>
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
                                {departamento.departamento_cargos?.map((cargo) => (
                                    <span key={cargo.id}>{cargo.nombre}</span>
                                )) || "Sin cargos"}
                            </td>
                            <td>
                                {/* Botón de los 3 puntos */}
                                <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setEditId(departamento.id);
                                        setFormData({
                                            nombre: departamento.nombre,
                                            descripcion: departamento.descripcion,
                                            cargos: departamento.departamento_cargos?.map((cargo) => cargo.id) || [],
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
                        <Form.Group className="mb-3">
                            <Form.Label>Cargos</Form.Label>
                            <Form.Select
                                name="cargos"
                                multiple
                                value={formData.cargos || []}
                                onChange={(e) => {
                                    const selectedOptions = Array.from(e.target.selectedOptions).map(
                                        (option) => option.value
                                    );
                                    setFormData({ ...formData, cargos: selectedOptions });
                                }}
                            >
                                {cargos.map((cargo) => (
                                    <option key={cargo.id} value={cargo.id}>
                                        {cargo.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    {/* Botón de eliminar */}
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

                    {/* Botones de cancelar y guardar */}
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
            </Modal>
        </div>
    );
};

export default Departamentos;