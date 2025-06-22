import React, { useEffect, useState } from "react";
import { Table, Container, Spinner, Alert } from "react-bootstrap";
import apiClient from "../../services/Apirest";

const Bitacora = () => {
    const [registros, setRegistros] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBitacora = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiClient.get("bitacora-personalizada/");
                console.log("Respuesta de la bitácora:", response); // <-- Imprime la respuesta completa
                setRegistros(response.data);
            } catch (err) {
                console.error("Error al obtener la bitácora:", err); // <-- Imprime el error completo
                setError("Error al obtener la bitácora.");
            }
            setLoading(false);
        };
        fetchBitacora();
    }, []);

    return (
        <Container className="mt-4">
            <h1 className="mb-4">Bitácora</h1>
            {loading && <Spinner animation="border" />}
            {error && <Alert variant="danger">{error}</Alert>}
            {!loading && !error && (
                <Table striped bordered hover responsive className="table-sm">
                    <thead className="table-primary">
                        <tr>
                            <th>Fecha</th>
                            <th>Usuario</th>
                            <th>Acción</th>
                            <th>IP</th>
                            <th>Detalles</th>
                        </tr>
                    </thead>
                    <tbody>
                        {registros.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center">
                                    No hay registros en la bitácora.
                                </td>
                            </tr>
                        )}
                        {registros.map((registro, idx) => (
                            <tr key={idx}>
                                <td>
                                    {registro.fecha_servidor
                                        ? new Date(registro.fecha_servidor).toLocaleString()
                                        : ""}
                                </td>
                                <td>{registro.usuario || "Desconocido"}</td>
                                <td>{registro.accion}</td>
                                <td>{registro.ip || "-"}</td>
                                <td>
                                    <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
                                        {registro.detalles
                                            ? JSON.stringify(registro.detalles, null, 2)
                                            : "-"}
                                    </pre>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default Bitacora;