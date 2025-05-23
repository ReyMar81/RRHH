import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table } from "react-bootstrap";

const Asistencia = () => {
    const [asistencias, setAsistencias] = useState([]);
    const [empleados, setEmpleados] = useState({}); // Mapeo de empleados por ID
    const [cargos, setCargos] = useState({}); // Mapeo de cargos por ID
    const [datosCargados, setDatosCargados] = useState(false); // Verificar si los datos están cargados

    // Obtener asistencias desde el backend
    const fetchAsistencias = async () => {
        try {
            const response = await apiClient.get("asistencias/");
            setAsistencias(response.data);
        } catch (error) {
            console.error("Error al obtener asistencias:", error);
        }
    };

    // Obtener empleados desde el backend
    const fetchEmpleados = async () => {
        try {
            const response = await apiClient.get("empleados/");
            const empleadosMap = {};
            response.data.forEach((empleado) => {
                empleadosMap[empleado.id] = {
                    nombre: `${empleado.nombre} ${empleado.apellidos}`,
                    horas_por_dia: parseFloat(empleado.cargo.horas_por_dia.split(":")[0]), // Obtener horas por día del cargo
                };
            });
            setEmpleados(empleadosMap);
        } catch (error) {
            console.error("Error al obtener empleados:", error);
        }
    };

    // Obtener cargos desde el backend
    const fetchCargos = async () => {
        try {
            const response = await apiClient.get("cargos/");
            const cargosMap = {};
            response.data.forEach((cargo) => {
                cargosMap[cargo.id] = {
                    horas_por_dia: parseFloat(cargo.horas_por_dia.split(":")[0]), // Convertir a número
                };
            });
            setCargos(cargosMap);
        } catch (error) {
            console.error("Error al obtener cargos:", error);
        }
    };

    // Calcular horas trabajadas
    const calcularHorasTrabajadas = (horaEntrada, horaSalida) => {
        const entrada = new Date(`1970-01-01T${horaEntrada}Z`);
        const salida = new Date(`1970-01-01T${horaSalida}Z`);
        const diferencia = (salida - entrada) / (1000 * 60 * 60); // Diferencia en horas
        const tiempoAlmuerzo = 1; // Descuento de 1 hora para almuerzo
        return (diferencia - tiempoAlmuerzo).toFixed(2); // Redondear a 2 decimales
    };

    // Calcular horas extra
    const calcularHorasExtra = (horasTrabajadas, idEmpleado) => {
        const empleado = empleados[idEmpleado];
        if (!empleado || !empleado.cargo || !cargos[empleado.cargo]) return "N/A";

        const horasPorDia = cargos[empleado.cargo].horas_por_dia; // Obtener horas por día del cargo
        const horasExtra = horasTrabajadas - horasPorDia;
        return horasExtra > 0 ? horasExtra.toFixed(2) : "0.00"; // Mostrar solo si hay horas extra
    };

    // Verificar si el empleado cumplió sus horas laborales
    const verificarCumplimientoHoras = (horasTrabajadas, idEmpleado) => {
        const empleado = empleados[idEmpleado];
        if (!empleado || !empleado.cargo || !cargos[empleado.cargo]) return "N/A";

        const horasPorDia = cargos[empleado.cargo].horas_por_dia; // Obtener horas por día del cargo
        if (horasTrabajadas >= horasPorDia) {
            return "Cumplió";
        } else {
            const horasFaltantes = (horasPorDia - horasTrabajadas).toFixed(2);
            return `Faltaron ${horasFaltantes} horas`;
        }
    };

    useEffect(() => {
        const cargarDatos = async () => {
            await fetchAsistencias();
            await fetchEmpleados();
            await fetchCargos();
            setDatosCargados(true); // Marcar que los datos están cargados
        };
        cargarDatos();
    }, []);

    return (
        <div className="container mt-4">
            <h1 className="mb-4 text-primary">Asistencias</h1>
            <Table striped bordered hover responsive>
                <thead className="table-primary">
                    <tr>
                        <th>Empleado</th>
                        <th>Fecha</th>
                        <th>Hora de Entrada</th>
                        <th>Hora de Salida</th>
                        <th>Horas Laborales</th>
                        <th>Horas Extra</th>
                        <th>Cumplimiento</th>
                    </tr>
                </thead>
                <tbody>
                    {datosCargados &&
                        asistencias.map((asistencia) => {
                            const horasTrabajadas = calcularHorasTrabajadas(
                                asistencia.hora_entrada,
                                asistencia.hora_salida
                            );
                            return (
                                <tr key={asistencia.id}>
                                    <td>{empleados[asistencia.id_empleado]?.nombre || "Cargando..."}</td>
                                    <td>{asistencia.fecha}</td>
                                    <td>{asistencia.hora_entrada}</td>
                                    <td>{asistencia.hora_salida}</td>
                                    <td>{horasTrabajadas}</td>
                                    <td>
                                        {calcularHorasExtra(horasTrabajadas, asistencia.id_empleado)}
                                    </td>
                                    <td>
                                        {verificarCumplimientoHoras(horasTrabajadas, asistencia.id_empleado)}
                                    </td>
                                </tr>
                            );
                        })}
                </tbody>
            </Table>
        </div>
    );
};

export default Asistencia;