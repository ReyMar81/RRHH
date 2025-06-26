import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Pagination, Form, Row, Col, Button, Modal } from "react-bootstrap";

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

const Asistencia = () => {
    const [asistencias, setAsistencias] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [datosCargados, setDatosCargados] = useState(false);
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;

    // Filtros
    const [empleadoFiltro, setEmpleadoFiltro] = useState("");
    const [fechaInicio, setFechaInicio] = useState("");
    const [fechaFin, setFechaFin] = useState("");
    const [busqueda, setBusqueda] = useState(""); // Nuevo filtro de texto

    const empresaId = localStorage.getItem("empresa_id");

    //Reporte
    const [showReporteModal, setShowReporteModal] = useState(false);
    const [reporteFecha, setReporteFecha] = useState("");
    const [reporteDepartamento, setReporteDepartamento] = useState("");
    const [reporteCargo, setReporteCargo] = useState("");
    const [departamentos, setDepartamentos] = useState([]);
    const [cargos, setCargos] = useState([]);

    //Obtener empleados
    const fetchDepartamentos = async () => {
        try {
            const response = await apiClient.get(`departamentos/`);
            setDepartamentos(response.data);
        } catch (error) {
            console.error("Error al obtener departamentos:", error);
        }
    };
    //Obtener Cargos
    const fetchCargos = async () => {
        try {
            const response = await apiClient.get(`cargos/`);
            setCargos(response.data);
        } catch (error) {
            console.error("Error al obtener cargos:", error);
        }
    };

    const generarReportePdf = async () => {
        if (!reporteFecha) {
            alert("Debe seleccionar una fecha");
            return;
        }

        try {
            const params = new URLSearchParams();
            params.append("fecha", reporteFecha);
            if (reporteDepartamento) params.append("departamento", reporteDepartamento);
            if (reporteCargo) params.append("cargo", reporteCargo);

            const response = await apiClient.get(`asistencias/reporte-pdf/?${params.toString()}`, {
                responseType: "blob",
            });

            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `reporte_asistencias_${reporteFecha}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            setShowReporteModal(false);
        } catch (error) {
            console.error("Error al generar el reporte:", error);
            alert("No se pudo generar el reporte.");
        }
    };

    // Obtener asistencias
    const fetchAsistencias = async () => {
        try {
            const response = await apiClient.get(
                `asistencias/?empresa_id=${empresaId}`
            );
            setAsistencias(response.data);
        } catch (error) {
            console.error("Error al obtener asistencias:", error);
        }
    };

    // Obtener empleados
    const fetchEmpleados = async () => {
        try {
            const response = await apiClient.get(
                `empleados/?empresa_id=${empresaId}`
            );
            setEmpleados(response.data);
        } catch (error) {
            console.error("Error al obtener empleados:", error);
        }
    };

    useEffect(() => {
        const cargarDatos = async () => {
            await fetchAsistencias();
            await fetchEmpleados();
            await fetchDepartamentos();
            await fetchCargos();
            setDatosCargados(true);
        };
        cargarDatos();
    }, []);

    // Filtrar asistencias
    const asistenciasFiltradas = asistencias.filter((a) => {
        const empleadoObj = empleados.find(e => e.id === a.empleado);
        const nombreCompleto = empleadoObj
            ? `${empleadoObj.nombre} ${empleadoObj.apellidos}`.toLowerCase()
            : "";
        const cumpleBusqueda = busqueda.trim() === ""
            ? true
            : nombreCompleto.includes(busqueda.toLowerCase());
        const cumpleEmpleado = empleadoFiltro
            ? String(a.empleado) === String(empleadoFiltro)
            : true;
        const cumpleFechaInicio = fechaInicio
            ? new Date(a.fecha) >= new Date(fechaInicio)
            : true;
        const cumpleFechaFin = fechaFin
            ? new Date(a.fecha) <= new Date(fechaFin)
            : true;
        return cumpleBusqueda && cumpleEmpleado && cumpleFechaInicio && cumpleFechaFin;
    });

    // Ordenar y paginar
    const asistenciasOrdenadas = [...asistenciasFiltradas].sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const asistenciasPagina = asistenciasOrdenadas.slice(inicio, fin);
    const totalPaginas = Math.ceil(asistenciasOrdenadas.length / porPagina);

    // Resetear página al cambiar filtros
    useEffect(() => {
        setPagina(1);
    }, [empleadoFiltro, fechaInicio, fechaFin, busqueda]);

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Asistencias</h1>
            {/* Filtros */}
            <Form className="mb-3">
                <Row className="align-items-end">
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Empleado</Form.Label>
                            <Form.Select
                                value={empleadoFiltro}
                                onChange={(e) => setEmpleadoFiltro(e.target.value)}
                            >
                                <option value="">Todos</option>
                                {empleados.map((emp) => (
                                    <option key={emp.id} value={emp.id}>
                                        {emp.nombre} {emp.apellidos}
                                    </option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label>Buscar empleado</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Buscar por nombre o apellido..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Label>Fecha inicio</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group>
                            <Form.Label>Fecha fin</Form.Label>
                            <Form.Control
                                type="date"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                            />
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mt-2">
                    <Col className="d-flex justify-content-end">
                        <Button
                            variant="outline-secondary"
                            onClick={() => {
                                setEmpleadoFiltro("");
                                setFechaInicio("");
                                setFechaFin("");
                                setBusqueda("");
                            }}
                            className="d-flex align-items-center"
                        >
                            <i className="bi bi-x-circle me-2"></i>
                            Limpiar filtros
                        </Button>
                        <Button
                            variant="danger"
                            className="ms-2"
                            onClick={() => setShowReporteModal(true)}
                        >
                            <i className="bi bi-file-earmark-pdf-fill me-2"></i>
                            Reporte
                        </Button>
                    </Col>
                </Row>
            </Form>
            <Table striped bordered hover responsive>
                <thead className="table-primary">
                    <tr>
                        <th>Empleado</th>
                        <th>Fecha</th>
                        <th>Hora de Entrada</th>
                        <th>Hora de Salida</th>
                        <th>Horas Trabajadas</th>
                        <th>Observaciones</th>
                    </tr>
                </thead>
                <tbody>
                    {datosCargados &&
                        asistenciasPagina.map((asistencia) => {
                            const empleadoObj = empleados.find(e => e.id === asistencia.empleado);
                            return (
                                <tr key={asistencia.id}>
                                    <td>
                                        {empleadoObj
                                            ? `${empleadoObj.nombre} ${empleadoObj.apellidos}`
                                            : asistencia.nombre_empleado || "Cargando..."}
                                    </td>
                                    <td>{asistencia.fecha}</td>
                                    <td>{asistencia.hora_entrada || "-"}</td>
                                    <td>{asistencia.hora_salida || "-"}</td>
                                    <td>{asistencia.horas_trabajadas ?? "-"}</td>
                                    <td>{asistencia.observaciones}</td>
                                </tr>
                            );
                        })}
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
            <Modal show={showReporteModal} onHide={() => setShowReporteModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Reporte de Asistencias</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Fecha</Form.Label>
                            <Form.Control
                                type="date"
                                value={reporteFecha}
                                onChange={(e) => setReporteFecha(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Departamento (opcional)</Form.Label>
                            <Form.Select
                                value={reporteDepartamento}
                                onChange={(e) => setReporteDepartamento(e.target.value)}
                            >
                                <option value="">Todos</option>
                                {departamentos.map(dep => (
                                    <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Cargo (opcional)</Form.Label>
                            <Form.Select
                                value={reporteCargo}
                                onChange={(e) => setReporteCargo(e.target.value)}
                            >
                                <option value="">Todos</option>
                                {cargos.map(cargo => (
                                    <option key={cargo.id} value={cargo.id}>{cargo.nombre}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReporteModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="danger" onClick={generarReportePdf}>
                        Generar PDF
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default Asistencia;