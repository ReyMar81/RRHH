import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Modal, Form, Pagination } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

const Contratos = () => {
    const [contratos, setContratos] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [cargos, setCargos] = useState([]);
    const [formData, setFormData] = useState({
        tipo_contrato: "",
        fecha_inicio: "",
        fecha_fin: "",
        salario_personalizado: "",
        estado: "",
        observaciones: "",
        empleado: "",
        cargo_departamento: "",
    });
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);
    const [pagina, setPagina] = useState(1);
    const [busqueda, setBusqueda] = useState(""); // Nuevo estado para el filtro de texto
    const porPagina = 10;

    // Obtener el id de la empresa desde localStorage
    const empresaId = localStorage.getItem("empresa_id");

    // Obtener contratos
    const fetchContratos = async () => {
        try {
            const response = await apiClient.get(`contratos/?empresa_id=${empresaId}`);
            setContratos(response.data);
        } catch (error) {
            console.error("Error al obtener contratos:", error);
        }
    };

    // Obtener empleados
    const fetchEmpleados = async () => {
        try {
            const response = await apiClient.get(`empleados/?empresa_id=${empresaId}`);
            setEmpleados(response.data);
        } catch (error) {
            console.error("Error al obtener empleados:", error);
        }
    };

    // Obtener cargos
    const fetchCargos = async () => {
        try {
            const response = await apiClient.get(`cargos/?empresa_id=${empresaId}`);
            setCargos(response.data);
        } catch (error) {
            console.error("Error al obtener cargos:", error);
        }
    };

    // Manejar cambios en el formulario
    const handleChange = (e) => {
        const { name, value } = e.target;

        // Limpiar fecha_fin si el tipo de contrato es "INDEFINIDO"
        if (name === "tipo_contrato" && value === "INDEFINIDO") {
            setFormData({ ...formData, [name]: value, fecha_fin: "" });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Crear o editar contrato
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Obtener el salario del cargo seleccionado si no se proporciona un salario personalizado
        const cargoSeleccionado = cargos.find((cargo) => cargo.id === parseInt(formData.cargo_departamento, 10));
        const salarioFinal = formData.salario_personalizado || (cargoSeleccionado ? cargoSeleccionado.salario : null);

        if (!salarioFinal) {
            alert("Debe seleccionar un cargo válido o proporcionar un salario personalizado.");
            return;
        }

        // Validar que la fecha de fin sea opcional solo para contratos indefinidos
        if (formData.tipo_contrato !== "INDEFINIDO" && !formData.fecha_fin) {
            alert("Debe proporcionar una fecha de fin para este tipo de contrato.");
            return;
        }

        try {
            const dataToSend = {
                ...formData,
                fecha_fin: formData.fecha_fin || null, // Enviar null si fecha_fin está vacío
                salario_personalizado: salarioFinal,
                empresa_id: empresaId, // Asociar el contrato a la empresa
            };

            if (isEditing) {
                await apiClient.put(`contratos/${editId}/`, dataToSend);
            } else {
                await apiClient.post("contratos/", dataToSend);
            }

            fetchContratos();
            resetForm();
            setShowModal(false);
        } catch (error) {
            console.error("Error al guardar el contrato:", error);
        }
    };

    // Eliminar contrato
    const deleteContrato = async (id) => {
        if (window.confirm("¿Estás seguro de eliminar este contrato?")) {
            try {
                await apiClient.delete(`contratos/${id}/?empresa_id=${empresaId}`);
                fetchContratos();
            } catch (error) {
                console.error("Error al eliminar contrato:", error);
            }
        }
    };

    // Resetear formulario
    const resetForm = () => {
        setFormData({
            tipo_contrato: "",
            fecha_inicio: "",
            fecha_fin: "",
            salario_personalizado: "",
            estado: "",
            observaciones: "",
            empleado: "",
            cargo_departamento: "",
        });
        setIsEditing(false);
        setEditId(null);
    };

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchContratos();
        fetchEmpleados();
        fetchCargos();
    }, []);

    const generarPDF = (contrato) => {
        const doc = new jsPDF();
        doc.text("Contrato de Trabajo", 10, 10);
        autoTable(doc, {
            startY: 20,
            head: [["Campo", "Valor"]],
            body: [
                ["Empleado", empleados.find(e => e.id === contrato.empleado)?.nombre || ""],
                ["Cargo", cargos.find(c => c.id === contrato.cargo_departamento)?.nombre || ""],
                ["Tipo", contrato.tipo_contrato],
                ["Estado", contrato.estado],
                ["Fecha Inicio", contrato.fecha_inicio],
                ["Fecha Fin", contrato.fecha_fin || "—"],
                ["Salario", contrato.salario_personalizado],
                ["Observaciones", contrato.observaciones],
            ],
        });
        doc.save(`Contrato_${contrato.id}.pdf`);
    };

    // Calcular contratos a mostrar
    const contratosFiltrados = contratos.filter((contrato) => {
        const empleado = empleados.find(e => e.id === contrato.empleado);
        const nombreCompleto = empleado ? `${empleado.nombre} ${empleado.apellidos}`.toLowerCase() : "";
        return nombreCompleto.includes(busqueda.toLowerCase());
    });

    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const contratosPagina = contratosFiltrados.slice(inicio, fin);
    const totalPaginas = Math.ceil(contratosFiltrados.length / porPagina);

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Gestión de Contratos</h1>
            <div className="d-flex justify-content-between mb-3">
                {/* Filtro de búsqueda */}
                <Form.Control
                    type="text"
                    placeholder="Buscar empleado..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-50 mx-3"
                />
                <Button onClick={() => setShowModal(true)}>
                    Crear Contrato
                </Button>
            </div>
            <Table striped bordered hover responsive className="mt-3">
                <thead className="table-primary">
                    <tr>
                        <th>Empleado</th>
                        <th>Cargo</th>
                        <th>Tipo</th>
                        <th>Estado</th>
                        <th>Fecha Inicio</th>
                        <th>Fecha Fin</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {contratosPagina.map((contrato) => (
                        <tr key={contrato.id}>
                            <td>
                                {empleados.find((e) => e.id === contrato.empleado)
                                    ? `${empleados.find((e) => e.id === contrato.empleado).nombre} ${empleados.find((e) => e.id === contrato.empleado).apellidos}`
                                    : "—"}
                            </td>
                            <td>
                                {cargos.find((c) => c.id === contrato.cargo_departamento)?.nombre || "—"}
                            </td>
                            <td>{contrato.tipo_contrato}</td>
                            <td>{contrato.estado}</td>
                            <td>{contrato.fecha_inicio}</td>
                            <td>{contrato.fecha_fin || "—"}</td>
                            <td>
                                <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setEditId(contrato.id);
                                        setFormData(contrato);
                                        setShowModal(true);
                                    }}
                                >
                                    <i className="bi bi-three-dots" style={{ fontSize: "1.5rem" }}></i>
                                </Button>
                                <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() => generarPDF(contrato)}
                                >
                                    <i className="bi bi-file-earmark-pdf" style={{ fontSize: "1.5rem" }}></i>
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

            {/* Modal para crear/editar contrato */}
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
                    <Modal.Title>{isEditing ? "Editar Contrato" : "Crear Contrato"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleSubmit}>
                        {/* Campos del formulario */}
                        <Form.Group className="mb-3">
                            <Form.Label>Empleado</Form.Label>
                            <Form.Control
                                list="empleados-list"
                                name="empleado_nombre"
                                value={
                                    empleados.find(e => String(e.id) === String(formData.empleado))
                                        ? `${empleados.find(e => String(e.id) === String(formData.empleado)).nombre} ${empleados.find(e => String(e.id) === String(formData.empleado)).apellidos}`
                                        : formData.empleado_nombre || ""
                                }
                                onChange={e => {
                                    const texto = e.target.value;
                                    // Buscar si el texto coincide con algún empleado
                                    const emp = empleados.find(
                                        emp =>
                                            `${emp.nombre} ${emp.apellidos}`.toLowerCase() === texto.toLowerCase()
                                    );
                                    if (emp) {
                                        setFormData({ ...formData, empleado: emp.id, empleado_nombre: texto });
                                    } else {
                                        setFormData({ ...formData, empleado: "", empleado_nombre: texto });
                                    }
                                }}
                                required
                                placeholder="Buscar o seleccionar empleado..."
                                autoComplete="off"
                            />
                            <datalist id="empleados-list">
                                {empleados.map((empleado) => (
                                    <option
                                        key={empleado.id}
                                        value={`${empleado.nombre} ${empleado.apellidos}`}
                                    />
                                ))}
                            </datalist>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cargo</Form.Label>
                            <Form.Select
                                name="cargo_departamento"
                                value={formData.cargo_departamento}
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
                            <Form.Label>Tipo de Contrato</Form.Label>
                            <Form.Select
                                name="tipo_contrato"
                                value={formData.tipo_contrato}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione un tipo de contrato</option>
                                <option value="INDEFINIDO">Indefinido</option>
                                <option value="PLAZO FIJO">Plazo fijo</option>
                                <option value="MEDIO TIEMPO">Medio tiempo</option>
                                <option value="PASANTIA">Pasantía</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Estado</Form.Label>
                            <Form.Select
                                name="estado"
                                value={formData.estado}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seleccione un estado</option>
                                <option value="ACTIVO">Activo</option>
                                <option value="FINALIZADO">Finalizado</option>
                                <option value="PENDIENTE">Pendiente</option>
                                <option value="RENOVADO">Renovado</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha Inicio</Form.Label>
                            <Form.Control
                                type="date"
                                name="fecha_inicio"
                                value={formData.fecha_inicio}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                        {/* Mostrar el campo de Fecha Fin solo si el tipo de contrato no es indefinido */}
                        {formData.tipo_contrato !== "INDEFINIDO" && (
                            <Form.Group className="mb-3">
                                <Form.Label>Fecha Fin</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="fecha_fin"
                                    value={formData.fecha_fin}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        )}
                        <Form.Group className="mb-3">
                            <Form.Label>Salario Personalizado</Form.Label>
                            <Form.Control
                                type="number"
                                name="salario_personalizado"
                                value={formData.salario_personalizado}
                                onChange={handleChange}
                                step="0.01"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Observaciones</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="observaciones"
                                value={formData.observaciones}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <div className="d-flex justify-content-between">
                            {isEditing && (
                                <Button
                                    variant="danger"
                                    onClick={() => {
                                        if (window.confirm("¿Estás seguro de eliminar este contrato?")) {
                                            deleteContrato(editId);
                                            setShowModal(false);
                                        }
                                    }}
                                >
                                    Eliminar
                                </Button>
                            )}
                            <div className="d-flex">
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
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Contratos;