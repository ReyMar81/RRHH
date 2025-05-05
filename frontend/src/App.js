import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './features/Dashboard/Dashboard';
import Login from './features/Login/Login';
import Departamentos from './features/Departamentos/Departamentos';
import Empleados from './features/Empleados/Empleados';
import Nomina from './pages/Nomina';
import Perfiles from './pages/Perfiles';
import Vacaciones from './pages/Vacaciones';

function App() {
    return (
            <Router>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />}>
                        <Route path="empleados" element={<Empleados />} />
                        <Route path="departamentos" element={<Departamentos />} />
                        <Route path="nomina" element={<Nomina />} />
                        <Route path="vacaciones" element={<Vacaciones />} />
                        <Route path="perfiles" element={<Perfiles />} />
                    </Route>
                </Routes>
            </Router>
    );
}

export default App;
