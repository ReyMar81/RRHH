import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table } from "react-bootstrap";

const Asistencia = () => {
    const [asistencias, setAsistencias] = useState([]);
    const [datosCargados, setDatosCargados] = useState(false);

    // Obtener el id de la empresa desde localStorage
    const empresaId = localStorage.getItem("empresa_id");

    // Obtener asistencias desde el backend
    const fetchAsistencias = async () => {
        try {
            const response = await apiClient.get(
                `asistencia/asistencias/?empresa_id=${empresaId}`
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
                        asistencias.map((asistencia) => (
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
        </div>
    );
};

export default Asistencia;