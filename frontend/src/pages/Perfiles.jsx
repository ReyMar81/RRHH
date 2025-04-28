// src/components/Pages/Perfiles.js
import React from 'react';
import { Card, Table, Button, Form, Row, Col } from 'react-bootstrap';
import { FaUserEdit, FaIdCard, FaFile } from 'react-icons/fa';
import { useTheme } from '../contexts/ThemeContext';

const Perfiles = () => {
    const { theme } = useTheme();

    // Datos de ejemplo para perfiles
    const perfiles = [
        { id: 1, tipo: 'Administrador', descripcion: 'Acceso completo al sistema', permisos: 'Todos los módulos' },
        { id: 2, tipo: 'Gerente RH', descripcion: 'Gestión de personal y departamentos', permisos: 'Empleados, Departamentos, Reportes' },
        { id: 3, tipo: 'Especialista Nómina', descripcion: 'Gestión de pagos y nóminas', permisos: 'Nómina, Reportes básicos' },
        { id: 4, tipo: 'Coordinador', descripcion: 'Gestión de vacaciones y permisos', permisos: 'Vacaciones, Perfiles básicos' },
        { id: 5, tipo: 'Empleado', descripcion: 'Visualización de datos personales', permisos: 'Perfil propio, Solicitudes' }
    ];

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Perfiles de Usuario</h2>
                <Button variant="primary">
                    <FaUserEdit className="me-2" /> Nuevo Perfil
                </Button>
            </div>

            <Card style={{
                backgroundColor: theme.name === 'dark' ? theme.colors.dark : theme.colors.light,
                color: theme.colors.text,
                marginBottom: '20px'
            }}>
                <Card.Body>
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Buscar perfil</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="Buscar..."
                                    style={{
                                        backgroundColor: theme.name === 'dark' ? theme.colors.dark : theme.colors.light,
                                        color: theme.colors.text,
                                        borderColor: theme.name === 'dark' ? theme.colors.secondary : '#ced4da'
                                    }}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Filtrar por tipo</Form.Label>
                                <Form.Select
                                    style={{
                                        backgroundColor: theme.name === 'dark' ? theme.colors.dark : theme.colors.light,
                                        color: theme.colors.text,
                                        borderColor: theme.name === 'dark' ? theme.colors.secondary : '#ced4da'
                                    }}
                                >
                                    <option value="">Todos los perfiles</option>
                                    <option value="admin">Administrador</option>
                                    <option value="gerente">Gerente RH</option>
                                    <option value="especialista">Especialista Nómina</option>
                                    <option value="coordinador">Coordinador</option>
                                    <option value="empleado">Empleado</option>
                                </Form.Select>
                            </Form.Group>
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
                                <th>Tipo de Perfil</th>
                                <th>Descripción</th>
                                <th>Permisos</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {perfiles.map((perfil) => (
                                <tr key={perfil.id}>
                                    <td>{perfil.id}</td>
                                    <td>{perfil.tipo}</td>
                                    <td>{perfil.descripcion}</td>
                                    <td>{perfil.permisos}</td>
                                    <td>
                                        <Button variant="outline-info" size="sm" className="me-2">
                                            <FaIdCard /> Ver
                                        </Button>
                                        <Button variant="outline-primary" size="sm">
                                            <FaFile /> Editar
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </div>
    );
};

export default Perfiles;