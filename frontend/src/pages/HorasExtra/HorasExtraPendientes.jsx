import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Alert, Pagination } from "react-bootstrap";

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

const HorasExtraPendientes = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    // PAGINACIÓN
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const solicitudesPagina = solicitudes.slice(inicio, fin);
    const totalPaginas = Math.ceil(solicitudes.length / porPagina);

    // Obtener solicitudes pendientes
    const fetchSolicitudes = async () => {
        setError("");
        try {
            const res = await apiClient.get("horas_extras/pendientes-aprobar/");
            setSolicitudes(res.data);
        } catch (err) {
            setError("Error al cargar solicitudes pendientes.");
        }
    };

    useEffect(() => {
        fetchSolicitudes();
    }, []);

    // Aprobar o rechazar solicitud
    const responderSolicitud = async (id, aprobado) => {
        setError("");
        setSuccess("");
        try {
            await apiClient.patch(`horas_extras/${id}/responder/`, { aprobado });
            setSuccess(aprobado ? "Solicitud aprobada." : "Solicitud rechazada.");
            fetchSolicitudes();
        } catch (err) {
            setError("No tienes permisos o hubo un error al responder la solicitud.");
        }
    };

    // Formatear fecha
    const formatFecha = (fecha) => {
        if (!fecha) return "";
        return new Date(fecha).toLocaleDateString();
    };

    // Formatear duración
    const formatDuracion = (duracion) => {
        if (!duracion) return "";
        const [h, m] = duracion.split(":");
        return `${parseInt(h)}h ${parseInt(m)}m`;
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Horas Extra Pendientes</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Table striped bordered hover>
                <thead className="table-primary">
                    <tr>
                        <th>Horas solicitadas</th>
                        <th>Motivo</th>
                        <th>Fecha solicitud</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {solicitudesPagina.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center text-muted">
                                No hay solicitudes pendientes.
                            </td>
                        </tr>
                    ) : (
                        solicitudesPagina.map((s) => (
                            <tr key={s.id}>
                                <td>{formatDuracion(s.cantidad_horas_extra_solicitadas)}</td>
                                <td>{s.motivo}</td>
                                <td>{formatFecha(s.fecha_solicitud)}</td>
                                <td>
                                    <Button
                                        variant="success"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => responderSolicitud(s.id, true)}
                                        title="Aprobar"
                                    >
                                        ✔
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => responderSolicitud(s.id, false)}
                                        title="Rechazar"
                                    >
                                        ✖
                                    </Button>
                                </td>
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
        </div>
    );
};

export default HorasExtraPendientes;