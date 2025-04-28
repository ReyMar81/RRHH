import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login/Login';
import Departamentos from './pages/Departamentos';
import Empleados from './pages/Empleados';
import Nomina from './pages/Nomina';
import Perfiles from './pages/Perfiles';
import Vacaciones from './pages/Vacaciones';

function App() {
    return (
        <ThemeProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/dashboard" element={<Dashboard />}>
                        <Route path="empleados" element={<Empleados />} />
                        <Route path="departamentos" element={<Departamentos />} />
                        <Route path="nomina" element={<Nomina />} />
                        <Route path="vacaciones" element={<Vacaciones />} />
                        <Route path="perfiles" element={<Perfiles />} />
                    </Route>
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;
