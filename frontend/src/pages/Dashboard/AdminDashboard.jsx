import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import "./AdminDashboard.module.css";

const AdminDashboard = () => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigate('/loginadmin');
    };

    return (
        <div className="dashboard-container d-flex">
            {/* Sidebar */}
            <nav className="sidebar">
                <div className="sidebar-header p-3 d-flex justify-content-between align-items-center">
                    <h5 className="m-0 text-white">Admin RRHH</h5>
                    <button
                        className="btn btn-sm btn-light d-md-none"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    >
                        <i className={`bi ${sidebarCollapsed ? 'bi-list' : 'bi-x'}`}></i>
                    </button>
                </div>
                <ul className="nav flex-column flex-grow-1">
                    <li className="nav-item">
                        <Link to="empresas" className="nav-link text-white p-3 d-flex align-items-center">
                            <i className="bi bi-building"></i>
                            <span className="ms-2">Empresas</span>
                        </Link>
                    </li>
                    <li className="nav-item">
                        <Link to="logs" className="nav-link text-white p-3 d-flex align-items-center">
                            <i className="bi bi-clipboard-data"></i>
                            <span className="ms-2">Logs</span>
                        </Link>
                    </li>
                </ul>
                <div className="sidebar-footer p-3 text-center">
                    <button className="btn btn-sm btn-light" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right"></i> Cerrar sesión
                    </button>
                </div>
            </nav>

            {/* Content Wrapper */}
            <div className="content-wrapper flex-grow-1">
                <Container fluid className="p-4">
                    <div className="main-content rounded shadow-sm p-4">
                        <Outlet />
                    </div>
                </Container>
            </div>
        </div>
    );
};

export default AdminDashboard;