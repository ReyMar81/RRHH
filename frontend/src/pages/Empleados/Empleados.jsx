import React, { useEffect, useState } from "react";
import { Apiurl } from "../../services/Apirest";
import axios from "axios";
import { Modal, Button, Form, Table } from "react-bootstrap";

const Empleados = () => {
    const [empleados, setEmpleados] = useState([]);
    const [departamentos, setDepartamentos] = useState([]); // Para almacenar los departamentos
    const [formData, setFormData] = useState({
        nombre: "",
        apellidos: "",
        ci: "",
        fecha_nacimiento: "",
        genero: "",
        direccion: "",
        estado_civil: "",
        telefono: "",
        cargo: "",
        correo_personal: "",
        departamento_id: "",
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

    // Obtener el token JWT desde el almacenamiento local
    const getAuthHeaders = () => {
        const token = localStorage.getItem("access_token");
        return {
            Authorization: `Bearer ${token}`,
        };
    };

    // Obtener empleados
    const fetchEmpleados = async () => {
        try {
            const response = await axios.get(`${Apiurl}empleados/`, {
                headers: getAuthHeaders(),
            });
            setEmpleados(response.data);
        } catch (error) {
            console.error("Error al obtener empleados:", error);
        }
    };

    // Obtener departamentos
    const fetchDepartamentos = async () => {
        try {
            const response = await axios.get(`${Apiurl}departamentos/`, {
                headers: getAuthHeaders(),
            });
            setDepartamentos(response.data);
        } catch (error) {
            console.error("Error al obtener departamentos:", error);
        }
    };

    // Crear empleado
    const createEmpleado = async () => {
        try {
            await axios.post(`${Apiurl}empleados/`, formData, {
                headers: getAuthHeaders(),
            });
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
            await axios.put(`${Apiurl}empleados/${editId}/`, formData, {
                headers: getAuthHeaders(),
            });
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
            await axios.delete(`${Apiurl}empleados/${id}/`, {
                headers: getAuthHeaders(),
            });
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
            cargo: "",
            correo_personal: "",
            departamento_id: "",
        });
    };

    // Cargar empleados y departamentos al montar el componente
    useEffect(() => {
        fetchEmpleados();
        fetchDepartamentos();
    }, []);

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-primary">Gestión de Empleados</h1>
            <div className="d-flex justify-content-end mb-3">
                <Button variant="primary" onClick={() => setShowModal(true)}>
                    Crear Empleado
                </Button>
            </div>
            <Table striped bordered hover responsive className="table-sm">
                <thead className="table-primary">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Apellidos</th>
                        <th>CI</th>
                        <th>Fecha Nacimiento</th>
                        <th>Género</th>
                        <th>Dirección</th>
                        <th>Estado Civil</th>
                        <th>Teléfono</th>
                        <th>Cargo</th>
                        <th>Correo Personal</th>
                        <th>Departamento</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map((empleado) => (
                        <tr key={empleado.id}>
                            <td>{empleado.id}</td>
                            <td>{empleado.nombre}</td>
                            <td>{empleado.apellidos}</td>
                            <td>{empleado.ci}</td>
                            <td>{empleado.fecha_nacimiento}</td>
                            <td>{empleado.genero}</td>
                            <td>{empleado.direccion}</td>
                            <td>{empleado.estado_civil}</td>
                            <td>{empleado.telefono}</td>
                            <td>{empleado.cargo}</td>
                            <td>{empleado.correo_personal}</td>
                            <td>
                                {
                                    departamentos.find(
                                        (dep) => dep.id === empleado.departamento_id
                                    )?.nombre || "Sin Departamento"
                                }
                            </td>
                            <td>
                                <div className="d-flex gap-2">
                                    <Button
                                        variant="warning"
                                        size="sm"
                                        onClick={() => {
                                            setIsEditing(true);
                                            setEditId(empleado.id);
                                            setFormData({ ...empleado });
                                            setShowModal(true);
                                        }}
                                    >
                                        Editar
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => deleteEmpleado(empleado.id)}
                                    >
                                        Eliminar
                                    </Button>
                                </div>
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
                            {/* Primera columna */}
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

                            {/* Segunda columna */}
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

                        {/* Tercera fila */}
                        <div className="row">
                            <div className="col-md-6">
                                <Form.Group className="mb-3">
                                    <Form.Label>Cargo</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="cargo"
                                        placeholder="Cargo"
                                        value={formData.cargo}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </div>
                            <div className="col-md-6">
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

                        {/* Última fila */}
                        <div className="row">
                            <div className="col-md-12">
                                <Form.Group className="mb-3">
                                    <Form.Label>Departamento</Form.Label>
                                    <Form.Select
                                        name="departamento_id"
                                        value={formData.departamento_id}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione un departamento</option>
                                        {departamentos.map((departamento) => (
                                            <option key={departamento.id} value={departamento.id}>
                                                {departamento.nombre}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </div>
                        </div>

                        <div className="d-flex justify-content-end">
                            <Button variant="secondary" onClick={() => setShowModal(false)} className="me-2">
                                Cancelar
                            </Button>
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

export default Empleados;