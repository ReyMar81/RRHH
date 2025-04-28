// src/components/Pages/Empleados.js
import React, { useState } from 'react';
import { Card, Table, Button, Badge, Row, Col, Form, InputGroup } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash, FaUserPlus, FaFilter, FaFileExport } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

// Datos de ejemplo
const empleadosData = [
    { id: 1, nombre: 'Juan Pérez', cargo: 'Desarrollador Frontend', departamento: 'Tecnología', estado: 'Activo', fechaContratacion: '15/03/2021' },
    { id: 2, nombre: 'María García', cargo: 'Diseñadora UX/UI', departamento: 'Diseño', estado: 'Activo', fechaContratacion: '10/05/2022' },
    { id: 3, nombre: 'Carlos Rodríguez', cargo: 'Gerente de Proyecto', departamento: 'Administración', estado: 'Vacaciones', fechaContratacion: '22/01/2020' },
    { id: 4, nombre: 'Ana Martínez', cargo: 'Analista de Recursos Humanos', departamento: 'Recursos Humanos', estado: 'Activo', fechaContratacion: '08/07/2022' },
    { id: 5, nombre: 'Roberto Sánchez', cargo: 'Desarrollador Backend', departamento: 'Tecnología', estado: 'Permiso', fechaContratacion: '03/11/2021' },
    { id: 6, nombre: 'Laura Torres', cargo: 'Contadora', departamento: 'Finanzas', estado: 'Activo', fechaContratacion: '17/04/2023' },
];

const Empleados = () => {
    const { theme } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [empleados, setEmpleados] = useState(empleadosData);

    // Filtrar empleados por término de búsqueda
    const filteredEmpleados = empleados.filter(empleado =>
        empleado.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empleado.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        empleado.departamento.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Función para manejar eliminación de empleado
    const handleDelete = (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar este empleado?')) {
            setEmpleados(empleados.filter(emp => emp.id !== id));
        }
    };

    // Obtener el color del badge según el estado
    const getBadgeColor = (estado) => {
        switch (estado) {
            case 'Activo':
                return 'success';
            case 'Vacaciones':
                return 'info';
            case 'Permiso':
                return 'warning';
            default:
                return 'secondary';
        }
    };

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Gestión de Empleados</h2>
                <Button variant="primary">
                    <FaUserPlus className="me-2" /> Nuevo Empleado
                </Button>
            </div>

            <Card style={{
                backgroundColor: theme.name === 'dark' ? theme.colors.dark : theme.colors.light,
                color: theme.colors.text,
                marginBottom: '20px'
            }}>
                <Card.Body>
                    <Row className="align-items-center">
                        <Col md={6}>
                            <InputGroup>
                                <Form.Control
                                    placeholder="Buscar empleados..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    style={{
                                        backgroundColor: theme.name === 'dark' ? theme.colors.dark : theme.colors.light,
                                        color: theme.colors.text,
                                        borderColor: theme.name === 'dark' ? theme.colors.secondary : theme.colors.light
                                    }}
                                />
                                <Button variant="outline-primary">
                                    <FaSearch />
                                </Button>
                            </InputGroup>
                        </Col>
                        <Col md={6} className="d-flex justify-content-end">
                            <Button variant="outline-secondary" className="me-2">
                                <FaFilter className="me-2" /> Filtros
                            </Button>
                            <Button variant="outline-success">
                                <FaFileExport className="me-2" /> Exportar
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            <Card style={{
                backgroundColor: theme.name === 'dark' ? theme.colors.dark : theme.colors.light,
                color: theme.colors.text
            }}>
                <Card.Body>
                    <Table
                        responsive
                        hover
                        striped
                        style={{
                            color: theme.colors.text,
                            borderColor: theme.name === 'dark' ? theme.colors.secondary : theme.colors.light
                        }}
                    >
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Nombre</th>
                                <th>Cargo</th>
                                <th>Departamento</th>
                                <th>Estado</th>
                                <th>Fecha de Contratación</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmpleados.map((empleado) => (
                                <tr key={empleado.id}>
                                    <td>{empleado.id}</td>
                                    <td>{empleado.nombre}</td>
                                    <td>{empleado.cargo}</td>
                                    <td>{empleado.departamento}</td>
                                    <td>
                                        <Badge bg={getBadgeColor(empleado.estado)}>
                                            {empleado.estado}
                                        </Badge>
                                    </td>
                                    <td>{empleado.fechaContratacion}</td>
                                    <td>
                                        <Button variant="outline-primary" size="sm" className="me-2">
                                            <FaEdit />
                                        </Button>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(empleado.id)}>
                                            <FaTrash />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {filteredEmpleados.length === 0 && (
                        <div className="text-center py-4">
                            <p>No se encontraron empleados que coincidan con la búsqueda.</p>
                        </div>
                    )}
                </Card.Body>
            </Card>
        </div>
    );
};

export default Empleados;