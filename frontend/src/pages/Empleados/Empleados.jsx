import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Modal, Button, Form, Table, Pagination } from "react-bootstrap";

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
        cuenta_bancaria: "", // Nuevo campo
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [busqueda, setBusqueda] = useState(""); // Nuevo estado para el filtro de texto

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

    // Obtener el id de la empresa desde localStorage
    const empresaId = localStorage.getItem("empresa_id");

    // Obtener empleados
    const fetchEmpleados = async () => {
        try {
            const response = await apiClient.get(`empleados/?empresa_id=${empresaId}`);
            setEmpleados(response.data);
            setTotalPaginas(Math.ceil(response.data.length / 10)); // Suponiendo 10 empleados por página
        } catch (error) {
            console.error("Error al obtener empleados:", error);
        }
    };

    // Obtener departamentos
    const fetchDepartamentos = async () => {
        try {
            const response = await apiClient.get(`departamentos/?empresa_id=${empresaId}`);
            setDepartamentos(response.data);
        } catch (error) {
            console.error("Error al obtener departamentos:", error);
        }
    };

    // Obtener contratos
    const fetchContratos = async () => {
        try {
            const response = await apiClient.get(`contratos/?empresa_id=${empresaId}`);
            setContratos(response.data);
        } catch (error) {
            console.error("Error al obtener contratos:", error);
        }
    };

    // Filtrar empleados por departamento y búsqueda
    const filterEmpleados = () => {
        let empleadosFiltrados = empleados;
        if (selectedDepartamento) {
            empleadosFiltrados = empleadosFiltrados.filter((empleado) =>
                contratos.some(
                    (contrato) =>
                        contrato.empleado === empleado.id &&
                        contrato.cargo_departamento === parseInt(selectedDepartamento)
                )
            );
        }
        if (busqueda.trim() !== "") {
            empleadosFiltrados = empleadosFiltrados.filter((empleado) =>
                `${empleado.nombre} ${empleado.apellidos}`.toLowerCase().includes(busqueda.toLowerCase())
            );
        }
        setFilteredEmpleados(empleadosFiltrados);
    };

    // Manejar cambios en el filtro de departamento
    const handleDepartamentoChange = (e) => {
        setSelectedDepartamento(e.target.value);
    };

    // Crear empleado
    const createEmpleado = async () => {
        try {
            await apiClient.post("empleados/", { ...formData, empresa_id: empresaId });
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
            await apiClient.put(`empleados/${editId}/`, { ...formData, empresa_id: empresaId });
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
            await apiClient.delete(`empleados/${id}/?empresa_id=${empresaId}`);
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
            cuenta_bancaria: "", // Nuevo campo
        });
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchEmpleados();
        fetchDepartamentos();
        fetchContratos();
    }, []);

    // Actualizar empleados filtrados cuando cambie el departamento, empleados o búsqueda
    useEffect(() => {
        filterEmpleados();
    }, [selectedDepartamento, empleados, busqueda]);

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
                {/* Filtro de búsqueda */}
                <Form.Control
                    type="text"
                    placeholder="Buscar empleado..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-50 mx-3"
                />
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
                    {filteredEmpleados.slice((paginaActual - 1) * 10, paginaActual * 10).map((empleado) => (
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

            {/* Paginación */}
            <div className="d-flex justify-content-center mb-4">
                <Pagination>
                    <Pagination.First onClick={() => setPaginaActual(1)} />
                    <Pagination.Prev onClick={() => setPaginaActual((prev) => Math.max(prev - 1, 1))} />
                    {getPaginationItems(paginaActual, totalPaginas).map((item, index) =>
                        item === "..." ? (
                            <Pagination.Ellipsis key={index} />
                        ) : (
                            <Pagination.Item
                                key={index}
                                active={item === paginaActual}
                                onClick={() => setPaginaActual(item)}
                            >
                                {item}
                            </Pagination.Item>
                        )
                    )}
                    <Pagination.Next onClick={() => setPaginaActual((prev) => Math.min(prev + 1, totalPaginas))} />
                    <Pagination.Last onClick={() => setPaginaActual(totalPaginas)} />
                </Pagination>
            </div>

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
                        <div className="row">
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <Form.Group className="mb-3">
                                    <Form.Label>Cuenta Bancaria</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="cuenta_bancaria"
                                        placeholder="Cuenta Bancaria"
                                        value={formData.cuenta_bancaria}
                                        onChange={handleChange}
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