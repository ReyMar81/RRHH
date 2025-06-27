import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Form, Modal, Alert, Pagination } from "react-bootstrap";

const Nomina = () => {
    const [empleados, setEmpleados] = useState([]);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState("");
    const [boletas, setBoletas] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [generando, setGenerando] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [fechas, setFechas] = useState({
        fecha_inicio: "",
        fecha_fin: "",
    });
    const [busqueda, setBusqueda] = useState(""); // Nuevo filtro de texto
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [showManualModal, setShowManualModal] = useState(false);
    const [manualFechas, setManualFechas] = useState({
        fecha_inicio: "",
        fecha_fin: "",
    });
    const [manualLoading, setManualLoading] = useState(false);

    const empresaId = localStorage.getItem("empresa_id");

    // Obtener empleados
    const fetchEmpleados = async () => {
        try {
            const response = await apiClient.get(`empleados/?empresa_id=${empresaId}`);
            setEmpleados(response.data);
        } catch (error) {
            setError("Error al obtener empleados");
        }
    };

    // Obtener boletas del empleado seleccionado
    const fetchBoletasEmpleado = async (empleadoId) => {
        if (!empleadoId) {
            setBoletas([]);
            return;
        }
        try {
            const response = await apiClient.get(`boletas-empleado/${empleadoId}/`);
            setBoletas(response.data || []);
        } catch (error) {
            setError("Error al obtener boletas del empleado");
        }
    };

    useEffect(() => {
        fetchEmpleados();
    }, []);

    useEffect(() => {
        if (empleadoSeleccionado) {
            fetchBoletasEmpleado(empleadoSeleccionado);
        } else {
            setBoletas([]);
        }
    }, [empleadoSeleccionado]);

    // Manejar cambios en fechas del modal
    const handleFechaChange = (e) => {
        const { name, value } = e.target;
        setFechas({ ...fechas, [name]: value });
    };

    // Generar nómina masiva
    const handleGenerarNomina = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setGenerando(true);
        try {
            await apiClient.post("generar-masiva/", {
                empresa_id: empresaId,
                fecha_inicio: fechas.fecha_inicio,
                fecha_fin: fechas.fecha_fin,
            });
            setSuccess("Nómina generada correctamente.");
            setShowModal(false);
            setFechas({ fecha_inicio: "", fecha_fin: "" });
            // Si hay empleado seleccionado, refresca sus boletas
            if (empleadoSeleccionado) fetchBoletasEmpleado(empleadoSeleccionado);
        } catch (err) {
            setError("Error al generar la nómina.");
        }
        setGenerando(false);
    };

    // Filtrar empleados por nombre/apellido
    const empleadosFiltrados = empleados.filter(emp =>
        `${emp.nombre} ${emp.apellidos}`.toLowerCase().includes(busqueda.toLowerCase())
    );

    // Obtener items de paginación
    const getPaginationItems = (paginaActual, totalPaginas) => {
        const items = [];
        for (let i = 1; i <= totalPaginas; i++) {
            if (i === 1 || i === totalPaginas || (i >= paginaActual - 1 && i <= paginaActual + 1)) {
                items.push(i);
            } else if (items[items.length - 1] !== "...") {
                items.push("...");
            }
        }
        return items;
    };

    // Manejar cambios en fechas del modal manual
    const handleManualFechaChange = (e) => {
        const { name, value } = e.target;
        setManualFechas({ ...manualFechas, [name]: value });
    };

    // Generar nómina manual
    const handleGenerarManual = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setManualLoading(true);
        try {
            await apiClient.post("generar-manual/", {
                empresa_id: empresaId,
                empleado_id: empleadoSeleccionado,
                fecha_inicio: manualFechas.fecha_inicio,
                fecha_fin: manualFechas.fecha_fin,
                cierre_fin_de_mes: false,
            });
            setSuccess("Nómina individual generada correctamente.");
            setShowManualModal(false);
            setManualFechas({ fecha_inicio: "", fecha_fin: "" });
            if (empleadoSeleccionado) fetchBoletasEmpleado(empleadoSeleccionado);
        } catch (err) {
            setError("Error al generar la nómina individual.");
        }
        setManualLoading(false);
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Nómina</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <div className="d-flex mb-3 gap-2">
                <Form.Control
                    type="text"
                    placeholder="Buscar empleado..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="w-50 mx-3"
                />
                <Form.Select
                    value={empleadoSeleccionado}
                    onChange={e => setEmpleadoSeleccionado(e.target.value)}
                    style={{ maxWidth: 300 }}
                >
                    <option value="">Selecciona un empleado</option>
                    {empleadosFiltrados.map(emp => (
                        <option key={emp.id} value={emp.id}>
                            {emp.nombre} {emp.apellidos}
                        </option>
                    ))}
                </Form.Select>
                <Button variant="success" onClick={() => setShowModal(true)}>
                    Generar Nómina
                </Button>
                <Button
                    variant="primary"
                    disabled={!empleadoSeleccionado}
                    onClick={() => setShowManualModal(true)}
                >
                    Generar Nómina Individual
                </Button>
            </div>

            <Table striped bordered hover responsive>
                <thead className="table-primary">
                    <tr>
                        <th>Fecha</th>
                        <th>Estado</th>
                        <th>Total Ingresos</th>
                        <th>Total Deducciones</th>
                        <th>Total Neto</th>
                    </tr>
                </thead>
                <tbody>
                    {boletas.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center text-muted">
                                {empleadoSeleccionado
                                    ? "No hay boletas para este empleado."
                                    : "Seleccione un empleado para ver sus boletas."}
                            </td>
                        </tr>
                    ) : (
                        boletas.map((b) => (
                            <tr key={b.id}>
                                <td>{b.fecha_inicio}</td>
                                <td>{b.estado}</td>
                                <td>{b.total_ingresos}</td>
                                <td>{b.total_deducciones}</td>
                                <td>{b.total_neto}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>

            {/* Paginación */}
            <div className="d-flex justify-content-center mb-4">
                <Pagination>
                    {getPaginationItems(pagina, totalPaginas).map((item, idx) =>
                        item === "..." ? (
                            <Pagination.Ellipsis key={`ellipsis-${idx}`} disabled />
                        ) : (
                            <Pagination.Item
                                key={`page-${item}-${idx}`} // <-- Clave única
                                active={pagina === item}
                                onClick={() => setPagina(item)}
                            >
                                {item}
                            </Pagination.Item>
                        )
                    )}
                </Pagination>
            </div>

            {/* Modal para generar nómina */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Generar Nómina</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleGenerarNomina}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha Inicio</Form.Label>
                            <Form.Control
                                type="date"
                                name="fecha_inicio"
                                value={fechas.fecha_inicio}
                                onChange={handleFechaChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha Fin</Form.Label>
                            <Form.Control
                                type="date"
                                name="fecha_fin"
                                value={fechas.fecha_fin}
                                onChange={handleFechaChange}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={generando}>
                            {generando ? "Generando..." : "Generar"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Modal para generar nómina individual */}
            <Modal show={showManualModal} onHide={() => setShowManualModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Generar Nómina Individual</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleGenerarManual}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha Inicio</Form.Label>
                            <Form.Control
                                type="date"
                                name="fecha_inicio"
                                value={manualFechas.fecha_inicio}
                                onChange={handleManualFechaChange}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha Fin</Form.Label>
                            <Form.Control
                                type="date"
                                name="fecha_fin"
                                value={manualFechas.fecha_fin}
                                onChange={handleManualFechaChange}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowManualModal(false)}>
                            Cancelar
                        </Button>
                        <Button variant="primary" type="submit" disabled={manualLoading}>
                            {manualLoading ? "Generando..." : "Generar"}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Nomina;