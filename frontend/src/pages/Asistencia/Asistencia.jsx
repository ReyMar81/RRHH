import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Pagination } from "react-bootstrap";

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
    const [datosCargados, setDatosCargados] = useState(false);
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;

    // Obtener el id de la empresa desde localStorage
    const empresaId = localStorage.getItem("empresa_id");

    // Obtener asistencias desde el backend
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

    useEffect(() => {
        const cargarDatos = async () => {
            await fetchAsistencias();
            setDatosCargados(true);
        };
        cargarDatos();
    }, []);

    // Calcular asistencias a mostrar
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const asistenciasPagina = asistencias.slice(inicio, fin);
    const totalPaginas = Math.ceil(asistencias.length / porPagina);

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Asistencias</h1>
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
                        asistenciasPagina.map((asistencia) => (
                            <tr key={asistencia.id}>
                                <td>
                                    {asistencia.nombre_empleado || "Cargando..."}
                                </td>
                                <td>{asistencia.fecha}</td>
                                <td>{asistencia.hora_entrada || "-"}</td>
                                <td>{asistencia.hora_salida || "-"}</td>
                                <td>{asistencia.horas_trabajadas ?? "-"}</td>
                                <td>{asistencia.observaciones}</td>
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
        </div>
    );
};

export default Asistencia;