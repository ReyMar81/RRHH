import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/Apirest";
import { Modal, Button, Form, Table, Pagination } from "react-bootstrap";

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

const Departamentos = () => {
    const [departamentos, setDepartamentos] = useState([]);
    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // PAGINACIÓN
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const departamentosPagina = departamentos.slice(inicio, fin);
    const totalPaginas = Math.ceil(departamentos.length / porPagina);

    const navigate = useNavigate();
    const empresaId = localStorage.getItem("empresa_id");

    // Obtener departamentos desde el backend
    const fetchDepartamentos = async () => {
        try {
            const response = await apiClient.get(`departamentos/?empresa_id=${empresaId}`);
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
            empresa_id: empresaId, // Asociar el departamento a la empresa
        };

        try {
            if (isEditing) {
                await apiClient.put(`departamentos/${editId}/`, payload);
            } else {
                await apiClient.post("departamentos/", payload);
            }

            fetchDepartamentos();
            resetForm();
            setShowModal(false);
        } catch (error) {
            console.error("Error al guardar el departamento:", error);
        }
    };

    // Eliminar departamento
    const deleteDepartamento = async (id) => {
        try {
            await apiClient.delete(`departamentos/${id}/?empresa_id=${empresaId}`);
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
            <h1 className="mb-4">Gestión de Departamentos</h1>
            <div className="d-flex justify-content-between mb-3">
                <Button onClick={() => setShowModal(true)}>
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
                    {departamentosPagina.map((departamento) => (
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