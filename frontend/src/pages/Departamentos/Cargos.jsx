import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Modal, Form } from "react-bootstrap";

const Cargos = () => {
    const [cargos, setCargos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        nombre: "",
        tipo_pago: "",
        salario: "",
        horas_por_dia: "", // Manejado como número en el frontend
        horario_inicio: "",
        horario_fin: "",
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

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Convertir horas_por_dia a formato HH:MM:SS para el backend
    const convertHorasPorDiaToBackend = (horas) => {
        const horasEnteras = Math.floor(horas);
        const minutos = Math.round((horas - horasEnteras) * 60);
        return `${horasEnteras.toString().padStart(2, "0")}:${minutos
            .toString()
            .padStart(2, "0")}:00`;
    };

    // Crear o actualizar un cargo
    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSend = {
            ...formData,
            horas_por_dia: convertHorasPorDiaToBackend(formData.horas_por_dia),
        };

        try {
            if (isEditing) {
                await apiClient.put(`cargos/${formData.id}/`, dataToSend);
            } else {
                await apiClient.post("cargos/", dataToSend);
            }
            fetchCargos();
            setShowModal(false);
            setFormData({
                id: null,
                nombre: "",
                tipo_pago: "",
                salario: "",
                horas_por_dia: "",
                horario_inicio: "",
                horario_fin: "",
            });
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
            ...cargo,
            horas_por_dia: parseFloat(cargo.horas_por_dia.split(":")[0]), // Convertir a número
        });
        setIsEditing(true);
        setShowModal(true);
    };

    useEffect(() => {
        fetchCargos();
    }, []);

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-primary">Gestión de Cargos</h1>
            <Button variant="primary" onClick={() => setShowModal(true)}>
                Crear Cargo
            </Button>
            <Table striped bordered hover responsive className="mt-3">
                <thead className="table-primary">
                    <tr>
                        <th>Nombre</th>
                        <th>Tipo de Pago</th>
                        <th>Salario</th>
                        <th>Horas por Día</th>
                        <th>Horario Inicio</th>
                        <th>Horario Fin</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {cargos.map((cargo) => (
                        <tr key={cargo.id}>
                            <td>{cargo.nombre}</td>
                            <td>{cargo.tipo_pago}</td>
                            <td>{cargo.salario}</td>
                            <td>{cargo.horas_por_dia}</td>
                            <td>{cargo.horario_inicio}</td>
                            <td>{cargo.horario_fin}</td>
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
                            <Form.Control
                                type="text"
                                name="tipo_pago"
                                value={formData.tipo_pago}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Salario</Form.Label>
                            <Form.Control
                                type="number"
                                name="salario"
                                value={formData.salario}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Horas por Día</Form.Label>
                            <Form.Control
                                type="number"
                                name="horas_por_dia"
                                value={formData.horas_por_dia}
                                onChange={handleChange}
                                step="0.1"
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