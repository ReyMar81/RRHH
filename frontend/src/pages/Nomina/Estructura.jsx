import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Modal, Form, Pagination } from "react-bootstrap";

const TIPOS_CONTRATO = [
    { value: "INDEFINIDO", label: "Indefinido" },
    { value: "PLAZO FIJO", label: "Plazo Fijo" },
    { value: "MEDIO TIEMPO", label: "Medio Tiempo" },
    { value: "PASANTIA", label: "Pasantía" },
];

// Genera los ítems de paginación estilo Google
const getPaginationItems = (pagina, totalPaginas) => {
    let items = [];
    if (totalPaginas <= 7) {
        for (let i = 1; i <= totalPaginas; i++) items.push(i);
    } else {
        if (pagina <= 4) {
            items = [1, 2, 3, 4, 5, "...", totalPaginas];
        } else if (pagina >= totalPaginas - 3) {
            items = [1, "...", totalPaginas - 4, totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas];
        } else {
            items = [1, "...", pagina - 1, pagina, pagina + 1, "...", totalPaginas];
        }
    }
    return items;
};

const Estructura = () => {
    const [estructuras, setEstructuras] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        tipo_contrato: "",
        activa: true,
    });
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;

    const empresaId = localStorage.getItem("empresa_id");

    // Obtener estructuras salariales
    const fetchEstructuras = async () => {
        try {
            const response = await apiClient.get(`estructuras/?empresa_id=${empresaId}`);
            setEstructuras(response.data);
        } catch (error) {
            console.error("Error al obtener estructuras:", error);
        }
    };

    useEffect(() => {
        fetchEstructuras();
    }, []);

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
            tipo_contrato: "",
            activa: true,
        });
        setIsEditing(false);
        setEditId(null);
    };

    // Crear o editar estructura
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            empresa: empresaId,
        };
        try {
            if (isEditing) {
                await apiClient.put(`estructuras/${editId}/`, payload);
            } else {
                await apiClient.post("estructuras/", payload);
            }
            fetchEstructuras();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error("Error al guardar la estructura:", error);
        }
    };

    // Eliminar estructura
    const deleteEstructura = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar esta estructura?")) {
            try {
                await apiClient.delete(`estructuras/${id}/?empresa_id=${empresaId}`);
                fetchEstructuras();
            } catch (error) {
                console.error("Error al eliminar la estructura:", error);
            }
        }
    };

    // Abrir modal para editar
    const handleEdit = (estructura) => {
        setFormData({
            nombre: estructura.nombre,
            descripcion: estructura.descripcion,
            tipo_contrato: estructura.tipo_contrato || "",
            activa: estructura.activa,
        });
        setIsEditing(true);
        setEditId(estructura.id);
        setShowModal(true);
    };

    // Calcular estructuras a mostrar
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const estructurasPagina = estructuras.slice(inicio, fin);
    const totalPaginas = Math.ceil(estructuras.length / porPagina);

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Estructuras Salariales</h1>
            <Button onClick={() => { resetForm(); setShowModal(true); }}>
                Crear Estructura
            </Button>
            <Table striped bordered hover responsive className="mt-3">
                <thead className="table-primary">
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Tipo de Contrato</th>
                        <th>Activa</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {estructurasPagina.map((estructura) => (
                        <tr key={estructura.id}>
                            <td>{estructura.nombre}</td>
                            <td>{estructura.descripcion}</td>
                            <td>
                                {TIPOS_CONTRATO.find(t => t.value === estructura.tipo_contrato)?.label || estructura.tipo_contrato || "—"}
                            </td>
                            <td>{estructura.activa ? "Sí" : "No"}</td>
                            <td>
                                <Button
                                    variant="link"
                                    className="p-0 me-2"
                                    onClick={() => handleEdit(estructura)}
                                >
                                    <i className="bi bi-three-dots" style={{ fontSize: "1.5rem" }}></i>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {/* Paginación estética */}
            {totalPaginas > 1 && (
                <Pagination className="justify-content-center">
                    <Pagination.Prev
                        onClick={() => setPagina(pagina - 1)}
                        disabled={pagina === 1}
                    />
                    {getPaginationItems(pagina, totalPaginas).map((item, idx) =>
                        item === "..." ? (
                            <Pagination.Ellipsis key={`ellipsis-${idx}`} disabled />
                        ) : (
                            <Pagination.Item
                                key={`page-${item}-${idx}`} // <-- Clave única
                                active={pagina === item}
                                onClick={() => setPagina(item)}
                            >
                                {item}
                            </Pagination.Item>
                        )
                    )}
                    <Pagination.Next
                        onClick={() => setPagina(pagina + 1)}
                        disabled={pagina === totalPaginas}
                    />
                </Pagination>
            )}

            {/* Modal para crear/editar estructura */}
            <Modal
                show={showModal}
                onHide={() => { setShowModal(false); resetForm(); }}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Editar Estructura" : "Crear Estructura"}</Modal.Title>
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
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo de Contrato</Form.Label>
                            <Form.Select
                                name="tipo_contrato"
                                value={formData.tipo_contrato}
                                onChange={handleChange}
                            >
                                <option value="">Sin tipo de contrato</option>
                                {TIPOS_CONTRATO.map((tipo) => (
                                    <option key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Check
                                type="checkbox"
                                label="Activa"
                                name="activa"
                                checked={formData.activa}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-between">
                            {isEditing && (
                                <Button
                                    variant="danger"
                                    onClick={() => deleteEstructura(editId)}
                                >
                                    Eliminar
                                </Button>
                            )}
                            <div>
                                <Button
                                    variant="secondary"
                                    onClick={() => { setShowModal(false); resetForm(); }}
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
        </div>
    );
};

export default Estructura;