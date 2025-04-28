// src/components/Pages/Departamentos.js
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { useTheme } from '../contexts/ThemeContext'; // Asegúrate de que la ruta sea correcta

const Departamentos = () => {
    const { theme } = useTheme();

    // Datos de ejemplo para departamentos
    const departamentos = [
        { id: 1, nombre: 'Tecnología', empleados: 24, manager: 'Roberto Gómez', presupuesto: '$250,000' },
        { id: 2, nombre: 'Recursos Humanos', empleados: 12, manager: 'Laura Martínez', presupuesto: '$120,000' },
        { id: 3, nombre: 'Finanzas', empleados: 15, manager: 'Carlos Sánchez', presupuesto: '$180,000' },
        { id: 4, nombre: 'Marketing', empleados: 18, manager: 'Ana Torres', presupuesto: '$200,000' },
        { id: 5, nombre: 'Ventas', empleados: 30, manager: 'Juan Ramírez', presupuesto: '$350,000' },
        { id: 6, nombre: 'Operaciones', empleados: 22, manager: 'Patricia Vega', presupuesto: '$280,000' },
    ];

    return (
        <div>
            <h2 className="mb-4">Departamentos</h2>

            <Row>
                {departamentos.map(depto => (
                    <Col key={depto.id} lg={4} md={6} className="mb-4">
                        <Card
                            style={{
                                backgroundColor: theme.name === 'dark' ? theme.colors.dark : theme.colors.light,
                                color: theme.colors.text,
                                border: `1px solid ${theme.name === 'dark' ? theme.colors.secondary : '#eee'}`
                            }}
                        >
                            <Card.Body>
                                <Card.Title style={{ color: theme.colors.primary }}>{depto.nombre}</Card.Title>
                                <Card.Text>
                                    <strong>Manager:</strong> {depto.manager}<br />
                                    <strong>Empleados:</strong> {depto.empleados}<br />
                                    <strong>Presupuesto anual:</strong> {depto.presupuesto}
                                </Card.Text>
                                <div className="d-grid gap-2 d-md-flex justify-content-md-end">
                                    <button className="btn btn-outline-primary me-md-2" type="button">Ver detalles</button>
                                    <button className="btn btn-outline-secondary" type="button">Editar</button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default Departamentos;