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
        <div className="mt-4 rounded shadow-sm p-4 bg-white">
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
                        {Object.keys(formData).map((key) => (
                            <Form.Group className="mb-3" key={key}>
                                <Form.Label>
                                    {key
                                        .replace(/_/g, " ") // Reemplaza guiones bajos con espacios
                                        .split(" ") // Divide las palabras
                                        .map(
                                            (word) =>
                                                word.charAt(0).toUpperCase() + word.slice(1) // Convierte la primera letra en mayúscula
                                        )
                                        .join(" ")} {/* Une las palabras nuevamente */}
                                </Form.Label>
                                {key === "genero" ? (
                                    <Form.Select
                                        name={key}
                                        value={formData[key]}
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
                                ) : key === "estado_civil" ? (
                                    <Form.Select
                                        name={key}
                                        value={formData[key]}
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
                                ) : key === "departamento_id" ? (
                                    <Form.Select
                                        name={key}
                                        value={formData[key]}
                                        onChange={handleChange}
                                    >
                                        <option value="">Seleccione un departamento</option>
                                        {departamentos.map((departamento) => (
                                            <option key={departamento.id} value={departamento.id}>
                                                {departamento.nombre}
                                            </option>
                                        ))}
                                    </Form.Select>
                                ) : (
                                    <Form.Control
                                        type={key === "fecha_nacimiento" ? "date" : "text"}
                                        name={key}
                                        placeholder={key}
                                        value={formData[key]}
                                        onChange={handleChange}
                                        required={key !== "departamento_id"}
                                    />
                                )}
                            </Form.Group>
                        ))}
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