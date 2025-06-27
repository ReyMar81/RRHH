import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Form, Alert, Pagination } from "react-bootstrap";

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

const TIPOS_ENCARGADO = [
    { value: "hora_extra", label: "Encargado de Horas Extra" },
    { value: "evaluacion", label: "Encargado de Evaluaciones" },
];

const Aprobadores = () => {
    const [empleados, setEmpleados] = useState([]);
    const [departamentos, setDepartamentos] = useState([]);
    const [aprobadores, setAprobadores] = useState([]);
    const [form, setForm] = useState({ empleado: "", departamento: "", encargado_de: "hora_extra" });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    // PAGINACIÓN
    const [pagina, setPagina] = useState(1);
    const porPagina = 10;
    const inicio = (pagina - 1) * porPagina;
    const fin = inicio + porPagina;
    const aprobadoresPagina = aprobadores.slice(inicio, fin);
    const totalPaginas = Math.ceil(aprobadores.length / porPagina);

    // Obtener empleados y departamentos
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [empRes, depRes, aprRes] = await Promise.all([
                    apiClient.get("empleados/"),
                    apiClient.get("departamentos/"),
                    apiClient.get("Aprobadores/"),
                ]);
                setEmpleados(empRes.data);
                setDepartamentos(depRes.data);
                setAprobadores(aprRes.data);
            } catch (err) {
                setError("Error al cargar datos.");
            }
        };
        fetchData();
    }, []);

    // Manejar cambios en selects
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Agregar aprobador/evaluador
    const handleAgregar = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!form.empleado || !form.departamento || !form.encargado_de) {
            setError("Seleccione todos los campos.");
            return;
        }
        try {
            await apiClient.post("Aprobadores/", {
                encargado_de: form.encargado_de,
                empleado: form.empleado,
                departamento: form.departamento,
            });
            setSuccess("Encargado agregado correctamente.");
            setForm({ empleado: "", departamento: "", encargado_de: "hora_extra" });
            // Refrescar lista
            const res = await apiClient.get("Aprobadores/");
            setAprobadores(res.data);
        } catch (err) {
            setError("Error al agregar encargado.");
        }
    };

    // Eliminar encargado
    const handleEliminar = async (id) => {
        if (!window.confirm("¿Seguro que deseas eliminar este encargado?")) return;
        setError("");
        setSuccess("");
        try {
            await apiClient.delete(`Aprobadores/${id}/`);
            setSuccess("Encargado eliminado correctamente.");
            // Refrescar lista
            const res = await apiClient.get("Aprobadores/");
            setAprobadores(res.data);
        } catch (err) {
            setError("Error al eliminar encargado.");
        }
    };

    // Utilidades para mostrar nombres
    const getEmpleadoNombre = (id) => {
        const emp = empleados.find(e => e.id === (typeof id === "object" ? id.id : id));
        return emp ? `${emp.nombre} ${emp.apellidos}` : id;
    };
    const getDepartamentoNombre = (id) => {
        const dep = departamentos.find(d => d.id === (typeof id === "object" ? id.id : id));
        return dep ? dep.nombre : id;
    };
    const getTipoEncargado = (tipo) => {
        const found = TIPOS_ENCARGADO.find(t => t.value === tipo);
        return found ? found.label : tipo;
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Encargados (Aprobadores/Evaluadores)</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Form className="d-flex gap-2 mb-3 align-items-end" onSubmit={handleAgregar}>
                <Form.Group>
                    <Form.Label>Empleado</Form.Label>
                    <Form.Select
                        name="empleado"
                        value={form.empleado}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione un empleado</option>
                        {empleados.map(emp => (
                            <option key={emp.id} value={emp.id}>
                                {emp.nombre} {emp.apellidos}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Departamento</Form.Label>
                    <Form.Select
                        name="departamento"
                        value={form.departamento}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Seleccione un departamento</option>
                        {departamentos.map(dep => (
                            <option key={dep.id} value={dep.id}>
                                {dep.nombre}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Tipo de Encargado</Form.Label>
                    <Form.Select
                        name="encargado_de"
                        value={form.encargado_de}
                        onChange={handleChange}
                        required
                    >
                        {TIPOS_ENCARGADO.map(tipo => (
                            <option key={tipo.value} value={tipo.value}>
                                {tipo.label}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Button type="submit" variant="primary" className="ms-2">
                    Agregar +
                </Button>
            </Form>
            <Table striped bordered hover>
                <thead className="table-primary">
                    <tr>
                        <th>Empleado</th>
                        <th>Departamento</th>
                        <th>Tipo de Encargado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {aprobadoresPagina.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="text-center text-muted">
                                No hay encargados registrados.
                            </td>
                        </tr>
                    ) : (
                        aprobadoresPagina.map((a) => (
                            <tr key={a.id}>
                                <td>{getEmpleadoNombre(a.empleado)}</td>
                                <td>{getDepartamentoNombre(a.departamento)}</td>
                                <td>{getTipoEncargado(a.encargado_de)}</td>
                                <td>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => handleEliminar(a.id)}
                                    >
                                        Eliminar
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

export default Aprobadores;