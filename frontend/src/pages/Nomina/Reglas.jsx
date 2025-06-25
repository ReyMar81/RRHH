import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Modal, Form, Pagination } from "react-bootstrap";

const TIPO_REGLA = [
    { value: "ingreso", label: "Ingreso" },
    { value: "deduccion", label: "Deducción" },
    { value: "bono", label: "Bono" },
    { value: "hora_extra", label: "Hora Extra" },
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

const Reglas = () => {
    const [reglas, setReglas] = useState([]);
    const [estructuras, setEstructuras] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [formData, setFormData] = useState({
        nombre: "",
        codigo: "",
        tipo: "",
        secuencia: 10,
        condicion: "",
        formula: "",
        estructura: "",
    });
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;

    const empresaId = localStorage.getItem("empresa_id");

    // Obtener reglas y estructuras salariales
    const fetchReglas = async () => {
        try {
            const response = await apiClient.get(`reglas/?empresa_id=${empresaId}`);
            setReglas(response.data);
        } catch (error) {
            console.error("Error al obtener reglas:", error);
        }
    };

    const fetchEstructuras = async () => {
        try {
            const response = await apiClient.get(`estructuras/?empresa_id=${empresaId}`);
            setEstructuras(response.data);
        } catch (error) {
            console.error("Error al obtener estructuras:", error);
        }
    };

    useEffect(() => {
        fetchReglas();
        fetchEstructuras();
    }, []);

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            nombre: "",
            codigo: "",
            tipo: "",
            secuencia: 10,
            condicion: "",
            formula: "",
            estructura: "",
        });
        setIsEditing(false);
        setEditId(null);
    };

    // Crear o editar regla
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            empresa: empresaId,
        };
        try {
            if (isEditing) {
                await apiClient.put(`reglas/${editId}/`, payload);
            } else {
                await apiClient.post("reglas/", payload);
            }
            fetchReglas();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error("Error al guardar la regla:", error);
        }
    };

    // Eliminar regla
    const deleteRegla = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar esta regla?")) {
            try {
                await apiClient.delete(`reglas/${id}/?empresa_id=${empresaId}`);
                fetchReglas();
            } catch (error) {
                console.error("Error al eliminar la regla:", error);
            }
        }
    };

    // Abrir modal para editar
    const handleEdit = (regla) => {
        setFormData({
            nombre: regla.nombre,
            codigo: regla.codigo,
            tipo: regla.tipo,
            secuencia: regla.secuencia,
            condicion: regla.condicion,
            formula: regla.formula,
            estructura: regla.estructura,
        });
        setIsEditing(true);
        setEditId(regla.id);
        setShowModal(true);
    };

    // Calcular reglas a mostrar
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const reglasPagina = reglas.slice(inicio, fin);
    const totalPaginas = Math.ceil(reglas.length / porPagina);

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Reglas Salariales</h1>
            <Button onClick={() => { resetForm(); setShowModal(true); }}>
                Crear Regla
            </Button>
            <Table striped bordered hover responsive className="mt-3">
                <thead className="table-primary">
                    <tr>
                        <th>Nombre</th>
                        <th>Código</th>
                        <th>Tipo</th>
                        <th>Estructura</th>
                        <th>Secuencia</th>
                        <th>Condición</th>
                        <th>Fórmula</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {reglasPagina.map((regla) => (
                        <tr key={regla.id}>
                            <td>{regla.nombre}</td>
                            <td>{regla.codigo}</td>
                            <td>{TIPO_REGLA.find(t => t.value === regla.tipo)?.label || regla.tipo}</td>
                            <td>
                                {estructuras.find(e => e.id === regla.estructura)?.nombre || regla.estructura}
                            </td>
                            <td>{regla.secuencia}</td>
                            <td>
                                <span style={{ fontSize: "0.9em" }}>
                                    {regla.condicion || <span className="text-muted">Siempre</span>}
                                </span>
                            </td>
                            <td>
                                <span style={{ fontSize: "0.9em" }}>{regla.formula}</span>
                            </td>
                            <td>
                                <Button
                                    variant="link"
                                    className="p-0 me-2"
                                    onClick={() => handleEdit(regla)}
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

            {/* Modal para crear/editar regla */}
            <Modal
                show={showModal}
                onHide={() => { setShowModal(false); resetForm(); }}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Editar Regla" : "Crear Regla"}</Modal.Title>
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
                            <Form.Label>Código</Form.Label>
                            <Form.Control
                                type="text"
                                name="codigo"
                                value={formData.codigo}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo</Form.Label>
                            <Form.Select
                                name="tipo"
                                value={formData.tipo}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione un tipo</option>
                                {TIPO_REGLA.map((tipo) => (
                                    <option key={tipo.value} value={tipo.value}>
                                        {tipo.label}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Estructura Salarial</Form.Label>
                            <Form.Select
                                name="estructura"
                                value={formData.estructura}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione una estructura</option>
                                {estructuras.map((estructura) => (
                                    <option key={estructura.id} value={estructura.id}>
                                        {estructura.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Secuencia</Form.Label>
                            <Form.Control
                                type="number"
                                name="secuencia"
                                value={formData.secuencia}
                                onChange={handleChange}
                                min={1}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Condición (opcional)</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="condicion"
                                value={formData.condicion}
                                onChange={handleChange}
                                placeholder="Ejemplo: empleado.cargo == 'Gerente'"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Fórmula</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="formula"
                                value={formData.formula}
                                onChange={handleChange}
                                required
                                placeholder="Ejemplo: salario_base * 0.10"
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-between">
                            {isEditing && (
                                <Button
                                    variant="danger"
                                    onClick={() => deleteRegla(editId)}
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

export default Reglas;