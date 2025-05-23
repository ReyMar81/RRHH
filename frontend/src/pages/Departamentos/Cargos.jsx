import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Modal, Form } from "react-bootstrap";

const Cargos = () => {
    const [cargos, setCargos] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        nombre: "",
        tipo_pago: "",
        salario: "",
        receso_diario: "",
        horario_inicio: "",
        horario_fin: "",
        cargo_padre: "",
    });

    // Obtener cargos desde el backend
    const fetchCargos = async () => {
        try {
            const response = await apiClient.get("cargos/");
            setCargos(response.data);
        } catch (error) {
            console.error("Error al obtener los cargos:", error);
        }
    };

    // Manejar cambios en el formulario de cargo
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Crear o actualizar un cargo
    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSend = {
            ...formData,
            cargo_padre: formData.cargo_padre || null,
        };

        try {
            if (isEditing) {
                await apiClient.put(`cargos/${formData.id}/`, dataToSend);
            } else {
                await apiClient.post("cargos/", dataToSend);
            }
            fetchCargos();
            setShowModal(false);
            resetForm();
            setIsEditing(false);
        } catch (error) {
            console.error("Error al guardar el cargo:", error);
        }
    };

    // Eliminar un cargo
    const handleDelete = async () => {
        if (window.confirm("¿Estás seguro de eliminar este cargo?")) {
            try {
                await apiClient.delete(`cargos/${formData.id}/`);
                fetchCargos();
                setShowModal(false);
            } catch (error) {
                console.error("Error al eliminar el cargo:", error);
            }
        }
    };

    // Abrir el modal para editar un cargo
    const handleEdit = (cargo) => {
        setFormData({
            id: cargo.id,
            nombre: cargo.nombre,
            tipo_pago: cargo.tipo_pago,
            salario: cargo.salario,
            receso_diario: cargo.receso_diario,
            horario_inicio: cargo.horario_inicio,
            horario_fin: cargo.horario_fin,
            cargo_padre: cargo.cargo_padre || "",
        });
        setIsEditing(true);
        setShowModal(true);
    };

    // Reiniciar el formulario
    const resetForm = () => {
        setFormData({
            id: null,
            nombre: "",
            tipo_pago: "",
            salario: "",
            receso_diario: "",
            horario_inicio: "",
            horario_fin: "",
            cargo_padre: "",
        });
    };

    useEffect(() => {
        fetchCargos();
    }, []);

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-primary">Gestión de Cargos</h1>
            <Button variant="primary" onClick={() => { resetForm(); setShowModal(true); }}>
                Crear Cargo
            </Button>
            <Table striped bordered hover responsive className="mt-3">
                <thead className="table-primary">
                    <tr>
                        <th>Nombre</th>
                        <th>Tipo de Pago</th>
                        <th>Salario</th>
                        <th>Receso Diario</th>
                        <th>Horario Inicio</th>
                        <th>Horario Fin</th>
                        <th>Cargo Padre</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {cargos.map((cargo) => (
                        <tr key={cargo.id}>
                            <td>{cargo.nombre}</td>
                            <td>{cargo.tipo_pago.charAt(0).toUpperCase() + cargo.tipo_pago.slice(1)}</td>
                            <td>{cargo.salario}</td>
                            <td>{cargo.receso_diario}</td>
                            <td>{cargo.horario_inicio}</td>
                            <td>{cargo.horario_fin}</td>
                            <td>
                                {cargo.cargo_padre
                                    ? cargos.find(c => c.id === cargo.cargo_padre)?.nombre || "—"
                                    : "—"}
                            </td>
                            <td>
                                <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() => handleEdit(cargo)}
                                >
                                    <i className="bi bi-three-dots" style={{ fontSize: "1.5rem" }}></i>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal para crear/editar cargos */}
            <Modal
                show={showModal}
                onHide={() => {
                    setShowModal(false);
                    setIsEditing(false);
                }}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Editar Cargo" : "Crear Cargo"}</Modal.Title>
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
                            <Form.Label>Tipo de Pago</Form.Label>
                            <Form.Select
                                name="tipo_pago"
                                value={formData.tipo_pago}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione una opción</option>
                                <option value="mensual">Mensual</option>
                                <option value="quincenal">Quincenal</option>
                                <option value="semanal">Semanal</option>
                                <option value="diario">Diario</option>
                                <option value="hora">Por hora</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Salario</Form.Label>
                            <Form.Control
                                type="number"
                                name="salario"
                                value={formData.salario}
                                onChange={handleChange}
                                inputMode="decimal"
                                step="0.01"
                                placeholder="Ingrese el salario (ej. 1500.50)"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Receso Diario (horas)</Form.Label>
                            <Form.Control
                                type="number"
                                name="receso_diario"
                                value={formData.receso_diario}
                                onChange={handleChange}
                                inputMode="decimal"
                                step="0.01"
                                placeholder="Ejemplo: 1.5"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Horario Inicio</Form.Label>
                            <Form.Control
                                type="time"
                                name="horario_inicio"
                                value={formData.horario_inicio}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Horario Fin</Form.Label>
                            <Form.Control
                                type="time"
                                name="horario_fin"
                                value={formData.horario_fin}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cargo Padre (opcional)</Form.Label>
                            <Form.Select
                                name="cargo_padre"
                                value={formData.cargo_padre || ""}
                                onChange={handleChange}
                            >
                                <option value="">Sin cargo padre</option>
                                {cargos
                                    .filter(c => c.id !== formData.id)
                                    .map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.nombre}
                                        </option>
                                    ))}
                            </Form.Select>
                        </Form.Group>
                        <div className="d-flex justify-content-between">
                            {isEditing && (
                                <Button variant="danger" onClick={handleDelete}>
                                    Eliminar
                                </Button>
                            )}
                            <Button variant="primary" type="submit">
                                {isEditing ? "Actualizar" : "Crear"}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Cargos;