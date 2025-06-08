import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Modal, Form } from "react-bootstrap";

const CargosDepartamentos = () => {
    const [cargosDepartamentos, setCargosDepartamentos] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        id_cargo: "",
        id_departamento: "",
    });

    // Obtener el id de la empresa desde localStorage
    const empresaId = localStorage.getItem("empresa_id");

    // Obtener relaciones cargos-departamentos desde el backend
    const fetchCargosDepartamentos = async () => {
        try {
            const response = await apiClient.get(`cargos_departamentos/?empresa_id=${empresaId}`);
            setCargosDepartamentos(response.data);
        } catch (error) {
            console.error("Error al obtener los cargos-departamentos:", error);
        }
    };

    // Obtener cargos desde el backend
    const fetchCargos = async () => {
        try {
            const response = await apiClient.get(`cargos/?empresa_id=${empresaId}`);
            setCargos(response.data);
        } catch (error) {
            console.error("Error al obtener los cargos:", error);
        }
    };

    // Obtener departamentos desde el backend
    const fetchDepartamentos = async () => {
        try {
            const response = await apiClient.get(`departamentos/?empresa_id=${empresaId}`);
            setDepartamentos(response.data);
        } catch (error) {
            console.error("Error al obtener los departamentos:", error);
        }
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Crear o actualizar una relación cargo-departamento
    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSend = {
            ...formData,
            empresa_id: empresaId, // Asociar la relación a la empresa
        };

        try {
            if (isEditing) {
                await apiClient.put(`cargos_departamentos/${formData.id}/`, dataToSend);
            } else {
                await apiClient.post("cargos_departamentos/", dataToSend);
            }
            fetchCargosDepartamentos();
            setShowModal(false);
            resetForm();
        } catch (error) {
            console.error("Error al guardar el cargo-departamento:", error);
        }
    };

    // Eliminar una relación cargo-departamento
    const handleDelete = async () => {
        if (window.confirm("¿Estás seguro de eliminar esta relación?")) {
            try {
                await apiClient.delete(`cargos_departamentos/${formData.id}/?empresa_id=${empresaId}`);
                fetchCargosDepartamentos();
                setShowModal(false);
                resetForm();
            } catch (error) {
                console.error("Error al eliminar el cargo-departamento:", error);
            }
        }
    };

    // Abrir el modal para editar
    const handleEdit = (cargoDepartamento) => {
        setFormData({
            id: cargoDepartamento.id,
            id_cargo: cargoDepartamento.id_cargo,
            id_departamento: cargoDepartamento.id_departamento,
        });
        setIsEditing(true);
        setShowModal(true);
    };

    // Reiniciar el formulario
    const resetForm = () => {
        setFormData({
            id: null,
            id_cargo: "",
            id_departamento: "",
        });
        setIsEditing(false);
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchCargosDepartamentos();
        fetchCargos();
        fetchDepartamentos();
    }, []);

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Gestión de Cargos-Departamentos</h1>
            <Button onClick={() => setShowModal(true)}>
                Crear Relación
            </Button>
            <Table striped bordered hover responsive className="mt-3">
                <thead className="table-primary">
                    <tr>
                        <th>Cargo</th>
                        <th>Departamento</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {cargosDepartamentos.map((relacion) => (
                        <tr key={relacion.id}>
                            <td>
                                {cargos.find((cargo) => cargo.id === relacion.id_cargo)?.nombre || "—"}
                            </td>
                            <td>
                                {departamentos.find((dep) => dep.id === relacion.id_departamento)?.nombre || "—"}
                            </td>
                            <td>
                                <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() => handleEdit(relacion)}
                                >
                                    <i className="bi bi-three-dots" style={{ fontSize: "1.5rem" }}></i>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal para crear/editar */}
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
                    <Modal.Title>{isEditing ? "Editar Relación" : "Crear Relación"}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Cargo</Form.Label>
                            <Form.Select
                                name="id_cargo"
                                value={formData.id_cargo}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione un cargo</option>
                                {cargos.map((cargo) => (
                                    <option key={cargo.id} value={cargo.id}>
                                        {cargo.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Departamento</Form.Label>
                            <Form.Select
                                name="id_departamento"
                                value={formData.id_departamento}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione un departamento</option>
                                {departamentos.map((dep) => (
                                    <option key={dep.id} value={dep.id}>
                                        {dep.nombre}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        {isEditing && (
                            <Button
                                variant="danger"
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            `¿Estás seguro de que deseas eliminar esta relación?`
                                        )
                                    ) {
                                        handleDelete();
                                    }
                                }}
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
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default CargosDepartamentos;