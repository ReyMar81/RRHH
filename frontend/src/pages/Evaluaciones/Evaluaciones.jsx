import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Alert, Pagination } from "react-bootstrap";

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

const Evaluaciones = () => {
    const [evaluaciones, setEvaluaciones] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;

    // Obtener evaluaciones pendientes de aprobar
    const fetchEvaluaciones = async () => {
        setError("");
        try {
            const res = await apiClient.get("evaluaciones/pendientes-evaluar/");
            setEvaluaciones(res.data);
        } catch (err) {
            setError("Error al cargar evaluaciones pendientes.");
        }
    };

    useEffect(() => {
        fetchEvaluaciones();
    }, []);

    // Aprobar evaluación
    const aprobarEvaluacion = async (id) => {
        setError("");
        setSuccess("");
        try {
            await apiClient.patch(`evaluaciones/${id}/aceptar/`);
            setSuccess("Evaluación aceptada.");
            fetchEvaluaciones();
        } catch (err) {
            setError(
                err.response?.data?.error ||
                "No tienes permisos o hubo un error al aprobar la evaluación."
            );
        }
    };

    // Rechazar evaluación (puedes implementar lógica específica si tu backend lo permite)
    const rechazarEvaluacion = (id) => {
        // Aquí podrías llamar a un endpoint de rechazo si existe, o simplemente ocultar la evaluación.
        setEvaluaciones(evaluaciones.filter(e => e.id !== id));
        setSuccess("Evaluación rechazada (solo ocultada en frontend).");
    };

    // Paginación
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const evaluacionesPagina = evaluaciones.slice(inicio, fin);
    const totalPaginas = Math.ceil(evaluaciones.length / porPagina);

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Evaluaciones Pendientes</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Table striped bordered hover>
                <thead className="table-primary">
                    <tr>
                        <th>Evaluado</th>
                        <th>Solicitador</th>
                        <th>Motivo</th>
                        <th>Fecha creación</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {evaluacionesPagina.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center text-muted">
                                No hay evaluaciones pendientes.
                            </td>
                        </tr>
                    ) : (
                        evaluacionesPagina.map((e) => (
                            <tr key={e.id}>
                                <td>{e.evaluado_nombre || "—"}</td>
                                <td>{e.solicitador_nombre || "—"}</td>
                                <td>{e.motivo || "—"}</td>
                                <td>{e.fecha_creacion ? new Date(e.fecha_creacion).toLocaleDateString() : "—"}</td>
                                <td>
                                    <Button
                                        variant="success"
                                        size="sm"
                                        className="me-2"
                                        onClick={() => aprobarEvaluacion(e.id)}
                                        title="Aprobar"
                                    >
                                        ✔
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => rechazarEvaluacion(e.id)}
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
                            <Pagination.Ellipsis key={`ellipsis-${idx}`} disabled />
                        ) : (
                            <Pagination.Item
                                key={`page-${item}-${idx}`}
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

export default Evaluaciones;