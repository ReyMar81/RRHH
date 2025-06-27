import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Alert, Pagination, Form, Row, Col } from "react-bootstrap";

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

const HistorialHorasExtra = () => {
    const [historial, setHistorial] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [error, setError] = useState("");
    const [pagina, setPagina] = useState(1);
    const [busquedaSolicito, setBusquedaSolicito] = useState(""); // Nuevo filtro para "Solicitó"
    const porPagina = 10;

    useEffect(() => {
        const fetchHistorial = async () => {
            setError("");
            try {
                const res = await apiClient.get("horas_extras/");
                setHistorial(res.data);
            } catch (err) {
                setError("Error al cargar el historial.");
            }
        };
        const fetchEmpleados = async () => {
            try {
                const res = await apiClient.get("empleados/");
                setEmpleados(res.data);
            } catch (err) {}
        };
        fetchHistorial();
        fetchEmpleados();
    }, []);

    // Obtener nombre completo por id
    const getEmpleadoNombre = (id) => {
        const emp = empleados.find(e => e.id === id);
        return emp ? `${emp.nombre} ${emp.apellidos}` : "—";
    };

    // Filtro por nombre de quien solicitó
    const historialFiltrado = historial.filter((h) => {
        if (!busquedaSolicito.trim()) return true;
        const solicitador = empleados.find(e => e.id === h.empleado_solicitador);
        const nombreCompleto = solicitador ? `${solicitador.nombre} ${solicitador.apellidos}`.toLowerCase() : "";
        return nombreCompleto.includes(busquedaSolicito.toLowerCase());
    });

    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const historialPagina = historialFiltrado.slice(inicio, fin);
    const totalPaginas = Math.ceil(historialFiltrado.length / porPagina);

    // Formatear fecha
    const formatFecha = (fecha) => {
        if (!fecha) return "";
        return new Date(fecha).toLocaleDateString();
    };

    // Formatear duración
    const formatDuracion = (duracion) => {
        if (!duracion) return "";
        const [h, m] = duracion.split(":");
        return `${parseInt(h)}:${m}`;
    };

    // Formatear aprobado
    const formatAprobado = (aprobado) => {
        if (aprobado === true) return "Sí";
        if (aprobado === false) return "No";
        return "Pendiente";
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Historial de Horas Extra</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Row className="mb-3">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por quien solicitó..."
                        value={busquedaSolicito}
                        onChange={e => setBusquedaSolicito(e.target.value)}
                        className="w-100"
                    />
                </Col>
            </Row>

            <Table striped bordered hover>
                <thead className="table-primary">
                    <tr>
                        <th>Horas trabajadas</th>
                        <th>Aprobado</th>
                        <th>Motivo</th>
                        <th>Fecha solicitud</th>
                        <th>Solicitó</th>
                        <th>Autorizó</th>
                    </tr>
                </thead>
                <tbody>
                    {historialPagina.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center text-muted">
                                No hay historial de horas extra.
                            </td>
                        </tr>
                    ) : (
                        historialPagina.map((h) => (
                            <tr key={h.id}>
                                <td>{formatDuracion(h.cantidad_horas_extra_trabajadas)}</td>
                                <td>{formatAprobado(h.aprobado)}</td>
                                <td>{h.motivo}</td>
                                <td>{formatFecha(h.fecha_solicitud)}</td>
                                <td>{getEmpleadoNombre(h.empleado_solicitador)}</td>
                                <td>{h.empleado_autorizador ? getEmpleadoNombre(h.empleado_autorizador) : "—"}</td>
                            </tr>
                        ))
                    )}
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
                    <Pagination.Next
                        onClick={() => setPagina(pagina + 1)}
                        disabled={pagina === totalPaginas}
                    />
                </Pagination>
            )}
        </div>
    );
};

export default HistorialHorasExtra;