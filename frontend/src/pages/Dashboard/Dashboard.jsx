// src/components/Dashboard/Dashboard.js
import React, { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Container, ThemeProvider } from 'react-bootstrap';
import './Dashboard.css'; // Archivo CSS para estilos personalizados

const Dashboard = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [departamentosOpen, setDepartamentosOpen] = useState(false); // Nuevo estado
    const [documentosOpen, setDocumentosOpen] = useState(false); // Añade este estado junto a los otros
    const [nominaOpen, setNominaOpen] = useState(false); // Añade este estado junto a los otros
    const [horasExtraOpen, setHorasExtraOpen] = useState(false); // Agrega este estado junto a los otros
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
                    <h5 className="m-0 text-white">HRM System</h5>
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
                    {/* Submenú Departamentos */}
                    <li className="nav-item">
                        <button
                            className="nav-link text-white p-3 d-flex align-items-center w-100 bg-transparent border-0"
                            style={{ textAlign: "left" }}
                            onClick={() => setDepartamentosOpen(!departamentosOpen)}
                        >
                            <i className="bi bi-building"></i>
                            <span className="ms-2 flex-grow-1">Departamentos</span>
                            <i className={`bi ms-auto ${departamentosOpen ? "bi-caret-down-fill" : "bi-caret-right-fill"}`}></i>
                        </button>
                        {departamentosOpen && (
                            <ul className="nav flex-column ms-4">
                                <li className="nav-item">
                                    <Link to="departamentos" className="nav-link text-white p-2 d-flex align-items-center">
                                        <i className="bi bi-list-ul"></i>
                                        <span className="ms-2">Departamentos</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="cargos" className="nav-link text-white p-2 d-flex align-items-center">
                                        <i className="bi bi-person-workspace"></i>
                                        <span className="ms-2">Cargos</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="cargos_departamentos" className="nav-link text-white p-2 d-flex align-items-center">
                                        <i className="bi bi-diagram-3"></i>
                                        <span className="ms-2">Cargo Departamento</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    {/* Fin Submenú Departamentos */}
                    <li className="nav-item">
                        <button
                            className="nav-link text-white p-3 d-flex align-items-center w-100 bg-transparent border-0"
                            style={{ textAlign: "left" }}
                            onClick={() => setDocumentosOpen(!documentosOpen)}
                        >
                            <i className="bi bi-folder"></i>
                            <span className="ms-2 flex-grow-1">Documentos</span>
                            <i className={`bi ms-auto ${documentosOpen ? "bi-caret-down-fill" : "bi-caret-right-fill"}`}></i>
                        </button>
                        {documentosOpen && (
                            <ul className="nav flex-column ms-4">
                                <li className="nav-item">
                                    <Link to="documentos" className="nav-link text-white p-2 d-flex align-items-center">
                                        <i className="bi bi-folder2-open"></i>
                                        <span className="ms-2">Documentos</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="categorias" className="nav-link text-white p-2 d-flex align-items-center">
                                        <i className="bi bi-tags"></i>
                                        <span className="ms-2">Categorías</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="tipos" className="nav-link text-white p-2 d-flex align-items-center">
                                        <i className="bi bi-bookmark"></i>
                                        <span className="ms-2">Tipos</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>

                    <li className="nav-item">
                        <button
                            className="nav-link text-white p-3 d-flex align-items-center w-100 bg-transparent border-0"
                            style={{ textAlign: "left" }}
                            onClick={() => setNominaOpen(!nominaOpen)}
                        >
                            <i className="bi bi-cash-coin"></i>
                            <span className="ms-2 flex-grow-1">Nómina</span>
                            <i className={`bi ms-auto ${nominaOpen ? "bi-caret-down-fill" : "bi-caret-right-fill"}`}></i>
                        </button>
                        {nominaOpen && (
                            <ul className="nav flex-column ms-4">
                                <li className="nav-item">
                                    <Link to="nomina" className="nav-link text-white p-2 d-flex align-items-center">
                                        <i className="bi bi-cash-stack"></i>
                                        <span className="ms-2">Nómina</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="estructura" className="nav-link text-white p-2 d-flex align-items-center">
                                        <i className="bi bi-diagram-2"></i>
                                        <span className="ms-2">Estructura</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="reglas" className="nav-link text-white p-2 d-flex align-items-center">
                                        <i className="bi bi-gear"></i>
                                        <span className="ms-2">Reglas</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    {/* Submenú Horas Extra */}
                    <li className="nav-item">
                        <button
                            className="nav-link text-white p-3 d-flex align-items-center w-100 bg-transparent border-0"
                            style={{ textAlign: "left" }}
                            onClick={() => setHorasExtraOpen(!horasExtraOpen)}
                        >
                            <i className="bi bi-clock-history"></i>
                            <span className="ms-2 flex-grow-1">Horas Extra</span>
                            <i className={`bi ms-auto ${horasExtraOpen ? "bi-caret-down-fill" : "bi-caret-right-fill"}`}></i>
                        </button>
                        {horasExtraOpen && (
                            <ul className="nav flex-column ms-4">
                                <li className="nav-item">
                                    <Link to="aprobadores" className="nav-link text-white p-2 d-flex align-items-center">
                                        <i className="bi bi-person-check"></i>
                                        <span className="ms-2">Aprobadores</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="horas_extra_pendientes" className="nav-link text-white p-2 d-flex align-items-center">
                                        <i className="bi bi-hourglass-split"></i>
                                        <span className="ms-2">Pendientes</span>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="historial_horas_extra" className="nav-link text-white p-2 d-flex align-items-center">
                                        <i className="bi bi-clock"></i>
                                        <span className="ms-2">Historial</span>
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </li>
                    {/* Fin Submenú Horas Extra */}
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


