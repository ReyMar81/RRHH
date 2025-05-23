import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Modal, Form } from "react-bootstrap";

const Cargos = () => {
    const [cargos, setCargos] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [showCargoDepartamentoModal, setShowCargoDepartamentoModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        nombre: "",
        tipo_pago: "",
        salario: "",
        horas_por_dia: "",
        horario_inicio: "",
        horario_fin: "",
    });
    const [cargoDepartamentoData, setCargoDepartamentoData] = useState({
        id_cargo: null,
        id_departamento: "",
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

    // Obtener departamentos desde el backend
    const fetchDepartamentos = async () => {
        try {
            const response = await apiClient.get("departamentos/");
            setDepartamentos(response.data);
        } catch (error) {
            console.error("Error al obtener los departamentos:", error);
        }
    };

    // Manejar cambios en el formulario de cargo
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Manejar cambios en el formulario de cargo_departamento
    const handleCargoDepartamentoChange = (e) => {
        const { name, value } = e.target;
        setCargoDepartamentoData({ ...cargoDepartamentoData, [name]: value });
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
            let cargoId;
            if (isEditing) {
                await apiClient.put(`cargos/${formData.id}/`, dataToSend);
                cargoId = formData.id;
            } else {
                const response = await apiClient.post("cargos/", dataToSend);
                cargoId = response.data.id;
            }

            fetchCargos();
            setShowModal(false);
            resetForm();
            setIsEditing(false);

            // Abrir el modal para crear cargos_departamentos
            setCargoDepartamentoData({ id_cargo: cargoId, id_departamento: "" });
            setShowCargoDepartamentoModal(true);
        } catch (error) {
            console.error("Error al guardar el cargo:", error);
        }
    };

    // Crear un registro en cargos_departamentos
    const handleCargoDepartamentoSubmit = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post("cargos_departamentos/", cargoDepartamentoData);
            setShowCargoDepartamentoModal(false);
            setCargoDepartamentoData({ id_cargo: null, id_departamento: "" });
        } catch (error) {
            console.error("Error al guardar la relación cargo-departamento:", error);
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

    // Reiniciar el formulario
    const resetForm = () => {
        setFormData({
            id: null,
            nombre: "",
            tipo_pago: "",
            salario: "",
            horas_por_dia: "",
            horario_inicio: "",
            horario_fin: "",
        });
    };

    useEffect(() => {
        fetchCargos();
        fetchDepartamentos();
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
                            <td>{cargo.tipo_pago.charAt(0).toUpperCase() + cargo.tipo_pago.slice(1)}</td>
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
                                type="text"
                                name="salario"
                                value={formData.salario}
                                onChange={handleChange}
                                inputMode="decimal"
                                pattern="^\d+(\.\d{1,2})?$"
                                placeholder="Ingrese el salario (ej. 1500.50)"
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Horas por Día</Form.Label>
                            <Form.Control
                                type="text"
                                name="horas_por_dia"
                                value={formData.horas_por_dia}
                                onChange={handleChange}
                                inputMode="decimal"
                                pattern="^\d+(\.\d{1,2})?$"
                                placeholder="Ingrese las horas (ej. 8.5)"
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

            {/* Modal para crear cargos_departamentos */}
            <Modal
                show={showCargoDepartamentoModal}
                onHide={() => setShowCargoDepartamentoModal(false)}
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title>Asignar Departamento al Cargo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleCargoDepartamentoSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Departamento</Form.Label>
                            <Form.Select
                                name="id_departamento"
                                value={cargoDepartamentoData.id_departamento}
                                onChange={handleCargoDepartamentoChange}
                                required
                            >
                                <option value="">Seleccione un departamento</option>
                                {departamentos.map((departamento) => (
                                    <option key={departamento.id} value={departamento.id}>
                                        {departamento.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Asignar
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Cargos;