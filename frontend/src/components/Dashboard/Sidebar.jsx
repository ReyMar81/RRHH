// src/components/Dashboard/Sidebar.js
import React from 'react';
import { Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import {
    FaUsers,
    FaSitemap,
    FaMoneyBillWave,
    FaUmbrellaBeach,
    FaUserCircle,
    FaChartBar,
    FaCog
} from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
//import logo from '../../assets/logo-rh.png'; // Asegúrate de tener este archivo en tu proyecto

const Sidebar = ({ collapsed }) => {
    const location = useLocation();
    const { theme } = useTheme();

    // Función para determinar si un enlace está activo
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div
            className={`sidebar ${collapsed ? 'collapsed' : ''}`}
            style={{
                backgroundColor: theme.colors.sidebarBg, // Fondo dinámico
                color: theme.colors.sidebarText,        // Texto dinámico
            }}
        >
            <div className="d-flex justify-content-center py-4">
                {collapsed ? (
                    <span style={{ fontSize: '24px', color: theme.colors.primary }}>RH</span>
                ) : (
                    <h4 style={{ marginBottom: 0, color: theme.colors.primary }}>RH Dashboard</h4>
                )}
            </div>

            <hr style={{ backgroundColor: theme.colors.light, opacity: 0.2 }} />

            <Nav className="flex-column">
                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/empleados"
                        className={`sidebar-link ${isActive('/empleados') ? 'active' : ''}`}
                        style={{
                            color: isActive('/empleados') ? theme.colors.primary : theme.colors.sidebarText,
                            backgroundColor: isActive('/empleados') ? `${theme.colors.primary}20` : 'transparent',
                            padding: collapsed ? '15px 0' : '10px 15px',
                            textAlign: collapsed ? 'center' : 'left',
                        }}
                    >
                        <FaUsers className={collapsed ? 'mx-auto' : 'me-2'} />
                        {!collapsed && <span>Empleados</span>}
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/departamentos"
                        className={`sidebar-link ${isActive('/departamentos') ? 'active' : ''}`}
                        style={{
                            color: isActive('/departamentos') ? theme.colors.primary : theme.colors.sidebarText,
                            backgroundColor: isActive('/departamentos') ? `${theme.colors.primary}20` : 'transparent',
                            padding: collapsed ? '15px 0' : '10px 15px',
                            textAlign: collapsed ? 'center' : 'left',
                        }}
                    >
                        <FaSitemap className={collapsed ? 'mx-auto' : 'me-2'} />
                        {!collapsed && <span>Departamentos</span>}
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/nomina"
                        className={`sidebar-link ${isActive('/nomina') ? 'active' : ''}`}
                        style={{
                            color: isActive('/nomina') ? theme.colors.primary : theme.colors.sidebarText,
                            backgroundColor: isActive('/nomina') ? `${theme.colors.primary}20` : 'transparent',
                            padding: collapsed ? '15px 0' : '10px 15px',
                            textAlign: collapsed ? 'center' : 'left',
                        }}
                    >
                        <FaMoneyBillWave className={collapsed ? 'mx-auto' : 'me-2'} />
                        {!collapsed && <span>Nómina</span>}
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/vacaciones"
                        className={`sidebar-link ${isActive('/vacaciones') ? 'active' : ''}`}
                        style={{
                            color: isActive('/vacaciones') ? theme.colors.primary : theme.colors.sidebarText,
                            backgroundColor: isActive('/vacaciones') ? `${theme.colors.primary}20` : 'transparent',
                            padding: collapsed ? '15px 0' : '10px 15px',
                            textAlign: collapsed ? 'center' : 'left',
                        }}
                    >
                        <FaUmbrellaBeach className={collapsed ? 'mx-auto' : 'me-2'} />
                        {!collapsed && <span>Vacaciones</span>}
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/perfiles"
                        className={`sidebar-link ${isActive('/perfiles') ? 'active' : ''}`}
                        style={{
                            color: isActive('/perfiles') ? theme.colors.primary : theme.colors.sidebarText,
                            backgroundColor: isActive('/perfiles') ? `${theme.colors.primary}20` : 'transparent',
                            padding: collapsed ? '15px 0' : '10px 15px',
                            textAlign: collapsed ? 'center' : 'left',
                        }}
                    >
                        <FaUserCircle className={collapsed ? 'mx-auto' : 'me-2'} />
                        {!collapsed && <span>Perfiles</span>}
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/reportes"
                        className={`sidebar-link ${isActive('/reportes') ? 'active' : ''}`}
                        style={{
                            color: isActive('/reportes') ? theme.colors.primary : theme.colors.sidebarText,
                            backgroundColor: isActive('/reportes') ? `${theme.colors.primary}20` : 'transparent',
                            padding: collapsed ? '15px 0' : '10px 15px',
                            textAlign: collapsed ? 'center' : 'left',
                        }}
                    >
                        <FaChartBar className={collapsed ? 'mx-auto' : 'me-2'} />
                        {!collapsed && <span>Reportes</span>}
                    </Nav.Link>
                </Nav.Item>

                <Nav.Item>
                    <Nav.Link
                        as={Link}
                        to="/configuracion"
                        className={`sidebar-link ${isActive('/configuracion') ? 'active' : ''}`}
                        style={{
                            color: isActive('/configuracion') ? theme.colors.primary : theme.colors.sidebarText,
                            backgroundColor: isActive('/configuracion') ? `${theme.colors.primary}20` : 'transparent',
                            padding: collapsed ? '15px 0' : '10px 15px',
                            textAlign: collapsed ? 'center' : 'left',
                        }}
                    >
                        <FaCog className={collapsed ? 'mx-auto' : 'me-2'} />
                        {!collapsed && <span>Configuración</span>}
                    </Nav.Link>
                </Nav.Item>
            </Nav>
        </div>
    );
};

export default Sidebar;