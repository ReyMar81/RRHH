import React, { useEffect, useState } from "react";
import { Modal, Button, Form, Table, Container } from "react-bootstrap";
import apiClient from "../../services/Apirest";

const PAISES = [
    { value: "BOL", label: "BOLIVIA" }
];

const Empresas = () => {
    const [empresas, setEmpresas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        nombre: "",
        pais: "BOL",
        direccion: "",
        telefono: "",
        email: "",
        estado: true,
        autorizaHorasExtra: true,
    });

    // Obtener empresas
    const fetchEmpresas = async () => {
        try {
            const response = await apiClient.get("empresas/");
            setEmpresas(response.data);
        } catch (error) {
            console.error("Error al obtener empresas:", error);
        }
    };

    // Crear empresa
    const createEmpresa = async () => {
        try {
            await apiClient.post("empresas/", formData);
            fetchEmpresas();
            resetForm();
            setShowModal(false);
        } catch (error) {
            console.error("Error al crear empresa:", error);
        }
    };

    // Editar empresa
    const updateEmpresa = async () => {
        try {
            await apiClient.put(`empresas/${editId}/`, formData);
            fetchEmpresas();
            resetForm();
            setIsEditing(false);
            setEditId(null);
            setShowModal(false);
        } catch (error) {
            console.error("Error al actualizar empresa:", error);
        }
    };

    // Eliminar empresa
    const deleteEmpresa = async (id) => {
        try {
            await apiClient.delete(`empresas/${id}/`);
            fetchEmpresas();
        } catch (error) {
            console.error("Error al eliminar empresa:", error);
        }
    };

    // Manejar el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            updateEmpresa();
        } else {
            createEmpresa();
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
            pais: "BOL",
            direccion: "",
            telefono: "",
            email: "",
            estado: true,
            autorizaHorasExtra: true,
        });
    };

    useEffect(() => {
        fetchEmpresas();
    }, []);

    return (
        <Container className="mt-4">
            <h1 className="mb-4">Gestión de Empresas</h1>
            <div className="d-flex justify-content-between mb-3">
                <Button variant="primary" onClick={() => { resetForm(); setIsEditing(false); setShowModal(true); }}>
                    Crear Empresa
                </Button>
            </div>
            <Table striped bordered hover responsive className="table-sm">
                <thead className="table-primary">
                    <tr>
                        <th>Nombre</th>
                        <th>País</th>
                        <th>Teléfono</th>
                        <th>Email</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    {empresas.map((empresa) => (
                        <tr
                            key={empresa.id}
                            style={{ cursor: "pointer" }}
                            onClick={() => localStorage.setItem("empresaSeleccionadaId", empresa.id)}
                        >
                            <td>{empresa.nombre}</td>
                            <td>{PAISES.find(p => p.value === empresa.pais)?.label || empresa.pais}</td>
                            <td>{empresa.telefono}</td>
                            <td>{empresa.email}</td>
                            <td>{empresa.estado ? "Activa" : "Inactiva"}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal para crear/editar empresas */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Editar Empresa" : "Crear Empresa"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>País</Form.Label>
                            <Form.Select
                                name="pais"
                                value={formData.pais}
                                onChange={handleChange}
                                required
                            >
                                {PAISES.map((pais) => (
                                    <option key={pais.value} value={pais.value}>{pais.label}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Dirección</Form.Label>
                            <Form.Control
                                type="text"
                                name="direccion"
                                value={formData.direccion}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control
                                type="text"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Empresa activa"
                                name="estado"
                                checked={formData.estado}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Autoriza Horas Extra"
                                name="autorizaHorasExtra"
                                checked={formData.autorizaHorasExtra}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-between">
                            {isEditing && (
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                `¿Estás seguro de que deseas eliminar la empresa ${formData.nombre}?`
                                            )
                                        ) {
                                            deleteEmpresa(editId);
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
                                    onClick={() => setShowModal(false)}
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
        </Container>
    );
};

export default Empresas;