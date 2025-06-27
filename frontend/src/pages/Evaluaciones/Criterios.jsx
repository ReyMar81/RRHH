import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Form, Row, Col, Pagination, Alert, Button, Modal } from "react-bootstrap";

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

const Criterios = () => {
    const [criterios, setCriterios] = useState([]);
    const [busqueda, setBusqueda] = useState("");
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
    });

    useEffect(() => {
        fetchCriterios();
    }, []);

    const fetchCriterios = async () => {
        try {
            const res = await apiClient.get("criterios/");
            setCriterios(res.data);
        } catch (err) {
            setError("Error al cargar criterios.");
        }
    };

    const criteriosFiltrados = criterios.filter((c) => {
        if (!busqueda.trim()) return true;
        return (
            (c.nombre && c.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
            (c.descripcion && c.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
        );
    });

    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const criteriosPagina = criteriosFiltrados.slice(inicio, fin);
    const totalPaginas = Math.ceil(criteriosFiltrados.length / porPagina);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const resetForm = () => {
        setFormData({ nombre: "", descripcion: "" });
        setIsEditing(false);
        setEditId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isEditing) {
            await updateCriterio();
        } else {
            await createCriterio();
        }
    };

    const createCriterio = async () => {
        try {
            await apiClient.post("criterios/", formData);
            fetchCriterios();
            resetForm();
            setShowModal(false);
        } catch (err) {
            setError("Error al crear criterio.");
        }
    };

    const updateCriterio = async () => {
        try {
            await apiClient.put(`criterios/${editId}/`, formData);
            fetchCriterios();
            resetForm();
            setShowModal(false);
        } catch (err) {
            setError("Error al actualizar criterio.");
        }
    };

    const deleteCriterio = async (id) => {
        if (!window.confirm("¿Estás seguro de eliminar este criterio?")) return;
        try {
            await apiClient.delete(`criterios/${id}/`);
            fetchCriterios();
            resetForm();
            setShowModal(false);
        } catch (err) {
            setError("Error al eliminar criterio.");
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Criterios de Evaluación</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row className="mb-3">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por nombre o descripción..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </Col>
                <Col md={6} className="text-end">
                    <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
                        Crear Criterio
                    </Button>
                </Col>
            </Row>
            <Table striped bordered hover responsive>
                <thead className="table-primary">
                    <tr>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {criteriosPagina.length === 0 ? (
                        <tr>
                            <td colSpan={3} className="text-center text-muted">
                                No hay criterios.
                            </td>
                        </tr>
                    ) : (
                        criteriosPagina.map((c) => (
                            <tr key={c.id}>
                                <td>{c.nombre}</td>
                                <td>{c.descripcion}</td>
                                <td>
                                    <Button
                                        variant="link"
                                        className="p-0"
                                        onClick={() => {
                                            setIsEditing(true);
                                            setEditId(c.id);
                                            setFormData({ nombre: c.nombre, descripcion: c.descripcion });
                                            setShowModal(true);
                                        }}
                                    >
                                        <i className="bi bi-three-dots" style={{ fontSize: "1.5rem" }}></i>
                                    </Button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
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

            {/* Modal para crear/editar criterio */}
            <Modal
                show={showModal}
                onHide={() => { setShowModal(false); resetForm(); }}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Editar Criterio" : "Crear Criterio"}</Modal.Title>
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
                                placeholder="Nombre del criterio"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="descripcion"
                                value={formData.descripcion}
                                onChange={handleChange}
                                placeholder="Descripción del criterio"
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-between">
                            {isEditing && (
                                <Button
                                    variant="danger"
                                    onClick={() => deleteCriterio(editId)}
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

export default Criterios;