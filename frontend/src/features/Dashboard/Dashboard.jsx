// src/components/Dashboard/Dashboard.js
import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import './Dashboard.css';

const Dashboard = () => {
    const [sidebarCollapsed] = useState(false);
    return (
        <div className="dashboard-container">
            <div className="d-flex">
                <nav className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
                    <ul>
                        <li>
                            <Link to="empleados">
                                <i className="bi bi-person-badge"></i>
                                <span>Empleados</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="departamentos">
                                <i className="bi bi-building"></i>
                                <span>Departamentos</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                <div
                    className="content-wrapper"
                    style={{
                        flex: 1,
                        marginLeft: sidebarCollapsed ? '10px' : '20px',
                        transition: 'margin-left 0.3s ease-in-out',
                    }}
                >

                    <Container fluid>
                        {/* Aquí se cargan las páginas hijas */}
                        <div className="main-content">
                            <Outlet />
                        </div>
                    </Container>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

