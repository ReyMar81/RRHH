import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Alert, Pagination } from "react-bootstrap";

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
    const [error, setError] = useState("");
    // PAGINACIÓN
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const historialPagina = historial.slice(inicio, fin);
    const totalPaginas = Math.ceil(historial.length / porPagina);

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
        fetchHistorial();
    }, []);

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
            <Table striped bordered hover>
                <thead className="table-primary">
                    <tr>
                        <th>Horas trabajadas</th>
                        <th>Aprobado</th>
                        <th>Motivo</th>
                        <th>Fecha solicitud</th>
                    </tr>
                </thead>
                <tbody>
                    {historialPagina.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center text-muted">
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

export default HistorialHorasExtra;