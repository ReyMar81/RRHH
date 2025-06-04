import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Modal, Button, Form, Table } from "react-bootstrap";

const Empleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [contratos, setContratos] = useState([]);
    const [selectedDepartamento, setSelectedDepartamento] = useState("");
    const [filteredEmpleados, setFilteredEmpleados] = useState([]);
    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        ci: "",
        fecha_nacimiento: "",
        genero: "",
        direccion: "",
        estado_civil: "",
        telefono: "",
        correo_personal: "",
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Opciones estáticas para género y estado civil
    const generoChoices = [
        { value: "M", label: "Masculino" },
        { value: "F", label: "Femenino" },
    ];

    const estadoCivilChoices = [
        { value: "S", label: "Soltero/a" },
        { value: "C", label: "Casado/a" },
        { value: "V", label: "Viudo/a" },
    ];

    // Obtener empleados
    const fetchEmpleados = async () => {
        try {
            const response = await apiClient.get("empleados/");
            setEmpleados(response.data);
        } catch (error) {
            console.error("Error al obtener empleados:", error);
        }
    };

    // Obtener departamentos
    const fetchDepartamentos = async () => {
        try {
            const response = await apiClient.get("departamentos/");
            setDepartamentos(response.data);
        } catch (error) {
            console.error("Error al obtener departamentos:", error);
        }
    };

    // Obtener contratos
    const fetchContratos = async () => {
        try {
            const response = await apiClient.get("contratos/");
            setContratos(response.data);
        } catch (error) {
            console.error("Error al obtener contratos:", error);
        }
    };

    // Filtrar empleados por departamento
    const filterEmpleadosByDepartamento = () => {
        if (!selectedDepartamento) {
            setFilteredEmpleados(empleados);
        } else {
            const empleadosFiltrados = empleados.filter((empleado) =>
                contratos.some(
                    (contrato) =>
                        contrato.empleado === empleado.id &&
                        contrato.cargo_departamento === parseInt(selectedDepartamento)
                )
            );
            setFilteredEmpleados(empleadosFiltrados);
        }
    };

    // Manejar cambios en el filtro de departamento
    const handleDepartamentoChange = (e) => {
        setSelectedDepartamento(e.target.value);
    };

    // Crear empleado
    const createEmpleado = async () => {
        try {
            await apiClient.post("empleados/", formData);
            fetchEmpleados();
            resetForm();
            setShowModal(false);
        } catch (error) {
            console.error("Error al crear empleado:", error);
        }
    };

    // Editar empleado
    const updateEmpleado = async () => {
        try {
            await apiClient.put(`empleados/${editId}/`, formData);
            fetchEmpleados();
            resetForm();
            setIsEditing(false);
            setEditId(null);
            setShowModal(false);
        } catch (error) {
            console.error("Error al actualizar empleado:", error);
        }
    };

    // Eliminar empleado
    const deleteEmpleado = async (id) => {
        try {
            await apiClient.delete(`empleados/${id}/`);
            fetchEmpleados();
        } catch (error) {
            console.error("Error al eliminar empleado:", error);
        }
    };

    // Manejar el envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            updateEmpleado();
        } else {
            createEmpleado();
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
            apellidos: "",
            ci: "",
            fecha_nacimiento: "",
            genero: "",
            direccion: "",
            estado_civil: "",
            telefono: "",
            correo_personal: "",
        });
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchEmpleados();
        fetchDepartamentos();
        fetchContratos();
    }, []);

    // Actualizar empleados filtrados cuando cambie el departamento seleccionado o los empleados
    useEffect(() => {
        filterEmpleadosByDepartamento();
    }, [selectedDepartamento, empleados]);

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Gestión de Empleados</h1>
            <div className="d-flex justify-content-between mb-3">
                <Form.Select
                    value={selectedDepartamento}
                    onChange={handleDepartamentoChange}
                    className="w-25"
                >
                    <option value="">Todos los Departamentos</option>
                    {departamentos.map((departamento) => (
                        <option key={departamento.id} value={departamento.id}>
                            {departamento.nombre}
                        </option>
                    ))}
                </Form.Select>
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    Crear Empleado
                </Button>
            </div>
            <Table striped bordered hover responsive className="table-sm">
                <thead className="table-primary">
                    <tr>
                        <th>Nombre</th>
                        <th>Apellidos</th>
                        <th>Teléfono</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredEmpleados.map((empleado) => (
                        <tr key={empleado.id}>
                            <td>{empleado.nombre}</td>
                            <td>{empleado.apellidos}</td>
                            <td>{empleado.telefono}</td>
                            <td>
                                <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setEditId(empleado.id);
                                        setFormData(empleado);
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

            {/* Modal para crear/editar empleados */}
            <Modal
                show={showModal}
                onHide={() => setShowModal(false)}
                centered
                backdrop="static"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{isEditing ? "Editar Empleado" : "Crear Empleado"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Nombre</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="nombre"
                                        placeholder="Nombre"
                                        value={formData.nombre}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Apellidos</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="apellidos"
                                        placeholder="Apellidos"
                                        value={formData.apellidos}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>CI</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="ci"
                                        placeholder="CI"
                                        value={formData.ci}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fecha de Nacimiento</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="fecha_nacimiento"
                                        value={formData.fecha_nacimiento}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Género</Form.Label>
                                    <Form.Select
                                        name="genero"
                                        value={formData.genero}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione una opción</option>
                                        {generoChoices.map((choice) => (
                                            <option key={choice.value} value={choice.value}>
                                                {choice.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Dirección</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="direccion"
                                        placeholder="Dirección"
                                        value={formData.direccion}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Estado Civil</Form.Label>
                                    <Form.Select
                                        name="estado_civil"
                                        value={formData.estado_civil}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Seleccione una opción</option>
                                        {estadoCivilChoices.map((choice) => (
                                            <option key={choice.value} value={choice.value}>
                                                {choice.label}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Teléfono</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="telefono"
                                        placeholder="Teléfono"
                                        value={formData.telefono}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <Form.Group className="mb-3">
                                    <Form.Label>Correo Personal</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="correo_personal"
                                        placeholder="Correo Personal"
                                        value={formData.correo_personal}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between">
                            {isEditing && (
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        if (
                                            window.confirm(
                                                `¿Estás seguro de que deseas eliminar a ${formData.nombre} ${formData.apellidos}?`
                                            )
                                        ) {
                                            deleteEmpleado(editId);
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
        </div>
    );
};

export default Empleados;