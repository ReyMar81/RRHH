// src/components/Dashboard/Dashboard.js
import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Container, ThemeProvider } from 'react-bootstrap';
import './Dashboard.css'; // Archivo CSS para estilos personalizados

const Dashboard = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();

    // Manejar el cierre de sesión
    const handleLogout = () => {
        // Eliminar los tokens de autenticación
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        // Redirigir al login
        navigate('/');
    };

    return (
        <div className="dashboard-container d-flex">
            {/* Sidebar */}
            <nav className="sidebar">
                <div className="sidebar-header p-3 d-flex justify-content-between align-items-center">
                    <h5 className="m-0 text-white">RRHH</h5>
                    <button
                        className="btn btn-sm btn-light d-md-none"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        <i className={`bi ${sidebarCollapsed ? 'bi-list' : 'bi-x'}`}></i>
                    </button>
                </div>
                <ul className="nav flex-column flex-grow-1">
                    <li className="nav-item">
                        <Link to="empleados" className="nav-link text-white p-3 d-flex align-items-center">
                            <i className="bi bi-person-badge"></i>
                            <span className="ms-2">Empleados</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="departamentos" className="nav-link text-white p-3 d-flex align-items-center">
                            <i className="bi bi-building"></i>
                            <span className="ms-2">Departamentos</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="documentos" className="nav-link text-white p-3 d-flex align-items-center">
                            <i className="bi bi-folder"></i>
                            <span className="ms-2">Documentos</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="asistencia" className="nav-link text-white p-3 d-flex align-items-center">
                            <i className="bi bi-calendar-check"></i>
                            <span className="ms-2">Asistencia</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="contratos" className="nav-link text-white p-3 d-flex align-items-center">
                            <i className="bi bi-file-earmark-text"></i>
                            <span className="ms-2">Contratos</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="perfil" className="nav-link text-white p-3 d-flex align-items-center">
                            <i className="bi bi-person-circle"></i>
                            <span className="ms-2">Perfil</span>
                        </Link>
                    </li>
                </ul>
                <div className="sidebar-footer p-3 text-center">
                    <button className="btn btn-sm btn-light" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i> Salir
                    </button>
                </div>
            </nav>

            {/* Content Wrapper */}

            <div className="content-wrapper flex-grow-1">
                <Container fluid className="p-4">
                    {/* Main Content */}
                    <div className="main-content rounded shadow-sm p-4">
                        <ThemeProvider>
                            <Outlet />
                        </ThemeProvider>
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default Dashboard;

