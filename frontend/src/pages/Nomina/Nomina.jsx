import React, { useEffect, useState } from "react";
import apiClient from "../../services/Apirest";
import { Table, Button, Form, Modal } from "react-bootstrap";

const Nomina = () => {
    const [boletas, setBoletas] = useState([]);
    const [empleados, setEmpleados] = useState([]);
    const [filtros, setFiltros] = useState({
        empleado: "",
        fecha_inicio: "",
        fecha_fin: "",
    });
    const [showDetalle, setShowDetalle] = useState(false);
    const [detalle, setDetalle] = useState([]);
    const [detalleBoleta, setDetalleBoleta] = useState(null);

    const empresaId = localStorage.getItem("empresa_id");

    // Obtener boletas de pago
    const fetchBoletas = async () => {
        try {
            let url = `boletas/?empresa_id=${empresaId}`;
            if (filtros.empleado) url += `&empleado=${filtros.empleado}`;
            if (filtros.fecha_inicio) url += `&fecha_inicio=${filtros.fecha_inicio}`;
            if (filtros.fecha_fin) url += `&fecha_fin=${filtros.fecha_fin}`;
            const response = await apiClient.get(url);
            setBoletas(response.data);
        } catch (error) {
            console.error("Error al obtener boletas:", error);
        }
    };

    // Obtener empleados
    const fetchEmpleados = async () => {
        try {
            const response = await apiClient.get(`empleados/?empresa_id=${empresaId}`);
            setEmpleados(response.data);
        } catch (error) {
            console.error("Error al obtener empleados:", error);
        }
    };

    useEffect(() => {
        fetchEmpleados();
    }, []);

    useEffect(() => {
        fetchBoletas();
        // eslint-disable-next-line
    }, [filtros]);

    // Manejar cambios en los filtros
    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros({ ...filtros, [name]: value });
    };

    // Ver detalle de boleta
    const verDetalle = async (boleta) => {
        try {
            const response = await apiClient.get(`detalles/?boleta=${boleta.id}`);
            setDetalle(response.data);
            setDetalleBoleta(boleta);
            setShowDetalle(true);
        } catch (error) {
            console.error("Error al obtener detalle:", error);
        }
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Nómina</h1>
            <Form className="row mb-3">
                <Form.Group className="col-md-4">
                    <Form.Label>Empleado</Form.Label>
                    <Form.Select
                        name="empleado"
                        value={filtros.empleado}
                        onChange={handleFiltroChange}
                    >
                        <option value="">Todos</option>
                        {empleados.map((emp) => (
                            <option key={emp.id} value={emp.id}>
                                {emp.nombre} {emp.apellidos}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
                <Form.Group className="col-md-3">
                    <Form.Label>Desde</Form.Label>
                    <Form.Control
                        type="date"
                        name="fecha_inicio"
                        value={filtros.fecha_inicio}
                        onChange={handleFiltroChange}
                    />
                </Form.Group>
                <Form.Group className="col-md-3">
                    <Form.Label>Hasta</Form.Label>
                    <Form.Control
                        type="date"
                        name="fecha_fin"
                        value={filtros.fecha_fin}
                        onChange={handleFiltroChange}
                    />
                </Form.Group>
                <div className="col-md-2 d-flex align-items-end">
                    <Button variant="primary" onClick={fetchBoletas}>
                        Buscar
                    </Button>
                </div>
            </Form>
            <Table striped bordered hover responsive>
                <thead className="table-primary">
                    <tr>
                        <th>Empleado</th>
                        <th>Periodo</th>
                        <th>Total Ingresos</th>
                        <th>Total Deducciones</th>
                        <th>Total Neto</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {boletas.map((b) => (
                        <tr key={b.id}>
                            <td>{b.empleado_nombre || b.empleado}</td>
                            <td>
                                {b.fecha_inicio} - {b.fecha_fin}
                            </td>
                            <td>{b.total_ingresos}</td>
                            <td>{b.total_deducciones}</td>
                            <td>{b.total_neto}</td>
                            <td>{b.estado}</td>
                            <td>
                                <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() => verDetalle(b)}
                                >
                                    <i className="bi bi-eye"></i>
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>

            {/* Modal Detalle Boleta */}
            <Modal
                show={showDetalle}
                onHide={() => setShowDetalle(false)}
                centered
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>
                        Detalle de Boleta
                        {detalleBoleta && (
                            <span className="ms-3 text-muted" style={{ fontSize: "1rem" }}>
                                {detalleBoleta.empleado_nombre || detalleBoleta.empleado} <br />
                                {detalleBoleta.fecha_inicio} - {detalleBoleta.fecha_fin}
                            </span>
                        )}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Código</th>
                                <th>Tipo</th>
                                <th>Monto</th>
                            </tr>
                        </thead>
                        <tbody>
                            {detalle.map((d) => (
                                <tr key={d.id}>
                                    <td>{d.nombre}</td>
                                    <td>{d.codigo}</td>
                                    <td>{d.tipo}</td>
                                    <td>{d.monto}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Nomina;