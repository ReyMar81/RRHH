import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Modal, Form, Pagination } from "react-bootstrap";

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

    // PAGINACIÓN
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const tiposPagina = tipos.slice(inicio, fin);
    const totalPaginas = Math.ceil(tipos.length / porPagina);

    // Obtener el id de la empresa desde localStorage
    const empresaId = localStorage.getItem("empresa_id");

    // Obtener tipos desde el backend
    const fetchTipos = async () => {
        try {
            const response = await apiClient.get(`tipos/?empresa_id=${empresaId}`);
            setTipos(response.data);
        } catch (error) {
            console.error("Error al obtener tipos:", error);
        }
    };

    // Crear o editar tipo
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            empresa_id: empresaId, // Asociar el tipo a la empresa
        };

        try {
            if (isEditing) {
                await apiClient.put(`tipos/${editId}/`, payload);
                setMessage("Tipo actualizado con éxito.");
            } else {
                await apiClient.post("tipos/", payload);
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
                await apiClient.delete(`tipos/${id}/?empresa_id=${empresaId}`);
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
            <h1 className="mb-4 ">Gestión de Tipos</h1>
            <div className="d-flex justify-content-between mb-3">
                <Button onClick={() => setShowModal(true)}>
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
                    {tiposPagina.map((tipo) => (
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
            {/* Paginación estética */}
            {totalPaginas > 1 && (
                <Pagination className="justify-content-center">
                    <Pagination.Prev
                        onClick={() => setPagina(pagina - 1)}
                        disabled={pagina === 1}
                    />
                    {getPaginationItems(pagina, totalPaginas).map((item, idx) =>
                        item === "..." ? (
                            <Pagination.Ellipsis key={idx} disabled />
                        ) : (
                            <Pagination.Item
                                key={item}
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