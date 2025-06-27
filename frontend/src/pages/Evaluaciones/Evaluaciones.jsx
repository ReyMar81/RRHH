import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Form, Row, Col, Pagination, Alert } from "react-bootstrap";

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
    const [busqueda, setBusqueda] = useState("");
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;
    const [error, setError] = useState("");

    useEffect(() => {
        fetchEvaluaciones();
    }, []);

    const fetchEvaluaciones = async () => {
        try {
            // Puedes cambiar el endpoint según lo que quieras mostrar (todas, finalizadas, pendientes, etc.)
            const res = await apiClient.get("evaluaciones/");
            setEvaluaciones(res.data);
        } catch (err) {
            setError("Error al cargar evaluaciones.");
        }
    };

    // Filtro por nombre de evaluado
    const evaluacionesFiltradas = evaluaciones.filter((e) => {
        if (!busqueda.trim()) return true;
        const nombre = e.evaluado_nombre || "";
        return nombre.toLowerCase().includes(busqueda.toLowerCase());
    });

    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const evaluacionesPagina = evaluacionesFiltradas.slice(inicio, fin);
    const totalPaginas = Math.ceil(evaluacionesFiltradas.length / porPagina);

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Evaluaciones</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <Row className="mb-3">
                <Col md={6}>
                    <Form.Control
                        type="text"
                        placeholder="Buscar por nombre de evaluado..."
                        value={busqueda}
                        onChange={e => setBusqueda(e.target.value)}
                    />
                </Col>
            </Row>
            <Table striped bordered hover responsive>
                <thead className="table-primary">
                    <tr>
                        <th>Evaluado</th>
                        <th>Solicitador</th>
                        <th>Motivo</th>
                        <th>Estado</th>
                        <th>Fecha creación</th>
                    </tr>
                </thead>
                <tbody>
                    {evaluacionesPagina.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="text-center text-muted">
                                No hay evaluaciones.
                            </td>
                        </tr>
                    ) : (
                        evaluacionesPagina.map((e) => (
                            <tr key={e.id}>
                                <td>{e.evaluado_nombre || "—"}</td>
                                <td>{e.solicitador_nombre || "—"}</td>
                                <td>{e.motivo || "—"}</td>
                                <td>{e.estado}</td>
                                <td>{e.fecha_creacion ? new Date(e.fecha_creacion).toLocaleDateString() : "—"}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </Table>
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

export default Evaluaciones;